import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from arabart_model import *
f = int(sys.argv[1]); r0, r1 = int(sys.argv[2], 0), int(sys.argv[3], 0); out = sys.argv[4]
base = font_base(f); hgt = w16(base+2); cw = hgt*2 + 10; cell = hgt + 20
W, H = 16*cw, (r1-r0)*cell
c = [0]*(W*H)
for code in range(r0*16, r1*16):
    if code < 3 or not w16(base + 2*code): continue
    col, row = code % 16, code//16 - r0
    for yy in range(row*cell, row*cell+cell):
        c[yy*W + col*cw] = 8
    draw(c, W, H, [code], col*cw + cw - 4, row*cell + hgt + 4, f, 15, clip=False)
png(out, c, W, H, 2)
