# EGA/VGA planar memory + port model on top of the shared Dos harness (copied locally).
import sys, os, struct, zlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dosemu import Dos, R
from gfx import png, EGA
from unicorn import *
from unicorn.x86_const import *

class Ega(Dos):
    def __init__(self, *a, files=None, snap_every=0, **k):
        super().__init__(*a, **k)
        self.planes = [bytearray(0x10000) for _ in range(4)]
        self.seq = [0]*8; self.seq[2] = 0xf; self.gc = [0]*9; self.gc[8] = 0xff
        self.si = self.gi = 0; self.latch = [0]*4; self.pal = list(range(16)); self.dac = {}
        self.retr = 0; self.attr_i = None; self.vgamode = 3; self.files = files or {}; self.fh = {}
        self.snap_every = snap_every; self.frames = []; self.ports = {}
        uc = self.uc
        uc.hook_add(UC_HOOK_MEM_WRITE, self.vwrite, begin=0xA0000, end=0xAFFFF)
        uc.hook_add(UC_HOOK_MEM_READ, self.vread, begin=0xA0000, end=0xAFFFF)
        uc.hook_add(UC_HOOK_INSN, self.port_in, None, 1, 0, UC_X86_INS_IN)
        uc.hook_add(UC_HOOK_INSN, self.port_out, None, 1, 0, UC_X86_INS_OUT)
        self.ivt_owned = set()
        env = b'COMSPEC=C:\\COMMAND.COM\0PATH=C:\\\0\0\x01\0C:\\PROG.EXE\0'
        self.uc.mem_write(0x900*16, env); self.uc.mem_write(self.psp*16+0x2c, struct.pack('<H', 0x900))
    # --- ports
    def port_out(self, uc, port, size, value, _):
        self.ports[port] = self.ports.get(port, 0) + 1
        vals = [(port, value & 0xff)] if size == 1 else [(port, value & 0xff), (port+1, (value >> 8) & 0xff)]
        for p, v in vals:
            if p == 0x3c4: self.si = v & 7
            elif p == 0x3c5: self.seq[self.si] = v
            elif p == 0x3ce: self.gi = v & 15
            elif p == 0x3cf:
                if self.gi < 9: self.gc[self.gi] = v
            elif p == 0x3c0:
                if self.attr_i is None: self.attr_i = v & 0x1f
                else:
                    if self.attr_i < 16: self.pal[self.attr_i] = v & 0x3f
                    self.attr_i = None
            elif p == 0x3c8: self.dac_i = v; self.dac_c = []
            elif p == 0x3c9:
                self.dac_c.append(v & 0x3f)
                if len(self.dac_c) == 3: self.dac[self.dac_i] = tuple(self.dac_c); self.dac_i += 1; self.dac_c = []
    def port_in(self, uc, port, size, _):
        self.ports[('in', port)] = self.ports.get(('in', port), 0) + 1
        if port == 0x3da:
            self.attr_i = None; self.retr += 1
            if self.snap_every and self.retr % self.snap_every == 0: self.frames.append(self.render())
            return 0x09 if (self.retr // 2) % 2 else 0x00
        if port == 0x40: self.pit = getattr(self, 'pit', 0) - 37; return self.pit & 0xff
        if port == 0x61: return 0
        if port == 0x60: return 0
        return 0xff
    # --- planar memory
    def vread(self, uc, access, addr, size, value, _):
        for i in range(size):
            o = (addr + i - 0xA0000)
            self.latch = [p[o] for p in self.planes]
            if self.gc[5] & 8:  # read mode 1: colour compare
                cc, dc = self.gc[2] & 15, self.gc[7] & 15; v = 0xff
                for p in range(4):
                    if dc >> p & 1: v &= ~(self.latch[p] ^ (0xff if cc >> p & 1 else 0)) & 0xff
            else: v = self.planes[self.gc[4] & 3][o]
            uc.mem_write(addr + i, bytes([v]))
    def vwrite(self, uc, access, addr, size, value, _):
        for i in range(size):
            self.wbyte(addr + i - 0xA0000, (value >> (8*i)) & 0xff)
    def wbyte(self, o, v):
        gc = self.gc; mode = gc[5] & 3; mask = self.seq[2] & 15; bm = gc[8]
        rot = gc[3] & 7; fn = (gc[3] >> 3) & 3
        if mode == 1:
            for p in range(4):
                if mask >> p & 1: self.planes[p][o] = self.latch[p]
            return
        v = ((v >> rot) | (v << (8 - rot))) & 0xff
        for p in range(4):
            if not (mask >> p & 1): continue
            if mode == 0:
                d = (0xff if gc[0] >> p & 1 else 0) if gc[1] >> p & 1 else v
            elif mode == 2:
                d = 0xff if v >> p & 1 else 0
            else:  # VGA mode 3
                bm2 = bm & v; d = 0xff if gc[0] >> p & 1 else 0
                l = self.latch[p]; d = l if fn == 0 else d
                self.planes[p][o] = (d & bm2) | (l & ~bm2 & 0xff); continue
            l = self.latch[p]
            if fn == 1: d &= l
            elif fn == 2: d |= l
            elif fn == 3: d ^= l
            self.planes[p][o] = (d & bm) | (l & ~bm & 0xff)
    def render(self, w=None, h=None, start=0):
        m = self.vgamode
        w = w or (320 if m in (0x0d, 0x13) else 640); h = h or {0x0d: 200, 0x0e: 200, 0x10: 350, 0x12: 480}.get(m, 350)
        bpl = w // 8; pix = {}
        P = self.planes
        for y in range(h):
            for xb in range(bpl):
                o = start + y*bpl + xb
                b0, b1, b2, b3 = P[0][o], P[1][o], P[2][o], P[3][o]
                if not (b0 | b1 | b2 | b3): continue
                for bit in range(8):
                    s = 7 - bit
                    c = (b0 >> s & 1) | (b1 >> s & 1) << 1 | (b2 >> s & 1) << 2 | (b3 >> s & 1) << 3
                    if c: pix[(xb*8+bit, y)] = c
        return (w, h, pix, list(self.pal), dict(self.dac))
    def save(self, path, fr=None):
        w, h, pix, pal, dac = fr or self.render()
        def rgb(c):
            a = pal[c]
            if dac and a in dac: return tuple(x*255//63 for x in dac[a])
            # EGA 6-bit attribute rgbRGB
            r = ((a >> 2) & 1)*170 + ((a >> 5) & 1)*85; g = ((a >> 1) & 1)*170 + ((a >> 4) & 1)*85; b = (a & 1)*170 + ((a >> 3) & 1)*85
            if self.vgamode in (0x0d, 0x0e) and a < 16:
                return EGA[a]
            return (r, g, b)
        png(path, w, h, pix, [rgb(c) for c in range(16)])
    # --- interrupts: vector through IVT for vectors the program installed
    def intr(self, uc, n, _):
        ah = self.r('ax') >> 8; al = self.r('ax') & 0xff
        if n in self.ivt_owned:
            seg, off = struct.unpack('<HH', bytes(uc.mem_read(n*4, 4)))[::-1]
            sp = (self.r('sp') - 6) & 0xffff; ss = self.r('ss')
            uc.mem_write(ss*16 + sp, struct.pack('<HHH', self.r('ip'), self.r('cs'), self.r('eflags') & 0xffff))
            self.w('sp', sp); uc.reg_write(R['cs'], seg); uc.reg_write(R['ip'], off); return
        if n == 0x21 and ah == 0x25:
            self.ivt_owned.add(al); uc.mem_write(al*4, struct.pack('<HH', self.r('dx'), self.r('ds'))); return
        if n == 0x21 and ah == 0x35:
            off, seg = struct.unpack('<HH', bytes(uc.mem_read(al*4, 4))); self.w('es', seg); self.w('bx', off); return
        if n == 0x10 and ah == 0x00:
            self.vgamode = al & 0x7f
            if not al & 0x80:
                for p in self.planes: p[:] = bytes(0x10000)
            self.pal = list(range(16)) if self.vgamode != 0x10 else [0,1,2,3,4,5,0x14,7,0x38,0x39,0x3a,0x3b,0x3c,0x3d,0x3e,0x3f]
            if self.vgamode in (0x12, 0x0d, 0x0e): self.pal = [0,1,2,3,4,5,0x14,7,0x38,0x39,0x3a,0x3b,0x3c,0x3d,0x3e,0x3f]
        if n == 0x10 and ah == 0x10:
            if al == 0: self.pal[self.r('bx') & 15] = self.r('bx') >> 8
            elif al == 2:
                a = self.r('es')*16 + self.r('dx'); self.pal[:16] = list(uc.mem_read(a, 16))
            elif al == 0x10: self.dac[self.r('bx')] = (self.r('dx') >> 8, self.r('cx') >> 8, self.r('cx') & 0xff)
            elif al == 0x12:
                a = self.r('es')*16 + self.r('dx'); n0 = self.r('bx')
                for i in range(self.r('cx')): self.dac[n0+i] = tuple(uc.mem_read(a+3*i, 3))
            return
        if n == 0x10 and ah == 0x0f:
            self.w('ax', (80 if self.vgamode != 0x0d else 40) << 8 | self.vgamode); self.w('bx', self.r('bx') & 0xff); return
        if n == 0x10 and ah == 0x1a: self.w('ax', 0x001a); self.w('bx', 0x0008); return
        if n == 0x10 and ah == 0x12 and (self.r('bx') & 0xff) == 0x10: self.w('bx', 0x0003); self.w('cx', 0x0009); return
        if n == 0x11: self.w('ax', 0x0026); return
        if n == 0x1a and ah == 0: self.tick = getattr(self, 'tick', 0) + 1; self.w('cx', 0); self.w('dx', self.tick); return
        if n == 0x21 and ah == 0x3d:
            a = self.r('ds')*16 + self.r('dx'); name = bytes(uc.mem_read(a, 80)).split(b'\0')[0].decode('latin1')
            self.log.append(('open', name))
            base = name.replace('\\', '/').split('/')[-1].upper()
            if base in self.files:
                h = self.nexth; self.nexth += 1; self.fh[h] = [open(self.files[base], 'rb').read(), 0]
                self.w('ax', h); self.cf(False)
            else: self.w('ax', 2); self.cf(True)
            return
        if n == 0x21 and ah == 0x3f and self.r('bx') in self.fh:
            f = self.fh[self.r('bx')]; data = f[0][f[1]:f[1]+self.r('cx')]; f[1] += len(data)
            uc.mem_write(self.r('ds')*16 + self.r('dx'), data); self.w('ax', len(data)); self.cf(False); return
        if n == 0x21 and ah == 0x42 and self.r('bx') in self.fh:
            f = self.fh[self.r('bx')]; off = (self.r('cx') << 16) | self.r('dx')
            if off & 0x80000000: off -= 1 << 32
            f[1] = [off, f[1] + off, len(f[0]) + off][al]
            self.w('ax', f[1] & 0xffff); self.w('dx', f[1] >> 16); self.cf(False); return
        if n == 0x21 and ah == 0x3e: self.fh.pop(self.r('bx'), None); self.cf(False); return
        if n == 0x21 and ah == 0x4b:
            a = self.r('ds')*16 + self.r('dx'); self.log.append(('exec', bytes(uc.mem_read(a, 64)).split(b'\0')[0])); self.cf(True); self.w('ax', 2); return
        super().intr(uc, n, _)
