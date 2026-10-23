import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gfx import GDos, png
class S(GDos):
    slide = 0; inpause = False
    def intr(self, uc, n, _):
        ah = self.r('ax') >> 8
        if n == 0x21 and ah == 0x0b:
            if not self.inpause:
                self.slide += 1; png(f'{sys.argv[2]}_{self.slide:02d}.png', 640, 350, self.pix); self.inpause = True
            return
        if n == 0x10 and ah == 0x00: self.pix = {}; self.inpause = False
        super().intr(uc, n, _)
d = S(sys.argv[1], frames=10**9).run()
print('slides', d.slide, d.screen(0).strip()[:120])
