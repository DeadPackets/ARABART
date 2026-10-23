# linear disassembly of a range: lin.py file seg start end
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tools import load
from capstone import *
m=load(sys.argv[1]); seg=int(sys.argv[2],16); a=int(sys.argv[3],16); b=int(sys.argv[4],16)
md=Cs(CS_ARCH_X86,CS_MODE_16)
img=m['img']; off=a
while off<b:
    chunk=img[seg*16+off:seg*16+b]
    got=False
    for ins in md.disasm(chunk, off):
        print(f'{ins.address:04x} {ins.bytes.hex():<12} {ins.mnemonic} {ins.op_str}')
        off=ins.address+ins.size; got=True
    if off<b:
        print(f'{off:04x} db {img[seg*16+off]:02x}'); off+=1
