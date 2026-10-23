import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gfx import GDos, png
frames = []
class S(GDos):
    inpause = False
    def intr(self, uc, n, _):
        ah = self.r('ax') >> 8
        if n == 0x21 and ah == 0x0b:
            if not self.inpause: frames.append(dict(self.pix)); self.inpause = True
            return
        if n == 0x10 and ah == 0x00: self.pix = {}; self.inpause = False
        super().intr(uc, n, _)
S(sys.argv[1], frames=10**9).run()
cols = 3; W, H = 320, 175; rows = (len(frames)+cols-1)//cols; sheet = {}
for i, f in enumerate(frames):
    ox, oy = (i % cols)*(W+4), (i//cols)*(H+4)
    for (x, y), c in f.items():
        if c: sheet[(ox + x//2, oy + y//2)] = c
    for x in range(W): sheet[(ox+x, oy+H)] = 8
png(sys.argv[2], cols*(W+4), rows*(H+4), sheet); print(len(frames), 'frames')
