import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from arabart_model import *
n = IMG[NFONTS]
for f in range(n):
    base = font_base(f); hgt = w16(base+2)
    cell = hgt + 30; W, H = 16*56, 16*cell
    c = [0]*(W*H)
    for code in range(3, 256):
        g = w16(base + 2*code)
        if not g: continue
        cx, cy = (code % 16)*56 + 50, (code//16)*cell + hgt + 8
        draw(c, W, H, [code], cx, cy, f, 15)
        for i in range(2): put(c, W, H, (code%16)*56, (code//16)*cell + i, 4, 1)   # cell marker
    png(f'font{f+1}.png', c, W, H)
    print('font', f+1, 'base', hex(base), 'height', hgt, 'shadow', w16(base+4), 'glyphs', sum(1 for k in range(3,256) if w16(base+2*k)))
