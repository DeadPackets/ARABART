# Function [start,end) for a seg:off, using compiler prologues (enter / push bp; mov bp,sp) in dis/<seg>.txt.
import sys, re
def starts(seg):
    L = open(f'dis/{seg}.txt').read().splitlines(); out = []
    for i, l in enumerate(L):
        if re.search(r' (c8[0-9a-f]{6}) ', l) or (re.search(r' 55 +push bp$', l) and i+1 < len(L) and '8bec' in L[i+1]):
            out.append(int(l[5:9], 16))
    return out
for a in sys.argv[1:]:
    seg, off = a.split(':'); off = int(off, 16); S = starts(seg)
    st = max([s for s in S if s <= off], default=None); nx = min([s for s in S if s > off], default=None)
    print(f'{a}: function {seg}:{st:04x}..{seg}:{nx:04x}' if nx else f'{a}: {st}')
