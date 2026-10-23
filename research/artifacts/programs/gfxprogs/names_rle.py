# Decode NAMES.COM RLE images: literal bytes, 37h n v = n copies of v, 37h 00 = end then a word (plane stride).
import sys
img = b'\0'*0x100 + open('../unpacked/NAMES_NAMES.COM','rb').read()
def dec(si):
    out = bytearray(); s = si
    while True:
        a = img[si]; si += 1
        if a != 0x37: out.append(a); continue
        n = img[si]; si += 1
        if n == 0: stride = img[si] | img[si+1] << 8; return out, stride, si + 2
        out += bytes([img[si]])*n; si += 1
starts = [0x9b8]; si = 0x9b8; seen = []
for _ in range(12):
    if si >= len(img): break
    out, stride, nsi = dec(si); seen.append((si, nsi - si, len(out), stride)); si = nsi
for s, c, u, st in seen: print(f'image @{s:04x}: packed {c:5d} -> {u:5d} bytes, plane stride {st} ({u/st if st else 0:.1f} planes) ratio {c/u:.2f}')
assert dec(0x998a)[1] > 0
