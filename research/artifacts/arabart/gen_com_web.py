# Commercial diagram data: stored vertical runs (script) vs drawn pixels (emulated frame) for the word "مركز".
import sys, os, json; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
from arabart_model import PAL
L = json.load(open('com_lines.json'))[18]; C0, C1, R0, R1 = 487, 564, 144, 182
stored = [[r[0]-C0, r[1]-R0, r[2]] for r in L['runs'] if C0 <= r[0] <= 560]
im = Image.open('com_slide13.png').convert('RGB'); inv = {tuple(c): i for i, c in enumerate(PAL)}
drawn = []
for y in range(R0, R1):
    x = C0
    while x < C1:
        c = inv.get(im.getpixel((x, y)), 0)
        if c:
            s = x
            while x < C1 and inv.get(im.getpixel((x, y)), 0) == c: x += 1
            drawn.append([s-C0, y-R0, x-s, c])
        else: x += 1
D = json.load(open('web_data.json')); D['com'] = {'stored': stored, 'drawn': drawn, 'w': C1-C0, 'h': R1-R0, 'c1': L['c1'], 'c2': L['c2'], 'col0': C0, 'row0': R0}
json.dump(D, open('web_data.json', 'w'), separators=(',', ':'))
print('stored runs', len(stored), 'drawn runs', len(drawn))
