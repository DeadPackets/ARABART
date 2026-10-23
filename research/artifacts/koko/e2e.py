# End-to-end proof for the kvc-live scene.
# Part 0 (always): no hosted file holds Koko's signature bytes in plain form (scene files, the bundle, every member).
# Part 1 (always): Unicorn PC with a real interrupt table. Loads DOUBLE.COM resident, runs the shipped
#   (packed) KVC.EXE C: on a copy of programs/KVC_LIVE, records the PC speaker, checks the cleaned files.
# Part 2 (if the dev server answers): the same scene in js-dos in headless Chrome, driven like a visitor.
# Writes research/artifacts/koko/e2e-report.md.
# Run: uv run -q --with unicorn --with playwright python -I research/artifacts/koko/e2e.py
import os, re, sys, struct, shutil, tempfile, time, hashlib, json, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
SCENE = os.path.join(ROOT, 'programs', 'KVC_LIVE')
BUNDLE = os.path.join(ROOT, 'public', 'bundles', 'kvc-live.jsdos')
PAGE = 'http://localhost:4322/ARABART/program/kvc-antivirus/'
sys.path.insert(0, os.path.join(ROOT, 'research', 'artifacts', 'programs'))
from fsdos import FSDos  # noqa: E402
sys.path.insert(0, HERE)
from build import COM_TAIL, BODY_MARK, RESTORE  # noqa: E402  KVC's signature table, read from KVC itself
from dosemu import R  # noqa: E402
from unicorn import UC_HOOK_CODE, UC_HOOK_INSN  # noqa: E402
from unicorn.x86_const import UC_X86_INS_IN, UC_X86_INS_OUT  # noqa: E402

ROM = 0xF000
PIT_HZ = 1193182
clean = {n: open(os.path.join(HERE, 'clean', n), 'rb').read() for n in ('HELLO.COM', 'GREET.EXE')}
sha = lambda b: hashlib.sha256(b).hexdigest()[:16]


class PC(FSDos):
    """FSDos plus a real interrupt vector table, so resident hooks and KVC's INT 3 call run as real code.
    Each untouched vector points at a ROM stub 'int 0FEh / db n / retf 2' that hands the call to Python."""

    def __init__(self, *a, **k):
        super().__init__(*a, **k)
        for n in range(256):
            self.uc.mem_write(ROM * 16 + self.stub(n), bytes([0xCD, 0xFE, n, 0xCA, 0x02, 0x00]))
            self.uc.mem_write(n * 4, struct.pack('<HH', self.stub(n), ROM))
        self.ticks, self.speaker, self.p61, self.dos = 0, [], 0, set()
        self.uc.hook_add(UC_HOOK_INSN, lambda uc, port, size, _: self.p61 if port == 0x61 else 0, None, 1, 0, UC_X86_INS_IN)
        self.uc.hook_add(UC_HOOK_INSN, self.out_port, None, 1, 0, UC_X86_INS_OUT)
        self.uc.hook_add(UC_HOOK_CODE, self.tick)

    stub = staticmethod(lambda n: 0x1000 + n * 8)

    def tick(self, *_):
        self.ticks += 1

    def out_port(self, uc, port, size, value, _):
        if port == 0x61:
            self.p61 = value
        self.speaker.append((self.ticks, port, value & 0xFF))

    def vec(self, n):
        return struct.unpack('<HH', bytes(self.uc.mem_read(n * 4, 4)))

    def intr(self, uc, n, _):
        if n == 0xFE:                                    # ROM stub: serve the service named by the next byte
            ip = self.r('ip'); n = uc.mem_read(self.r('cs') * 16 + ip, 1)[0]; self.w('ip', ip + 1)
            return self.service(uc, n, _)
        off, seg = self.vec(n)
        if (off, seg) == (self.stub(n), ROM):
            return self.service(uc, n, _)
        sp = (self.r('sp') - 6) & 0xFFFF                 # hooked vector: push FLAGS, CS, IP and jump, as the CPU does
        uc.mem_write(self.r('ss') * 16 + sp, struct.pack('<HHH', self.r('ip'), self.r('cs'), self.r('eflags') & 0xFFFF))
        self.w('sp', sp); uc.reg_write(R['eflags'], self.r('eflags') & ~0x300)
        self.w('cs', seg); self.w('ip', off)

    def service(self, uc, n, _):
        ax = self.r('ax')
        if n == 0x21 and ax >> 8 == 0x35:
            off, seg = self.vec(ax & 0xFF); self.w('es', seg); self.w('bx', off); return
        if n == 0x21 and ax >> 8 == 0x25:
            uc.mem_write((ax & 0xFF) * 4, struct.pack('<HH', self.r('dx'), self.r('ds'))); return
        if n == 0x21:
            self.dos.add(ax >> 8)
        return super().intr(uc, n, _)


    def run_resident(self, path, seg=0x0700):
        """Run a COM at seg until it calls 'stay resident', then give the CPU back to the main program."""
        keep = {n: self.r(n) for n in ('ax', 'bx', 'cx', 'dx', 'si', 'di', 'bp', 'sp', 'cs', 'ds', 'es', 'ss')}
        psp = bytearray(256); psp[0:2] = b'\xCD\x20'; psp[2:4] = struct.pack('<H', 0xA000); psp[0x81] = 13
        self.uc.mem_write(seg * 16, bytes(psp)); self.uc.mem_write(seg * 16 + 0x100, open(path, 'rb').read())
        for n, v in (('cs', seg), ('ds', seg), ('es', seg), ('ss', seg), ('sp', 0xFFFE)):
            self.w(n, v)
        self.uc.emu_start(seg * 16 + 0x100, 0, count=100_000)
        assert self.done and self.log[-1] == (0x21, 0x31), 'double did not stay resident'
        self.done = False
        for n, v in keep.items():
            self.w(n, v)
        return self


