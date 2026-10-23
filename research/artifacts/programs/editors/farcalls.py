# Collect far-call targets (9A ofs seg) via relocation table: each reloc pointing at the seg word of a 9A instruction.
import sys, os, struct, collections; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tools import load
m = load(sys.argv[1]); img = m['img']; rel = set(m['relocs'])
segs = collections.Counter(); targets = collections.Counter()
for r in rel:
    if r >= 3 and img[r-3] == 0x9a:
        off, seg = struct.unpack_from('<HH', img, r-2)
        segs[seg] += 1; targets[(seg, off)] += 1
for s in sorted(segs): print(f'seg {s:04x} (lin {s*16:05x}) calls={segs[s]} entries={sorted(o for (ss,o) in targets if ss==s)[:12]}')
