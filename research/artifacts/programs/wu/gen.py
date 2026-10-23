# Generates the SVG diagrams for the Programs writeups from the real unpacked bytes.
# Output: wu/svg/<name>.svg (wide svg + optional slot="narrow" svg). build.py pastes them into the .astro files.
import os, re, struct, html
HERE = os.path.dirname(os.path.abspath(__file__)); U = os.path.join(HERE, '..', 'unpacked')
EGA = ['#000000', '#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA',
       '#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF']
OUT = {}
CW = 9.6  # Martian Mono advance at 14px, measured on the page (conservative)

def esc(s): return html.escape(s, quote=False).replace('{', '&#123;').replace('}', '&#125;')
def T(x, y, s, cls='', anchor='start', extra=''):
    c = f' class="{cls}"' if cls else ''
    a = '' if anchor == 'start' else f' text-anchor="{anchor}"'
    return f'<text{c} x="{x:g}" y="{y:g}"{a}{extra}>{esc(s)}</text>'
def R(x, y, w, h, cls='box', extra=''):
    return f'<rect class="{cls}" x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}"{extra} />'
def P(d, cls='wire', extra=''): return f'<path class="{cls}" d="{d}"{extra} />'
def G(s, parts): return f'<g data-s="{s}">' + ''.join(parts) + '</g>'
def svg(vb, tid, title, body, narrow=False):
    slot = ' slot="narrow"' if narrow else ''
    return (f'<svg{slot} class="dg" viewBox="{vb}" role="img" aria-labelledby="{tid}">\n'
            f'<title id="{tid}">{esc(title)}</title>\n' + '\n'.join(body) + '\n</svg>')
def fill(c): return f' style="fill:{EGA[c]}"'
def ink(cls): return 't-bk' if cls in ('box-hi', 'box-ink') else ''

# ------------------------------------------------------------------ KVC
kvc = open(os.path.join(U, 'KVC_KVC.EXE'), 'rb').read()[0x40:]
assert kvc[0x7ef:0x7f2] == bytes.fromhex('b80cff') and kvc[0x7f4:0x7f7] == bytes.fromhex('3dc1c0')
assert kvc[0x840:0x844] == bytes.fromhex('b80335cc') and kvc[0x848:0x84c] == bytes.fromhex('b82125cc')
w = [R(10, 120, 120, 56), T(70, 154, 'KVC.EXE', '', 'middle'),
     T(310, 70, 'Interrupt table', 't-cy', 'middle'), R(210, 80, 200, 136),
     R(222, 96, 176, 44, 'box-bk'), T(234, 124, '0084  INT 21h'),
     R(222, 156, 176, 44, 'box-bk'), T(234, 184, '000C  INT 3'),
     R(480, 20, 150, 56, 'box-ink'), T(555, 54, 'Koko', 't-bk', 'middle'),
     R(480, 224, 150, 56), T(555, 258, 'DOS', '', 'middle'),
     P('M555 76 V222', 'wire dash'),
     G('1-2', [P('M130 140 H220', 'wire-hi arrow'), T(176, 130, 'FF0Ch', '', 'middle')]),
     G('1-4', [P('M398 112 L478 54', 'wire-hi arrow')]),
     G('2-5', [T(472, 40, 'replies C0C1h', 't-yl', 'end')]),
     G('3+', [P('M130 160 H220', 'wire-hi arrow'), P('M398 184 L478 246', 'wire-hi arrow')]),
     G('4+', [T(310, 238, 'INT 3 = DOS address', 't-yl', 'middle')]),
     G('5+', [P('M398 124 C446 124 452 220 478 236', 'wire-hi arrow'), T(310, 262, 'INT 21h = DOS address', 't-yl', 'middle')]),
     G('6', [T(630, 100, 'cut off', 't-yl', 'end'), T(310, 290, 'asks again: no reply, Freezed', 't-yl', 'middle')])]
n = [R(90, 0, 120, 44), T(150, 28, 'KVC.EXE', '', 'middle'),
     G('1+', [P('M150 44 V98', 'wire-hi arrow')]), G('1-2', [T(160, 76, 'FF0Ch')]),
     R(20, 100, 260, 112), T(150, 124, 'Interrupt table', 't-cy', 'middle'),
     R(32, 134, 236, 30, 'box-bk'), T(44, 155, '0084  INT 21h'),
     R(32, 172, 236, 30, 'box-bk'), T(44, 193, '000C  INT 3'),
     R(10, 300, 120, 50, 'box-ink'), T(70, 330, 'Koko', 't-bk', 'middle'),
     R(170, 300, 120, 50), T(230, 330, 'DOS', '', 'middle'),
     P('M130 325 H168', 'wire dash'),
     G('1-4', [P('M32 149 H16 V298', 'wire-hi arrow')]),
     G('3+', [P('M268 187 H276 V298', 'wire-hi arrow')]),
     G('5+', [P('M268 149 H290 V298', 'wire-hi arrow')]),
     G('2-5', [T(70, 374, 'C0C1h', 't-yl', 'middle')]),
     G('4+', [T(150, 236, 'INT 3 = DOS address', 't-yl', 'middle')]),
     G('5+', [T(150, 262, 'INT 21h = DOS', 't-yl', 'middle')]),
     G('6', [T(70, 398, 'cut off', 't-yl', 'middle'), T(150, 430, 'asks again: no reply', 't-yl', 'middle')])]
OUT['kvc-ram'] = svg('0 0 640 300', 'kvc-ram-t', 'KVC asks INT 21h for Koko, then copies the real DOS address from the INT 3 entry into the INT 21h entry, so DOS calls no longer pass through the virus.', w) + '\n' + \
    svg('0 0 300 440', 'kvc-ram-tn', 'KVC finds Koko through INT 21h, then points INT 21h back at DOS.', n, True)

# COM repair: the test file from kvc_e2e.py (host 278 bytes, body at paragraph 12h)
SIG = kvc[0x3780 + 0x59f:0x3780 + 0x59f + 21]; RESTORE = kvc[0x3780 + 0x5d5:0x3780 + 0x5d5 + 6]
assert SIG[:8] == bytes.fromhex('50b8000150 33c0cb'.replace(' ', '')) and SIG[10:18] == b'KoKo (1)' and RESTORE == bytes.fromhex('bf0001be2201')
HOST, PAD, BODY = 278, 10, 512
sc = 600 / (HOST + PAD + BODY)
def bar(x0, y, scale, h):
    xs = [x0, x0 + 26*scale, x0 + HOST*scale, x0 + (HOST+PAD)*scale, x0 + (HOST+PAD+BODY)*scale]
    return xs, [R(xs[0], y, xs[1]-xs[0], h, 'box-ink'), R(xs[1], y, xs[2]-xs[1], h), R(xs[2], y, xs[3]-xs[2], h, 'box-bk'), R(xs[3], y, xs[4]-xs[3], h, 'box-dash')]