def text(d):
    return bytes(d.out).decode('cp437')


def run_sample(disk, name):
    d = PC(os.path.join(disk, name), root=disk).run()
    return text(d).strip(), sorted(d.dos)


SIGS = {'COM stub and name (21 bytes)': COM_TAIL, 'EXE body mark (20 bytes)': BODY_MARK, 'COM restore code (6 bytes)': RESTORE}


def part0(rep):
    import zipfile
    raw = open(BUNDLE, 'rb').read()
    z = zipfile.ZipFile(BUNDLE)
    members = {n: z.read(n) for n in z.namelist()}
    scene = {n: open(os.path.join(SCENE, n), 'rb').read() for n in os.listdir(SCENE)}
    hits = lambda files: sorted(f'{n}: {k}' for n, d in files.items() for k, sig in SIGS.items() if sig in d)
    checks = {
        'no scene file in programs/KVC_LIVE holds a plain signature run': not hits(scene),
        'the bundle file holds no plain signature run': not hits({'kvc-live.jsdos': raw}),
        'no file inside the bundle holds a plain signature run': not hits(members),
    }
    rep.append('## Part 0: nothing hosted holds Koko\'s bytes in plain form\n')
    rep.append('KVC\'s signature table is 47 bytes of Koko\'s code (21 + 20 + 6), read from KVC itself. HELLO.COM and GREET.EXE are stored '
               'scrambled (each byte XOR a rolling key), and UNWRAP.COM, the first line of START.BAT, puts them back inside the emulator.\n')
    rep.append('| Check | Result |\n|---|---|')
    rep += [f'| {k} | {"PASS" if v else "FAIL"} |' for k, v in checks.items()]
    found = hits(scene) + hits({'kvc-live.jsdos': raw}) + hits(members)
    rep.append('\n' + ('Found: ' + ', '.join(found) if found else f'Searched {len(scene)} scene files, the {len(raw):,}-byte bundle and its {len(members)} members.') + '\n')
    return checks


