import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from machine import Machine, PROG
files = {'ARAB-ART.FNT': PROG + 'ARAB-ART.FNT', 'EGAVGA.BGI': PROG + 'EGAVGA.BGI'}
m = Machine('../unpacked/SUN_ARAB-ART.EXE', files=files, maxins=50_000_000)
m.run()
print('TSR?', getattr(m, 'tsr', False), 'INT10 vector', m.uc.mem_read(0x40, 4).hex(), 'log', m.log[-5:])
m.load('../unpacked/SUN_SUN.EXE', 0x2000)
m.keys = []; m.maxins = 300_000_000
m.run()
import collections
print('mode', hex(m.vgamode), 'retr', m.retr, 'ports', {k: v for k, v in m.ports.items()})
print('ints', collections.Counter(x for x in m.log if isinstance(x[0], int)).most_common(15))
print('other', [x for x in m.log if not isinstance(x[0], int)][:10])
print('cs:ip', hex(m.r('cs')), hex(m.r('ip')), 'screen text:', m.screen(0)[:200])
m.save('sun_first.png')
