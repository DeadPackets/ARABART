import sys, os, json; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from arabart_model import png
D = json.load(open('web_data.json'))
W, H = 900, 420; c = [0]*(W*H)
def blit(rs, ox, oy, col=None):
    for r in rs:
        for x in range(r[0], r[0]+r[2]):
            X, Y = ox+x, oy+r[1]
            if 0 <= X < W and 0 <= Y < H: c[Y*W+X] = col if col else (r[3] if len(r) > 3 else 15)
for i, e in enumerate(D['effects']): blit(e['runs'], 10 + i*110, 10)
for i, f in enumerate(D['fonts']): blit(f['runs'], 10 + i*170, 120)
x = 600
for k in ['0x30', '0xa9', '0xf6', '0x6d']:
    g = D['walk']['glyphs'][k]; blit(g['runs'], x, 300); x -= g['adv']
blit(D['fmt']['runs'], 700, 380)
png('web_preview.png', c, W, H, 1)