xs, b = bar(20, 40, sc, 40)
w = [T(20, 26, 'Test file, 800 bytes (built from KVC\'s own checks)', 't-cy'), *b,
     T((xs[1]+xs[2])/2, 66, 'program', '', 'middle'), T((xs[3]+xs[4])/2, 66, 'Koko body', '', 'middle'),
     T(20, 100, '0'), T(xs[2]-2, 100, '278', '', 'end'), T(xs[3]+2, 100, '288'), T(620, 100, '800', '', 'end'),
     G('1', [R(xs[0]-3, 37, xs[1]-xs[0]+6, 46, 'wire-hi')]),
     G('1+', [T(20, 134, 'bytes 0-25:  ?? ?? ?? 12 00  50 B8 00 01 50 33 C0 CB'), T(20, 156, '             08 00 "KoKo (1)" 0A 0D 24')]),
     G('2', [R(xs[3]-3, 37, xs[4]-xs[3]+6, 46, 'wire-hi')]),
     G('2+', [T(20, 188, 'bytes 3-4 = 0012h paragraphs: body at 0120h (288)')]),
     G('3+', [T(20, 214, 'body+127h = BF 00 01 BE 22 01 (Koko\'s own code)')]),
     G('4+', [T(20, 240, 'body+18h = 0116h (278 bytes), body+22h = 26 bytes')]),
     G('5', [R(xs[0]-3, 37, xs[1]-xs[0]+6, 46, 'wire-hi')]),
     G('5+', [T(20, 266, 'the 26 bytes go back to 0, then the date and time')]),
     G('6', [R(xs[2], 37, xs[4]-xs[2]+3, 46, 'wire-hi')]),
     G('6', [T(20, 292, 'chsize 278: 522 bytes cut, byte-exact again', 't-yl')])]
xs, b = bar(20, 30, 260 / 800, 36)
n = [T(20, 18, 'Test file, 800 bytes', 't-cy'), *b, T((xs[1]+xs[2])/2, 54, 'program', '', 'middle'), T((xs[3]+xs[4])/2, 54, 'Koko body', '', 'middle'),
     T(20, 86, '0'), T(xs[2]-2, 86, '278', '', 'end'), T(280, 86, '800', '', 'end'),
     G('1', [R(xs[0]-3, 27, xs[1]-xs[0]+6, 42, 'wire-hi')]),
     G('1+', [T(10, 118, '1. bytes 5-25:'), T(10, 140, '50 B8 00 01 50 33 C0 CB'), T(10, 162, '08 00 "KoKo (1)" 0A 0D 24')]),
     G('2', [R(xs[3]-3, 27, xs[4]-xs[3]+6, 42, 'wire-hi')]),
     G('2+', [T(10, 194, '2. bytes 3-4 = 0012h'), T(10, 216, '   body at 0120h (288)')]),
     G('3+', [T(10, 248, '3. body+127h:'), T(10, 270, '   BF 00 01 BE 22 01')]),
     G('4+', [T(10, 302, '4. body+18h = 0116h (278)'), T(10, 324, '   body+22h = saved bytes')]),
     G('5+', [T(10, 356, '5. 26 bytes back to 0,'), T(10, 378, '   date and time back')]),
     G('6', [R(xs[2], 27, xs[4]-xs[2]+3, 42, 'wire-hi')]),
     G('6', [T(10, 410, '6. cut to 278 bytes:', 't-yl'), T(10, 432, '   byte-exact again', 't-yl')])]
OUT['kvc-com'] = svg('0 0 640 304', 'kvc-com-t', 'An 800-byte infected COM test file: the 26-byte stub, the program, padding and the Koko body, with the fields KVC reads to repair it.', w) + '\n' + \
    svg('0 0 300 444', 'kvc-com-tn', 'The infected COM test file and the six repair steps.', n, True)

# EXE header before and after (values from the kvc_e2e.py test file)
rows = [('02h last page', '0120h', '0020h', 'size mod 512'), ('04h pages', '0007h', '0003h', 'size / 512 + 1'),
        ('0Eh SS', '0099h', '0030h', 'from entry+4Fh'), ('10h SP', 'C0C1h', '0200h', 'from entry+53h'),
        ('14h IP', '0000h', '0010h', 'from entry+51h'), ('16h CS', '0050h', '0000h', 'from entry+4Dh'), ('file size', '3,360', '1,056', 'entry - 100h')]
w = [T(10, 24, 'Header field', 't-cy'), T(262, 24, 'infected', 't-cy', 'end'), T(392, 24, 'cleaned', 't-cy', 'end'), T(424, 24, 'source', 't-cy')]
for i, (f, a, c, src) in enumerate(rows):
    y = 58 + i*32
    w += [T(10, y, f), T(262, y, a, 't-yl' if a == 'C0C1h' else '', 'end'), T(392, y, c, '', 'end'), T(424, y, src)]
    if a == 'C0C1h': w.append(R(178, y-21, 92, 30, 'wire-hi'))
w += [T(10, 292, "SP = C0C1h is Koko's mark.", 't-cy')]
n = [T(10, 18, 'field', 't-cy'), T(186, 18, 'infected', 't-cy', 'end'), T(290, 18, 'cleaned', 't-cy', 'end')]
for i, (f, a, c, src) in enumerate(rows):
    y = 48 + i*30
    n += [T(10, y, f[4:] if f[3] == ' ' else 'size'), T(186, y, a, 't-yl' if a == 'C0C1h' else '', 'end'), T(290, y, c, '', 'end')]
n += [T(10, 270, 'SP = C0C1h: Koko\'s mark.', 't-cy')]
OUT['kvc-exe'] = svg('0 0 640 304', 'kvc-exe-t', 'EXE header fields of the infected test file and after KVC cleaned it, with where each value comes from: SP C0C1h becomes 0200h and the file shrinks from 3,360 to 1,056 bytes.', w) + '\n' + \
    svg('0 0 300 282', 'kvc-exe-tn', 'EXE header fields before and after KVC: SP C0C1h becomes 0200h.', n, True)

