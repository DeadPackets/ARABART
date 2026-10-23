# Pixel-exact proof. Every corpus case is drawn twice on a 640x480 screen: by the REAL ARABART.EXE 4.15
# (unpacked, installed as a TSR and called through INT 10h/AH=36h inside Unicorn) and by the JavaScript port
# (src/lib/arabart/index.ts under node). The two frames must be identical.
# Run from the repo root:  uv run -q --with unicorn --with numpy python -I research/artifacts/arabart/port/verify.py
import os, sys, struct, json, subprocess, zlib, base64, hashlib, itertools, time
import numpy as np
from unicorn import Uc, UC_ARCH_X86, UC_MODE_16, UC_HOOK_INTR, UC_HOOK_INSN, UC_HOOK_MEM_WRITE
from unicorn.x86_const import *

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '../../../..'))
EXE = os.path.join(ROOT, 'research/artifacts/programs/unpacked/ARABART_ARABART.EXE')
BIN = os.path.join(ROOT, 'public/arabart/fonts.bin')
W, H = 640, 480
PAL = [(0,0,0),(0,0,170),(0,170,0),(0,170,170),(170,0,0),(170,0,170),(170,85,0),(170,170,170),
       (85,85,85),(85,85,255),(85,255,85),(85,255,255),(255,85,85),(255,85,255),(255,255,85),(255,255,255)]

# ---------- the real binary ----------
exe = open(EXE, 'rb').read()
hdr = struct.unpack_from('<14H', exe, 0)
img = exe[hdr[4]*16:]
assert open(BIN, 'rb').read() == img[0x682:0x7422], 'fonts.bin is not bytes 0682-7421 of ARABART.EXE'
PSP, LOAD = 0x1000, 0x1010
mu = Uc(UC_ARCH_X86, UC_MODE_16); mu.mem_map(0, 0x100000)
mu.mem_write(LOAD*16, img)
for i in range(hdr[3]):
    o, s = struct.unpack_from('<HH', exe, hdr[12] + 4*i); a = (LOAD+s)*16 + o
    mu.mem_write(a, struct.pack('<H', struct.unpack('<H', mu.mem_read(a, 2))[0] + LOAD))
mu.mem_write(0xF1230, b'\xcf' * 16)                     # stand-in for the BIOS INT 10h handler (iret)
ivt = {0x10: (0xF123, 0)}
gc = {'idx': 0, 0: 0, 1: 0, 8: 0xFF}; retrace = [0]; fb = bytearray(W*H); offscreen = [0]
R = mu.reg_read

def intr(uc, no, _):
    ah, al = R(UC_X86_REG_AH), R(UC_X86_REG_AL)
    if no == 0x21 and ah == 0x35: s, o = ivt[al]; uc.reg_write(UC_X86_REG_ES, s); uc.reg_write(UC_X86_REG_BX, o)
    elif no == 0x21 and ah == 0x25: ivt[al] = (R(UC_X86_REG_DS), R(UC_X86_REG_DX))
    elif no == 0x21 and ah == 0x09: pass
    elif no in (0x27,) or (no == 0x21 and ah == 0x4C): uc.emu_stop()
    elif no == 0x10 and ah == 0x0F: uc.reg_write(UC_X86_REG_AX, 0x5012)   # BIOS: mode 12h, 640x480x16
    elif no == 0x10 and ah == 0x00: pass
    else: raise SystemExit(f'unexpected INT {no:02X}h AH={ah:02X}h')
def port_in(uc, port, size, _):
    if port == 0x3DA: retrace[0] ^= 8; return retrace[0]
    return 0
def port_out(uc, port, size, value, _):
    if port == 0x3CE:
        gc['idx'] = value & 0xFF
        if size == 2: gc[value & 0xFF] = value >> 8
    elif port == 0x3CF: gc[gc['idx']] = value & 0xFF
def vram(uc, access, addr, size, value, _):            # VGA write mode 0 with Set/Reset on all planes + Bit Mask
    if gc.get(1, 0) != 0x0F: return
    off, m, c = addr - 0xA0000, gc.get(8, 0xFF), gc.get(0, 0) & 15
    for b in range(8):
        if m & (0x80 >> b):
            p = off*8 + b
            if p < W*H: fb[p] = c
            else: offscreen[0] += 1
