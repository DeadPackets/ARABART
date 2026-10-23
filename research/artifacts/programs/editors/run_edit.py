import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edos import EDos
def k(s): return [ord(c) for c in s]
ENTER, F10, DOWN, RIGHT, ESC = 0x1c0d, 0x4400, 0x5000, 0x4d00, 0x011b
root = os.path.abspath('run')
for name, keys in [('edit_typed', k('Hello from EDIT-TEST') + [ENTER] + k('second line')), ('edit_menu', k('abc') + [F10]), ('edit_menu2', k('abc') + [F10, ENTER])]:
    d = EDos('../unpacked/EDIT_EDIT.EXE', keys, root=root, maxins=800_000_000).run()
    d.shot(name + '.png'); print(name, getattr(d, 'err', ''), [x for x in d.log if not isinstance(x[0], int)][:6], d.calls[-6:])
