# SUN driver: realistic keyboard (keys arrive one at a time), snapshot at each blocking key read.
import sys, os, struct; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from machine import Machine, PROG
from sheet import sheet
from unicorn.x86_const import UC_X86_REG_EFLAGS
files = {'ARAB-ART.FNT': PROG + 'ARAB-ART.FNT', 'EGAVGA.BGI': PROG + 'EGAVGA.BGI'}
K = {'ENT': 0x1c0d, 'SP': 0x3920, 'DN': 0x5000, 'UP': 0x4800, 'ESC': 0x011b, 'ALTX': 0x2d00, 'F1': 0x3b00, 'LT': 0x4b00, 'RT': 0x4d00, 'Y': 0x1579, 'N': 0x316e}
class Sun(Machine):
    POLLS = 400
    def intr(self, uc, n, _):
        if n == 0x16 and (self.r('cs') == 0xF000 or struct.unpack('<HH', bytes(uc.mem_read(0x58, 4)))[1] == 0xF000):
            ah = self.r('ax') >> 8
            if ah in (0, 0x10):
                if self.buf is None:
                    self.shot()
                    if not self.script: self.done = True; uc.emu_stop(); return
                    self.buf = self.script.pop(0)
                self.w('ax', self.buf); self.buf = None; self.polls = 0; return
            if ah in (1, 0x11):
                self.polls += 1
                if self.buf is None and self.script and self.polls > self.POLLS:
                    self.shot(); self.buf = self.script.pop(0)
                if self.polls > 200000 and not self.script: self.done = True; uc.emu_stop(); return
                f = self.r('eflags')
                if self.buf is None: uc.reg_write(UC_X86_REG_EFLAGS, f | 0x40)
                else: self.w('ax', self.buf); uc.reg_write(UC_X86_REG_EFLAGS, f & ~0x40)
                return
        return super().intr(uc, n, _)
    def shot(self):
        w, h, pix, pal, dac = self.render(); self.shots.append((pix, (list(pal), dict(dac))))
def rgb(p, c):
    pal, dac = p; a = pal[c]
    if a in dac: return tuple(x*255//63 for x in dac[a])
    return (((a>>2)&1)*170+((a>>5)&1)*85, ((a>>1)&1)*170+((a>>4)&1)*85, (a&1)*170+((a>>3)&1)*85)
def run(script, out, cols=3, maxins=3_000_000_000):
    m = Sun('../unpacked/SUN_ARAB-ART.EXE', files=files, maxins=50_000_000); m.run()
    m.load('../unpacked/SUN_SUN.EXE', 0x2000)
    m.script = [K[k] if k in K else int(k, 16) for k in script.split(',') if k]; m.buf = None; m.polls = 0; m.shots = []; m.maxins = maxins
    m.run(); m.shot()
    print('shots', len(m.shots), 'left', len(m.script), 'at %04x:%04x' % (m.r('cs') - 0x2000, m.r('ip')), 'retr', m.retr, 'err', getattr(m, 'err', None))
    sheet(out, m.shots, rgb, cols=cols, w=640, h=480)
    return m
if __name__ == '__main__':
    run(sys.argv[1], sys.argv[2])
