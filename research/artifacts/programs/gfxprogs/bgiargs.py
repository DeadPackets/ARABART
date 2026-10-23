# For each BGI entry (seg de6), collect pushed args at call sites in user modules (simple backward scan).
import struct, collections
from capstone import *
d = open('../unpacked/SUN_SUN.EXE','rb').read(); hdr = struct.unpack('<H', d[8:10])[0]*16; img = d[hdr:]
md = Cs(CS_ARCH_X86, CS_MODE_16)
code = img[0x2de0:0xd890]; ins = list(md.disasm(code, 0x2de0))
ex = collections.defaultdict(list); nargs = {}
for i, x in enumerate(ins):
    if x.mnemonic == 'lcall' and x.op_str.startswith('0xde6'):
        of = int(x.op_str.split(', ')[1], 16); args = []
        j = i - 1
        while j >= 0 and len(args) < 8 and ins[j].mnemonic in ('push', 'mov', 'lea', 'add', 'imul', 'sub', 'cwd'):
            if ins[j].mnemonic == 'push': args.append(ins[j].op_str)
            j -= 1
        nx = ins[i+1] if i + 1 < len(ins) else None
        n = 0
        if nx and nx.mnemonic == 'add' and nx.op_str.startswith('sp'): n = int(nx.op_str.split(', ')[1], 16)//2
        elif nx and nx.op_str == 'cx':
            k = i + 1
            while ins[k].mnemonic == 'pop' and ins[k].op_str == 'cx': n += 1; k += 1
        nargs[of] = n; ex[of].append(args[:n])
for of in sorted(ex, key=lambda k: -len(ex[k])):
    print(f'{of:04x} calls {len(ex[of]):3d} nargs {nargs[of]}  e.g. {ex[of][0]} | {ex[of][len(ex[of])//2]}')
