# Does the 1991 commercial's lettering match ARABART 4.15 fonts? Compare lit-pixel masks after bbox alignment.
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
from arabart_model import *
slide = Image.open('com_slide13.png').convert('L')
S = {(x, y) for y in range(350) for x in range(640) if slide.getpixel((x, y)) > 20}
def bbox(P): xs = [p[0] for p in P]; ys = [p[1] for p in P]; return min(xs), min(ys), max(xs), max(ys)
sb = bbox(S); print('commercial text bbox', sb, 'size', sb[2]-sb[0]+1, 'x', sb[3]-sb[1]+1)
for f in range(4):
    for bold in (0, 1):
        W, H = 900, 200; c = [0]*(W*H)
        draw(c, W, H, shape(translate(('@' if bold else '') + 'lv;. f,vsud] go]lhj hg;lfd,jv')), 880, 120, f, 15, clip=False)
        G = {(i % W, i // W) for i, v in enumerate(c) if v}
        G = G | {(x+2, y+2) for x, y in G}                                  # 3-D: second pixel at (+2,+2)
        gb = bbox(G); dx, dy = sb[0]-gb[0], sb[1]-gb[1]
        G2 = {(x+dx, y+dy) for x, y in G}
        iou = len(S & G2) / len(S | G2)
        print(f'font {f+1} bold={bold}: bbox {gb[2]-gb[0]+1}x{gb[3]-gb[1]+1}  IoU={iou:.3f}')
