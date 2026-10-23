import os, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fsdos import FSDos
HERE = os.path.dirname(os.path.abspath(__file__))
class F(FSDos):
    def intr(self, uc, n, _):
        ah = self.r('ax') >> 8
        if n == 0x21 and ah in (0x4e, 0x4f):
            nm = self.cstr(self.r('ds'), self.r('dx')) if ah == 0x4e else ''
            print('find', hex(ah), nm, 'attr', hex(self.r('cx')), 'dta', self.dta)
            super().intr(uc, n, _)
            seg, off = self.dta; b = bytes(uc.mem_read(seg*16+off, 43)); print('   ->', 'CF', self.r('eflags') & 1, b[21], b[30:43].split(b'\0')[0])
            return
        super().intr(uc, n, _)
d = F(os.path.join(HERE, 'unpacked/KVC_KVC.EXE'), keys=b'    ', args=b' C:', root=os.path.join(HERE, 'kvc_disk')).run()
