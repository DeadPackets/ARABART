# A tiny Windows CE (ARM) host for unicorn: maps a PE image, points every import at a stub, and runs one function.
# Shared by the HandySwitcher, HandyMenu and HandyLauncher proofs. Nothing here runs the program natively.
import os, random, re, shutil, struct, subprocess, sys, tempfile
import pefile
from unicorn import Uc, UC_ARCH_ARM, UC_MODE_ARM, UC_HOOK_CODE, UcError
from unicorn.arm_const import *

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
DOWNLOADS = os.path.join(REPO, 'research', 'dinarsoft', 'downloads')
STUB, STACK, HEAP = 0x70000000, 0x60000000, 0x50000000
BXLR = struct.pack('<I', 0xE12FFF1E)

def extract(name, upx=False):
    """Copy one installer out of downloads/ into a fresh temp folder and unpack it there (7-Zip, and UPX for setups)."""
    d = tempfile.mkdtemp(prefix='ds-')
    src = os.path.join(DOWNLOADS, name)
    dst = os.path.join(d, 'in.bin')
    shutil.copyfile(src, dst)
    if upx:
        subprocess.run(['upx', '-d', '-q', dst], check=True, capture_output=True)
    out = os.path.join(d, 'x')
    os.mkdir(out)
    subprocess.run(['7zz', 'x', '-y', '-o' + out, dst], check=True, capture_output=True)
    return out

