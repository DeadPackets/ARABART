# Decode WINKEY MENU2.DAT icons exactly as WINKEY.EXE 0x027C draws them; render a contact sheet PNG.
import sys, os, struct; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gfx import png
def draw(d, ofs, X, Y, pix):
    x0, y0 = X + d[ofs], Y + d[ofs+1]; i = ofs + 2; colors = []; runs = 0
    while True:
        color, row = d[i], y0 - d[i+1]; i += 2; colors.append(color)       # 0x2ac / 0x2c5
        while True:
            c = d[i]; i += 1                                                  # 0x2d6
            if c == 0xef: row -= 1; continue                                  # next row up
            if c == 0xfc: break                                               # new colour segment
            if c > 0xfc: return colors, runs, i                              # end
            n = d[i]; i += 1; runs += 1
            for k in range(n): pix[(x0 - c - k, row)] = color                # run leftwards from x0-c
d = open('/Users/deadpackets/workspace/DOSArchive/programs/WINKEY/MENU2.DAT', 'rb').read()
offs = struct.unpack('<8H', d[:16]); print('index', [hex(o) for o in offs], 'file', len(d))
pix = {}; ends = []
for n, o in enumerate(offs):
    colors, runs, end = draw(d, o, 10 + (n % 4) * 70, 10 + (n // 4) * 50, pix); ends.append((o, end))
    print(f'icon#{n} @{o:#06x}..{end:#06x} origin {d[o]}x{d[o+1]} runs {runs} colours {colors}')
spans = sorted(ends); print('contiguous:', all(spans[k][1] == spans[k+1][0] for k in range(len(spans)-1)), 'last end', hex(spans[-1][1]), 'of', hex(len(d)))
sc = {}
for (x, y), c in pix.items():
    for dx in range(3):
        for dy in range(3): sc[(x*3+dx, y*3+dy)] = c
png('menu2_icons.png', 300*3, 110*3, {k: v for k, v in sc.items() if 0 <= k[0] < 900 and 0 <= k[1] < 330})
