import sys, os, struct, collections; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tools import load, dis
m = load(sys.argv[1]); img = m['img']; lo, hi = int(sys.argv[2],16), int(sys.argv[3],16)
t = collections.Counter()
for r in m['relocs']:
    if r >= 3 and img[r-3] == 0x9a and lo <= r < hi:
        off, seg = struct.unpack_from('<HH', img, r-2); t[(seg, off)] += 1
for (s, o), c in sorted(t.items()):
    print(f'--- {s:04x}:{o:04x} x{c}')
    print(dis(img, s, o, 8))