class Emu:
    def __init__(self, path, ordinals):
        self.pe = pe = pefile.PE(path)
        self.base = pe.OPTIONAL_HEADER.ImageBase
        img = pe.get_memory_mapped_image()
        size = (len(img) + 0xFFFF) & ~0xFFFF
        self.uc = uc = Uc(UC_ARCH_ARM, UC_MODE_ARM)
        uc.mem_map(self.base, size)
        uc.mem_write(self.base, img)
        uc.mem_map(STACK, 0x100000)
        uc.mem_map(HEAP, 0x100000)
        uc.mem_map(STUB, 0x10000)
        self.heap = HEAP
        self.stubs = {}
        k = 0
        for d in getattr(pe, 'DIRECTORY_ENTRY_IMPORT', []):
            dll = d.dll.decode().lower()
            for i in d.imports:
                nm = i.name.decode() if i.name else ordinals.get((dll, i.ordinal), '%s#%d' % (dll, i.ordinal))
                a = STUB + 4 * k; k += 1
                uc.mem_write(a, BXLR)
                uc.mem_write(i.address, struct.pack('<I', a))
                self.stubs[a] = nm
        uc.hook_add(UC_HOOK_CODE, self._stub, begin=STUB, end=STUB + 0x10000)
        self.calls = []
        self.files = {}      # path -> bytes
        self.reg = {}        # (key, value) -> bytes
        self.device_id = None  # bytes or None (call fails)
        self.today = (2026, 10, 22)
        self.handles = {}

    # memory helpers
    def r32(self, a): return struct.unpack('<I', self.uc.mem_read(a, 4))[0]
    def w32(self, a, v): self.uc.mem_write(a, struct.pack('<I', v & 0xFFFFFFFF))
    def wstr(self, a, n=4096):
        out = []
        while len(out) < n:
            c = struct.unpack('<H', self.uc.mem_read(a + 2 * len(out), 2))[0]
            if not c: break
            out.append(chr(c))
        return ''.join(out)
    def put_wstr(self, a, s): self.uc.mem_write(a, s.encode('utf-16le') + b'\0\0')
    def alloc(self, n):
        a = self.heap; self.heap += (n + 15) & ~15
        return a
    def arg(self, i):
        if i < 4: return self.uc.reg_read([UC_ARM_REG_R0, UC_ARM_REG_R1, UC_ARM_REG_R2, UC_ARM_REG_R3][i])
        return self.r32(self.uc.reg_read(UC_ARM_REG_SP) + 4 * (i - 4))

    def _stub(self, uc, addr, size, _):
        nm = self.stubs.get(addr)
        a = [self.arg(i) for i in range(8)]
        r0 = 0
        self.calls.append(nm)
        if nm == 'wcslen': r0 = len(self.wstr(a[0]))
        elif nm == 'wcscpy': self.put_wstr(a[0], self.wstr(a[1])); r0 = a[0]
        elif nm == 'wcscat': self.put_wstr(a[0], self.wstr(a[0]) + self.wstr(a[1])); r0 = a[0]
        elif nm in ('lstrcmpW',): x, y = self.wstr(a[0]), self.wstr(a[1]); r0 = (x > y) - (x < y)
        elif nm in ('_wcsicmp', 'lstrcmpiW'): x, y = self.wstr(a[0]).lower(), self.wstr(a[1]).lower(); r0 = (x > y) - (x < y)
        elif nm == 'memset': uc.mem_write(a[0], bytes([a[1] & 0xFF]) * a[2]); r0 = a[0]
        elif nm == 'memcpy': uc.mem_write(a[0], bytes(uc.mem_read(a[1], a[2]))); r0 = a[0]
        elif nm == 'wsprintfW':
            fmt, vals = self.wstr(a[1]), iter(a[2:])
            out = re.sub(r'%(0?\d*)([dXxs])', lambda m: self.wstr(next(vals)) if m.group(2) == 's' else ('%' + m.group(1) + m.group(2)) % next(vals), fmt)
            self.put_wstr(a[0], out); r0 = len(out)
        elif nm in ('__rt_udiv', '__rt_sdiv'):
            d, n = a[0], a[1]
            if nm == '__rt_sdiv':
                d = d - (1 << 32) if d & 0x80000000 else d
                n = n - (1 << 32) if n & 0x80000000 else n
                q = abs(n) // abs(d) * (1 if (n < 0) == (d < 0) else -1)
                r = n - q * d
            else:
                q, r = n // d, n % d
            r0 = q & 0xFFFFFFFF
            uc.reg_write(UC_ARM_REG_R1, r & 0xFFFFFFFF)
        elif nm == 'KernelIoControl':
            assert a[0] == 0x01010054, hex(a[0])  # IOCTL_HAL_GET_DEVICEID
            if self.device_id is None: r0 = 0
            else:
                preset, platform = self.device_id
                buf = struct.pack('<5I', 20 + len(preset) + len(platform), 20, len(preset), 20 + len(preset), len(platform)) + preset + platform
                uc.mem_write(a[3], buf); r0 = 1
        elif nm == 'GetLocalTime':
            y, m, d = self.today
            uc.mem_write(a[0], struct.pack('<8H', y, m, 4, d, 12, 0, 0, 0))
        elif nm == 'CreateFileW':
            p = self.wstr(a[0])
            if p in self.files:
                h = 0x100 + len(self.handles); self.handles[h] = p; r0 = h
            else: r0 = 0xFFFFFFFF
        elif nm == 'GetFileSize': r0 = len(self.files[self.handles[a[0]]]) if a[0] in self.handles else 0xFFFFFFFF
        elif nm == 'ReadFile' and a[0] not in self.handles: r0 = 0
        elif nm == 'ReadFile':
            data = self.files[self.handles[a[0]]][:a[2]]
            uc.mem_write(a[1], data); self.w32(a[3], len(data)); r0 = 1
        elif nm == 'CloseHandle': r0 = 1
        elif nm in ('RegOpenKeyExW', 'RegCreateKeyExW'):
            key = self.wstr(a[1])
            out = a[4] if nm == 'RegOpenKeyExW' else a[7]
            self.w32(out, 0x2000 + (abs(hash(key)) & 0xFFF)); self.handles[self.r32(out)] = key; r0 = 0
        elif nm == 'RegQueryValueExW':
            key = (self.handles.get(a[0]), self.wstr(a[1]))
            if key in self.reg and a[4]:
                v = self.reg[key]; uc.mem_write(a[4], v)
                if a[5]: self.w32(a[5], len(v))
                r0 = 0
            else: r0 = 2
        elif nm == 'RegSetValueExW':
            self.reg[(self.handles.get(a[0]), self.wstr(a[1]))] = bytes(uc.mem_read(self.arg(4), self.arg(5))); r0 = 0
        elif nm == 'RegDeleteValueW': self.reg.pop((self.handles.get(a[0]), self.wstr(a[1])), None)
        elif nm in ('RegCloseKey', 'RegFlushKey'): r0 = 0
        else:
            raise RuntimeError('unexpected import call: %s' % nm)
        uc.reg_write(UC_ARM_REG_R0, r0 & 0xFFFFFFFF)

    def call(self, fn, *args, limit=5_000_000):
        uc = self.uc
        sp = STACK + 0xF0000
        uc.reg_write(UC_ARM_REG_SP, sp)
        for i, v in enumerate(args[:4]):
            uc.reg_write([UC_ARM_REG_R0, UC_ARM_REG_R1, UC_ARM_REG_R2, UC_ARM_REG_R3][i], v)
        ret = STUB + 0xFF00
        uc.mem_write(ret, BXLR)
        uc.reg_write(UC_ARM_REG_LR, ret)
        uc.emu_start(fn, ret, count=limit)
        return uc.reg_read(UC_ARM_REG_R0)

