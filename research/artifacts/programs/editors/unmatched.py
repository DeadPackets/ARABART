import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fnhash import funcs
a = funcs('../unpacked/EDIT_EDIT.EXE', 0x2d10, 0xd2b0); b = funcs('../unpacked/DIGI_T_MAIN.EXE', 0, 0x2af10)
hb = set(h for h, n in b.values())
segs = [0x2d10,0x4730,0x4bb0,0x5410,0x9170,0x92a0,0xb230,0xb2d0]
import bisect
for s,(h,n) in sorted(a.items()):
    sg = segs[bisect.bisect_right(segs, s)-1]
    print(f'{s:05x} seg{sg>>4:04x}:{s-sg:04x} {n:5d} ins {"MATCH" if h in hb else "-----"}')
