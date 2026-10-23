# EDIT.EXE: does a Tab insert (movmem 255-col, 8 bytes past the block) damage the next line?
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edos import EDos
UP, HOME, ESC, TAB, ENTER = 0x4800, 0x4700, 0x011b, 0x0f09, 0x1c0d
def run(keys):
    d = EDos('../unpacked/EDIT_EDIT.EXE', keys, root=os.path.abspath('run'), maxins=900_000_000).run()
    return bytes(d.uc.mem_read(0, 0xA0000))
base = [ESC] + [ord(c) for c in 'AB'] + [ENTER] + [ord(c) for c in 'HELLO'] + [UP, HOME]
for name, extra in (('before', []), ('after 1 Tab', [TAB]), ('after 2 Tabs', [TAB, TAB])):
    m = run(base + extra)
    a = m.find(b'AB'); h = m.find(b'HELLO'); e = m.find(b'ELLO')
    print(name, 'line0 at', hex(a), 'HELLO at', hex(h), 'gap', h - a if h > 0 else None, 'ELLO at', hex(e), 'hdr before HELLO', m[h-4:h].hex() if h > 0 else m[e-5:e].hex())
import re
for name, extra in (('before', []), ('after 2 Tabs', [TAB, TAB])):
    m = run(base + extra)
    print(name, [hex(x.start()) for x in re.finditer(rb'(?: {8})*AB\x00', m)], [hex(x.start()) for x in re.finditer(rb'HELLO\x00', m)])
    for x in re.finditer(rb'HELLO\x00', m): print('  bytes before HELLO', m[x.start()-20:x.start()].hex(' '))
    for x in re.finditer(rb'(?: {8})*AB\x00', m): print('  line0 tail', x.start(), m[x.start()+250:x.start()+272].hex(' '))