def ordinals():
    """coredll ordinal -> name, from the public .def text that sits beside this file."""
    m = {}
    for dll in ('coredll', 'aygshell', 'commctrl', 'commdlg', 'toolhelp'):
        p = os.path.join(HERE, 'ref', dll + '.def')
        if not os.path.exists(p): continue
        for line in open(p, errors='replace'):
            r = re.match(r'\s*(\S+)\s+@(\d+)', line)
            if r:
                nm = r.group(1)
                if nm.startswith('?'):
                    mm = re.match(r'\?+(\w+)@', nm); nm = mm.group(1) if mm else nm
                m[(dll + '.dll', int(r.group(2)))] = nm
    return m

def ts_keys(module, calls):
    """Run the site's own TypeScript (node strips the types) and return what it generates."""
    eng = 'file://' + os.path.join(REPO, 'src/lib/dinarsoft/handyswitcher.ts')
    js = 'const m = { ...(await import(%r)), ...(await import(%r)) };\nconst out = {};\n' % (eng, 'file://' + os.path.join(REPO, module))
    for k, expr in calls.items(): js += 'out[%r] = %s;\n' % (k, expr)
    js += 'console.log(JSON.stringify(out));'
    r = subprocess.run(['node', '--input-type=module', '-e', js], check=True, capture_output=True, text=True)
    import json
    return json.loads(r.stdout.strip().splitlines()[-1])
def date_record(y, m, d):
    """His 14-byte install-date record: the date stored twice in different disguises, salted, plus a checksum."""
    s = [m * 2 + 3, y + 7, y + 0x15, d * 2 + 5, m * 2 + 1, (d + 2) * 2]
    b = bytearray(struct.pack('<6H', *s))
    total = sum(b)
    for i in range(12): b[i] = (b[i] + i % 2) & 0xFF
    return bytes(b) + struct.pack('<H', total % 31)

ORDS = None

def run(b, path, key, device=None, record=None):
    e = Emu(path, ORDS)
    e.device_id = device
    if record is not None:
        if b['trial'][0] == 'file': e.files[b['trial'][1]] = record
        else: e.reg[(b['trial'][1], b['trial'][2])] = record
    e.put_wstr(b['lic'], key)
    e.call(b['check'])
    st = e.r32(b['state'])
    left = e.r32(b['days']) if b['days'] and st == 0 else None
    return st, left, e

