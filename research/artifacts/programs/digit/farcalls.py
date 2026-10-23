# Collect far-call targets (9A ofs seg) using relocation table: every reloc whose word is preceded by 9A xx xx is a far call.
import sys, os, struct, collections
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tools import load
m = load(sys.argv[1]); img = m['img']
targets = collections.Counter(); callers = collections.defaultdict(set); segs = collections.Counter()
for r in m['relocs']:
    seg, = struct.unpack_from('<H', img, r); segs[seg] += 1
    if r >= 3 and img[r-3] == 0x9a:
        off, = struct.unpack_from('<H', img, r-2); targets[(seg, off)] += 1; callers[(seg,off)].add(r-3)
print('segments referenced by relocations (seg: count):')
for s in sorted(segs): print(f'  {s:04x}: {segs[s]}')
print('far call targets:', len(targets))
import json
json.dump({f'{s:04x}:{o:04x}': c for (s,o), c in sorted(targets.items())}, open(sys.argv[2], 'w'), indent=0)