def part1(rep):
    disk = tempfile.mkdtemp(prefix='kvc-live-')
    for f in os.listdir(SCENE):
        shutil.copy(os.path.join(SCENE, f), disk)
    u = PC(os.path.join(disk, 'UNWRAP.COM'), root=disk).run()     # START.BAT: UNWRAP, then DEL UNWRAP.COM
    unwrap_calls = sorted(u.dos)
    os.remove(os.path.join(disk, 'UNWRAP.COM'))
    unwrapped = {n: open(os.path.join(disk, n), 'rb').read() for n in clean}
    before = {n: run_sample(disk, n) for n in clean}

    d = PC(os.path.join(disk, 'KVC.EXE'), args=b' C:', root=disk)
    d.run_resident(os.path.join(disk, 'DOUBLE.COM'))
    v21, v3 = d.vec(0x21), d.vec(3)
    assert v21[1] == 0x0700 and v3 == (d.stub(0x21), ROM), 'double not hooked as expected'
    d.run()
    out = text(d)
    after21, after3 = d.vec(0x21), d.vec(3)
    files = {n: open(os.path.join(disk, n), 'rb').read() for n in clean}
    after = {n: run_sample(disk, n) for n in clean}

    tones, on_at = [], None                       # (divisor, instructions it sounded for)
    for i, (t, port, v) in enumerate(d.speaker):
        if port == 0x42 and i + 1 < len(d.speaker) and d.speaker[i + 1][1] == 0x42:
            tones.append([v | d.speaker[i + 1][2] << 8, t])
    ends = [t for t, port, v in d.speaker if port == 0x61 and not v & 3]
    starts = [t for _, t in tones] + ends[-1:]
    tones = [(div, starts[i + 1] - starts[i]) for i, (div, _) in enumerate(tones)]

    checks = {
        'UNWRAP.COM only opens, reads, seeks, writes and closes (DOS calls 3Dh, 3Fh, 42h, 40h, 3Eh, 4Ch)': unwrap_calls == [0x3D, 0x3E, 0x3F, 0x40, 0x42, 0x4C],
        'after UNWRAP, the samples carry all 47 signature bytes KVC looks for': all(
            sig in unwrapped[n] for n, sigs in (('HELLO.COM', (COM_TAIL, BODY_MARK, RESTORE)), ('GREET.EXE', (COM_TAIL, BODY_MARK))) for sig in sigs),
        'Koko found in memory': 'Found  --KoKo (1) virus--  active in  RAM' in out,
        'Koko frozen (INT 21h now points at DOS, not the double)': '##### Virus Freezed #####' in out and after21 == after3 == (d.stub(0x21), ROM),
        'alarm: 20 tones on the PC speaker, then speaker off': len(tones) == 20 and len(ends) == 1,
        'alarm divisors alternate 1000, 1600': [t[0] for t in tones] == [1000, 1600] * 10,
        '4 files scanned, 2 found, 2 removed': all(s in out for s in ('scanned  >>     4', 'found   >>     2', 'removed >>     2')),
        'HELLO.COM equals the clean original byte for byte': files['HELLO.COM'] == clean['HELLO.COM'],
        'GREET.EXE equals the clean original byte for byte': files['GREET.EXE'] == clean['GREET.EXE'],
        'marked samples only print and exit (DOS calls 09h, 4Ch)': all(b[1] == [0x09, 0x4C] for b in before.values()),
    }
    rep.append('## Part 1: Unicorn PC, shipped KVC.EXE (packed, 11,000 bytes)\n')
    rep.append('Real interrupt table. On a copy of `programs/KVC_LIVE`: UNWRAP.COM runs and is deleted, as START.BAT does; DOUBLE.COM loads resident; then `KVC C:`.\n')
    rep.append('| Check | Result |\n|---|---|')
    rep += [f'| {k} | {"PASS" if v else "FAIL"} |' for k, v in checks.items()]
    rep.append('\n### Vectors\n')
    rep.append(f'- After the double loads: INT 21h = {v21[1]:04X}:{v21[0]:04X} (the double), INT 3 = {v3[1]:04X}:{v3[0]:04X} (DOS entry)')
    rep.append(f'- After KVC: INT 21h = {after21[1]:04X}:{after21[0]:04X}, INT 3 = {after3[1]:04X}:{after3[0]:04X}\n')
    rep.append('### Alarm as KVC played it (port 42h divisors, instructions per tone)\n')
    rep.append('| # | Divisor | Hz | Instructions |\n|---|---|---|---|')
    rep += [f'| {i + 1} | {div} | {PIT_HZ / div:.1f} | {n:,} |' for i, (div, n) in enumerate(tones)]
    rep.append('\n### Samples before and after (output when run)\n')
    for n in clean:
        rep.append(f'- {n} marked ({len(open(os.path.join(SCENE, n), "rb").read()):,} bytes): `{" / ".join(before[n][0].splitlines())}`')
        rep.append(f'- {n} cleaned ({len(files[n]):,} bytes, sha256 {sha(files[n])}, clean original {sha(clean[n])}): `{after[n][0]}`')
    rep.append('\n### Text screen when KVC exits\n\n```\n' + '\n'.join(l for l in d.screen().split('\n') if l.strip()) + '\n```\n')
    shutil.rmtree(disk)
    return checks, tones


