import sys, os, struct; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edos import EDos
d = EDos('../unpacked/EDIT_EDITOR.EXE', [ord('a')], root=os.path.abspath('run')).run()
dg = 0x1000 + 0x762
print('lineh', struct.unpack('<h', d.rd(dg, 0x13e6, 2)), 'charw', struct.unpack('<h', d.rd(dg, 0x13e8, 2)))
print('ints', sorted(set((n, a) for n, a in [x for x in d.log if isinstance(x[0], int)])))
print('unhandled', [x for x in d.log if not isinstance(x[0], int)][:20])
print('ROM font F000:FA6E', d.rd(0xf000, 0xfa6e + 8*ord('A'), 8).hex(), 'int43', d.rd(0, 0x43*4, 4).hex(), 'int1f', d.rd(0, 0x1f*4, 4).hex())