# code map
segs = [(0x0000, 0x0210, 'Borland start-up', 'box-bk'), (0x0210, 0x07e6, 'his C', 'box-hi'), (0x07e6, 0x1295, 'his Assembly', 'box-ink'),
        (0x1295, 0x1f93, 'his help text', 'box-dash'), (0x1f93, 0x3780, 'Borland runtime', 'box-bk'), (0x3780, 0x41e0, 'data', 'box')]
tot = 0x41e0; assert tot == len(kvc)
w = [T(10, 20, 'KVC.EXE unpacked, 16,864 bytes, to scale', 't-cy')]
for a, b_, lab, cls in segs: w.append(R(10 + a*620/tot, 32, (b_-a)*620/tot, 40, cls))
for i, (a, b_, lab, cls) in enumerate(segs):
    x = 10 + (i % 2)*320; y = 100 + (i // 2)*30
    w += [R(x, y-14, 18, 18, cls), T(x+28, y, f'{lab}  {b_-a:,} B')]
n = [T(10, 18, 'KVC.EXE, 16,864 bytes', 't-cy')]
for i, (a, b_, lab, cls) in enumerate(segs):
    y = 32 + i*32; bw = max(4, (b_-a)*70/0x17ed)
    n += [R(10, y, bw, 22, cls), T(88, y+17, f'{lab} {b_-a:,}')]
OUT['kvc-map'] = svg('0 0 640 180', 'kvc-map-t', 'Map of KVC.EXE to scale: Borland start-up, his C, his Assembly, his help text, the Borland runtime and data.', w) + '\n' + \
    svg('0 0 300 226', 'kvc-map-tn', 'KVC.EXE parts and their sizes in bytes.', n, True)

# ------------------------------------------------------------------ FORM_X
fxd = open(os.path.join(U, 'FORM_X_FORM_X.EXE'), 'rb').read()[0x30:]; fx = fxd[0x16a0:]
m15 = [9]*13 + [8, 5, 0, 0, 0, 0, 0]; three = [0]*13 + [3] + [0]*6   # captured at 016A:0288 and in the token buffer
def cells(ox, oy, vals, cw):
    b = []
    for i, v in enumerate(vals):
        cls = 'box' if i < 14 else 'box-ink'
        b += [R(ox + i*cw, oy, cw-2, 30, cls), T(ox + i*cw + (cw-2)/2, oy+21, str(v), ink(cls), 'middle')]
    return b
w = [T(90, 20, '14 digits before the point', 't-cy'), T(90 + 14*26, 20, '6 after', 't-cy'),
     T(10, 57, 'x=-1.5'), *cells(90, 36, m15, 26), T(10, 117, '3'), *cells(90, 96, three, 26),
     P(f'M{90 + 14*26 - 1} 30 V132', 'wire-hi'),
     T(10, 160, 'One byte per digit. First digit 9 is above 4: negative.'),
     T(10, 184, '99999999999998.5 is -1.5 in ten\'s complement.', 't-yl')]
def cells2(ox, oy, vals, cw):
    b = []
    for k, v in enumerate(vals):
        r, i = divmod(k, 10); cls = 'box' if k < 14 else 'box-ink'
        b += [R(ox + i*cw, oy + r*36, cw-2, 30, cls), T(ox + i*cw + (cw-2)/2, oy + r*36 + 21, str(v), ink(cls), 'middle')]
    return b
n = [T(10, 18, 'x = -1.5, 20 bytes', 't-cy'), *cells2(10, 30, m15, 28),
     T(10, 124, 'Light: the 6 digits after'), T(10, 146, 'the point. First digit 9'), T(10, 168, 'is above 4: negative.', 't-yl')]
OUT['fx-number'] = svg('0 0 640 196', 'fx-number-t', 'Two FORM_X numbers as 20 bytes each: x = -1.5 stored in ten\'s complement, and the constant 3.', w) + '\n' + \
    svg('0 0 300 180', 'fx-number-tn', 'x = -1.5 stored as 20 digit bytes.', n, True)

rows = [('-7.5', [9]*13 + [2, 5, 0, 0, 0, 0, 0], '1'), ('8', [0]*13 + [8] + [0]*6, '2'),
        ('added', [9]*13 + [10, 5, 0, 0, 0, 0, 0], '3'), ('carried', [0]*14 + [5, 0, 0, 0, 0, 0], '4')]
def subrows(ox, lab_x, cw, first, y0, dy):
    b = []
    for k, (lab, vals, s) in enumerate(rows):
        y = y0 + k*dy; g = [T(lab_x, y+21, lab)]
        for i, v in enumerate(vals[first:]):
            j = i + first; hi = (s == '3' and j == 13) or (s == '4' and j <= 13)
            cls = 'box-hi' if hi else ('box' if j < 14 else 'box-ink')
            g += [R(ox + i*cw, y, cw-2, 30, cls), T(ox + i*cw + (cw-2)/2, y+21, str(v), ink(cls), 'middle')]
        b.append(G(s, g))
    return b
w = [T(10, 20, 'Digits 0 to 19; the point sits after digit 13', 't-cy'), *subrows(90, 10, 27, 0, 34, 48),
     G('4', [T(90, 244, 'the carry runs through 13 nines and falls off', 't-yl')])]
n = [T(10, 18, 'Digits 12 to 19', 't-cy'), *subrows(80, 10, 27, 12, 30, 46),
     T(10, 222, 'Digits 0 to 11: all 9 in'), T(10, 244, 'rows 1 and 3, all 0 in 2, 4.')]
OUT['fx-sub'] = svg('0 0 640 256', 'fx-sub-t', 'FORM_X computes 8 - 7.5 as 8 plus the ten\'s complement of 7.5. The carry pass turns the 10 into 0 and ripples through the nines, leaving 0.5.', w) + '\n' + \
    svg('0 0 300 256', 'fx-sub-tn', '8 - 7.5 by adding the ten\'s complement, then carrying.', n, True)

# key filter: state byte DS:0282 (parser at 016A:0075)
LAMPS = [(0x02, '('), (0x04, '0-9'), (0x08, 'x'), (0x10, '*/+'), (0x20, '-'), (0x01, ')'), ('dot', '.')]
def allowed(st, bit): return ((st & 0xc0) == 0x40) if bit == 'dot' else bool(st & bit)
seq = [('start', None, 0x2E), ('2', True, 0x75), ('*', True, 0x0E), ('*', False, 0x0E), ('(', True, 0x2E), ('x', True, 0x31)]
w = [T(10, 22, 'Key', 't-cy'), T(64, 22, 'Result', 't-cy'), T(184, 22, 'DS:0282', 't-cy'), T(296, 22, 'Keys allowed next', 't-cy')]
w += [T(296 + i*48 + 20, 46, lab, '', 'middle') for i, (bit, lab) in enumerate(LAMPS)]
for k, (key, ok, st) in enumerate(seq):
    y = 56 + k*38
    g = [T(10, y+21, '-' if key == 'start' else key), T(64, y+21, 'start' if ok is None else ('accepted' if ok else 'ignored'), 't-yl' if ok is False else ''),
         T(184, y+21, f'{st:02X}h')]
    g += [R(296 + i*48, y+5, 40, 24, 'box-hi' if allowed(st, bit) else 'box-bk') for i, (bit, _) in enumerate(LAMPS)]
    w.append(G(str(k+1), g))
n = [T(10, 18, 'Key, DS:0282, allowed next', 't-cy')]
n += [T(118 + i*25 + 10.5, 44, lab if len(lab) == 1 else ('d' if lab == '0-9' else 'o'), '', 'middle') for i, (bit, lab) in enumerate(LAMPS)]
for k, (key, ok, st) in enumerate(seq):
    y = 54 + k*38
    g = [T(10, y+21, key + (' no' if ok is False else ''), 't-yl' if ok is False else ''), T(66, y+21, f'{st:02X}h')]
    g += [R(118 + i*25, y+5, 21, 24, 'box-hi' if allowed(st, bit) else 'box-bk') for i, (bit, _) in enumerate(LAMPS)]
    n.append(G(str(k+1), g))
n.append(T(10, 302, 'd: digit, o: * / +', 't-cy'))
OUT['fx-keys'] = svg('0 0 640 286', 'fx-keys-t', 'Typing 2, *, *, (, x into FORM_X: the state byte after each key and the keys it allows next. The second * is ignored.', w) + '\n' + \
    svg('0 0 300 314', 'fx-keys-tn', 'The state byte after each key and the keys allowed next.', n, True)

# protection: stored bytes, three run-once blocks, decoded credit, patched jump
assert fx[0x36e] == 0x90 and fx[0xa6f] == 0x90 and fx[0xf13:0xf16] == bytes.fromhex('e90000')
stored = fx[0xb20:0xb2c]
d = bytearray(fx); d[0x36e] = 0xc3
for o, v in ((0xb2e, 0x62), (0xb3f, 0xe3), (0xb43, 0xc8), (0xb49, 0x68), (0xb53, 0x13)): d[o] = v
s = 0
for i in range(0x34): s = (s + d[0x35e+i] + (d[0x35f+i] << 8)) & 0xffff
disp = (s + 0xa517) & 0xffff; assert disp == 0xfd45 and (0xf16 + disp) & 0xffff == 0xc5b
bl = d[0xb20]; dec = [d[0xb20]]
for i in range(1, 0x36):
    v = (d[0xb20+i] - bl) & 0xffff
    if v >> 8: v = (v - 1) & 0xff
    dec.append(v & 0xff); bl = d[0xb20+i]
assert bytes(dec[1:]) == b'   Yasser Dot Design..    <c>1992 YASSER MOHAMED ALI.'
def strip(ox, oy, vals, cw, cls='box', chars=False):
    b = []
    for i, v in enumerate(vals):
        b += [R(ox + i*cw, oy, cw-3, 28, cls), T(ox + i*cw + (cw-3)/2, oy+20, f'{v:02X}', ink(cls), 'middle')]
        if chars: b.append(T(ox + i*cw + (cw-3)/2, oy+50, '_' if v == 0x20 else chr(v), 't-yl', 'middle'))
    return b
w = [G('1', [T(10, 22, 'Stored at 0B20 (first 12 of 54 bytes)', 't-cy'), *strip(10, 32, stored, 44)]),
     G('2', [R(10, 84, 196, 56), T(22, 106, 'Block 1, 036E'), T(22, 128, 'fixes 5 bytes', 't-cy')]),
     G('3', [R(222, 84, 196, 56), T(234, 106, 'Block 2, 0A6F'), T(234, 128, 'minus previous', 't-cy')]),
     G('4', [R(434, 84, 196, 56), T(446, 106, 'Block 3, 0B73'), T(446, 128, 'sum + A517h', 't-cy')]),
     G('3+', [T(10, 164, 'Unscrambled', 't-cy'), *strip(10, 174, dec[:12], 44, 'box-hi', True)]),
     G('4+', [T(10, 260, 'Jump at 0F13:'), T(150, 260, 'E9 00 00'), T(250, 260, 'becomes E9 45 FD', 't-yl')]),
     G('5', [T(10, 290, 'Intact: jumps to 0C5B, shows the credit, exits.'), T(10, 314, 'One byte changed: E9 46 FE, jumps to 0D5C.', 't-yl')])]
n = [G('1', [T(10, 18, '1. Stored at 0B20', 't-cy'), *strip(10, 28, stored[:6], 46)]),
     G('2', [T(10, 86, '2. Block 1: fix 5 bytes')]),
     G('3+', [T(10, 112, '3. Block 2: unscramble', 't-cy'), *strip(10, 122, dec[:6], 46, 'box-hi', True)]),
     G('4+', [T(10, 200, '4. Block 3: sum + A517h'), T(10, 222, '   0F13: E9 45 FD', 't-yl')]),
     G('5', [T(10, 250, '5. Intact: exit at 0C5B'), T(10, 272, '   Changed: 0D5C, no exit', 't-yl')])]
OUT['fx-protect'] = svg('0 0 640 326', 'fx-protect-t', 'How FORM_X unscrambles its hidden credit and fixes its own exit jump: stored bytes, three run-once blocks, the unscrambled text and the patched jump.', w) + '\n' + \
    svg('0 0 300 284', 'fx-protect-tn', 'FORM_X unscrambles its credit and fixes its own exit jump.', n, True)

# ------------------------------------------------------------------ SCREEN
scr = open(os.path.join(U, 'SCREEN_SCREEN.COM'), 'rb').read(); img = b'\0'*0x100 + scr
assert len(scr) == 3504 and img[0x19c:0x1a1] == bytes.fromhex('4b43000704')
parts = [(0x100, 0x19c, 'player code', 'box-hi'), (0x19c, 0x54d, 'line 1', 'box'), (0x54d, 0xa96, 'line 2', 'box'),
         (0xa96, 0xe59, 'line 3', 'box'), (0xe59, 0x100 + len(scr), 'end, credit', 'box-ink')]
sc = 600 / len(scr)
w = [T(20, 22, 'SCREEN.COM unpacked, 3,504 bytes, to scale', 't-cy')]
for a, b_, lab, cls in parts:
    x = 20 + (a-0x100)*sc; ww = (b_-a)*sc; w.append(R(x, 34, ww, 44, cls))
    if lab.startswith('line'): w.append(T(x + ww/2, 62, f'{lab}: {b_-a:,} B', '', 'middle'))
w += [R(20, 104, 18, 18, 'box-hi'), T(48, 118, 'player: 156 bytes of code'), R(340, 104, 18, 18, 'box-ink'), T(368, 118, 'end, exit, credit: 87 B'),
      T(20, 150, 'Each line: 5-byte header, origin, then strokes.', 't-cy')]
n = [T(10, 18, 'SCREEN.COM, 3,504 bytes', 't-cy')]
for i, (a, b_, lab, cls) in enumerate(parts):
    y = 30 + i*32; n += [R(10, y, max(4, (b_-a)*80/1353), 22, cls), T(98, y+17, f'{lab} {b_-a:,}')]
OUT['scr-file'] = svg('0 0 640 162', 'scr-file-t', 'SCREEN.COM to scale: 156 bytes of player code, then three lines of drawing script, then the exit code and credit.', w) + '\n' + \
    svg('0 0 300 190', 'scr-file-tn', 'SCREEN.COM parts and their sizes in bytes.', n, True)

si = 0x19c + 9; di = 64; bx = 445; runs = []
while len(runs) < 17:
    dl = img[si]; si += 1
    if dl == 0x78: bx -= 1; continue
    n_ = img[si]; si += 1; runs.append((bx, dl + di, n_))
step_of = lambda k: 3 if k == 0 else 4 if k <= 2 else 5 if k <= 4 else 6
pix = {}
for k, (c, r0, ln) in enumerate(runs):            # same order as the player: stroke pixel, then its shadow
    for j in range(ln):
        pix[(c, r0+j)] = (7, step_of(k)); pix[(c+2, r0+j+2)] = (4, step_of(k))
def grid(ox, oy, cell):
    c0, c1, r0, r1 = 432, 447, 92, 104
    b = [R(ox, oy, (c1-c0+1)*cell, (r1-r0+1)*cell, 'box-bk')]
    for k in sorted(set(s for _, s in pix.values())):
        b.append(G(f'{k}+', [f'<rect x="{ox+(c-c0)*cell}" y="{oy+(r-r0)*cell}" width="{cell}" height="{cell}"{fill(col)} />'
                             for (c, r), (col, s) in sorted(pix.items()) if s == k]))
    b += [T(ox + (c-c0)*cell + cell/2, oy-8, str(c), '', 'middle') for c in (445, 440, 435)]
    b += [T(ox-6, oy + (r-r0)*cell + cell - 2, str(r), '', 'end') for r in (96, 100, 104)]
    return b
lines = [('4B 43 00 07 04', 'header', '1'), ('40 00  BD 01', 'origin', '2'), ('20 04', 'stroke', '3'), ('78', 'x', '4'),
         ('1F 06', 'stroke', '4'), ('78', 'x', '4'), ('1E 08', 'stroke', '4'), ('78', 'x', '5'), ('1D 04  23 04', '2 strokes', '5'),
         ('78  1C 04  23 04 ...', '12 more', '6')]
def blist(ox, oy, lh, lx):
    return [G(s, [T(ox, oy + i*lh, h), T(lx, oy + i*lh, lab, 't-cy')]) for i, (h, lab, s) in enumerate(lines)]
w = [T(10, 24, 'Script bytes from 019C', 't-cy'), *blist(10, 58, 27, 206), T(360, 24, 'Pixels, column x row', 't-cy'), *grid(360, 56, 17),
     T(10, 344, 'grey: color 7, the stroke'), T(10, 368, 'red: color 4, the shadow, 2 right and 2 down')]
n = [T(150, 18, 'Pixels, column x row', 't-cy', 'middle'), *grid(42, 46, 15),
     T(10, 266, 'Script bytes from 019C', 't-cy'), *blist(10, 294, 25, 204),
     T(10, 548, 'grey stroke, red shadow')]
OUT['scr-zoom'] = svg('0 0 640 380', 'scr-zoom-t', 'The first script bytes of SCREEN.COM and the 16 by 13 pixels they draw: the start of the first letter, grey with a red shadow.', w) + '\n' + \
    svg('0 0 300 560', 'scr-zoom-tn', 'The first script bytes of SCREEN.COM and the pixels they draw.', n, True)

hdrs = [(0x19c, 'Line 1'), (0x54d, 'Line 2'), (0xa96, 'Line 3')]
assert [img[a:a+5].hex() for a, _ in hdrs] == ['4b43000704', '4b430d0e0e', '4b430d030e']
assert img[0x13b] == 0x4b and img[0x143] == 0x43 and img[0x17f:0x181] == bytes.fromhex('eb0d') and img[0x178:0x17b] == bytes.fromhex('b8030c') and img[0x181:0x184] == bytes.fromhex('b80e0c')
targ = [('4B', '013B', 'dec bx', "'x': one column left"), ('43', '0143', 'inc bx', "'w': one column right"),
        ('00', '0180', 'jmp +00', 'draw the shadow'), ('07', '0179', 'mov ax,0C07h', 'stroke color 7'), ('04', '0182', 'mov ax,0C04h', 'shadow color 4')]
w = [T(10, 22, 'Line 1 header', 't-cy'), T(150, 22, 'written into the player', 't-cy')]
for i, (v, at, ins, why) in enumerate(targ):
    y = 36 + i*42
    w += [R(10, y, 56, 30, 'box-hi'), T(38, y+21, v, 't-bk', 'middle'), P(f'M66 {y+15} H138', 'wire-hi arrow'),
          T(150, y+21, at), T(206, y+21, ins), T(360, y+21, why, 't-cy')]
w += [T(10, 262, 'Line 2: 4B 43 0D 0E 0E  shadow off, yellow'), T(10, 288, 'Line 3: 4B 43 0D 03 0E  shadow off, cyan'),
      T(10, 314, '0Dh makes the jump skip the shadow code.', 't-yl')]
n = [T(10, 18, 'Line 1 header, and where', 't-cy'), T(10, 40, 'each byte goes', 't-cy')]
for i, (v, at, ins, why) in enumerate(targ):
    y = 54 + i*56
    n += [R(10, y, 44, 28, 'box-hi'), T(32, y+20, v, 't-bk', 'middle'), T(66, y+20, f'{at}: {ins}'), T(66, y+42, why.replace("'", ''), 't-cy')]
n += [T(10, 350, 'Line 2: 4B 43 0D 0E 0E'), T(10, 374, 'Line 3: 4B 43 0D 03 0E'), T(10, 398, '0Dh skips the shadow.', 't-yl')]
OUT['scr-patch'] = svg('0 0 640 326', 'scr-patch-t', 'The five header bytes of line 1 and the five places in the player code where they are written: two step opcodes, a jump offset and two colors.', w) + '\n' + \
    svg('0 0 300 410', 'scr-patch-tn', 'Each header byte and the instruction it changes.', n, True)

w = [T(10, 22, 'Color byte at 0179, one value per frame', 't-cy')]
for i, c in enumerate(range(2, 16)):
    x = 10 + i*44; w += [R(x, 36, 38, 38, 'box-bk', fill(c)), T(x+19, 96, f'{c:02X}h', '', 'middle')]
w += [T(10, 128, 'Each frame redraws line 3 (319 strokes) in the'), T(10, 150, 'next color. After 0Fh it goes back to 02h.')]
n = [T(10, 18, 'Color byte at 0179', 't-cy')]
for i, c in enumerate(range(2, 16)):
    x = 10 + (i % 7)*41; y = 32 + (i // 7)*66; n += [R(x, y, 36, 36, 'box-bk', fill(c)), T(x+18, y+54, f'{c:02X}h', '', 'middle')]
n += [T(10, 180, 'After 0Fh, back to 02h.')]
OUT['scr-cycle'] = svg('0 0 640 162', 'scr-cycle-t', 'The 14 EGA colors that line 3 cycles through, 02h to 0Fh.', w) + '\n' + \
    svg('0 0 300 192', 'scr-cycle-tn', 'The 14 colors of the animation, 02h to 0Fh.', n, True)

# ------------------------------------------------------------------ TAHER
th = open(os.path.join(U, 'TAHER_TAHER.COM'), 'rb').read(); timg = b'\0'*0x100 + th
demo = open(os.path.join(U, 'ARABIC_DEMO.COM'), 'rb').read()
same = next(i for i in range(len(th)) if th[i] != demo[i]); assert same == 241 and len(th) == 2346 and th[-2:] == b'z\x1a'
parts = [(0x100, 0x113, 'decoder', 'box-ink'), (0x113, 0x1ab, 'player', 'box-hi'), (0x1ab, 0x1ec, 'credit', 'box-dash'),
         (0x1ec, 0xa29, 'script', 'box'), (0xa29, 0xa2a, 'EOF', 'box-bk')]
sc = 600 / len(th)
w = [P(f'M20 30 V22 H{20 + same*sc:.1f} V30', 'wire-hi'), T(20, 16, 'same 241 bytes as ARABIC/DEMO.COM', 't-yl')]
for a, b_, lab, cls in parts: w.append(R(20 + (a-0x100)*sc, 36, (b_-a)*sc, 40, cls))
w.append(T(20 + (0x1ec-0x100 + 1055)*sc, 62, 'script: 2,109 bytes, 901 strokes', '', 'middle'))
leg = [('decoder 19 B', 'box-ink'), ('player 152 B', 'box-hi'), ('hidden credit 65 B', 'box-dash')]
for i, (lab, cls) in enumerate(leg):
    x = 20 + i*206; w += [R(x, 98, 18, 18, cls), T(x+28, 112, lab)]
w.append(T(20, 144, 'The last byte is 1Ah, the DOS end-of-file mark.', 't-cy'))
n = [T(10, 18, 'TAHER.COM, 2,346 bytes', 't-cy')]
for i, (a, b_, lab, cls) in enumerate(parts[:4]):
    y = 30 + i*32; n += [R(10, y, max(4, (b_-a)*80/2109), 22, cls), T(98, y+17, f'{lab} {b_-a:,}')]
n += [T(10, 176, 'Bytes 0 to 240 are the'), T(10, 198, 'same as in DEMO.COM.', 't-yl')]
OUT['th-file'] = svg('0 0 640 156', 'th-file-t', 'TAHER.COM to scale: a 19-byte decoder, the 152-byte player, the 65-byte hidden credit, and a 2,109-byte script. The first 241 bytes match ARABIC/DEMO.COM.', w) + '\n' + \
    svg('0 0 300 210', 'th-file-tn', 'TAHER.COM parts and their sizes in bytes.', n, True)

assert timg[0x15e:0x161] == bytes.fromhex('80fa88') and timg[0x159:0x15c] == bytes.fromhex('80fa7a') and timg[0x189:0x18c] == bytes.fromhex('b90010')
cmds = [('00-6F', 'stroke: start, length', 'same'), ('78h x', 'one column', 'same'), ('77h w', 'one column back', 'same'),
        ('79h y', 'new line: header', 'same'), ('7Bh {', 'next color, redraw', '(not used)'), ('88h', '-', 'wait, clear, next'), ('7Ah z', '-', 'wait, credit, exit')]
w = [T(10, 22, 'Byte', 't-cy'), T(130, 22, 'SCREEN (gift)', 't-cy'), T(400, 22, 'TAHER, DEMO.COM', 't-cy')]
for i, (b_, a, t) in enumerate(cmds):
    y = 54 + i*30; new_ = i >= 5
    w += [T(10, y, b_), T(130, y, a), T(400, y, t, 't-yl' if new_ else '')]
    if new_: w.append(R(392, y-21, 236, 30, 'wire-hi'))
n = [T(10, 18, 'Byte: SCREEN / TAHER', 't-cy')]
for i, (b_, a, t) in enumerate(cmds):
    y = 46 + i*44
    n += [T(10, y, b_), T(10, y+21, a if t == 'same' else ('SCREEN only: next color' if a != '-' else 'TAHER: ' + t), 't-yl' if i >= 5 else 't-cy')]
OUT['th-cmds'] = svg('0 0 640 252', 'th-cmds-t', 'The script commands of the SCREEN player and of the TAHER and DEMO.COM player. TAHER adds 88h (wait, clear, next slide) and z (wait, credit, exit).', w) + '\n' + \
    svg('0 0 300 340', 'th-cmds-tn', 'Script commands of the two players; TAHER adds 88h and z.', n, True)

st = timg[0x1ab:0x1ab+12]; key = list(range(4, 16)); dc = [(a - k) & 0xff for a, k in zip(st, key)]
full = bytes((timg[0x1ab+i] - (4+i)) & 0xff for i in range(65)); assert full.startswith(b'K E M Y A M   Software  Corp.') and b'1991 YASSER MOHAMED ALI.' in full
def row(ox, oy, vals, cw, cls, s, lab, chars=False):
    g = [T(ox-10, oy+20, lab, '', 'end')]
    for i, v in enumerate(vals):
        g += [R(ox + i*cw, oy, cw-3, 28, cls), T(ox + i*cw + (cw-3)/2, oy+20, f'{v:02X}', ink(cls), 'middle')]
        if chars: g.append(T(ox + i*cw + (cw-3)/2, oy+50, '_' if v == 0x20 else chr(v), 't-yl', 'middle'))
    return G(s, g)
w = [T(10, 20, 'TAHER.COM at 01AB: the first 12 of 65 bytes', 't-cy'),
     row(86, 34, st, 46, 'box', '1+', 'stored'), row(86, 80, key, 46, 'box-bk', '2+', 'minus'), row(86, 126, dc, 46, 'box-hi', '3', 'gives', True)]
n = [T(10, 18, '01AB: the first 6 bytes', 't-cy'),
     row(84, 30, st[:6], 36, 'box', '1+', 'stored'), row(84, 72, key[:6], 36, 'box-bk', '2+', 'minus'), row(84, 114, dc[:6], 36, 'box-hi', '3', 'gives', True)]
OUT['th-credit'] = svg('0 0 640 190', 'th-credit-t', 'TAHER\'s hidden credit: the stored bytes minus a key that counts up from 4 give the letters K, E, M with spaces.', w) + '\n' + \
    svg('0 0 300 180', 'th-credit-tn', 'Stored bytes minus 4, 5, 6 and on give K E M.', n, True)

# ------------------------------------------------------------------ PESM
p = open(os.path.join(U, 'PESM_PESM.EXE'), 'rb').read()[0x30:]; ar = open(os.path.join(U, 'ARABART_ARABART.EXE'), 'rb').read()[0x30:]
runs4 = [(0x13b1, 0x17d0, 0x1057), (0x0f9e, 0x13b1, 0x0c2a), (0x0c70, 0x0f04, 0x0900), (0x02c4, 0x034c, 0x0238)]
for a0, a1, b0 in runs4: assert p[a0:a1] == ar[b0:b0 + a1 - a0]
sc = 600 / len(ar)
w = [T(10, 22, f'ARABART.EXE 4.15 (1993), {len(ar):,} bytes', 't-cy'), R(10, 32, 600, 30),
     T(10, 186, f'PESM.EXE (1991), {len(p):,} bytes, same scale', 't-cy'), R(10, 130, len(p)*sc, 30)]
for a0, a1, b0 in runs4:
    k = a1 - a0
    w += [R(10 + b0*sc, 32, max(2, k*sc), 30, 'box-hi'), R(10 + a0*sc, 130, max(2, k*sc), 30, 'box-hi'),
          P(f'M{10 + b0*sc + k*sc/2:.1f} 62 L{10 + a0*sc + k*sc/2:.1f} 130', 'wire-hi')]
w += [T(10, 226, 'Byte for byte the same: 1,055 + 1,043 + 660 bytes of letter'), T(10, 250, 'shapes, and the 136-byte shaping routine. In all, 3,271'),
      T(10, 274, 'bytes match in runs of 16 bytes or more.', 't-yl')]
n = [T(10, 18, f'PESM.EXE, {len(p):,} bytes', 't-cy'), R(10, 28, 280, 26)]
for a0, a1, b0 in runs4: n.append(R(10 + a0*280/len(p), 28, max(2, (a1-a0)*280/len(p)), 26, 'box-hi'))
n += [T(10, 84, 'Yellow: bytes that are also'), T(10, 106, 'in ARABART.EXE 4.15 (1993):'), T(10, 132, '2,758 B of letter shapes', 't-yl'), T(10, 154, 'and the 136 B shaper.', 't-yl')]
OUT['pm-shared'] = svg('0 0 640 286', 'pm-shared-t', 'ARABART.EXE and PESM.EXE drawn to the same scale, with lines joining the identical blocks: three blocks of letter shapes and the shaping routine.', w) + '\n' + \
    svg('0 0 300 166', 'pm-shared-tn', 'PESM.EXE with the blocks it shares with ARABART highlighted.', n, True)

keys = 'fsl hggi'
codes = [p[0x9fb + ord(k) - 0x20] for k in keys]
assert codes == [0xe8, 0xf5, 0xee, 0x03, 0x6a, 0xe9, 0xe9, 0xeb]
sh = [p[0x9fb + ord(k) - 0x20] for k in 'fsl hggi hgvplk'] + [0]; sh[0] &= 0xbf
for i in range(len(sh) - 1):
    if not (sh[i] & 0x80 and sh[i+1] & 0x40): sh[i] &= 0x7f; sh[i+1] &= 0xbf
sh = sh[:8]
assert sh == [0xa8, 0xf5, 0x6e, 0x03, 0x2a, 0xa9, 0xe9, 0x6b]
LET = {'f': 'ب', 's': 'س', 'l': 'م', ' ': ' ', 'h': 'ا', 'g': 'ل', 'i': 'ه'}
def form(ch, c):
    if ch == ' ': return '_'
    l = LET[ch]; return {0xc0: 'ـ' + l + 'ـ', 0x80: l + 'ـ', 0x40: 'ـ' + l, 0x00: l}[c & 0xc0]
def hands(c): return ('<' if c & 0x80 else '.') + ' ' + ('>' if c & 0x40 else '.')
w = [T(10, 22, 'Keys at 00FC, table at 09FB, then the shaper', 't-cy')]
labs = [('key', 56), ('table', 96), ('hands', 134), ('shaped', 174), ('form', 214)]
w += [T(10, y, l) for l, y in labs]
for i, k in enumerate(keys):
    x = 96 + i*66
    w += [R(x, 36, 58, 30), T(x+29, 57, '_' if k == ' ' else k, '', 'middle'),
          R(x, 76, 58, 30, 'box-hi'), T(x+29, 97, f'{codes[i]:02X}', 't-bk', 'middle'),
          T(x+29, 136, hands(codes[i]), 't-cy', 'middle'),
          R(x, 154, 58, 30, 'box-ink'), T(x+29, 175, f'{sh[i]:02X}', 't-bk', 'middle'),
          T(x+29, 222, form(k, sh[i]), 't-lg t-ar', 'middle')]
w += [T(10, 258, '< bit 80h: reaches the next letter, on the left'), T(10, 282, '> bit 40h: reaches the letter before, on the right')]
n = [T(10, 18, 'Key, table, hands, shaped', 't-cy')]
for gi, grp in enumerate((range(0, 4), range(4, 8))):
    for j, i in enumerate(grp):
        k = keys[i]; x = 12 + j*72; y0 = 32 + gi*196
        n += [R(x, y0, 62, 28), T(x+31, y0+20, '_' if k == ' ' else k, '', 'middle'),
              R(x, y0+36, 62, 28, 'box-hi'), T(x+31, y0+56, f'{codes[i]:02X}', 't-bk', 'middle'),
              T(x+31, y0+90, hands(codes[i]), 't-cy', 'middle'),
              R(x, y0+104, 62, 28, 'box-ink'), T(x+31, y0+124, f'{sh[i]:02X}', 't-bk', 'middle'),
              T(x+31, y0+168, form(k, sh[i]), 't-lg t-ar', 'middle')]
n += [T(10, 432, '< 80h reaches the next letter'), T(10, 456, '> 40h reaches the one before')]
OUT['pm-keys'] = svg('0 0 640 294', 'pm-keys-t', 'The keys f s l space h g g i, their codes from PESM\'s table, the two join bits, the codes after shaping, and the letter forms they select: bism and Allah.', w) + '\n' + \
    svg('0 0 300 468', 'pm-keys-tn', 'Keys, table codes, join bits, shaped codes and letter forms for the first two words.', n, True)

calls = []; i = 0x7
while i < 0xf7:
    if p[i] == 0xba and p[i+3] == 0xb8 and p[i+6] == 0xb9 and p[i+9] == 0xbb:
        dx, ax, cx, by = [struct.unpack('<H', p[i+k:i+k+2])[0] for k in (1, 4, 7, 10)]
        calls.append((dx, ax, cx, by, p[dx:p.index(b'\0', dx)])); i += 15
    else: i += 1
assert len(calls) == 16 and all(c[1] >> 8 == 0x36 for c in calls)
state = dict(B=0, U=0, I=0, D=0); rowsd = []
for dx, ax, cx, by, s in calls:
    pre = re.match(rb'[@#!$*]*', s).group().decode()
    for c in pre:
        if c == '*': state = dict(B=0, U=0, I=0, D=0)
        else: state[{'@': 'B', '#': 'U', '!': 'I', '$': 'D'}[c]] ^= 1
    rowsd.append((cx, by, ax & 0xff, pre, dict(state)))
assert [r[4]['B'] + 2*r[4]['U'] + 4*r[4]['I'] for r in rowsd[:8]] == list(range(8)) == [r[4]['B'] + 2*r[4]['U'] + 4*r[4]['I'] for r in rowsd[8:]]
w = []
for col in range(2):
    ox = 10 + col*320
    w += [T(ox, 20, f'x = {rowsd[col*8][0]}' + ('' if col == 0 else ', double size'), 't-cy'),
          T(ox, 46, 'y'), T(ox+50, 46, 'ink'), T(ox+96, 46, 'keys'), T(ox+168, 46, 'B', '', 'middle'), T(ox+200, 46, 'U', '', 'middle'), T(ox+232, 46, 'I', '', 'middle')]
    for r in range(8):
        cx, by, al, pre, stt = rowsd[col*8 + r]; y = 56 + r*30
        w += [T(ox, y+18, str(by)), R(ox+50, y+3, 28, 20, 'box-bk', fill(al)), T(ox+96, y+18, pre or '-', 't-yl')]
        w += [R(ox+160+j*32, y+4, 16, 18, 'box-hi' if stt[k] else 'box-bk') for j, k in enumerate('BUI')]
w += [T(10, 316, 'B bold, U underline, I italic. Each @ # ! flips one switch,'), T(10, 340, 'and switches stay on: each column counts 000 to 111.')]
n = [T(10, 18, 'Calls 1 to 8, x = 600', 't-cy'), T(10, 44, 'keys'), T(108, 44, 'B', '', 'middle'), T(140, 44, 'U', '', 'middle'), T(172, 44, 'I', '', 'middle'), T(210, 44, 'ink')]
for r in range(8):
    cx, by, al, pre, stt = rowsd[r]; y = 54 + r*28
    n += [T(10, y+18, pre or '-', 't-yl')] + [R(100+j*32, y+4, 16, 18, 'box-hi' if stt[k] else 'box-bk') for j, k in enumerate('BUI')] + [R(210, y+3, 28, 20, 'box-bk', fill(al))]
n += [T(10, 298, 'Calls 9 to 16 start with *$'), T(10, 320, '(reset, double size) and'), T(10, 342, 'count the same way.')]
OUT['pm-calls'] = svg('0 0 640 352', 'pm-calls-t', 'PESM\'s 16 calls: y position, color, the style keys before each string, and the bold, underline and italic switches they leave on. Each column counts 000 to 111.', w) + '\n' + \
    svg('0 0 300 354', 'pm-calls-tn', 'The first 8 calls count through the bold, underline and italic switches.', n, True)

# ------------------------------------------------------------------ write + overflow check
os.makedirs(os.path.join(HERE, 'svg'), exist_ok=True)
bad = 0
for k, v in OUT.items():
    open(os.path.join(HERE, 'svg', f'{k}.svg'), 'w').write(v)
    for one in re.findall(r'<svg.*?</svg>', v, re.S):
        W, H = map(float, re.search(r'viewBox="0 0 (\S+) (\S+)"', one).groups())
        for m in re.finditer(r'<text( class="([^"]*)")? x="([\d.]+)" y="([\d.]+)"( text-anchor="(\w+)")?[^>]*>(.*?)</text>', one):
            cls, x, y, anc, s = m.group(2) or '', float(m.group(3)), float(m.group(4)), m.group(6) or 'start', html.unescape(m.group(7))
            if 't-ar' in cls: continue
            wd = len(s) * CW * (20/14 if 't-lg' in cls else 1)
            x0 = x if anc == 'start' else x - wd if anc == 'end' else x - wd/2
            if x0 < -1 or x0 + wd > W + 1 or y > H or y < 12:
                bad += 1; print(f'OVERFLOW {k} W={W:g}: {s!r} x0={x0:.0f} x1={x0+wd:.0f} y={y:g}')
print('wrote', len(OUT), 'diagrams;', bad, 'overflows')
