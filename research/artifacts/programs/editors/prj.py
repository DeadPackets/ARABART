# Walk Borland TC/BC project/desktop file as (u16 id, u16 len, data) records.
import sys, struct
d = open(sys.argv[1], 'rb').read(); off = int(sys.argv[2], 0)
while off + 4 <= len(d):
    i, n = struct.unpack_from('<HH', d, off)
    v = d[off+4:off+4+n]
    s = v.rstrip(b'\0')
    txt = repr(s) if s and all(32 <= c < 127 or c in (0,) for c in s) and len(s) > 2 else v.hex() if n <= 16 else v[:48].hex() + '...'
    print(f'{off:04x} id={i:04x} ({i:4d}) len={n:3d} {txt}')
    if n > 0x4000: print('bad len'); break
    off += 4 + n
