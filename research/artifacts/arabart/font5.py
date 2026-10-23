import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from arabart_model import *
W, H = 320, 160
c = [0]*(W*H)
codes = shape(translate('hgals'))
print([hex(x) for x in codes])
draw(c, W, H, codes, 300, 70, 4, 14)
draw(c, W, H, shape(translate('@hgals')), 300, 140, 4, 12)
png('font5_alshams.png', c, W, H, 2)
