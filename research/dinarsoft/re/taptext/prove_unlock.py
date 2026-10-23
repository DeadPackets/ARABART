"""Proof that src/lib/dinarsoft/taptext.ts makes a key TapText 1.3 accepts on every device, using the app's own ARM code.

For each made-up Pocket PC (a random hardware ID), unicorn runs TapText.exe's own routines:
  0x17a84  builds "Your Pocket PC Code" from KernelIoControl(IOCTL_HAL_GET_DEVICEID)
  0x17c6c  formats it as the License Key screen shows it
  0x172b4  the licence check: reads the key typed in the four boxes (global 0x24a18), sets the state at 0x24c18
State 13 means registered. With no trial record (the stub RegOpenKeyExW fails) any other key leaves state 7.
Also checked: the per-device key (code scrambled with "TapTextII") and all five built-in words.
Run: uv run -q --with capstone --with pefile --with unicorn python -I research/dinarsoft/re/taptext/prove_unlock.py
"""
import os, sys, json, random, struct, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'hijridate', 'tools')); sys.path.insert(0, os.path.join(HERE, '..', 'hijridate'))
from emu import Emu
from cab import extract

REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
KEY, STATE = 0x24a18, 0x24c18
CODE_FN, FORMAT_FN, CHECK_FN = 0x17a84, 0x17c6c, 0x172b4
REGISTERED, EXPIRED = 13, 7


def builtin_words(path):
    # The five built-in words, read from the binary: four are people's names, so the repo does not spell them out
    import re
    data = open(path, 'rb').read()
    return [m.group()[:-2].decode('utf-16le') for m in re.finditer(rb'(?:[A-Z0-9]\x00){16}\x00\x00', data)][:5]


def node(js):
    return json.loads(subprocess.run(['node', '--input-type=module', '-e', js], check=True, capture_output=True, text=True).stdout)


def device(seed):
    r = random.Random(seed)
    return bytes(r.randrange(256) for _ in range(16)), bytes(r.randrange(256) for _ in range(16))


class App:
    def __init__(self, path):
        self.dev = (b'', b'')
        self.e = Emu(path, {'KernelIoControl': self.ioctl, 'RegOpenKeyExW': lambda e: 2, 'RegCloseKey': lambda e: 0})

    def ioctl(self, e):
        code, out, size = e.r(0), e.r(3), e.r(4)
        assert code == 0x01010054, hex(code)
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
    exe = extract('DinarSoftTapText13.CAB', '0TapText.001')
    app = App(exe)
    WORDS = builtin_words(exe)
    assert len(WORDS) == 5 and WORDS[-1] == 'GIVEAWAYVERSION1', WORDS
    devs = [device(i) for i in range(100)]
    codes = [app.code(d) for d in devs]
    lib = json.dumps(os.path.join(REPO, 'src/lib/dinarsoft/taptext.ts'))
    eng = json.dumps(os.path.join(REPO, 'src/lib/dinarsoft/handyswitcher.ts'))
    out = node(f"const t = await import({lib}), h = await import({eng});"
               f"const codes = {json.dumps(codes)}, words = {json.dumps(WORDS)};"
               "const strip = c => c.replace(/[^0-9A-Z]/g, '');"
               "console.log(JSON.stringify({ universal: t.unlock.generate({}), inputs: t.unlock.inputs.length,"
               " device: codes.map(c => h.dinarKey(strip(c), 'TapTextII')), hijri: codes.map(c => h.dinarKey(strip(c), 'Hijri')),"
               " words: words.map(w => h.dinarKey(w, 'TapText')) }));")
    boxes = lambda k: k.replace(' ', '').replace('-', '')
    uni = boxes(out['universal'])
    ok, lines = True, []
    s = [app.check(d, uni) for d in devs]
    ok &= out['inputs'] == 0 and all(x == REGISTERED for x in s)
    lines.append(f"unlock.generate() = {out['universal']}: accepted on {sum(x == REGISTERED for x in s)} of {len(s)} devices")
    s = [app.check(d, k) for d, k in zip(devs, out['device'])]
    ok &= all(x == REGISTERED for x in s)
    lines.append(f'per-device keys (code scrambled with "TapTextII"): {sum(x == REGISTERED for x in s)} of {len(s)}')
    for w, k in zip(WORDS, out['words']):
        s = [app.check(d, k) for d in devs[:20]]
        ok &= all(x == REGISTERED for x in s)
        lines.append(f'built-in word #{WORDS.index(w) + 1} key {k}: accepted on {sum(x == REGISTERED for x in s)} of 20 devices')
    rnd, wrong = random.Random(7), []
    for i, d in enumerate(devs):
        k = out['device'][i]
        flip = uni[:i % 16] + ('A' if uni[i % 16] != 'A' else 'B') + uni[i % 16 + 1:]
        noise = ''.join(rnd.choice('ABCDEFGHIJKLMNPQRSTUVWXYZ') for _ in range(16))
        wrong += [app.check(d, flip), app.check(d, noise), app.check(d, out['device'][(i + 1) % len(devs)]),
                  app.check(d, out['hijri'][i]), app.check(d, k[:15]), app.check(d, '')]
    ok &= all(x == EXPIRED for x in wrong)
    lines.append(f'wrong keys rejected (one letter changed, random, another device, HijriDate key, 15 letters, empty): {sum(x == EXPIRED for x in wrong)} of {len(wrong)}')
    lines.append('unmapped imports touched: ' + (', '.join(sorted(app.e.missing)) or 'none'))
    print('\n'.join(lines))
    print('PASS' if ok else 'FAIL')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