def tap_js(when):
    """Browser code: the first audio node that matches `when` also feeds an analyser; every 20 ms log
    [time ms, RMS, pitch Hz]; pitch is the median distance between rising edges (found to a fraction of a
    sample) in a 2048-sample window, so a window that spans a tone change still reads its main tone."""
    return """
      window.__snd = [];
      const C0 = AudioNode.prototype.connect;
      AudioNode.prototype.connect = function (d, ...r) {
        if ((%s) && !window.__an) {
          const an = window.__an = this.context.createAnalyser(), sr = this.context.sampleRate, buf = new Float32Array(an.fftSize = 2048);
          C0.call(this, an);
          setInterval(() => {
            an.getFloatTimeDomainData(buf); let m = 0, s = 0; for (const v of buf) m += v; m /= buf.length;
            const up = []; for (let i = 1; i < buf.length; i++) { s += (buf[i] - m) ** 2; if (buf[i - 1] <= m && buf[i] > m) up.push(i - 1 + (m - buf[i - 1]) / (buf[i] - buf[i - 1])); }
            const per = up.slice(1).map((v, i) => v - up[i]).sort((a, b) => a - b);
            window.__snd.push([performance.now() | 0, Math.sqrt(s / buf.length), per.length ? sr / per[per.length >> 1] : 0]);
          }, 20);
        }
        return C0.call(this, d, ...r);
      };""" % when


