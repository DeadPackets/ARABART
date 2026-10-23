# Record every INT 10h AH value issued by each editor across typing, menus, dialogs, load/save.
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edos import EDos
def k(s): return [ord(c) for c in s]
ENTER, F2, F3, F10, ESC, DOWN = 0x1c0d, 0x3c00, 0x3d00, 0x4400, 0x011b, 0x5000
class R(EDos):
    def intr(self, uc, n, _):
        if n == 0x10: self.ah10.add(self.r('ax') >> 8)
        if n == 0x33: self.ah10.add('INT33')
        super().intr(uc, n, _)
for exe, keys in [('EDIT_EDITOR.EXE', k('abc') + [ENTER, F10, DOWN, ESC, F2] + k('Z.TXT') + [ENTER, F3] + k('Z.TXT') + [ENTER]),
                  ('EDIT_EDIT.EXE', [ESC] + k('abc') + [ENTER, F10, DOWN, ESC, F10, ENTER] + k('Z2.TXT') + [ENTER])]:
    d = R('../unpacked/' + exe, keys, root=os.path.abspath('run'), maxins=800_000_000); d.ah10 = set(); d.run()
    print(exe, 'INT10 AH values:', sorted(map(str, d.ah10)), 'file calls:', [c for c in d.calls if isinstance(c, tuple)])
