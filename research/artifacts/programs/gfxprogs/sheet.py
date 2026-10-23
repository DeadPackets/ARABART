# Compose several rendered frames into one PNG contact sheet (stdlib only).
import struct, zlib
def sheet(path, frames, rgbfn, cols=4, w=320, h=200, gap=4):
    rows = (len(frames) + cols - 1) // cols
    W = cols*w + (cols-1)*gap; H = rows*h + (rows-1)*gap
    buf = [bytearray(b'\x40\x40\x40'*W) for _ in range(H)]
    for i, (pix, pal) in enumerate(frames):
        ox = (i % cols)*(w+gap); oy = (i // cols)*(h+gap)
        for y in range(h):
            row = buf[oy+y]
            for x in range(w):
                c = pix.get((x, y), 0); row[(ox+x)*3:(ox+x)*3+3] = bytes(rgbfn(pal, c))
    raw = b''.join(b'\0' + bytes(r) for r in buf)
    ch = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t+d) & 0xffffffff)
    open(path, 'wb').write(b'\x89PNG\r\n\x1a\n' + ch(b'IHDR', struct.pack('>IIBBBBB', W, H, 8, 2, 0, 0, 0)) + ch(b'IDAT', zlib.compress(raw, 9)) + ch(b'IEND', b''))
