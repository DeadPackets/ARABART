# Linear-disassemble all code segments into one listing file per segment.
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from tools import load
from capstone import *
m = load(sys.argv[1]); img = m['img']; segs = [int(s,16) for s in sys.argv[2].split(',')]
md = Cs(CS_ARCH_X86, CS_MODE_16); os.makedirs('dis', exist_ok=True)
for i, s in enumerate(segs[:-1]):
    a, b = s*16, segs[i+1]*16; code = img[a:b]; off = 0
    with open(f'dis/{s:04x}.txt', 'w') as f:
        while off < len(code):
            got = False
            for ins in md.disasm(code[off:], off):
                got = True; f.write(f'{s:04x}:{ins.address:04x} {ins.bytes.hex():<14} {ins.mnemonic} {ins.op_str}\n'); off = ins.address + ins.size
            if off < len(code): f.write(f'{s:04x}:{off:04x} {code[off]:02x}             db\n'); off += 1
