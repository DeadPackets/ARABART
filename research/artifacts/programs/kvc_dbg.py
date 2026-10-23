import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fsdos import FSDos
HERE = os.path.dirname(os.path.abspath(__file__))
d = FSDos(os.path.join(HERE, 'unpacked/KVC_KVC.EXE'), keys=b'    ', args=b' C:', root=os.path.join(HERE,'kvc_disk'), verbose=True).run()
print(repr(bytes(d.out)[:400])); print(d.log[-10:])
