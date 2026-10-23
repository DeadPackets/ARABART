import sys, os, struct; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from machine import Machine, PROG
files = {'ARAB-ART.FNT': PROG + 'ARAB-ART.FNT', 'EGAVGA.BGI': PROG + 'EGAVGA.BGI'}
class Sun(Machine):
    def intr(self, uc, n, _):
        if n == 0x16 and self.r('cs') != 0xF000:
            ss, sp = self.r('ss'), self.r('sp'); bp, ip, cs = struct.unpack('<HHH', bytes(uc.mem_read(ss*16+sp, 6)))
            self.calls16.append(((self.r('ax') >> 8), '%04x:%04x' % (cs - 0x2000, ip)))
        return super().intr(uc, n, _)
m = Sun('../unpacked/SUN_ARAB-ART.EXE', files=files, maxins=50_000_000); m.run()
m.load('../unpacked/SUN_SUN.EXE', 0x2000); m.calls16 = []
m.keys = [0x1c0d, 0x1c0d]; m.maxins = 2_000_000_000
m.run()
import collections; print(collections.Counter(m.calls16).most_common(10))
