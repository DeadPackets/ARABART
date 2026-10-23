import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fnhash import funcs
a = funcs('../unpacked/EDIT_EDIT.EXE', 0x2d10, 0xd2b0); b = funcs('../unpacked/DIGI_T_MAIN.EXE', 0, 0x2af10)
hb = set(h for h, n in b.values())
for seg, off in ((0xb2d,4),(0xb2d,0x7f2),(0xb2d,0x262),(0xb2d,0x332),(0xb23,0xc),(0x541,3)):
    s = seg*16+off; print(f'{seg:04x}:{off:04x}', s in a and a[s][0] in hb, a.get(s))