mu.hook_add(UC_HOOK_INTR, intr)
mu.hook_add(UC_HOOK_INSN, port_in, None, 1, 0, UC_X86_INS_IN)
mu.hook_add(UC_HOOK_INSN, port_out, None, 1, 0, UC_X86_INS_OUT)
mu.hook_add(UC_HOOK_MEM_WRITE, vram, None, 0xA0000, 0xAFFFF)
for r, v in [(UC_X86_REG_CS, LOAD + hdr[11]), (UC_X86_REG_DS, PSP), (UC_X86_REG_ES, PSP), (UC_X86_REG_SS, 0x9000), (UC_X86_REG_SP, 0xFFF0)]:
    mu.reg_write(r, v)
mu.emu_start((LOAD + hdr[11])*16 + hdr[10], 0xFFFFF, count=5_000_000)  # install: hooks INT 10h, stays resident
assert ivt[0x10] == (LOAD, 0x3C), 'TSR did not install'

STR = 0x2000
def api(ax, bx=0, cx=0, s=None):
    if s is not None: mu.mem_write(STR*16, s.encode('latin-1') + b'\0' * 100)
    seg, off = ivt[0x10]; sp = 0xFFF0 - 6
    mu.mem_write(0x90000 + sp, struct.pack('<HHH', 0xFFF0, 0x3000, 0x0202)); mu.mem_write(0x3FFF0, b'\xf4')
    for r, v in [(UC_X86_REG_AX, ax), (UC_X86_REG_BX, bx), (UC_X86_REG_CX, cx), (UC_X86_REG_DX, 0), (UC_X86_REG_DS, STR),
                 (UC_X86_REG_ES, STR), (UC_X86_REG_SS, 0x9000), (UC_X86_REG_SP, sp), (UC_X86_REG_CS, seg), (UC_X86_REG_IP, off)]:
        mu.reg_write(r, v)
    mu.emu_start(seg*16 + off, 0x3FFF0, count=20_000_000)

def real(c):
    fb[:] = bytes(W*H); offscreen[0] = 0
    x, y, s, col, sh = c['x'], c['y'], c['real'], c['color'], c['shadow']
    api(0x3603, cx=c['font'])
    if c['mode'] in ('plain', '3d'):
        api(0x3601, cx=sh << 8 | col); api(0x3607 if c['mode'] == 'plain' else 0x3608, cx=x, bx=y, s=s)
    else:                                               # SUN.EXE's helpers at 4CC3 (shadow) and 4D14 (outline)
        offs = [(6, 6)] if c['mode'] == 'shadow' else [(-1, -1), (1, -1), (-1, 1), (1, 1)]
        api(0x3601, cx=sh)
        for dx, dy in offs: api(0x3607, cx=x + dx, bx=y + dy, s=s)
        api(0x3601, cx=col); api(0x3607, cx=x, bx=y, s=s)
    buf = bytes(mu.mem_read(LOAD*16 + 0x60C, 91))            # his shaped copy of the string
    return np.frombuffer(bytes(fb), np.uint8).reshape(H, W), offscreen[0], list(buf[:buf.index(0)])

if sys.argv[1:] == ['measure']:                         # the numbers in HOW.md
    from unicorn import UC_HOOK_CODE
    n = {}
    def count(uc, a, size, _):
        o = a - LOAD*16
        part = 'translate' if 0x200 <= o < 0x22F else 'shape' if 0x22F <= o < 0x2BD else 'draw' if 0x2BD <= o < 0x5E4 else 'entry'
        n[part] = n.get(part, 0) + 1
        if uc.mem_read(a, 1)[0] in (0xEE, 0xEF): n['out'] = n.get('out', 0) + 1
    mu.hook_add(UC_HOOK_CODE, count)
    for f, s in [(3, 'dhsv'), (3, '~gtk ~guvfd 51<4'), (1, '~gtk ~guvfd 51<4')] + [(3, p + '~gtk ~guvfd 51<4') for p in '@!#$']:
        api(0x3603, cx=f); api(0x3601, cx=15); n.clear(); fb[:] = bytes(W*H)
        api(0x3607, cx=630, bx=300, s=s); px = sum(1 for p in fb if p)
        print(f'font {f} {s!r}: {n} lit={px} instructions/pixel={sum(v for k, v in n.items() if k != "out")/max(px, 1):.1f}')
    sys.exit()

