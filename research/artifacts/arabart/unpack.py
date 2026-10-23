# Emulate the DIET stub with Unicorn until it reaches the original entry; write unpacked MZ (or COM).
import sys, struct
from unicorn import Uc, UC_ARCH_X86, UC_MODE_16, UC_HOOK_CODE, UC_HOOK_INTR
from unicorn.x86_const import *

PSP = 0x1000
src, out = sys.argv[1], sys.argv[2]
d = open(src, 'rb').read()
mu = Uc(UC_ARCH_X86, UC_MODE_16)
mu.mem_map(0, 0x100000)
mu.mem_write(PSP*16, b'\xcd\x20' + struct.pack('<H', 0x9fff) + b'\0'*0xfc)
is_exe = d[:2] == b'MZ'
if is_exe:
    cblp, cp, crlc, hdr, minal, maxal, ss, sp, _, ip, cs, lfarlc = struct.unpack_from('<12H', d, 2)
    size = cp*512 - (512 - cblp if cblp else 0)
    load = PSP + 0x10
    mu.mem_write(load*16, d[hdr*16:size])
    for i in range(crlc):
        o, s = struct.unpack_from('<HH', d, lfarlc + 4*i)
        a = (load + s)*16 + o
        mu.mem_write(a, struct.pack('<H', (struct.unpack('<H', mu.mem_read(a, 2))[0] + load) & 0xffff))
    regs = dict(cs=load+cs, ip=ip, ss=load+ss, sp=sp)
else:
    load = PSP
    mu.mem_write(PSP*16+0x100, d)
    regs = dict(cs=PSP, ip=0x100, ss=PSP, sp=0xfffe)
for r, v in [(UC_X86_REG_DS, PSP), (UC_X86_REG_ES, PSP), (UC_X86_REG_CS, regs['cs']), (UC_X86_REG_SS, regs['ss']),
             (UC_X86_REG_SP, regs['sp']), (UC_X86_REG_IP, regs['ip'])]:
    mu.reg_write(r, v)
st = {}
R = lambda uc, r: uc.reg_read(r)
def code(uc, addr, size, _):
    b = bytes(uc.mem_read(addr, 2)); cs_ = R(uc, UC_X86_REG_CS); ip_ = R(uc, UC_X86_REG_IP)
    high = addr > load*16 + 0x1000 and addr > regs['cs']*16 + regs['ip'] + 0x40
    if is_exe and high and b[0] == 0x5d and 'end' not in st:          # pop bp: decompression finished
        st['end'] = ((R(uc, UC_X86_REG_ES) - load)*16 + R(uc, UC_X86_REG_DI), cs_)
        st['raw'] = bytes(uc.mem_read(load*16, st['end'][0]))
    if is_exe and high and b[0] == 0xbe and 'end' in st and 'tbl' not in st:   # mov si, table
        st['tbl'] = struct.unpack('<H', uc.mem_read(addr+1, 2))[0]
        st['cnt'] = struct.unpack('<H', uc.mem_read(addr+4, 2))[0]
    if is_exe and high and b[0] == 0xea:
        st['entry'] = struct.unpack('<HH', uc.mem_read(addr+1, 4))
        st['stack'] = (R(uc, UC_X86_REG_SS) - load, R(uc, UC_X86_REG_SP)); uc.emu_stop()
    if not is_exe and high and b == b'\x33\xed': st['end'] = R(uc, UC_X86_REG_DI)
    if not is_exe and cs_ == PSP and ip_ == 0x100 and 'end' in st: uc.emu_stop()
def intr(uc, no, _):
    print('unexpected INT', hex(no)); uc.emu_stop()
mu.hook_add(UC_HOOK_CODE, code); mu.hook_add(UC_HOOK_INTR, intr)
mu.emu_start(regs['cs']*16 + regs['ip'], 0xfffff, count=50_000_000)
if not is_exe:
    img = bytes(mu.mem_read(PSP*16+0x100, st['end'] - 0x100))
    open(out, 'wb').write(img); print(out, 'COM bytes', len(img)); sys.exit()
raw = st['raw']; dseg = st['end'][1]
# walk the relocation table exactly like the stub does
si = dseg*16 + st['tbl']; rel = []; seg = bx = 0
for _ in range(st['cnt']):
    w = struct.unpack('<H', mu.mem_read(si, 2))[0]; si += 2
    if w < 0x8000:
        seg = w; bx = struct.unpack('<H', mu.mem_read(si, 2))[0]; si += 2
    else:
        bx = (bx + ((((w << 1) & 0xffff) ^ 0x8000) - 0x8000 >> 1)) & 0xffff  # shl/sar: 15-bit signed delta
    rel.append((seg, bx))
tbl_lin = dseg*16 + st['tbl'] - load*16
img = raw[:tbl_lin] if 0 < tbl_lin <= len(raw) else raw   # drop the appended table from the image
orig = img[-0x3e:] if img[-0x3e:-0x3c] == b'MZ' else None   # DIET keeps the original 62-byte header at the end
if orig: img = img[:-0x3e]
ecs, eip = st['entry'][1] - load, st['entry'][0]
ess, esp = st['stack']
hdr_par = (0x1c + 4*len(rel) + 15)//16
total = hdr_par*16 + len(img)
mz = struct.pack('<2s13H', b'MZ', total % 512, (total + 511)//512, len(rel), hdr_par, (struct.unpack_from('<H', orig, 10)[0] if orig else max(0, (size - hdr*16 + 15)//16 + minal - (len(img) + 15)//16)), 0xffff,
                 ess, esp, 0, eip, ecs, 0x1c, 0)
mz += b''.join(struct.pack('<HH', o, s) for s, o in rel)
mz = mz.ljust(hdr_par*16, b'\0') + img
open(out, 'wb').write(mz)
print(out, 'image', hex(len(img)), 'relocs', len(rel), 'entry %04x:%04x stack %04x:%04x' % (ecs, eip, ess, esp))
