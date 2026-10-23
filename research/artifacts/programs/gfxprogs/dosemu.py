# Minimal DOS/BIOS text-mode harness on Unicorn for E2E runs of unpacked binaries.
import sys, os, struct
from unicorn import *
from unicorn.x86_const import *
R = {n: getattr(__import__('unicorn.x86_const', fromlist=['x']), 'UC_X86_REG_'+n.upper()) for n in
     'ax bx cx dx si di bp sp cs ds es ss ip eflags'.split()}
class Dos:
    def __init__(self, path, keys=b'', loadseg=0x1000, args=b'', root=None, verbose=False, maxins=200_000_000):
        self.uc = uc = Uc(UC_ARCH_X86, UC_MODE_16); uc.mem_map(0, 0x110000)
        self.keys = list(keys); self.out = []; self.page = 0; self.cur = [[0,0] for _ in range(8)]
        self.mode = 3; self.verbose = verbose; self.done = False; self.log = []; self.snaps = []
        self.root = root; self.files = {}; self.nexth = 5; self.dta = None; self.find = None
        d = open(path,'rb').read(); psp = loadseg - 0x10; self.psp = psp
        p = bytearray(256); p[0:2] = b'\xcd\x20'; p[2:4] = struct.pack('<H', 0xA000)
        p[0x80] = len(args); p[0x81:0x81+len(args)] = args; p[0x81+len(args)] = 13
        uc.mem_write(psp*16, bytes(p))
        if d[:2] == b'MZ':
            hdr = struct.unpack('<H', d[8:10])[0]*16; img = d[hdr:]
            uc.mem_write(loadseg*16, img)
            n, = struct.unpack('<H', d[6:8]); lfa, = struct.unpack('<H', d[0x18:0x1a])
            for i in range(n):
                o, s = struct.unpack('<HH', d[lfa+4*i:lfa+4*i+4]); a = (loadseg+s)*16+o
                w, = struct.unpack('<H', uc.mem_read(a,2)); uc.mem_write(a, struct.pack('<H',(w+loadseg)&0xffff))
            ss, sp, _, ip, cs = struct.unpack('<HHHHH', d[0x0e:0x18]); cs += loadseg; ss += loadseg
        else:
            uc.mem_write(psp*16+0x100, d); cs, ip, ss, sp = psp, 0x100, psp, 0xfffe
        self.dta = (psp, 0x80)
        for r, v in (('ds',psp),('es',psp),('ss',ss),('sp',sp),('cs',cs)): uc.reg_write(R[r], v)
        # BIOS data area: 80 cols, mode 3, video seg
        uc.mem_write(0x449, bytes([3])); uc.mem_write(0x44a, struct.pack('<H',80)); uc.mem_write(0x484, bytes([24]))
        self.clear()
        uc.hook_add(UC_HOOK_INTR, self.intr)
        self.start = cs*16+ip; self.maxins = maxins
    def r(self, n): return self.uc.reg_read(R[n])
    def w(self, n, v): self.uc.reg_write(R[n], v & 0xffff)
    def cf(self, on):
        f = self.r('eflags'); self.uc.reg_write(R['eflags'], (f | 1) if on else (f & ~1))
    def clear(self, page=None):
        for pg in ([page] if page is not None else range(8)):
            self.uc.mem_write(0xB8000 + pg*0x1000, b'\x20\x07'*2000)
    def vbase(self, pg): return 0xB8000 + pg*0x1000
    def putc(self, ch):
        pg = self.page; x, y = self.cur[pg]
        if ch == 13: x = 0
        elif ch == 10: y += 1
        elif ch == 8: x = max(0, x-1)
        elif ch == 7: pass
        else:
            self.uc.mem_write(self.vbase(pg) + (y*80+x)*2, bytes([ch])); x += 1
            if x >= 80: x = 0; y += 1
        if y >= 25:
            b = self.vbase(pg); m = bytes(self.uc.mem_read(b+160, 160*24)); self.uc.mem_write(b, m + b'\x20\x07'*80); y = 24
        self.cur[pg] = [x, y]
        self.out.append(ch)
    def screen(self, pg=None):
        pg = self.page if pg is None else pg
        m = bytes(self.uc.mem_read(self.vbase(pg), 4000))
        return '\n'.join(m[i*160:(i+1)*160:2].decode('cp437').rstrip() for i in range(25))
    def key(self):
        if not self.keys:
            self.snaps.append(self.screen()); self.done = True; self.uc.emu_stop(); return None
        k = self.keys.pop(0)
        return k
    def intr(self, uc, n, _):
        ah = self.r('ax') >> 8; al = self.r('ax') & 0xff
        if self.verbose: print(f'INT {n:02x} AX={self.r("ax"):04x} at {self.r("cs"):04x}:{self.r("ip"):04x}')
        self.log.append((n, ah))
        if n == 0x10:
            if ah == 0x00: self.mode = al & 0x7f; self.clear(); self.cur = [[0,0] for _ in range(8)]
            elif ah == 0x02: self.cur[self.r('bx')>>8 & 7] = [self.r('dx') & 0xff, self.r('dx') >> 8]
            elif ah == 0x03: x, y = self.cur[self.r('bx')>>8 & 7]; self.w('dx', y<<8 | x); self.w('cx', 0x0607)
            elif ah == 0x05: self.page = al & 7
            elif ah in (0x06, 0x07):
                b = self.vbase(self.page); cx, dx = self.r('cx'), self.r('dx'); attr = self.r('bx')>>8
                t, l, bt, rt = cx>>8, cx&0xff, dx>>8, dx&0xff; lines = al
                rows = [bytearray(self.uc.mem_read(b+y*160, 160)) for y in range(25)]
                h = bt - t + 1
                for _ in range(lines if lines else h):
                    rng = range(t, bt) if ah == 6 else range(bt, t, -1)
                    for y in rng:
                        src = y+1 if ah == 6 else y-1
                        rows[y][l*2:(rt+1)*2] = rows[src][l*2:(rt+1)*2]
                    fill = bt if ah == 6 else t
                    rows[fill][l*2:(rt+1)*2] = bytes([32, attr])*(rt-l+1)
                self.uc.mem_write(b, b''.join(bytes(r) for r in rows))
            elif ah == 0x0e: self.putc(al)
            elif ah == 0x0f: self.w('ax', 80<<8 | self.mode); self.w('bx', self.page<<8 | (self.r('bx')&0xff))
            elif ah == 0x09 or ah == 0x0a:
                x, y = self.cur[self.r('bx')>>8 & 7]; b = self.vbase(self.r('bx')>>8 & 7)
                for i in range(self.r('cx')):
                    self.uc.mem_write(b+(y*80+x+i)*2, bytes([al]) if ah == 0x0a else bytes([al, self.r('bx')&0xff]))
            elif ah == 0x01 or ah == 0x10 or ah == 0x11 or ah == 0x12 or ah == 0x0b or ah == 0x08: pass
            else: self.log.append(('unhandled10', ah))
        elif n == 0x16:
            if ah in (0, 0x10):
                k = self.key()
                if k is not None: self.w('ax', k if k > 0xff else k)
            elif ah in (1, 0x11):
                if self.keys:
                    k = self.keys[0]; self.w('ax', k); f = self.r('eflags'); uc.reg_write(R['eflags'], f & ~0x40)
                else:
                    self.snaps.append(self.screen()); self.done = True; uc.emu_stop()
            elif ah == 2: self.w('ax', 0)
        elif n == 0x21:
            if ah == 0x02: self.putc(self.r('dx') & 0xff)
            elif ah == 0x09:
                a = self.r('ds')*16 + self.r('dx')
                while True:
                    c = uc.mem_read(a, 1)[0]
                    if c == 0x24: break
                    self.putc(c); a += 1
            elif ah in (0x01, 0x07, 0x08):
                k = self.key()
                if k is not None:
                    self.w('ax', (self.r('ax') & 0xff00) | (k & 0xff))
                    if ah == 1: self.putc(k & 0xff)
            elif ah == 0x0b: self.w('ax', (self.r('ax') & 0xff00) | (0xff if self.keys else 0))
            elif ah in (0x4c, 0x00, 0x31): self.exitcode = al; self.done = True; uc.emu_stop()
            elif ah == 0x30: self.w('ax', 0x0005); self.w('bx', 0); self.w('cx', 0)
            elif ah == 0x4a: self.cf(False)
            elif ah == 0x48: self.w('ax', 0x5000); self.cf(False)
            elif ah == 0x35: self.w('es', 0xF000); self.w('bx', 0x1000 + (al<<2))
            elif ah == 0x25: pass
            elif ah == 0x2c: self.w('cx', 0x0c00); self.w('dx', 0)
            elif ah == 0x2a: self.w('cx', 1993); self.w('dx', 0x0101)
            elif ah == 0x1a: self.dta = (self.r('ds'), self.r('dx'))
            elif ah == 0x2f: self.w('es', self.dta[0]); self.w('bx', self.dta[1])
            elif ah == 0x44: self.w('dx', 0x80 if self.r('bx') < 3 else 0); self.cf(False)
            elif ah == 0x40:
                h = self.r('bx'); a = self.r('ds')*16 + self.r('dx'); data = bytes(uc.mem_read(a, self.r('cx')))
                if h in (1, 2):
                    for c in data: self.putc(c)
                self.w('ax', len(data)); self.cf(False)
            else:
                self.log.append(('unhandled21', ah)); self.cf(True); self.w('ax', 1)
        elif n == 0x20: self.done = True; uc.emu_stop()
        else:
            self.log.append(('int', n))
    def run(self):
        try:
            self.uc.emu_start(self.start, 0, count=self.maxins)
        except UcError as e:
            self.err = f'{e} at {self.r("cs"):04x}:{self.r("ip"):04x}'
            print('EMU ERROR', self.err)
        if not self.done: print('stopped (instruction cap) at %04x:%04x' % (self.r('cs'), self.r('ip')))
        return self
