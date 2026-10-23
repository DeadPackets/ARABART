import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ega import Ega
from gfx import EGA
from sheet import sheet
from unicorn import UC_HOOK_CODE
d = Ega('../unpacked/NAMES_NAMES.COM', keys=b''); d.vgamode = 0x0d
stops = [0x5af,0x5bb,0x5c7,0x5d3,0x5df,0x5f3,0x607,0x615,0x629,0x637,0x659,0x67b]
fr = []
def h(uc, addr, size, _):
    if d.r('cs') == d.psp and d.r('ip') in stops:
        w, hh, pix, pal, dac = d.render(); fr.append((pix, pal))
d.uc.hook_add(UC_HOOK_CODE, h, begin=d.psp*16+0x5a0, end=d.psp*16+0x690)
d.run()
sheet('names_sequence.png', fr, lambda pal, c: EGA[c], cols=4)
