# EDITOR/EDIT/WINKEY harness: file I/O (FSDos) + VGA planes (VDos) + DAC palette + read mode 0.
import sys, os, struct; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from vga import VDos
from fsdos import FSDos
from gfx import png
def ega64(i):
    r = ((i >> 2) & 1) * 2 + ((i >> 5) & 1); g = ((i >> 1) & 1) * 2 + ((i >> 4) & 1); b = (i & 1) * 2 + ((i >> 3) & 1)
    return (r * 85, g * 85, b * 85)
class EDos(VDos, FSDos):
    def __init__(self, *a, **k):
        super().__init__(*a, **k)
        self.dac = [ega64(i) for i in range(64)] + [(0, 0, 0)] * 192
        self.palreg = [0, 1, 2, 3, 4, 5, 0x14, 7, 0x38, 0x39, 0x3a, 0x3b, 0x3c, 0x3d, 0x3e, 0x3f]
    def vr(self, uc, access, addr, size, value, _):
        super().vr(uc, access, addr, size, value, _)
        o = addr - 0xA0000; rm = self.gc[4] & 3
        uc.mem_write(addr, bytes(self.planes[rm][(o + i) & 0xffff] for i in range(size)))
    def intr(self, uc, n, _):
        ax = self.r('ax')
        if n == 0x10 and ax == 0x1010:
            self.dac[self.r('bx') & 0xff] = tuple(min(255, v * 255 // 63) for v in (self.r('dx') >> 8, self.r('cx') >> 8, self.r('cx') & 0xff)); return
        if n == 0x10 and ax == 0x1000: self.palreg[self.r('bx') & 15] = self.r('bx') >> 8; return
        if n == 0x10 and ax == 0x1002:
            a = self.r('es') * 16 + self.r('dx'); self.palreg = list(uc.mem_read(a, 16)); return
        if n == 0x10 and ax >> 8 == 0x1a: self.w('ax', 0x1a); self.w('bx', 0x0008); return
        if n == 0x10 and ax >> 8 == 0x12 and (self.r('bx') & 0xff) == 0x10: self.w('bx', 0x0003); self.w('cx', 0x0009); return
        super().intr(uc, n, _)
    def shot(self, path, w=640, h=480):
        pal = [self.dac[self.palreg[i] & 0x3f] for i in range(16)]
        pix = self.pixels(w, h); png(path, w, h, pix, pal)
    def rd(self, seg, off, n): return bytes(self.uc.mem_read(seg * 16 + off, n))
