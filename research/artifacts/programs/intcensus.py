# Count INT n instructions found by linear sweep, with the AH value set just before when visible.
import sys, os, re, collections; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tools import load
from capstone import *
m = load(sys.argv[1]); img = m['img']; md = Cs(CS_ARCH_X86, CS_MODE_16)
start = int(sys.argv[2],16) if len(sys.argv)>2 else (0x100 if not m['exe'] else 0)
end = int(sys.argv[3],16) if len(sys.argv)>3 else len(img)
cnt = collections.Counter(); prev = []
off = start
while off < end:
    ok = False
    for ins in md.disasm(img[off:end], off):
        ok = True
        if ins.mnemonic == 'int':
            ah = None
            for p in reversed(prev[-6:]):
                mm = re.match(r'mov (ah|ax), (0x[0-9a-f]+|\d+)$', p)
                if mm:
                    v = int(mm.group(2), 0); ah = v if mm.group(1) == 'ah' else v >> 8; break
            cnt[(ins.op_str, None if ah is None else hex(ah))] += 1
        prev.append(f'{ins.mnemonic} {ins.op_str}'); off = ins.address + ins.size
    if off < end: off += 1
for (n, ah), c in sorted(cnt.items(), key=lambda x: (x[0][0], str(x[0][1]))): print(f'  int {n:5} ah={ah}: {c}')
