import os, sys, struct; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fsdos import FSDos
from unicorn import UC_HOOK_CODE
HERE = os.path.dirname(os.path.abspath(__file__))
d = FSDos(os.path.join(HERE, 'unpacked/KVC_KVC.EXE'), keys=b'    ', args=b' C:', root=os.path.join(HERE,'kvc_disk'))
def h(uc, a, s, _):
    if d.r('cs') == 0x1000 and d.r('ip') in (0x14, 0x16, 0x28, 0x2c):
        ds = d.r('ds'); print(hex(d.r('ip')), 'ds', hex(ds), 'dx', hex(d.r('dx')), 'w75', bytes(uc.mem_read(ds*16+0x75, 4)).hex(), 'psp2c', bytes(uc.mem_read(d.psp*16+0x2c,2)).hex())
d.uc.hook_add(UC_HOOK_CODE, h, begin=0x10000, end=0x10040); d.maxins = 100000; d.run()
print(bytes(d.uc.mem_read(0x10000, 8)).hex())
