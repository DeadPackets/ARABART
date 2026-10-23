import sys
from capstone import Cs, CS_ARCH_X86, CS_MODE_16
md = Cs(CS_ARCH_X86, CS_MODE_16)
data = open(sys.argv[1],'rb').read()
start = int(sys.argv[2],0); length = int(sys.argv[3],0)
base = int(sys.argv[4],0) if len(sys.argv)>4 else start
for i in md.disasm(data[start:start+length], base):
    print(f"{i.address:05x}: {i.bytes.hex():<16} {i.mnemonic} {i.op_str}")
