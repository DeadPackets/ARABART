# Map far-call targets (9A off seg) at relocation sites to get code segments and entry points.
import sys, struct, collections
d = open(sys.argv[1],'rb').read(); hdr = struct.unpack('<H', d[8:10])[0]*16; img = d[hdr:]
n, = struct.unpack('<H', d[6:8]); lfa, = struct.unpack('<H', d[0x18:0x1a])
rel = sorted(s*16+o for o, s in (struct.unpack('<HH', d[lfa+4*i:lfa+4*i+4]) for i in range(n)))
seg = collections.defaultdict(set); dseg = collections.Counter()
for r in rel:
    if r >= 3 and img[r-3] == 0x9a:
        off, sg = struct.unpack('<HH', img[r-2:r+2]); seg[sg].add(off)
    else:
        dseg[struct.unpack('<H', img[r:r+2])[0]] += 1
segs = sorted(seg)
for i, s in enumerate(segs):
    nxt = segs[i+1] if i+1 < len(segs) else None
    print(f'seg {s:04x} lin {s*16:06x} size~{((nxt or s)-s)*16:6d} entries {len(seg[s]):3d}: {",".join(hex(x) for x in sorted(seg[s])[:8])}')
print('non-call reloc targets (seg values):', dseg.most_common(12))
