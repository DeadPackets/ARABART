import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gfx import GDos, png
class T(GDos):
    def intr(self, uc, n, _):
        if n == 0x21 and (self.r('ax') >> 8) == 0x0b:
            self.kb += 1
            if self.kb == int(sys.argv[3]): png(sys.argv[2], 640, 350, self.pix); print('snapshot at poll', self.kb, 'pixels', self.pixels_written)
            if self.kb > int(sys.argv[4]): self.done = True; uc.emu_stop()
            return
        super().intr(uc, n, _)
d = T(sys.argv[1], frames=10**9).run()
print('polls', d.kb, 'screen0:', d.screen(0).strip()[:200])
