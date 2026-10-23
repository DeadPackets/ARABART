# Proof: run MemMaid's OWN license check (ARM code, unicorn) on keys from keymodel.py and on wrong keys.
# Every Windows CE call the check makes is answered by a small Python stand-in (string copies, the registry, the
# clock, KernelIoControl for the device ID). Usage:
#   uv run -q --with unicorn --with pefile python -I emulate.py <coredll_ordinals.txt> <dir with v15a,v172,v173,v23en>
# Writes emulate-report.json next to this script and exits 1 if any case fails.
import json, os, random, struct, sys, pefile
from unicorn import Uc, UC_ARCH_ARM, UC_MODE_ARM, UC_HOOK_CODE
from unicorn.arm_const import *

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import keymodel as km

# Per build: the check routine, where it reads the typed key, and where it writes its verdict.
# Verdicts: 13 = registered, 0 = trial running, 7 = trial over / no trial record.
BUILDS = {
    '1.5a': dict(dir='v15a', fn=0x1F218, key=0x48668, res=0x48868, days=None),
    '1.72': dict(dir='v172', fn=0x1FFD4, key=0x4EAF0, res=0x4ECF0, days=0x480F8),
    '1.73': dict(dir='v173', fn=0x1FFD4, key=0x4EE30, res=0x4F030, days=None),
    '2.3': dict(dir='v23en', fn=0x2DC88, key=0x8ADE8, res=0x8ADE4, days=0x84EFC),
}
STUB, STACK, RET = 0x0F000000, 0x7F000000, 0x0E000000

