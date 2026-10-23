import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ega import Ega
from unicorn import UC_HOOK_CODE
d = Ega('../unpacked/NAMES_NAMES.COM', keys=b''); d.vgamode = 0x0d
stops = {0x5af:'01_after_effect8c4',0x5bb:'02_after_904',0x5c7:'03_after_82e',0x5d3:'04_after_7b7',0x5df:'05_after_747',
         0x5f3:'06_img85aa',0x607:'07_img5ea2',0x615:'08_img998a',0x629:'09_img5ea2',0x637:'10_imgad6a',0x659:'11_imgc14a',0x67b:'12_imgd52a',0x68f:'13_final'}
def h(uc, addr, size, _):
    ip = d.r('ip')
    if d.r('cs') == d.psp and ip in stops: d.save(f'names_{stops[ip]}.png')
d.uc.hook_add(UC_HOOK_CODE, h, begin=d.psp*16+0x5a0, end=d.psp*16+0x690)
d.run()
