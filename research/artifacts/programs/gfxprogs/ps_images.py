# Find code-embedded image pointers in PORTSAID (mov ax,imm / xor dx,dx / mov bx,10h / div bx) and size each RLE block.
import re, struct
d = open('../unpacked/PORTSAID_PORTSAID.EXE','rb').read(); img = d[0x50:]
ptrs = sorted(set(struct.unpack('<H', img[m.start()+1:m.start()+3])[0]
                  for m in re.finditer(rb'\xb8..\x33\xd2\xbb\x10\x00\xf7\xf3', img, re.S)))
def rle_end(si):
    w, h = struct.unpack('<HH', img[si:si+4]); si += 4; out = 0
    while True:
        a = img[si]; si += 1
        if a != 0x37: out += 1; continue
        n = img[si]; si += 1
        if n == 0: return si, w, h, out
        si += 1; out += n
tot = 0
for p in ptrs:
    e, w, h, out = rle_end(p); tot += e - p
    print(f'img @{p:04x}-{e:04x} packed {e-p:5d} w={w} bytes ({w*8}px) h={h} unpacked {out} (= {out/(w*h):.1f} planes)')
print('total embedded image bytes', tot, 'count', len(ptrs))
