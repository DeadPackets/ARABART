# Re-create DEMO.EXE screen 1 with the Python model (DEMO main at DEMO_EXE.img 0x2163).
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from arabart_model import *
W, H = 640, 480
c = [0]*(W*H)
s = ' #~gtk ~guvfd 51<4#        '
codes = shape(translate(s))
x = 630
for font in (0, 1, 2):
    y = 0; hgt = w16(font_base(font) + 2)
    for col in range(4, 16):
        draw(c, W, H, codes, x, y + hgt, font, col)
        y += hgt
    # textwidth (fn 5) = sum of advance widths
    x -= sum(IMG[w16(font_base(font) + 2*k)] for k in codes if k not in CTRL)
png('demo_screen1_model.png', c, W, H)
