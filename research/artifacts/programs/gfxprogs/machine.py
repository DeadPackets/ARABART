# TSR-capable machine: IVT entries point to F000 stubs ("int n; iret") so programs can hook and chain vectors.
import sys, os, struct
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ega import Ega, R
from unicorn import *
from unicorn.x86_const import *
PROG = '/Users/deadpackets/workspace/DOSArchive/programs/SUN/'
class Machine(Ega):
    def __init__(self, *a, **k):
        super().__init__(*a, **k)
        for n in range(256):
            self.uc.mem_write(0xF0000 + n*4, bytes([0xCD, n, 0xCF, 0x90]))
            self.uc.mem_write(n*4, struct.pack('<HH', n*4, 0xF000))
        self.trace_bgi = []
    def intr(self, uc, n, _):
        cs = self.r('cs')
        if cs != 0xF000:
            off, seg = struct.unpack('<HH', bytes(uc.mem_read(n*4, 4)))
            if seg != 0xF000:   # vector hooked by a program: emulate the INT through the IVT
                sp = (self.r('sp') - 6) & 0xffff; ss = self.r('ss')
                uc.mem_write(ss*16 + sp, struct.pack('<HHH', self.r('ip'), cs, self.r('eflags') & 0xffff))
                self.w('sp', sp); uc.reg_write(R['cs'], seg); uc.reg_write(R['ip'], off)
                f = self.r('eflags'); uc.reg_write(R['eflags'], f & ~0x200)
                return
        ah = self.r('ax') >> 8
        if n == 0x27 or (n == 0x21 and ah == 0x31):
            self.tsr = True; self.done = True; uc.emu_stop(); return
        if n == 0x21 and ah == 0x25:
            al = self.r('ax') & 0xff; uc.mem_write(al*4, struct.pack('<HH', self.r('dx'), self.r('ds'))); return
        if n == 0x21 and ah == 0x35:
            al = self.r('ax') & 0xff; off, seg = struct.unpack('<HH', bytes(uc.mem_read(al*4, 4))); self.w('es', seg); self.w('bx', off); return
        if n == 0x10 and ah == 0x0c:
            self.putpix(self.r('cx'), self.r('dx'), self.r('ax') & 0xff); return
        if n == 0x10 and ah == 0x0d:
            self.w('ax', self.getpix(self.r('cx'), self.r('dx'))); return
        if n == 0x21 and ah == 0x48:
            self.heap = getattr(self, 'heap', 0x8000); seg = self.heap; self.heap += self.r('bx') + 1
            if self.heap > 0x9FFF: self.w('ax', 8); self.w('bx', 0); self.cf(True); return
            self.w('ax', seg); self.cf(False); return
        if n == 0x21 and ah == 0x49: self.cf(False); return
        if n == 0x21 and ah == 0x4a: self.cf(False); return
        super().intr(uc, n, _)
    def bpl(self): return 40 if self.vgamode == 0x0d else 80
    def putpix(self, x, y, c):
        o = y*self.bpl() + x//8; b = 0x80 >> (x & 7)
        for p in range(4):
            v = self.planes[p][o]
            if c & 0x80: self.planes[p][o] = v ^ (b if c >> p & 1 else 0)
            else: self.planes[p][o] = (v | b) if c >> p & 1 else (v & ~b & 0xff)
    def getpix(self, x, y):
        o = y*self.bpl() + x//8; s = 7 - (x & 7)
        return sum(((self.planes[p][o] >> s) & 1) << p for p in range(4))
    def load(self, path, loadseg, args=b''):
        uc = self.uc; d = open(path, 'rb').read(); psp = loadseg - 0x10; self.psp = psp
        p = bytearray(256); p[0:2] = b'\xcd\x20'; p[2:4] = struct.pack('<H', 0xA000)
        p[0x80] = len(args); p[0x81:0x81+len(args)] = args; p[0x81+len(args)] = 13
        p[0x2c:0x2e] = struct.pack('<H', 0x900)
        uc.mem_write(psp*16, bytes(p))
        hdr = struct.unpack('<H', d[8:10])[0]*16; uc.mem_write(loadseg*16, d[hdr:])
        n, = struct.unpack('<H', d[6:8]); lfa, = struct.unpack('<H', d[0x18:0x1a])
        for i in range(n):
            o, s = struct.unpack('<HH', d[lfa+4*i:lfa+4*i+4]); a = (loadseg+s)*16+o
            w, = struct.unpack('<H', uc.mem_read(a, 2)); uc.mem_write(a, struct.pack('<H', (w+loadseg) & 0xffff))
        ss, sp, _, ip, cs = struct.unpack('<HHHHH', d[0x0e:0x18])
        for r, v in (('ds', psp), ('es', psp), ('ss', ss+loadseg), ('sp', sp), ('cs', cs+loadseg)): uc.reg_write(R[r], v)
        self.start = (cs+loadseg)*16 + ip; self.done = False; self.dta = (psp, 0x80)