class Run:
    def __init__(self, exe, ordf):
        pe = pefile.PE(exe)
        ords = dict(l.split(None, 1) for l in open(ordf).read().splitlines())
        self.base = pe.OPTIONAL_HEADER.ImageBase
        img = bytearray(pe.get_memory_mapped_image())
        self.names = {}
        for k, (e, i) in enumerate((e, i) for e in pe.DIRECTORY_ENTRY_IMPORT for i in e.imports):
            n = i.name.decode() if i.name else ords.get(str(i.ordinal), f'#{i.ordinal}') if e.dll.lower() == b'coredll.dll' else f'{e.dll.decode()}#{i.ordinal}'
            struct.pack_into('<I', img, i.address - self.base, STUB + 4 * k)
            self.names[STUB + 4 * k] = n
        self.img = bytes(img)

    def call(self, fn, key, res, device_id, reg, today, days=None):
        uc = Uc(UC_ARCH_ARM, UC_MODE_ARM)
        size = (len(self.img) + 0xFFFF) & ~0xFFFF
        uc.mem_map(self.base, size); uc.mem_write(self.base, self.img)
        uc.mem_map(STUB, 0x10000); uc.mem_write(STUB, struct.pack('<I', 0xE1A0F00E) * 0x4000)  # mov pc, lr
        uc.mem_map(STACK - 0x100000, 0x100000); uc.mem_map(RET, 0x1000)
        uc.mem_write(key, (key_text := self.key).encode('utf-16le') + b'\0\0')
        self.calls, self.reg = [], dict(reg)
        R = lambda r: uc.reg_read(r)
        def ws(a):
            out = b''
            while (c := uc.mem_read(a + len(out), 2)) != b'\0\0': out += c
            return out.decode('utf-16le')
        def wput(a, s): uc.mem_write(a, s.encode('utf-16le') + b'\0\0')
        arg = lambda n: [R(UC_ARM_REG_R0), R(UC_ARM_REG_R1), R(UC_ARM_REG_R2), R(UC_ARM_REG_R3)][n] if n < 4 else struct.unpack('<I', uc.mem_read(R(UC_ARM_REG_SP) + 4 * (n - 4), 4))[0]
        handles = {}
        def hook(uc, addr, sz, _):
            n = self.names.get(addr)
            if n is None: return
            self.calls.append(n)
            r0 = 0; r1 = None
            if n == 'wcslen': r0 = len(ws(arg(0)))
            elif n == 'wcscpy': wput(arg(0), ws(arg(1))); r0 = arg(0)
            elif n == 'wcscat': wput(arg(0), ws(arg(0)) + ws(arg(1))); r0 = arg(0)
            elif n == 'lstrcmpW': a, b = ws(arg(0)), ws(arg(1)); r0 = (a > b) - (a < b)
            elif n == 'memset': uc.mem_write(arg(0), bytes([arg(1) & 255]) * arg(2)); r0 = arg(0)
            elif n == 'memcpy': uc.mem_write(arg(0), bytes(uc.mem_read(arg(1), arg(2)))); r0 = arg(0)
            elif n == 'wsprintfW':
                f = ws(arg(1)); wput(arg(0), f.replace('%02X', f'{arg(2) & 255:02X}')); r0 = len(f)
            elif n in ('__rt_udiv', '__rt_sdiv'):
                d, v = arg(0), arg(1)
                if n == '__rt_sdiv': d, v = (d ^ 0x80000000) - 0x80000000, (v ^ 0x80000000) - 0x80000000
                q = int(v / d); r0, r1 = q & 0xFFFFFFFF, (v - q * d) & 0xFFFFFFFF
            elif n == 'KernelIoControl':
                if device_id is None: r0 = 0
                else:
                    pre, plat = device_id; out = arg(3)
                    uc.mem_write(out, struct.pack('<5I', 20 + len(pre) + len(plat), 20, len(pre), 20 + len(pre), len(plat)) + pre + plat)
                    r0 = 1
            elif n == 'RegOpenKeyExW' or n == 'RegCreateKeyExW':
                path = ws(arg(1))
                if path in self.reg: h = 0x100 + len(handles); handles[h] = path; uc.mem_write(arg(4), struct.pack('<I', h)); r0 = 0
                else: r0 = 2
            elif n == 'RegQueryValueExW':
                v = self.reg.get(handles.get(arg(0)), {}).get(ws(arg(1)))
                if v is None: r0 = 2
                else:
                    uc.mem_write(arg(3), struct.pack('<I', 3)); uc.mem_write(arg(4), v); uc.mem_write(arg(5), struct.pack('<I', len(v))); r0 = 0
            elif n == 'RegSetValueExW':
                self.reg.setdefault(handles.get(arg(0)), {})[ws(arg(1))] = bytes(uc.mem_read(arg(4), arg(5))); r0 = 0
            elif n == 'RegDeleteValueW': self.reg.get(handles.get(arg(0)), {}).pop(ws(arg(1)), None); r0 = 0
            elif n in ('RegCloseKey', 'RegFlushKey'): r0 = 0
            elif n == 'GetLocalTime': y, m, d = today; uc.mem_write(arg(0), struct.pack('<8H', y, m, 0, d, 12, 0, 0, 0))
            else: raise RuntimeError(f'unhandled import {n}')
            uc.reg_write(UC_ARM_REG_R0, r0)
            if r1 is not None: uc.reg_write(UC_ARM_REG_R1, r1)
        uc.hook_add(UC_HOOK_CODE, hook, begin=STUB, end=STUB + 0xFFFF)
        uc.reg_write(UC_ARM_REG_SP, STACK - 0x100); uc.reg_write(UC_ARM_REG_LR, RET)
        uc.emu_start(fn, RET, count=5_000_000)
        out = {'verdict': struct.unpack('<I', uc.mem_read(res, 4))[0]}
        if days and out['verdict'] == 0: out['days_left'] = struct.unpack('<I', uc.mem_read(days, 4))[0]
        return out

def trial_bytes(y, m, d):
    """MemMaidSetup.dll's encoder (sub_10001000): the install date, stored twice over, odd bytes +1, checksum mod 31."""
    w = [2 * m + 3, y + 7, y + 21, 2 * d + 5, 2 * m + 1, 2 * d + 4]
    b = bytearray(struct.pack('<6H', *w))
    s = sum(b)
    for i in range(12): b[i] = (b[i] + i % 2) & 255
    return bytes(b) + struct.pack('<H', s % 31)

