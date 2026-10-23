# Split code at prologues (ENTER / push bp;mov bp,sp) and hash opcode-mnemonic sequences.
import sys, os, re, hashlib, json, struct; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tools import load
from capstone import *
md = Cs(CS_ARCH_X86, CS_MODE_16)
def funcs(path, lo, hi):
    img = load(path)['img']
    starts = sorted(set(m.start() for m in re.finditer(rb'\xc8..\x00|\x55\x8b\xec', img[lo:hi])))
    starts = [s+lo for s in starts]
    out = {}
    for i, s in enumerate(starts):
        e = starts[i+1] if i+1 < len(starts) else hi
        mn = [ins.mnemonic for ins in md.disasm(img[s:e], 0)]
        if len(mn) < 12: continue
        out[s] = (hashlib.md5(' '.join(mn).encode()).hexdigest()[:12], len(mn))
    return out
if __name__ == '__main__':
    a = funcs(sys.argv[1], int(sys.argv[2],16), int(sys.argv[3],16))
    b = funcs(sys.argv[4], int(sys.argv[5],16), int(sys.argv[6],16))
    hb = {}
    for s, (h, n) in b.items(): hb.setdefault(h, []).append(s)
    match = [(s, n, hb[h]) for s, (h, n) in a.items() if h in hb]
    print(f'A funcs {len(a)}, B funcs {len(b)}, exact opcode-sequence matches {len(match)}, instrs matched {sum(n for _,n,_ in match)} of {sum(n for _,n in a.values())}')
    for s, n, bs in match[:200]: print(f'  A {s:05x} ({n} ins) == B {[hex(x) for x in bs[:3]]}')
