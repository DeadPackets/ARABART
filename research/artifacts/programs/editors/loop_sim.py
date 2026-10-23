# Closest Digi-Test function to EDIT's loop 0473:01A9 (opcode-sequence similarity), and whether Digi-Test also starts with F10.
import sys, os, re, difflib; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tools import load
from capstone import *
md = Cs(CS_ARCH_X86, CS_MODE_16)
def split(path, lo, hi):
    img = load(path)['img']; st = sorted(m.start()+lo for m in re.finditer(rb'\xc8..\x00|\x55\x8b\xec', img[lo:hi]))
    return img, {s: [i.mnemonic for i in md.disasm(img[s:e], 0)] for s, e in zip(st, st[1:] + [hi])}
ia, A = split('../unpacked/EDIT_EDIT.EXE', 0x2d10, 0xd2b0); ib, B = split('../unpacked/DIGI_T_MAIN.EXE', 0, 0x2af10)
loop = A[0x4730 + 0x1a9]
best = sorted(((difflib.SequenceMatcher(None, loop, v, autojunk=False).ratio(), s) for s, v in B.items() if abs(len(v) - len(loop)) < 80), reverse=True)[:3]
print('EDIT loop ins', len(loop), 'best', [(round(r, 3), hex(s), len(B[s])) for r, s in best])
s = best[0][1]; e = min(k for k in B if k > s)
print('Digi-Test candidate has F10 seed (c7 07 00 44):', bytes.fromhex('26c7070044') in ib[s:e], 'Alt-X cmp:', bytes.fromhex('3d002d') in ib[s:e])
print('EDIT loop has F10 seed:', bytes.fromhex('26c7070044') in ia[0x4730+0x1a9:0x4730+0x428])
