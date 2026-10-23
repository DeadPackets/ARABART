# Minimal EGA/VGA planar model (write modes 0/1/2, set/reset, bit mask, map mask, logic ops) on top of GDos.
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from unicorn import *
from unicorn.x86_const import *
from gfx import GDos, png, EGA
class VDos(GDos):
    def __init__(self, *a, **k):
        super().__init__(*a, **k)
        self.planes = [bytearray(0x10000) for _ in range(4)]; self.latch = [0]*4
        self.gc = [0]*9; self.gc[8] = 0xff; self.seq = [0]*5; self.seq[2] = 0xf; self.gci = 0; self.seqi = 0
        self.uc.hook_add(UC_HOOK_MEM_WRITE, self.vw, begin=0xA0000, end=0xAFFFF)
        self.uc.hook_add(UC_HOOK_MEM_READ, self.vr, begin=0xA0000, end=0xAFFFF)
        self.uc.hook_add(UC_HOOK_INSN, self.port_out, None, 1, 0, UC_X86_INS_OUT)
        self.uc.hook_add(UC_HOOK_INSN, self.inp, None, 1, 0, UC_X86_INS_IN)
    def inp(self, uc, port, size, _):
        if port == 0x3da: self.t = getattr(self, 't', 0) ^ 9; return self.t
        return 0
    def port_out(self, uc, port, size, value, _):
        vals = [(port, value & 0xff)] + ([(port+1, value >> 8)] if size == 2 else [])
        for p, v in vals:
            if p == 0x3ce: self.gci = v & 0xf
            elif p == 0x3cf and self.gci < 9: self.gc[self.gci] = v
            elif p == 0x3c4: self.seqi = v & 7
            elif p == 0x3c5 and self.seqi < 5: self.seq[self.seqi] = v
    def vr(self, uc, access, addr, size, value, _):
        o = addr - 0xA0000
        for i in range(size):
            self.latch = [self.planes[p][(o+i) & 0xffff] for p in range(4)]
    def vw(self, uc, access, addr, size, value, _):
        for i in range(size):
            self.wbyte((addr - 0xA0000 + i) & 0xffff, (value >> (8*i)) & 0xff)
    def wbyte(self, o, v):
        mode = self.gc[5] & 3; mask = self.gc[8]; func = (self.gc[3] >> 3) & 3; rot = self.gc[3] & 7
        v = ((v >> rot) | (v << (8 - rot))) & 0xff
        for p in range(4):
            if not (self.seq[2] >> p) & 1: continue
            if mode == 1: self.planes[p][o] = self.latch[p]; continue
            if mode == 0: d = (0xff if (self.gc[0] >> p) & 1 else 0) if (self.gc[1] >> p) & 1 else v
            elif mode == 2: d = 0xff if (v >> p) & 1 else 0
            else: d = (0xff if (self.gc[0] >> p) & 1 else 0); m2 = mask & v; d = (d & m2) | (self.latch[p] & ~m2 & 0xff); self.planes[p][o] = d; continue
            l = self.latch[p]
            if func == 1: d &= l
            elif func == 2: d |= l
            elif func == 3: d ^= l
            self.planes[p][o] = (d & mask) | (l & ~mask & 0xff)
    def pixels(self, w=640, h=480, start=0):
        pix = {}
        for y in range(h):
            for xb in range(w // 8):
                o = start + y*(w//8) + xb
                b = [self.planes[p][o] for p in range(4)]
                if not any(b): continue
                for bit in range(8):
                    c = sum((((b[p] >> (7-bit)) & 1) << p) for p in range(4))
                    if c: pix[(xb*8+bit, y)] = c
        return pix
if __name__ == '__main__':
    d = VDos(sys.argv[1], frames=1).run()
    h = int(sys.argv[3]) if len(sys.argv) > 3 else 480
    png(sys.argv[2], 640, h, d.pixels(640, h)); print('mode', hex(d.mode), d.log[-4:])