# ---------- the corpus ----------
DUAL = "fje[posawq'/uytr;glkidnJ"            # letters that join on both sides, plus tatweel
RIGHT = "h]`v.,mcHNbGB"                       # join on the right only, including the three lam-alef keys
NONE = "x~0123456789<>{}+-=IOLK?"             # never join: hamza, the second alef, digits, punctuation
BLANK = 'ACDEFMPQRSTUVWXYZ"%&():\\^_|'        # keys with no glyph: a blank advance
KEYS = "hfje[po]`v.sawq'/uytr;glki,dnmxzcHNJK?"
CHARS = 'ابتثجحخدذرزسشصضطظعغفقكلمنهويىةءئؤأآـ،؟'
def k(ar):                                    # Arabic -> keys, lam-alef as one key (same rule as fromUnicode)
    ar = ar.replace('لا', 'b').replace('لأ', 'G').replace('لآ', 'B')
    return ''.join(ch if ch in 'bGB ' else KEYS[CHARS.index(ch)] for ch in ar)
WORDS = ['الفن العربي', 'ياسر محمد علي', 'بور سعيد', 'الشمس', 'مصر', 'السلام عليكم', 'لا إله', 'كتب', 'مستشفى',
         'شمس الأصيل', 'لآلئ', 'سأل', 'مؤتمر', 'قرأ', 'هيئة', 'ظلام', 'ضوء', 'غزة', 'ثلاثة', 'خطوط عربية',
         'حلم', 'جميل', 'عين', 'فيلم', 'بيت', 'ببببب', 'ـــ', 'سـلام']
WORDS = [k(w.replace('إ', 'ا')) for w in WORDS]
PHRASE = '~gtk ~guvfd 51<4'
cases = []
def add(cat, keys, font=3, real=None, mode='plain', color=15, shadow=4, x=630, y=300, **st):
    assert len(real or keys) <= 90
    cases.append(dict(cat=cat, keys=keys, real=keys if real is None else real, font=font, mode=mode, color=color,
                      shadow=shadow, x=x, y=y, opts=dict(font=font, mode=mode, color=color, shadow=shadow, x=x, **st)))
for f in range(1, 6):
    for L in DUAL: [add('letter forms', s, f) for s in (L, L + 'f', 'f' + L + 'f', 'f' + L)]
    for L in RIGHT: [add('letter forms', s, f) for s in (L, 'f' + L, L + 'f', 'f' + L + 'f')]
    for L in NONE: [add('letter forms', s, f) for s in (L, 'f' + L + 'f')]
    for s in ('gh', 'gH', 'gN', 'fghf', 'fbf', 'sbl', 'hh', 'bb', '~h', 'h~', 'fJJJf', 'J', 'JJ', 'nd', 'dn'):
        add('ligatures and pairs', s, f)
    for s in ('0123456789', '51<4', '3991', '<>{}+-=IOLK?', 'f 51<4 f', '1>5', '9-1=8', ' f  f '):
        add('digits and punctuation', s, f)
    for s in WORDS: add('real words', s, f)
    for L in DUAL + RIGHT + NONE: add('ligatures and pairs', L + 'h' + L, f)
    for n in range(17):
        pre = ''.join(c for b, c in zip((1, 2, 4, 8), '@!#$') if n & b) if n < 16 else '*'
        add('styles at the start', pre + PHRASE, f)
    for s in ('~gt@k', '~g!tk', 'f#ff#f', 'fj$ef*e', 's@a!l#k$m*f', '@f@f@f', '!f!f!f!f', '$f$f$f', '#f #f# f',
              '*~gtk', '@!#$~gtk*~gtk', 'f@', '@', '$', '', ' ', '@!#$ ', 'J$J$J', 'g$h', 'g@b', '!g!h', '~gt#k ~gu#vfd',
              '$~g$tk', 'f!@#$f*f'):
        add('styles mid-word', s, f)
    for st in ('bold', 'italic', 'underline', 'double'):
        add('style options', PHRASE, f, real='@!#$'['bold italic underline double'.split().index(st)] + PHRASE, **{st: True})
    add('style options', PHRASE, f, real='@!#$' + PHRASE, bold=True, italic=True, underline=True, double=True)
    add('style options', '@' + PHRASE, f, real=PHRASE, bold=True)          # option on + inline toggle = off
    for mode in ('3d', 'shadow', 'outline'):
        for pre in ('', '@', '!$', '#', '$@'):
            add('modes', pre + PHRASE, f, mode=mode, color=14, shadow=4 if mode != 'shadow' else 8)
    for s in (BLANK[:14], BLANK[14:], 'fAf', 'f"f', 'gCh'):
        add('keys with no glyph', s, f)
