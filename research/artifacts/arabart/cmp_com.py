import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from arabart_model import *
W, H = 640, 350
c = [0]*(W*H)
s = 'lv;. f,vsud] go]lhj hg;lfd,jv'
y = 40
for f in range(5):
    hgt = w16(font_base(f)+2)
    draw(c, W, H, shape(translate(s)), 620, y + hgt, f, 15)
    y += hgt + 12
png('com_text_in_arabart_fonts.png', c, W, H)
