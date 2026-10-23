# Generate compact pixel-run data for the museum writeup diagrams, straight from ARABART 4.15's tables.
import sys, os, json; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from arabart_model import *

def runs(canvas, W, H):
    out = []
    for y in range(H):
        x = 0
        while x < W:
            c = canvas[y*W + x]
            if c:
                s = x
                while x < W and canvas[y*W + x] == c: x += 1
                out.append([s, y, x - s, c])
            else: x += 1
    return out

def render(codes, font, W, H, x, y, style=None, color=15):
    c = [0]*(W*H); draw(c, W, H, codes, x, y, font, color, dict(style) if style else None, clip=False); return c

def crop(rs):
    x0 = min(r[0] for r in rs); y0 = min(r[1] for r in rs)
    x1 = max(r[0]+r[2] for r in rs); y1 = max(r[1] for r in rs) + 1
    return [[r[0]-x0, r[1]-y0, r[2], r[3]] for r in rs], x1-x0, y1-y0

D = {}
# 1. shaping walk: ~gtk in font 3 (index 2)
codes = translate('~gtk'); shaped = shape(codes)
D['walk'] = {'keys': list('~gtk'), 'table': codes, 'shaped': shaped}
iso = [c & 0x3F for c in shaped]  # every letter looked up alone = isolated form
def glyph_runs(code, font):
    g = w16(font_base(font) + 2*code); W, H = 120, 90
    c = [0]*(W*H); draw(c, W, H, [code], 100, 70, font, 15, clip=False)
    rs = runs(c, W, H)
    return {'adv': IMG[g], 'D': IMG[g+1], 'runs': [[r[0]-100, r[1]-70, r[2]] for r in rs]}  # x rel right edge, y rel baseline
D['walk']['glyphs'] = {hex(c): glyph_runs(c, 2) for c in shaped + iso}
# 2. glyph format: one glyph from font 1 with its raw bytes
for code in (0x6D, 0xE8, 0x68, 0x28, 0xF7, 0x37):
    g = w16(font_base(0) + 2*code); p = g + 2; rows = 1
    while IMG[p] <= 0xEF:
        if IMG[p] == 0xEF: rows += 1; p += 1
        else: p += 2
    print('font1 code', hex(code), 'bytes', p + 1 - g, 'rows', rows, 'width', IMG[g])
fmt_code = int(sys.argv[1], 16) if len(sys.argv) > 1 else 0x37
g = w16(font_base(0) + 2*fmt_code); p = g; bs = []
bs.append(IMG[p]); bs.append(IMG[p+1]); p += 2
while True:
    b = IMG[p]; bs.append(b); p += 1
    if b > 0xEF: break
    if b != 0xEF: bs.append(IMG[p]); p += 1
D['fmt'] = {'code': fmt_code, 'addr': g, 'ptr_at': font_base(0) + 2*fmt_code, 'bytes': bs, **glyph_runs(fmt_code, 0)}
# 3. font samples: الفن in fonts 1-4, الشمس in font 5
D['fonts'] = []
for f, s in ((0, '~gtk'), (1, '~gtk'), (2, '~gtk'), (3, '~gtk'), (4, 'hgals')):
    rs, w, h = crop(runs(render(shape(translate(s)), f, 400, 120, 380, 100), 400, 120))
    D['fonts'].append({'font': f+1, 'height': w16(font_base(f)+2), 'w': w, 'h': h, 'runs': [r[:3] for r in rs]})
# 4. effects on فن (font 3)
word = shape(translate('tk'))
def eff(name, passes):
    W, H = 260, 140; c = [0]*(W*H)
    for (dx, dy, col, st) in passes:
        draw(c, W, H, ([0xC8] if st == 'bold' else [0xC9] if st == 'italic' else [0xCA] if st == 'underline' else [0xCB] if st == 'size' else []) + word,
             200 + dx, 110 + dy, 2, col, clip=False)
    return {'name': name, 'runs': runs(c, W, H)}
D['effects'] = [
    eff('plain', [(0, 0, 14, None)]),
    eff('bold', [(0, 0, 14, 'bold')]),
    eff('italic', [(0, 0, 14, 'italic')]),
    eff('underline', [(0, 0, 14, 'underline')]),
    eff('size', [(0, 0, 14, 'size')]),
    eff('3d', [(-2, -2, 15, None), (0, 0, 4, None)]),                                   # fn 8: CH up-left by font shadow 2, then CL
    eff('outline', [(-1, -1, 4, None), (1, -1, 4, None), (-1, 1, 4, None), (1, 1, 4, None), (0, 0, 14, None)]),  # SUN 4D14
    eff('shadow', [(6, 6, 8, None), (0, 0, 14, None)]),                                 # SUN 4CC3
]
# crop effects to common box
allr = [r for e in D['effects'] for r in e['runs']]
x0 = min(r[0] for r in allr); y0 = min(r[1] for r in allr)
for e in D['effects']:
    rs = [[r[0]-x0, r[1]-y0, r[2], r[3]] for r in e['runs']]
    e['runs'] = rs; e['w'] = max(r[0]+r[2] for r in rs); e['h'] = max(r[1] for r in rs) + 1
D['effects_base'] = [200 - x0, 110 - y0]
json.dump(D, open('web_data.json', 'w'), separators=(',', ':'))
print('effects sizes', [(e['name'], len(e['runs']), e['w'], e['h']) for e in D['effects']])
print('fonts', [(f['font'], len(f['runs']), f['w'], f['h']) for f in D['fonts']])
print('walk glyph runs', {k: len(v['runs']) for k, v in D['walk']['glyphs'].items()})
print('json bytes', os.path.getsize('web_data.json'))
