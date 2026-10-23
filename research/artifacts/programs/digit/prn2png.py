# Render an Epson ESC/P 8-pin bit-image stream (ESC K/L/Y/Z, ESC 3 n) to a PNG at 216 dpi.
import sys, struct, zlib
def render(data):
    dens = {ord('K'): 60, ord('L'): 120, ord('Y'): 120, ord('Z'): 240}
    x = 0.0; y = 0; ls = 36; dots = set(); i = 0; log = []
    while i < len(data):
        c = data[i]
        if c == 0x1b:
            cmd = data[i+1]
            if cmd == ord('3'): ls = data[i+2]; i += 3; continue
            if cmd in dens:
                n = data[i+2] | data[i+3] << 8; cols = data[i+4:i+4+n]; step = 216 / dens[cmd]
                for k, b in enumerate(cols):
                    for pin in range(8):
                        if b & (0x80 >> pin): dots.add((int(x + k*step), y + 3*pin))
                x += n*step; log.append(f'ESC {chr(cmd)} {n} cols @y={y}'); i += 4 + n; continue
            if cmd == ord('*'):
                m = data[i+2]; n = data[i+3] | data[i+4] << 8; i += 5 + n; log.append(f'ESC * {m} {n} (skipped)'); continue
            log.append(f'unknown ESC {cmd:#x}'); i += 2; continue
        if c == 13: x = 0
        elif c == 10: y += ls
        elif c == 0x1a: break
        elif c >= 32: x += 216/10
        i += 1
    return dots, log
def png(path, dots):
    w = max(x for x, _ in dots) + 4; h = max(y for _, y in dots) + 4
    rows = [bytearray(b'\xff'*w) for _ in range(h)]
    for x, y in dots:
        for dy in range(3):
            for dx in range(2):
                if y+dy < h and x+dx < w: rows[y+dy][x+dx] = 0
    raw = b''.join(b'\0' + bytes(r) for r in rows)
    ch = lambda t, d: struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t+d) & 0xffffffff)
    open(path, 'wb').write(b'\x89PNG\r\n\x1a\n' + ch(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 0, 0, 0, 0)) + ch(b'IDAT', zlib.compress(raw, 9)) + ch(b'IEND', b''))
    return w, h
if __name__ == '__main__':
    dots, log = render(open(sys.argv[1], 'rb').read())
    print(sys.argv[1], 'commands:', len(log), '| first:', log[:4], '| unknown:', [l for l in log if 'unknown' in l][:5])
    print('size', png(sys.argv[2], dots))
