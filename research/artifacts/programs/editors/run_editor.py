# E2E: type two lines in EDITOR.EXE, save via F2 dialog, screenshot.
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edos import EDos
def k(s): return [0x0000 | ord(c) for c in s]
ENTER, F2, F3 = 0x1c0d, 0x3c00, 0x3d00
keys = k('Hello, World!') + [ENTER] + k('This is a text editor!') + [F2] + k('T1.TXT') + [ENTER]
d = EDos('../unpacked/EDIT_EDITOR.EXE', keys, root=os.path.abspath('run'), maxins=400_000_000).run()
d.shot('editor_e2e.png')
print('log tail', [x for x in d.log if isinstance(x, tuple) and str(x[0]).startswith('unh')][:10], d.calls[-8:])
