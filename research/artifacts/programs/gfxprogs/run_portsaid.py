import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ega import Ega
from sheet import sheet
from unicorn import UC_HOOK_CODE
d = Ega('../unpacked/PORTSAID_PORTSAID.EXE', keys=b'', maxins=400_000_000)
fr = []
calls = {0x6cef: 'after_44ce', 0x6cf7: 'after_delay', 0x6cfa: 'after_853', 0x6cfd: 'after_2ec1'}
def h(uc, addr, size, _):
    if addr - 0x1000*16 in calls:
        w, hh, pix, pal, dac = d.render(); fr.append((pix, pal)); print('snap', calls[addr - 0x10000], d.retr)
d.uc.hook_add(UC_HOOK_CODE, h, begin=0x10000+0x6ce7, end=0x10000+0x6d10)
d.run()
print('mode', hex(d.vgamode), 'pal', d.pal, 'log', [x for x in d.log if x[0] not in (0x21,)][:20])
print('unhandled', [x for x in d.log if isinstance(x[0], str)][:10])
d.save('portsaid_final.png')