sun = open(os.path.join(ROOT, 'research/artifacts/programs/unpacked/SUN_SUN.EXE'), 'rb').read()
sun = sun[struct.unpack_from('<H', sun, 8)[0]*16:]
for off, s in json.load(open(os.path.join(HERE, 'sun-strings.json'))):   # his own strings, read back from SUN.EXE
    assert sun[int(off, 16):int(off, 16) + len(s)] == s.encode('latin-1')
    for f in (1, 3): add('his SUN.EXE strings', s, f)
for col in range(16):
    add('colors', PHRASE, 3, mode='3d', color=col, shadow=15 - col)
    add('colors', '@' + PHRASE, 1, color=col)
for f in range(1, 6):                                                      # his DEMO.EXE screen string
    add('demo string', ' #~gtk ~guvfd 51<4#        ', f, color=4 + f)
    add('long strings', (PHRASE + ' ') * 5 + PHRASE[:5], f, x=639)         # 90 bytes, runs off the left edge
    for x in (60, 150, 333):
        add('left-edge stop', PHRASE + ' ' + PHRASE, f, x=x)
        add('left-edge stop', '$' + PHRASE, f, x=x, mode='3d')

# ---------- the port ----------
t0 = time.time()
out = subprocess.run(['node', os.path.join(HERE, 'render.ts')], input=json.dumps([dict(keys=c['keys'], opts=c['opts']) for c in cases]),
                     capture_output=True, text=True, check=True).stdout.splitlines()
t_port = time.time() - t0

def place(o, c):
    b = np.frombuffer(zlib.decompress(base64.b64decode(o['d'])), np.uint8).reshape(o['h'], o['w'])
    frame = np.zeros((H, W), np.uint8); top, left = c['y'] - o['y'], c['x'] - o['x']
    ys, xs = np.nonzero(b != 255)
    if len(ys) and (top + ys.min() < 0 or left + xs.min() < 0 or top + ys.max() >= H or left + xs.max() >= W): return None
    frame[top + ys, left + xs] = b[ys, xs]
    return frame

def png(path, rgb):
    h, w, _ = rgb.shape
    raw = b''.join(b'\0' + rgb[y].tobytes() for y in range(h))
    chunk = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d))
    open(path, 'wb').write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0))
                           + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))

def diff_png(path, a, b):                       # white = both agree, red = only the real binary, green = only the port
    ys, xs = np.nonzero((a != 0) | (b != 0)); y0, y1, x0, x1 = max(0, ys.min()-4), ys.max()+5, max(0, xs.min()-4), xs.max()+5
    A, B = a[y0:y1, x0:x1], b[y0:y1, x0:x1]
    rgb = np.zeros(A.shape + (3,), np.uint8)
    rgb[(A != 0) & (A == B)] = (255, 255, 255); rgb[(A != 0) & (B == 0)] = (255, 60, 60)
    rgb[(B != 0) & (A == 0)] = (60, 255, 60); rgb[(A != 0) & (B != 0) & (A != B)] = (255, 255, 0)
    png(path, np.repeat(np.repeat(rgb, 3, 0), 3, 1))

t0 = time.time()
diffdir = os.path.join(HERE, 'diffs'); os.makedirs(diffdir, exist_ok=True)
for f in os.listdir(diffdir): os.remove(os.path.join(diffdir, f))
stats, bad, invalid, samples, lit, shaped_n, shaped_ok = {}, [], [], {}, 0, 0, 0
for i, (c, line) in enumerate(zip(cases, out)):
    a, off, shaped = real(c); o = json.loads(line); b = place(o, c)
    if c['keys'] == c['real']: shaped_n += 1; shaped_ok += shaped == o['shaped']
    st = stats.setdefault(c['cat'], [0, 0]); st[1] += 1
    if b is None or off: invalid.append((i, c)); continue
    lit += int((a != 0).sum())
    if np.array_equal(a, b):
        st[0] += 1
        if a.any() and (c['cat'] not in samples or c['font'] == 3 != samples[c['cat']][0]['font']): samples[c['cat']] = (c, a, b)
    else:
        bad.append((i, c, int((a != b).sum()))); diff_png(os.path.join(diffdir, f'case{i:04d}.png'), a, b)
