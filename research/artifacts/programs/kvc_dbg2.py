import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fsdos import FSDos
from unicorn import UC_HOOK_CODE
HERE = os.path.dirname(os.path.abspath(__file__))
d = FSDos(os.path.join(HERE, 'unpacked/KVC_KVC.EXE'), keys=b'    ', args=b' C:', root=os.path.join(HERE,'kvc_disk'))
tr = []
def h(uc, a, s, _):
    ip = d.r('ip'); cs = d.r('cs')
    if len(tr) < 400000: tr.append((cs, ip, d.r('ax'), d.r('bx'), d.r('cx'), d.r('dx'), d.r('bp'), d.r('di'), d.r('sp'), d.r('ss')))
d.uc.hook_add(UC_HOOK_CODE, h); d.run()
for t in tr:
    if t[1] in (0x56, 0x5a, 0x77, 0x7b, 0x7e, 0x1f7, 0xfc) and t[0] == 0x1000: print(' '.join('%04x' % v for v in t))
# last 30 before abort write
idx = [i for i, t in enumerate(tr) if t[1] == 0x1f7]
print('first 0x1f7 at', idx[:1], 'total instr', len(tr))
if idx:
    for t in tr[idx[0]-25:idx[0]+1]: print(' '.join('%04x' % v for v in t))
