# DIET 1.00 unpacker by emulation: run stub to OEP, dump image, recover relocs by diffing two load segments.
import sys, struct, os
from unicorn import *
from unicorn.x86_const import *

def emulate(d, loadseg):
    uc = Uc(UC_ARCH_X86, UC_MODE_16)
    uc.mem_map(0, 0x110000)
    psp = loadseg - 0x10
    p = bytearray(256); p[0:2] = b'\xcd\x20'; p[2:4] = struct.pack('<H', 0xA000)
    uc.mem_write(psp*16, bytes(p))
    exe = d[:2] == b'MZ'
    if exe:
        hdr = struct.unpack('<H', d[8:10])[0]*16
        cblp, cp = struct.unpack('<HH', d[2:6]); size = (cp-1)*512 + (cblp or 512)
        uc.mem_write(loadseg*16, d[hdr:size])
        nrel, = struct.unpack('<H', d[6:8]); lfa, = struct.unpack('<H', d[0x18:0x1a])
        for i in range(nrel):
            o, s = struct.unpack('<HH', d[lfa+4*i:lfa+4*i+4]); a = (loadseg+s)*16+o
            w, = struct.unpack('<H', uc.mem_read(a,2)); uc.mem_write(a, struct.pack('<H',(w+loadseg)&0xffff))
        ss, sp, _, ip, cs = struct.unpack('<HHHHH', d[0x0e:0x18])
        cs += loadseg; ss += loadseg
    else:
        uc.mem_write(psp*16+0x100, d); cs, ip, ss, sp = psp, 0x100, psp, 0xfffe
    for r, v in ((UC_X86_REG_DS, psp), (UC_X86_REG_ES, psp), (UC_X86_REG_SS, ss), (UC_X86_REG_SP, sp), (UC_X86_REG_CS, cs)):
        uc.reg_write(r, v)
    st = {'far': 0, 'n': 0, 'oep': None, 'maxw': 0, 'start_cs': cs, 'rec': False, 'hi': 0xA0000}
    def code(uc, addr, size, _):
        st['n'] += 1
        c = uc.reg_read(UC_X86_REG_CS); i = uc.reg_read(UC_X86_REG_IP)
        if not exe and i == 0x115: st['rec'] = True; st['hi'] = (c*16 + 0xff00)
        if exe:
            if c != st['start_cs']:
                st['far'] += 1; st['start_cs'] = c
                if st['far'] == 1: st['rec'] = True; st['hi'] = c*16
                if st['far'] == 2: st['oep'] = (c, i); uc.emu_stop()
        elif i == 0x100 and st['n'] > 1:
            st['oep'] = (c, i); uc.emu_stop()
    def w(uc, access, addr, size, value, _):
        ssb = uc.reg_read(UC_X86_REG_SS)*16 + uc.reg_read(UC_X86_REG_SP)
        if st['rec'] and addr < st['hi'] and not (ssb - 128 <= addr < ssb + 16):
            st['maxw'] = max(st['maxw'], addr+size)
    uc.hook_add(UC_HOOK_CODE, code)
    uc.hook_add(UC_HOOK_MEM_WRITE, w)
    uc.hook_add(UC_HOOK_INTR, lambda uc, n, _: (print('unexpected INT', hex(n)), uc.emu_stop()))
    uc.emu_start(cs*16+ip, 0, count=50_000_000)
    assert st['oep'], 'OEP not reached'
    regs = {k: uc.reg_read(r) for k, r in (('ss', UC_X86_REG_SS), ('sp', UC_X86_REG_SP), ('ds', UC_X86_REG_DS), ('es', UC_X86_REG_ES))}
    return uc, st, regs, psp

def unpack(path, out):
    d = open(path,'rb').read()
    exe = d[:2] == b'MZ'
    A, B = 0x1000, 0x2000
    ua, sa, ra, pa = emulate(d, A); ub, sb, rb, pb = emulate(d, B)
    if not exe:
        end = min(sa['maxw'] - pa*16, 0xff00)
        img = bytes(ua.mem_read(pa*16+0x100, end-0x100))
        open(out,'wb').write(img)
        print(f'{os.path.basename(path)}: COM {len(d)} -> {len(img)} bytes, OEP {sa["oep"][0]-pa:+x}:{sa["oep"][1]:04x}')
        return
    stub2 = sa['oep']  # program image is below the decompressor copy
    n = sa['maxw'] - A*16
    # the decompressor writes its own stack/variables near top; cap at the relocated stub segment
    ia = bytes(ua.mem_read(A*16, n)); ib = bytes(ub.mem_read(B*16, n))
    relocs = []; img = bytearray(ia); i = 0
    while i < n-1:
        wa, = struct.unpack_from('<H', ia, i); wb, = struct.unpack_from('<H', ib, i)
        if wa != wb:
            assert (wb - wa) & 0xffff == B - A, f'diff at {i:x} {wa:x} {wb:x}'
            struct.pack_into('<H', img, i, (wa - A) & 0xffff); relocs.append(i); i += 2
        else: i += 1
    cs, ip = sa['oep'][0]-A, sa['oep'][1]; ss, sp = ra['ss']-A, ra['sp']
    assert ra['ds'] == pa and ra['es'] == pa, 'DS/ES not PSP at OEP'
    hdrp = (0x20 + 4*len(relocs) + 15)//16
    total = hdrp*16 + len(img)
    pk = struct.unpack('<HH', d[0x0a:0x0e]); packed_paras = (struct.unpack('<H',d[4:6])[0]*512)//16 + pk[0]
    minalloc = max(0, (ss*16+sp+15)//16 - len(img)//16 + 1)
    h = struct.pack('<2s13H', b'MZ', total % 512, (total+511)//512, len(relocs), hdrp, minalloc, 0xffff, ss, sp, 0, ip, cs, 0x20, 0)
    h += b'\0'*4
    for r in relocs: h += struct.pack('<HH', r & 0xf, r >> 4)
    h = h.ljust(hdrp*16, b'\0')
    open(out,'wb').write(h + img)
    print(f'{os.path.basename(path)}: EXE {len(d)} -> image {len(img)} bytes, {len(relocs)} relocs, CS:IP {cs:04x}:{ip:04x} SS:SP {ss:04x}:{sp:04x}, decompressor seg {stub2[0]-A:04x}')

if __name__ == '__main__':
    unpack(sys.argv[1], sys.argv[2])
