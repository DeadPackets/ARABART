"""Proof that src/lib/dinarsoft/hijridate.ts makes keys HijriDate 1.5 accepts, using the plug-in's own ARM code.

For each made-up Pocket PC (a random hardware ID), unicorn runs HijriPlugin.dll's own routines:
  0x105554  builds "Your Pocket PC Code" from KernelIoControl(IOCTL_HAL_GET_DEVICEID)
  0x105920  formats it as the License Key screen shows it (XXXX - XXXX - XXXX - XXXX)
  0x107604  the licence check: reads the key typed in the four boxes (global 0x10b030), sets the state at 0x10b02c
State 13 means registered. With no trial file (the stub CreateFileW fails) any other key leaves state 7, expired.
Run: uv run -q --with capstone --with pefile --with unicorn python -I research/dinarsoft/re/hijridate/prove_unlock.py
"""
import os, sys, json, random, struct, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'tools')); sys.path.insert(0, HERE)
from emu import Emu
from cab import extract

REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
KEY, STATE = 0x10b030, 0x10b02c
CODE_FN, FORMAT_FN, CHECK_FN = 0x105554, 0x105920, 0x107604
REGISTERED, EXPIRED = 13, 7


def generate(module, values):
    js = (f"const m = await import({json.dumps(os.path.join(REPO, module))});"
          f"console.log(JSON.stringify({json.dumps(values)}.map(v => m.unlock.generate(v))));")
    return json.loads(subprocess.run(['node', '--input-type=module', '-e', js], check=True, capture_output=True, text=True).stdout)


def device(seed):
    r = random.Random(seed)
    return bytes(r.randrange(256) for _ in range(16)), bytes(r.randrange(256) for _ in range(16))


class Plugin:
    def __init__(self, path):
        self.dev = (b'', b'')
        self.e = Emu(path, {'KernelIoControl': self.ioctl, 'CreateFileW': lambda e: 0, 'CloseHandle': lambda e: 1})

    def ioctl(self, e):
        code, out, size = e.r(0), e.r(3), e.r(4)
        assert code == 0x01010054, hex(code)  # IOCTL_HAL_GET_DEVICEID
        preset, platform = self.dev
        blob = struct.pack('<5I', 20 + len(preset) + len(platform), 20, len(preset), 20 + len(preset), len(platform)) + preset + platform
        e.uc.mem_write(out, blob[:size])
        return 1

    def code(self, dev):
        self.dev = dev
        buf = self.e.alloc(0x400)
        self.e.call(CODE_FN, buf)
        self.e.call(FORMAT_FN, buf)
        return self.e.wstr(buf)

    def check(self, dev, typed):
        self.dev = dev
        self.e.put_wstr(KEY, typed)
        self.e.w32(STATE, 0)
        self.e.call(CHECK_FN)
        return self.e.u32(STATE)


def main():
    path = extract('DinarSoftHijriDate15.CAB', 'HIJRIP~1.001')
    p = Plugin(path)
    devs = [device(i) for i in range(200)]
    codes = [p.code(d) for d in devs]
    keys = generate('src/lib/dinarsoft/hijridate.ts', [{'code': c} for c in codes])
    boxes = lambda k: k.replace(' ', '').replace('-', '')  # the four boxes, concatenated
    lines, ok = [], True
    good = [p.check(d, boxes(k)) for d, k in zip(devs, keys)]
    ok &= all(s == REGISTERED for s in good)
    lines.append(f'generated keys accepted: {sum(s == REGISTERED for s in good)} of {len(good)}')
    rnd = random.Random(7)
    wrong = []
    for i, (d, k) in enumerate(zip(devs, keys)):
        b = boxes(k)
        other = boxes(keys[(i + 1) % len(keys)])
        flip = b[:i % 16] + ('A' if b[i % 16] != 'A' else 'B') + b[i % 16 + 1:]
        noise = ''.join(rnd.choice('ABCDEFGHIJKLMNPQRSTUVWXYZ') for _ in range(16))
        wrong += [p.check(d, other), p.check(d, flip), p.check(d, noise), p.check(d, b.lower()), p.check(d, '')]
    ok &= all(s == EXPIRED for s in wrong)
    lines.append(f'wrong keys rejected (another device, one letter changed, random, lower case, empty): {sum(s == EXPIRED for s in wrong)} of {len(wrong)}')
    lines.append('examples: ' + '; '.join(f'{c} -> {k}' for c, k in list(zip(codes, keys))[:3]))
    lines.append('unmapped imports touched: ' + (', '.join(sorted(p.e.missing)) or 'none'))
    print('\n'.join(lines))
    print('PASS' if ok else 'FAIL')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