def prove(app, LIB, BUILDS, other, here):
    global ORDS
    ORDS = ordinals()
    rnd = random.Random(1983)
    lines, ok = [], True
    for b in BUILDS:
        path = os.path.join(extract(*b['src']), b['file'])
        lines.append('\n## ' + app + ' %s (`%s`, check routine at 0x%X)\n' % (b['name'], b['src'][0], b['check']))
        lines.append('| Case | Key typed | App says | Expected | |\n|---|---|---|---|---|')
        devs = []
        for _ in range(3):
            preset, platform = bytes(rnd.randrange(256) for _ in range(8)), bytes(rnd.randrange(256) for _ in range(16))
            devs.append((preset, platform, (preset + platform).hex().upper()))
        calls = {'universal': 'm.unlock.generate({})'}
        for k, (_, _, hx) in enumerate(devs):
            calls['code%d' % k] = 'm.pocketPcCode(%r)' % hx
            calls['key%d' % k] = 'm.dinarKey(m.pocketPcCode(%r), %r)' % (hx, b['product'])
            calls['other%d' % k] = 'm.dinarKey(m.pocketPcCode(%r), %r)' % (hx, other)
        calls['fallback'] = 'm.dinarKey(m.pocketPcCode("730007B6BFA373D1380000050BFE45CE5"), %r)' % b['product']
        calls['univ_other'] = 'm.dinarKey(m.UNIVERSAL, %r)' % other
        t = ts_keys(LIB, calls)
        cases = []
        for k, (p, q, _) in enumerate(devs):
            good = t['key%d' % k]
            cases.append(('device key, device %d (code %s)' % (k + 1, t['code%d' % k]), good, (p, q), None, 0xD))
            bad = good[:-1] + ('A' if good[-1] != 'A' else 'B')
            cases.append(('same key, last letter changed', bad, (p, q), None, 7))
            cases.append(('%s’s key for this device' % other, t['other%d' % k], (p, q), None, 7))
        cases.append(('device ID call fails, fallback code', t['fallback'], None, None, 0xD))
        cases.append(('generate() from the site (universal)', t['universal'], devs[0][:2], None, 0xD if b['universal'] else 7))
        cases.append(('universal key of %s' % other, t['univ_other'], devs[0][:2], None, 7))
        for _ in range(5):
            cases.append(('16 random letters', ''.join(rnd.choice('ABCDEFGHIJKLMNPQRSTUVWXYZ') for _ in range(16)), devs[1][:2], None, 7))
        cases.append(('no key, installed 3 days ago', '', devs[0][:2], date_record(2026, 10, 19), 0))
        cases.append(('no key, installed 15 days ago', '', devs[0][:2], date_record(2026, 10, 7), 0))
        cases.append(('no key, installed 40 days ago', '', devs[0][:2], date_record(2026, 9, 12), 7))
        cases.append(('no key, record tampered', '', devs[0][:2], bytes([date_record(2026, 10, 19)[0] ^ 1]) + date_record(2026, 10, 19)[1:], 7))
        names = {0xD: 'registered', 0: 'trial', 7: 'expired'}
        for label, key, dev, rec, want in cases:
            st, left, e = run(b, path, key, dev, rec)
            good = st == want
            ok &= good
            extra = ' (%d days left)' % left if left is not None else ''
            if rec is not None and b['trial'][0] == 'reg' and want == 7 and not label.endswith('tampered'):
                extra += ', record now %r' % e.reg.get((b['trial'][1], b['trial'][2]), b'')[:10]
            lines.append('| %s | `%s` | %s%s | %s | %s |' % (label, key or '(none)', names.get(st, hex(st)), extra, names[want], 'PASS' if good else 'FAIL'))
    rerun = 'uv run -q --with unicorn --with pefile python -I ' + os.path.relpath(os.path.join(here, 'prove.py'), REPO)
    head = ['# %s unlock proof' % app, '',
            'Each row loads the original ARM binary from the archived installer into unicorn, writes the key into the global the app reads from the registry, '
            'and runs the app’s own check routine. Keys come from `%s`, run by node. KernelIoControl returns a random device ID; '
            'the date is 2026-10-22. Rerun from the repo root: `%s`.' % (LIB, rerun),
            '', '**Result: %s**' % ('ALL PASS' if ok else 'FAILURES')]
    open(os.path.join(here, 'PROOF.md'), 'w').write('\n'.join(head + lines) + '\n')
    print('\n'.join(head + lines))
    sys.exit(0 if ok else 1)

