import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edos import EDos
def k(s): return [ord(c) for c in s]
ENTER, F10, DOWN, RIGHT, ESC = 0x1c0d, 0x4400, 0x5000, 0x4d00, 0x011b
class T(EDos):
    def intr(self, uc, n, _):
        if n == 0x16: self.trace.append((hex(self.r('ax') >> 8), f"{self.r('cs'):04x}:{self.r('ip'):04x}", len(self.keys)))
        if n == 0x10 and (self.r('ax') >> 8) in (0x10, 0x0b): self.trace.append(('int10', hex(self.r('ax')), hex(self.r('bx')), hex(self.r('cx')), hex(self.r('dx'))))
        super().intr(uc, n, _)
d = T('../unpacked/EDIT_EDIT.EXE', [ESC] + k('Hi') + [ENTER] + k('yo'), root=os.path.abspath('run'), maxins=800_000_000)
d.trace = []
d.run(); d.shot('edit_esc.png')
print(d.trace[:40]); print('palreg', d.palreg)
