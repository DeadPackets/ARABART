# Pixel capture for INT 10h AH=0Ch programs, PNG output with stdlib only.
import sys, os, struct, zlib; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dosemu import Dos
EGA = [(0,0,0),(0,0,170),(0,170,0),(0,170,170),(170,0,0),(170,0,170),(170,85,0),(170,170,170),
       (85,85,85),(85,85,255),(85,255,85),(85,255,255),(255,85,85),(255,85,255),(255,255,85),(255,255,255)]
def png(path, w, h, pix, pal=EGA):
    raw = b''.join(b'\0' + b''.join(bytes(pal[pix.get((x, y), 0) & 15]) for x in range(w)) for y in range(h))
    def chunk(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    open(path, 'wb').write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) +
                           chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b''))
class GDos(Dos):
    def __init__(self, *a, frames=1, **k):
        super().__init__(*a, **k); self.pix = {}; self.frames = frames; self.kb = 0; self.pixels_written = 0
    def intr(self, uc, n, _):
        ah = self.r('ax') >> 8; al = self.r('ax') & 0xff
        if n == 0x10 and ah == 0x0c:
            x, y = self.r('cx'), self.r('dx'); c = al
            self.pix[(x, y)] = (self.pix.get((x, y), 0) ^ (c & 15)) if c & 0x80 else c; self.pixels_written += 1; return
        if n == 0x10 and ah == 0x0d: self.w('ax', (self.r('ax') & 0xff00) | self.pix.get((self.r('cx'), self.r('dx')), 0)); return
        if n == 0x21 and ah == 0x0b:
            self.kb += 1
            if self.kb >= self.frames: self.w('ax', 0x0bff)
            else: self.w('ax', 0x0b00)
            return
        super().intr(uc, n, _)
if __name__ == '__main__':
    path, out, frames = sys.argv[1], sys.argv[2], int(sys.argv[3])
    d = GDos(path, frames=frames).run()
    print('pixels written', d.pixels_written, 'distinct', len(d.pix), 'kb polls', d.kb, 'mode', d.mode)
    print(d.screen(0).strip())
    w = 640; h = 350 if d.mode != 0x12 else 480
    png(out, w, h, d.pix)
