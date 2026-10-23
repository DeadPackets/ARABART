# For each code segment, list DGROUP strings referenced via push imm / mov reg,imm after push ds.
import sys, os, re, struct, collections
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tools import load
from capstone import *
m = load(sys.argv[1]); img = m['img']; DG = int(sys.argv[2], 16)
segs = [int(s,16) for s in sys.argv[3].split(',')]
dg = img[DG*16:]
strs = {}
for mm in re.finditer(rb'[\x20-\x7e]{3,}\x00', dg[:0x4000]):
    strs[mm.start()] = mm.group()[:-1].decode()
md = Cs(CS_ARCH_X86, CS_MODE_16)
for i, s in enumerate(segs[:-1]):
    a, b = s*16, segs[i+1]*16; refs = []
    off = 0; code = img[a:b]
    prev = ''
    while off < len(code):
        got = False
        for ins in md.disasm(code[off:], off):
            got = True
            mt = re.match(r'(push|mov \w+,) (0x[0-9a-f]+)$', f'{ins.mnemonic} {ins.op_str}')
            if mt:
                v = int(mt.group(2), 16)
                if v in strs and ('push ds' in prev or ins.mnemonic == 'mov'): refs.append(strs[v][:40])
            prev = f'{ins.mnemonic} {ins.op_str}'; off = ins.address + ins.size
        if not got or off < len(code): off += 1
    print(f'== {s:04x} ({b-a} bytes): ' + ' | '.join(dict.fromkeys(refs))[:600])