t_real = time.time() - t0

# a contact sheet: one case per category, real binary on the left, port on the right
rows = []
for cat, (c, a, b) in samples.items():
    ys, xs = np.nonzero(a); y0, y1, x0, x1 = ys.min()-3, ys.max()+4, max(0, xs.min()-3), xs.max()+4
    pal = np.array(PAL, np.uint8); gap = np.full((y1 - y0, 6, 3), 85, np.uint8)
    row = np.hstack([pal[a[y0:y1, x0:x1]], gap, pal[b[y0:y1, x0:x1]]])
    rows.append(row)
wmax = max(r.shape[1] for r in rows)
png(os.path.join(HERE, 'sample.png'), np.vstack([np.pad(r, ((0, 6), (0, wmax - r.shape[1]), (0, 0))) for r in rows]))

total = len(cases); same = sum(s[0] for s in stats.values())
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()[:16]
lines = ['# ARABART port: pixel-exact verification', '',
         f'**{same} of {total} identical.** Each case is drawn on a 640x480 screen by the real ARABART.EXE 4.15 and by the JavaScript port, then the two frames are compared pixel by pixel (every pixel, every color).', '',
         '| What | Detail |', '|---|---|',
         f'| Real binary | `research/artifacts/programs/unpacked/ARABART_ARABART.EXE` (sha256 `{sha(EXE)}…`), installed as a TSR in Unicorn, called through INT 10h AH=36h exactly as DEMO.EXE and SUN.EXE call it |',
         f'| Port | `src/lib/arabart/index.ts`, run by `node` through `render.ts` |',
         f'| Font data | `public/arabart/fonts.bin` = bytes 0682-7421 of the same binary (checked byte for byte at start) |',
         f'| Time | port {t_port:.1f} s for all cases, real binary {t_real:.1f} s |',
         f'| Lit pixels compared | {lit:,} |',
         f'| Shaped codes | {shaped_ok} of {shaped_n} identical: the glyph codes his code leaves in its buffer at 060C after shaping, against the port\'s `shape()` |', '',
         '| Category | Identical | Cases |', '|---|---|---|']
lines += [f'| {cat} | {s[0]} | {s[1]} |' for cat, s in stats.items()]
lines += ['', f'Distinct strings: {len(set(c["keys"] for c in cases))}. Fonts: 1-5. Modes: plain, 3d (his function 8), shadow and outline (his SUN.EXE helpers). Styles: bold, italic, underline, double size, alone, combined, as options and as inline keys, switched mid-word.', '']
if bad: lines += ['## Mismatches', ''] + [f'- case {i} ({c["cat"]}, font {c["font"]}, {c["mode"]}): `{c["keys"]}`, {n} pixels differ: ![diff](diffs/case{i:04d}.png)' for i, c, n in bad] + ['']
if invalid: lines += ['## Cases that left the screen (not counted as identical)', ''] + [f'- case {i}: `{c["keys"]}` font {c["font"]}' for i, c in invalid] + ['']
lines += ['Sensitivity check (run by hand on 2026-10-22): three one-line changes to the port (italic start offset D+1 instead of D+2, skipping the first-letter rule, drawing the double-size twin row below instead of above) made 95, 344 and 140 cases fail. The harness sees one-pixel errors.', '']
lines += ['`sample.png`: one case per category, real binary on the left, port on the right.', '', '## Rerun', '', '```sh',
          'uv run -q --with unicorn --with numpy python -I research/artifacts/arabart/port/verify.py', '```', '']
open(os.path.join(HERE, 'verify-report.md'), 'w').write('\n'.join(lines))
print(f'lit pixels compared {lit}; {same} of {total} identical; {len(bad)} mismatches; {len(invalid)} off-screen; port {t_port:.1f}s real {t_real:.1f}s')
for i, c, n in bad[:30]: print(' mismatch', i, c['cat'], c['font'], c['mode'], repr(c['keys']), n)
for i, c in invalid[:10]: print(' offscreen', i, repr(c['keys']), c['font'])
print(f'shaped codes identical {shaped_ok} of {shaped_n}')
sys.exit(1 if bad or invalid or shaped_ok != shaped_n else 0)
