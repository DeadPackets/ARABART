import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dosemu import Dos
formula, x0, x1 = sys.argv[1], sys.argv[2], sys.argv[3]
keys = formula.encode() + b'\r' + x0.encode() + b'\r' + x1.encode() + b'\r'
d = Dos(sys.argv[4] if len(sys.argv) > 4 else 'unpacked/FORM_X_FORM_X.EXE', keys).run()
print(d.snaps[-1] if d.snaps else d.screen())
print('INT log tail:', d.log[-6:])
