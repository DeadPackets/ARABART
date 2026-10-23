# Disassemble Borland emulator-encoded code: INT 34h-3Bh -> FWAIT+ESC D8-DF, INT 3Dh -> FWAIT;NOP, INT 3Ch xx -> FWAIT + seg-override ESC.
import sys, struct
from capstone import *
path, seg, a, b = sys.argv[1], int(sys.argv[2], 16), int(sys.argv[3], 16), int(sys.argv[4], 16)
d = open(path, 'rb').read(); h = struct.unpack('<H', d[8:10])[0]*16; img = bytearray(d[h:])
base = seg*16; code = img[base+a:base+b]; i = 0
while i < len(code) - 1:
    if code[i] == 0xcd and 0x34 <= code[i+1] <= 0x3b: code[i] = 0x9b; code[i+1] = 0xd8 + code[i+1] - 0x34; i += 2
    elif code[i] == 0xcd and code[i+1] == 0x3d: code[i] = 0x9b; code[i+1] = 0x90; i += 2
    elif code[i] == 0xcd and code[i+1] == 0x3c:  # next byte: seg override in bits, then ESC opcode follows as normal
        code[i] = 0x9b; code[i+1] = {0: 0x26, 1: 0x2e, 2: 0x36, 3: 0x3e}.get((code[i+2] >> 6) & 3, 0x26); code[i+2] = 0xd8 | (code[i+2] & 7); i += 3
    else: i += 1
md = Cs(CS_ARCH_X86, CS_MODE_16); off = a
while off < b:
    got = False
    for x in md.disasm(bytes(code[off-a:]), off):
        print(f'{x.address:04x} {x.mnemonic} {x.op_str}'); off = x.address + x.size; got = True
    if off < b: print(f'{off:04x} db'); off += 1
