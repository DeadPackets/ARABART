# Which EDIT.EXE functions in segments 0473 and 0541 match Digi-Test (opcode sequence)? Also the closest Digi-Test function for the loop.
import sys, os, difflib; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fnhash import funcs
a = funcs('../unpacked/EDIT_EDIT.EXE', 0x2d10, 0xd2b0); b = funcs('../unpacked/DIGI_T_MAIN.EXE', 0, 0x2af10)
hb = {h: s for s, (h, n) in b.items()}
for s in sorted(a):
    if 0x4730 <= s < 0x4bb0 or 0x5410 <= s < 0x5600:
        h, n = a[s]; seg = 0x473 if s < 0x4bb0 else 0x541
        print(f'{seg:04x}:{s - seg*16:04x} ins {n:4d} shared {h in hb}' + (f' = DIGI lin {hb[h]:05x}' if h in hb else ''))
