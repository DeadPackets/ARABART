import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edos import EDos
LEFT, ESC, TAB = 0x4b00, 0x011b, 0x0f09
d = EDos('../unpacked/EDIT_EDIT.EXE', [ESC] + [ord(c) for c in 'Helo'] + [LEFT, ord('l')] + [TAB, ord('X')], root=os.path.abspath('run'), maxins=800_000_000).run()
mem = bytes(d.uc.mem_read(0, 0xA0000))
i = mem.find(b'Hell')
print('found at', hex(i), mem[i:i+20])
d.shot('edit_insert_check.png')
