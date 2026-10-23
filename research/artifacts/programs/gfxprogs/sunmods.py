# Per-module stats for SUN: size, emulator INT 34h-3Dh count, far calls into RTL (seg 0) and BGI (seg de6).
import struct, re, collections, sys
sys.path.insert(0, '..')
from capstone import *
d = open('../unpacked/SUN_SUN.EXE','rb').read(); hdr = struct.unpack('<H', d[8:10])[0]*16; img = d[hdr:]
mods = [0x2de, 0x302, 0x30c, 0x4b6, 0x4da, 0x629, 0x6d2, 0x82c, 0xd89, 0xde6]
md = Cs(CS_ARCH_X86, CS_MODE_16)
rtl = collections.Counter(); bgi = collections.Counter(); per = {}
for i, s in enumerate(mods[:-1]):
    a, b = s*16, mods[i+1]*16; code = img[a:b]
    emu = 0; calls = collections.Counter(); off = 0; n = 0
    while off < len(code):
        got = False
        for ins in md.disasm(code[off:], off):
            got = True; n += 1
            if ins.mnemonic == 'int' and 0x34 <= int(ins.op_str, 16) <= 0x3e: emu += 1
            if ins.mnemonic == 'lcall':
                sg, of = [int(x, 16) for x in ins.op_str.split(', ')]
                if sg == 0: rtl[of] += 1; calls['rtl'] += 1
                elif sg == 0xde6: bgi[of] += 1; calls['bgi'] += 1
                else: calls['user'] += 1
            off = ins.address + ins.size
        if not got or off < len(code): off += 1
    per[s] = (b - a, emu, dict(calls))
for s, v in per.items(): print(f'module {s:04x}: {v[0]:6d} bytes, emu-INTs {v[1]:4d}, far calls {v[2]}')
print('RTL targets:', [(hex(k), v) for k, v in rtl.most_common()])
print('BGI targets:', [(hex(k), v) for k, v in bgi.most_common()])