def main():
    ordf, xdir = sys.argv[1], sys.argv[2]
    rnd = random.Random(1997)
    devices = [(bytes(rnd.randrange(256) for _ in range(rnd.choice([4, 6, 8, 10]))), bytes(rnd.randrange(256) for _ in range(16))) for _ in range(6)]
    devices.append((bytes.fromhex('0000000F'), bytes.fromhex('4A2D30C08D9A11D7A10000037A1E52F1')))
    letters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789'
    report, fails = {'builds': {}, 'accepted': 0, 'rejected': 0}, 0
    for ver, b in BUILDS.items():
        run = Run(os.path.join(xdir, b['dir'], 'named', 'MemMaid.exe'), ordf)
        cases = []
        def check(label, key, dev, want, reg=None, today=(2008, 7, 1), extra=None):
            nonlocal fails
            run.key = key
            got = run.call(b['fn'], b['key'], b['res'], dev, reg or {}, today, b['days'])
            ok = (got['verdict'] == 13) == want
            if extra: ok = ok and all(got.get(k) == v for k, v in extra.items())
            cases.append({'case': label, 'key': key, 'want_registered': want, **got, 'ok': ok})
            report['accepted' if want else 'rejected'] += ok
            fails += not ok
        for d in devices:
            code = km.pocket_code(*d)
            check(f'device key for {code}', km.device_key(code, ver), d, True)
            other = km.pocket_code(*devices[(devices.index(d) + 1) % len(devices)])
            check(f'key made for another device ({other})', km.device_key(other, ver), d, False)
        code = km.pocket_code(None)
        check(f'device key, device ID unavailable (code {code})', km.device_key(code, ver), None, True)
        check('giveaway key', km.giveaway_key(ver), devices[0], True)
        check('key made from his name', km.scramble('YASSERMOHAMEDALI', km.SCHEMES[ver]['builtin']), devices[0], True)
        for other in BUILDS:
            if km.giveaway_key(other) != km.giveaway_key(ver):
                check(f'giveaway key of {other}', km.giveaway_key(other), devices[0], False)
            if km.SCHEMES[other]['device'] != km.SCHEMES[ver]['device']:
                check(f'device key made the {other} way', km.device_key(km.pocket_code(*devices[0]), other), devices[0], False)
        good = km.giveaway_key(ver)
        for i in range(16):
            bad = good[:i] + letters[(letters.index(good[i]) + 1) % len(letters)] + good[i + 1:]
            check(f'giveaway key, letter {i + 1} changed', bad, devices[0], False)
        for _ in range(20): check('random 16 letters', ''.join(rnd.choice(letters) for _ in range(16)), devices[0], False)
        check('empty key', '', devices[0], False)
        check('the plain word GIVEAWAYVERSION1', 'GIVEAWAYVERSION1', devices[0], False)
        if ver == '2.3':
            reg = {'TapHelp': {'Ready2': trial_bytes(2008, 6, 20)}}
            check('no key, installed 2008-06-20, today 2008-06-23', '', devices[0], False, reg, (2008, 6, 23), {'verdict': 0, 'days_left': 12})
            check('no key, installed 2008-06-20, today 2008-07-06', '', devices[0], False, reg, (2008, 7, 6), {'verdict': 7})
        if ver in ('1.72', '1.73'):
            reg = {'Windows.2': {'OSDB': trial_bytes(2006, 7, 20)}}
            check('no key, installed 2006-07-20, today 2006-07-30', '', devices[0], False, reg, (2006, 7, 30), {'verdict': 0, **({'days_left': 5} if b['days'] else {})})
            check('no key, installed 2006-07-20, today 2006-08-05', '', devices[0], False, reg, (2006, 8, 5), {'verdict': 7})
        if ver == '1.5a':
            reg = {'AppHelper': {'Platform': trial_bytes(2006, 3, 23)}}
            check('no key, installed 2006-03-23, today 2006-03-30', '', devices[0], False, reg, (2006, 3, 30), {'verdict': 0})
            check('no key, installed 2006-03-23, today 2006-04-08', '', devices[0], False, reg, (2006, 4, 8), {'verdict': 7})
            bad = bytearray(trial_bytes(2006, 3, 23)); bad[4] ^= 1
            check('no key, trial record with one byte changed', '', devices[0], False, {'AppHelper': {'Platform': bytes(bad)}}, (2006, 3, 30), {'verdict': 7})
        report['builds'][ver] = cases
        print(f'{ver}: {sum(c["ok"] for c in cases)}/{len(cases)} cases as expected')
    report['fails'] = fails
    json.dump(report, open(os.path.join(HERE, 'emulate-report.json'), 'w'), indent=1)
    print(f'accepted as expected: {report["accepted"]}, rejected as expected: {report["rejected"]}, failures: {fails}')
    sys.exit(1 if fails else 0)

if __name__ == '__main__':
    main()
