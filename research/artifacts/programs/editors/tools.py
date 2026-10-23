import struct, sys, re
from capstone import *
def load(path):
    d = open(path,'rb').read()
    if d[:2] == b'MZ':
        hdr = struct.unpack('<H', d[8:10])[0]*16
        ss, sp, _, ip, cs = struct.unpack('<HHHHH', d[0x0e:0x18])
        n, = struct.unpack('<H', d[6:8]); lfa, = struct.unpack('<H', d[0x18:0x1a])
        rel = [struct.unpack('<HH', d[lfa+4*i:lfa+4*i+4]) for i in range(n)]
        return dict(img=d[hdr:], base=0, cs=cs, ip=ip, ss=ss, sp=sp, relocs=[s*16+o for o,s in rel], exe=True)
    return dict(img=b'\0'*0x100 + d, base=0, cs=0, ip=0x100, exe=False, relocs=[])
def dis(img, seg, off, count=40, until_ret=False):
    md = Cs(CS_ARCH_X86, CS_MODE_16)
    lin = seg*16 + off
    out = []
    for ins in md.disasm(img[lin:lin+count*8], off):
        out.append(f'{seg:04x}:{ins.address:04x}  {ins.bytes.hex():<14} {ins.mnemonic} {ins.op_str}')
        if len(out) >= count or (until_ret and ins.mnemonic in ('ret','retf','iret','jmp')): break
    return '\n'.join(out)
if __name__ == '__main__':
    m = load(sys.argv[1]); seg = int(sys.argv[2],16); off = int(sys.argv[3],16); n = int(sys.argv[4]) if len(sys.argv)>4 else 40
    print(dis(m['img'], seg, off, n))