def tones_of(snd):
    """Seconds with a tone, and the median pitch of the high and the low windows."""
    loud = [w for w in snd if w[1] > 0.02 and w[2] > 200]
    med = lambda xs: sorted(xs)[len(xs) // 2] if xs else 0
    return ((loud[-1][0] - loud[0][0]) / 1000 if loud else 0,
            med([w[2] for w in loud if w[2] > 950]), med([w[2] for w in loud if w[2] <= 950]))


SCRDUMP = bytes.fromhex('b43c31c9ba2601cd21721689c31eb800b88ed831d2b9a00fb440cd211fb43ecd21b8004ccd21') + b'SCREEN.BIN\0'
KEYS = {' ': [32], '.': [46], '\\': [92], ':': [340, 59]}


def part2(rep):
    try:
        urllib.request.urlopen(PAGE, timeout=5)
    except Exception as e:
        rep.append(f'## Part 2: js-dos\n\nSkipped: {PAGE} did not answer ({e}).\n')
        return None
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        br = p.chromium.launch(channel='chrome', headless=True, args=['--autoplay-policy=no-user-gesture-required'])
        pg = br.new_page(viewport={'width': 1280, 'height': 1000})
        pg.route_web_socket(re.compile('.*'), lambda ws: None)   # the dev server's reload channel: other edits must not reload the page
        pg.route('**/bundles/kvc-live.jsdos*', lambda r: r.fulfill(path=BUNDLE, content_type='application/zip'))
        # The page's demo PC sends its sound through one gain node it marks; tap that node with an analyser
        pg.add_init_script("""window.addEventListener('kvc:ready', e => { window.__ci = e.detail.ci; });""" + tap_js('this.__kvcMaster'))
        pg.goto(PAGE)
        demo = pg.locator('[data-kvclive]')
        demo.scroll_into_view_if_needed()
        demo.locator('[data-boot]').click()                    # a visitor's click starts the PC (and allows sound)
        pg.wait_for_function('window.__ci', timeout=90_000)
        time.sleep(2)
        shot = lambda name: demo.locator('[data-screen]').screenshot(path=os.path.join(HERE, name))
        shot('jsdos-1-ready.png')

        def type_line(s):
            for ch in s:
                pg.evaluate('c => window.__ci.simulateKeyPress(...c)', KEYS.get(ch, [ord(ch.upper())])); time.sleep(0.08)
            pg.evaluate('window.__ci.simulateKeyPress(257)'); time.sleep(0.2)

        def wait_still(limit=60):
            last, still, t0 = None, 0, time.time()
            while time.time() - t0 < limit and still < 4:
                h = sha(demo.locator('[data-screen]').screenshot()); still = still + 1 if h == last else 0; last = h; time.sleep(0.5)

        demo.locator('[data-type="SCAN"]').click(); time.sleep(1.4)   # the page's own SCAN key
        shot('jsdos-2-alarm.png')
        wait_still()
        shot('jsdos-3-done.png')
        pg.evaluate('async a => await window.__ci.fsWriteFile("SCRDUMP.COM", new Uint8Array(a))', list(SCRDUMP))
        has = lambda: '"SCREEN.BIN"' in pg.evaluate('async () => JSON.stringify(await window.__ci.fsTree())')
        type_line('SCRDUMP'); time.sleep(1.5)       # no RESCAN first: it would scroll KVC's top lines away
        if not has():
            type_line('RESCAN'); time.sleep(0.5); type_line('SCRDUMP'); time.sleep(1.5)
        raw = bytes(pg.evaluate('async () => Array.from(await window.__ci.fsReadFile("SCREEN.BIN"))'))
        screen = '\n'.join(raw[i * 160:(i + 1) * 160:2].decode('cp437').rstrip() for i in range(25))
        files = {n: bytes(pg.evaluate('async f => Array.from(await window.__ci.fsReadFile(f))', n)) for n in clean}
        snd = pg.evaluate('window.__snd')
        br.close()

    loud_sec, hi, lo = tones_of(snd)
    import zipfile
    z = zipfile.ZipFile(BUNDLE)
    same = sorted(n for n in z.namelist() if not n.startswith('.jsdos')) == sorted(os.listdir(SCENE)) and all(
        z.read(n) == open(os.path.join(SCENE, n), 'rb').read() for n in os.listdir(SCENE))
    checks = {
        'bundle holds exactly the files of programs/KVC_LIVE': same,
        'KVC found Koko in memory': 'KoKo (1) virus--  active in  RAM' in screen,
        'Koko frozen': '##### Virus Freezed #####' in screen,
        '4 files scanned, 2 found, 2 removed': all(s in screen for s in ('scanned  >>     4', 'found   >>     2', 'removed >>     2')),
        'HELLO.COM equals the clean original byte for byte': files['HELLO.COM'] == clean['HELLO.COM'],
        'GREET.EXE equals the clean original byte for byte': files['GREET.EXE'] == clean['GREET.EXE'],
        'PC speaker alarm heard in the page audio, about 1.3 s': 1.0 < loud_sec < 2.0,
        'two alternating pitches, high/low = 1.6 like divisors 1600/1000': lo > 0 and abs(hi / lo - 1.6) < 0.05,
    }
    rep.append('## Part 2: js-dos 8.5.3 in headless Chrome (what a visitor gets)\n')
    rep.append(f'Page {PAGE}: the demo PC in the writeup, booted by a click on its Start button, its bundle request answered by `public/bundles/kvc-live.jsdos`. SCAN typed by a click on the page\'s own Type SCAN key.\n')
    rep.append('| Check | Result |\n|---|---|')
    rep += [f'| {k} | {"PASS" if v else "FAIL"} |' for k, v in checks.items()]
    rep.append(f'\nSound (analyser on the demo\'s sound output, 2048-sample windows every 20 ms): tone present for {loud_sec:.2f} s, '
               f'median pitch {hi:.0f} Hz and {lo:.0f} Hz (KVC asks for 1193 Hz and 746 Hz: js-dos plays both {1 - hi / 1193.2:.0%} low). '
               f'The sound starts from the click on Start, as it does for a visitor.\n')
    rep.append('Screens: `jsdos-1-ready.png` (boot scene), `jsdos-2-alarm.png` (1 s after SCAN), `jsdos-3-done.png` (finished).\n')
    rep.append('### Text screen after the run (read from video memory)\n\n```\n' + '\n'.join(l for l in screen.split('\n') if l.strip()) + '\n```\n')
    return checks


def part3(rep, kvc_tones):
    import subprocess
    from playwright.sync_api import sync_playwright
    src = open(os.path.join(ROOT, 'src', 'lib', 'kvc', 'siren.ts')).read()
    js = subprocess.run(['node', '-e', 'process.stdout.write(require("esbuild").transformSync(require("fs").readFileSync(0, "utf8"),'
                         '{loader: "ts", format: "iife", globalName: "KVC"}).code)'], input=src, capture_output=True, text=True, cwd=ROOT, check=True).stdout
    with sync_playwright() as p:
        br = p.chromium.launch(channel='chrome', headless=True)
        pg = br.new_page()
        pg.add_init_script(tap_js('d instanceof AudioDestinationNode'))
        # runs as the page loads, before any input: play() must refuse (Playwright's evaluate counts as a gesture)
        pg.add_init_script(js + ';window.__siren = KVC.createSiren(); window.__nogesture = window.__siren.play().then(() => "played", e => e.message);')
        pg.goto(PAGE.split('/program/')[0] + '/')       # any page on the site's origin
        no_gesture = pg.evaluate('window.__nogesture')
        pg.evaluate("""document.body.insertAdjacentHTML('afterbegin', '<button id="kvc-siren" style="position:fixed;top:0;left:0;z-index:99999">Play</button>');
                       document.getElementById('kvc-siren').onclick = () => window.__siren.play().then(() => window.__done = 1);""")
        pg.click('#kvc-siren')
        pg.wait_for_function('window.__done', timeout=10_000); time.sleep(0.2)
        snd = pg.evaluate('window.__snd')
        br.close()
    dur, hi, lo = tones_of(snd)
    kvc_ms = sum(n for _, n in kvc_tones) / 1000         # instructions at 1 per microsecond (10 MHz 286)
    checks = {
        'refuses to start without a click or key press': no_gesture != 'played',
        f'plays for the KVC alarm length ({kvc_ms / 1000:.2f} s at 1 µs per instruction)': abs(dur - kvc_ms / 1000) < 0.1,
        'high tone 1193 Hz, low tone 746 Hz (within 2%)': abs(hi / 1193.2 - 1) < 0.02 and abs(lo / 745.7 - 1) < 0.02,
    }
    rep.append('## Part 3: `src/lib/kvc/siren.ts` in Chrome, started by a real click\n')
    rep.append('| Check | Result |\n|---|---|')
    rep += [f'| {k} | {"PASS" if v else "FAIL"} |' for k, v in checks.items()]
    rep.append(f'\nMeasured with the same analyser as part 2: tone present {dur:.2f} s, median pitch {hi:.0f} Hz and {lo:.0f} Hz. '
               f'Without a gesture `play()` answered: "{no_gesture}".\n')
    return checks


def main():
    rep = ['# kvc-live end-to-end report\n',
           f'Generated {time.strftime("%Y-%m-%d %H:%M")} by `research/artifacts/koko/e2e.py`.\n',
           'Rerun:\n\n```\nuv run -q --with capstone python -I research/artifacts/koko/build.py   # rebuild scene files\n'
           'uv run -q --with unicorn --with playwright python -I research/artifacts/koko/e2e.py\n```\n']
    c0 = part0(rep)
    c1, kvc_tones = part1(rep)
    browser = '--no-browser' not in sys.argv
    c2 = part2(rep) if browser else None
    c3 = part3(rep, kvc_tones) if browser else None
    ok = all(c0.values()) and all(c1.values()) and all(all(c.values()) for c in (c2, c3) if c)
    rep.insert(1, f'**Result: {"PASS" if ok else "FAIL"}** (safety {sum(c0.values())}/{len(c0)}, emulator {sum(c1.values())}/{len(c1)}'
                  + (f', js-dos {sum(c2.values())}/{len(c2)}' if c2 else ', js-dos not run')
                  + (f', siren {sum(c3.values())}/{len(c3)}' if c3 else '') + ')\n')
    open(os.path.join(HERE, 'e2e-report.md'), 'w').write('\n'.join(rep))
    print('\n'.join(rep))
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
