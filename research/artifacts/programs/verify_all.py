# Repeatable E2E checks for the parent analyst's findings. Writes verify_all.out.txt + render/*.png.
import os, sys, subprocess, hashlib, glob, struct, io, contextlib
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); os.chdir(HERE)
P = '/Users/deadpackets/workspace/DOSArchive/programs/'
log = []
def say(*a): s = ' '.join(str(x) for x in a); print(s); log.append(s)
# 1. DIET signature + unpack all 17 binaries
import undiet
for f in sorted(glob.glob(P+'*/*.EXE') + glob.glob(P+'*/*.COM')):
    d = open(f, 'rb').read(); out = 'unpacked/' + f[len(P):].replace('/', '_')
    if d[:2] == b'MZ':
        e = struct.unpack('<H', d[8:10])[0]*16 + 3
        assert d[e:e+10] == bytes.fromhex('fc061e0e8cc80106') + d[e+8:e+10] and d[e+55] != 0x64, f  # DIE rule: 0x64 here = DIET 1.10a/1.20, else 1.00
    else:
        assert d[3:5] == b'\x3b\xfc' and d[0] == 0xbf, f
    with contextlib.redirect_stdout(io.StringIO()): undiet.unpack(f, out)
    say('unpacked', f[len(P):], hashlib.md5(open(out, 'rb').read()).hexdigest())
# 2. FORM_X arithmetic
from dosemu import Dos
def formx(expr, a, b, path='unpacked/FORM_X_FORM_X.EXE'):
    d = Dos(path, (expr + '\r' + a + '\r' + b + '\r').encode()).run(); return d.snaps[-1]
s = formx('(x-3)*(x+2)/7', '-2', '2.5')
assert '-0.321428' in s and '-0.892857' in s; say('FORM_X (x-3)*(x+2)/7 at -1.5 -> -0.321428 (truncated), OK')
assert 'OVERFLOW' in formx('x/0', '1', '2'); say('FORM_X x/0 -> OVERFLOW, OK')
assert '0.166666' in formx('1/x', '1', '10'); say('FORM_X 1/6 -> 0.166666 (truncation, not rounding), OK')
# 3. FORM_X exit path and tamper check
from unicorn import UC_HOOK_CODE
def exit_jump(path):
    d = Dos(path, b'x*x+1\r1\r10\r '); seen = []
    d.uc.hook_add(UC_HOOK_CODE, lambda uc, a, s, _: seen.append(bytes(uc.mem_read(a, 3)).hex()) if d.r('cs') == 0x116a and d.r('ip') == 0xf13 else None)
    d.run(); return seen, d
seen, d = exit_jump('unpacked/FORM_X_FORM_X.EXE')
assert seen == ['e945fd'] and 'YASSER MOHAMED ALI' in d.screen(0); say('FORM_X JMP at 0F13 patched to E9 45 FD (-> 0C5B credits), decoded credit on screen, OK')
t = bytearray(open('unpacked/FORM_X_FORM_X.EXE', 'rb').read()); t[0x30+0x16a0+0x37d] = 1; open('formx_tampered.exe', 'wb').write(t)
seen, _ = exit_jump('formx_tampered.exe'); assert seen == ['e946fe']; say('FORM_X one-byte tamper -> JMP becomes E9 46 FE (-> 0D5C), OK')
# 4. Renders (run-length interpreter COMs, PESM planar VGA)
for cmd in (['gfx.py', 'unpacked/SCREEN_SCREEN.COM', 'render/screen.png', '1'],
            ['run_taher.py', 'unpacked/TAHER_TAHER.COM', 'render/taher.png', '1', '20000'],
            ['run_sheet.py', 'unpacked/ARABIC_DEMO.COM', 'render/arabicdemo_sheet.png'],
            ['vga.py', 'unpacked/PESM_PESM.EXE', 'render/pesm.png', '480']):
    r = subprocess.run([sys.executable, '-I'] + cmd, capture_output=True, text=True); assert r.returncode == 0, r.stderr
    say('render', cmd[2], hashlib.md5(open(cmd[2], 'rb').read()).hexdigest(), r.stdout.strip().splitlines()[0][:80])
# 5. KVC E2E on synthetic Koko-marked files
r = subprocess.run([sys.executable, '-I', 'kvc_e2e.py'], capture_output=True, text=True); assert r.returncode == 0, r.stdout + r.stderr
say(r.stdout.strip().splitlines()[-1])
# 6. Fork checks (Digi-Test formats, editor bugs, NAMES/PORTSAID reuse, SUN constants, ARAB-ART signature)
r = subprocess.run([sys.executable, '-I', 'digit/decode_formats.py', P + 'DIGI_T'], capture_output=True, text=True)
assert 'files with parse mismatch: 0 | wire paths verified: 170' in r.stdout; say('DIGI_T: 70 data files parse to their size trailer, 170/170 wire paths re-trace, OK')
r = subprocess.run([sys.executable, '-I', 'run_bugs.py'], capture_output=True, text=True, cwd='editors')
assert "\\xff\\r\\n\\xff" in r.stdout and "B1.TXT 157 b'ELLO'" in r.stdout, r.stdout[-500:]
say('EDITOR.EXE: feof bug adds FF per load/save; Del at col 100 of a 150-char line turns next line HELLO into ELLO, OK')
r = subprocess.run([sys.executable, '-I', 'shared.py'], capture_output=True, text=True, cwd='gfxprogs')
assert 'unordered shared bytes 153' in r.stdout; say('NAMES.COM and PORTSAID.EXE share 153 identical code bytes, OK')
sun = open('unpacked/SUN_SUN.EXE', 'rb').read(); sun = sun[struct.unpack('<H', sun[8:10])[0]*16:]
assert [struct.unpack('<f', sun[0x11ad0+o:0x11ad0+o+4])[0] for o in (0x19c1, 0x19c5, 0x19c9, 0x19cd)] == [225.0, 88.0, 356.0, 687.0]
say('SUN orbital-period floats at DS:19C1..19CD = 225, 88, 356 (Earth, should be ~365.25), 687, OK')
for f in ('unpacked/ARABART_ARABART.EXE', 'unpacked/SUN_ARAB-ART.EXE'):
    assert b'\xeb\n\x90DALYASSER' in open(f, 'rb').read()
say('ARABART 4.15 and ARAB-ART 7.15 share the 12-byte install signature EB 0A 90 "DALYASSER", OK')
open('verify_all.out.txt', 'w').write('\n'.join(log) + '\n'); say('ALL CHECKS PASSED')
