import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edos import EDos
d = EDos('/Users/deadpackets/workspace/DOSArchive/programs/EDIT/EDITOR.EXE', [ord(c) for c in '!,-.:;0129AZaz#$%&*()[]<>?/'], root=os.path.abspath('run')).run()
d.shot('probe3.png')
import struct
dg = 0x1000 + 0x762
off, seg = struct.unpack('<HH', d.rd(dg, 0xa72, 4))
print('line0 @', hex(seg), hex(off), d.rd(seg, off, 40))
