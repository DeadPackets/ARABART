# Python re-implementation of ARABART 4.15's resident text path (translate -> shape -> RLE glyph draw).
import struct, zlib, os

IMG = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'arabart.img'), 'rb').read()
TRANS, NFONTS, FONTTAB = 0x682, 0x6e6, 0x6e8
CTRL = {0xC8: 'bold', 0xC9: 'italic', 0xCA: 'underline', 0xCB: 'size', 0xD0: 'reset'}

def w16(a): return struct.unpack_from('<H', IMG, a)[0]
def font_base(f): return w16(FONTTAB + 2*f)

def translate(s):
    out = []
    for ch in s.encode('latin-1'):
        si = (0 if ch >= 0x80 else ch) - 0x20
        v = IMG[TRANS + si]            # ponytail: <0x20/>=0x80 index outside table exactly like the original
        out.append(v or 3)
    return out

def shape(codes):
    c = codes[:]
    i = 0
    while i < len(c) and c[i] in CTRL: i += 1
    if i < len(c): c[i] &= 0xBF                     # first letter cannot join to the right
    for i in range(len(c)):
        if c[i] in CTRL: continue
        j = i + 1
        while j < len(c) and c[j] in CTRL: j += 1
        nxt = c[j] if j < len(c) else 0
        if not (c[i] & 0x80 and nxt & 0x40):          # both sides must agree to join
            c[i] &= 0x7F
            if j < len(c): c[j] &= 0xBF
    return c

def draw(canvas, W, H, codes, x, y, font, color, style=None, clip=True):
    st = dict(bold=0, italic=0, underline=0, size=0) if style is None else style
    base = font_base(font)
    for code in codes:
        if code in CTRL:
            if code == 0xD0: st.update(bold=0, italic=0, underline=0, size=0)
            else: st[CTRL[code]] ^= 1
            continue
        g = w16(base + 2*code)
        width = IMG[g] + st['bold']
        if st['size']: width *= 2
        if clip and (x - width >= 640 or x - width < 0): break
        k = 2 if st['size'] else 1
        if st['underline']:
            for px in range(x, x - width, -1): put(canvas, W, H, px, y, color, k)
        if code != 3:
            x0 = x; D = IMG[g+1]; p = g + 2
            row = y - D*k; xi = x - st['italic']*(D + 1)
            while True:
                b = IMG[p]; p += 1
                if b == 0xEF: row -= k; xi -= st['italic']; continue
                if b > 0xEF: break
                skip = b*k; ln = (IMG[p] + st['bold'])*k; p += 1
                for px in range(xi - skip, xi - skip - ln, -1): put(canvas, W, H, px, row, color, k)
        x -= width
    return x

def put(c, W, H, x, y, col, k):
    for yy in range(y - k + 1, y + 1):
        if 0 <= x < W and 0 <= yy < H: c[yy*W + x] = col

PAL = [(0,0,0),(0,0,170),(0,170,0),(0,170,170),(170,0,0),(170,0,170),(170,85,0),(170,170,170),
       (85,85,85),(85,85,255),(85,255,85),(85,255,255),(255,85,85),(255,85,255),(255,255,85),(255,255,255)]
def png(path, c, W, H, scale=1):
    rows = b''
    for y in range(H):
        r = b''.join(bytes(PAL[c[y*W + x]]) * scale for x in range(W))
        rows += (b'\0' + r) * scale
    def chunk(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d))
    open(path, 'wb').write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', W*scale, H*scale, 8, 2, 0, 0, 0))
                           + chunk(b'IDAT', zlib.compress(rows)) + chunk(b'IEND', b''))
