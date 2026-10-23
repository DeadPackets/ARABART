# Drive SUN.EXE with a key script; snapshot the screen each time a key is consumed.
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from machine import Machine, PROG
from sheet import sheet
files = {'ARAB-ART.FNT': PROG + 'ARAB-ART.FNT', 'EGAVGA.BGI': PROG + 'EGAVGA.BGI'}
class Sun(Machine):
    def key(self):
        w, h, pix, pal, dac = self.render(); self.shots.append((pix, pal, dac, len(self.keys)))
        return super().key()
m = Sun('../unpacked/SUN_ARAB-ART.EXE', files=files, maxins=50_000_000); m.run()
m.load('../unpacked/SUN_SUN.EXE', 0x2000)
K = {'ENT': 0x1c0d, 'SP': 0x3920, 'DN': 0x5000, 'UP': 0x4800, 'ESC': 0x011b, 'ALTX': 0x2d00}
script = sys.argv[1].split(',')
m.keys = [K[k] if k in K else int(k, 16) for k in script]; m.shots = []; m.maxins = int(sys.argv[3]) if len(sys.argv) > 3 else 2_000_000_000
m.run()
print('keys left', len(m.keys), 'shots', len(m.shots), 'cs:ip %04x:%04x' % (m.r('cs'), m.r('ip')), 'retr', m.retr)
def rgb(pal, c, dac):
    a = pal[c]
    if a in dac: return tuple(x*255//63 for x in dac[a])
    return (((a>>2)&1)*170+((a>>5)&1)*85, ((a>>1)&1)*170+((a>>4)&1)*85, (a&1)*170+((a>>3)&1)*85)
frames = [(s[0], (s[1], s[2])) for s in m.shots]
sheet(sys.argv[2], frames, lambda p, c: rgb(p[0], c, p[1]), cols=3, w=640, h=480)
