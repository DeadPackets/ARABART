# Emulate the DIET stub until it far-jumps into the unpacked program, then dump memory.
import sys, struct
from unicorn import *
from unicorn.x86_const import *

def run(path, loadseg, trace=False):
    d = open(path,'rb').read()
    uc = Uc(UC_ARCH_X86, UC_MODE_16)
    uc.mem_map(0, 0x110000)
    psp = loadseg - 0x10
    is_exe = d[:2] == b'MZ'
    p = bytearray(256); p[0:2] = b'\xcd\x20'; p[2:4] = struct.pack('<H', 0xA000)
    uc.mem_write(psp*16, bytes(p))
    if is_exe:
        hdr = struct.unpack('<H', d[8:10])[0]*16
        cblp, cp = struct.unpack('<HH', d[2:6]); size = (cp-1)*512 + (cblp or 512)
        img = d[hdr:size]
        uc.mem_write(loadseg*16, img)
        nrel, = struct.unpack('<H', d[6:8]); lfa, = struct.unpack('<H', d[0x18:0x1a])
        for i in range(nrel):
            o, s = struct.unpack('<HH', d[lfa+4*i:lfa+4*i+4])
            a = (loadseg+s)*16+o
            w, = struct.unpack('<H', uc.mem_read(a,2)); uc.mem_write(a, struct.pack('<H',(w+loadseg)&0xffff))
        ss, sp, _, ip, cs = struct.unpack('<HHHHH', d[0x0e:0x18])
        regs = dict(cs=cs+loadseg, ip=ip, ss=ss+loadseg, sp=sp)
    else:
        uc.mem_write(psp*16+0x100, d)
        regs = dict(cs=psp, ip=0x100, ss=psp, sp=0xfffe)
        img = d
    uc.reg_write(UC_X86_REG_DS, psp); uc.reg_write(UC_X86_REG_ES, psp)
    uc.reg_write(UC_X86_REG_SS, regs['ss']); uc.reg_write(UC_X86_REG_SP, regs['sp'])
    uc.reg_write(UC_X86_REG_CS, regs['cs'])
    state = {'last_cs': regs['cs'], 'jumps': [], 'n':0}
    def hook_int(uc, intno, ud):
        ah = uc.reg_read(UC_X86_REG_AX) >> 8
        print(f'  INT {intno:02x} AH={ah:02x} at {uc.reg_read(UC_X86_REG_CS):04x}:{uc.reg_read(UC_X86_REG_IP):04x}')
        if intno == 0x21 and ah == 0x4c: uc.emu_stop()
        if intno == 0x21 and ah == 0x4a: uc.reg_write(UC_X86_REG_EFLAGS, uc.reg_read(UC_X86_REG_EFLAGS) & ~1)
    def hook_code(uc, addr, size, ud):
        cs = uc.reg_read(UC_X86_REG_CS); ip = uc.reg_read(UC_X86_REG_IP)
        state['n'] += 1
        if cs != state['last_cs']:
            state['jumps'].append((state['last_cs'], cs, ip, state['n']))
            state['last_cs'] = cs
    uc.hook_add(UC_HOOK_INTR, hook_int)
    uc.hook_add(UC_HOOK_CODE, hook_code)
    return uc, regs, state, img

if __name__ == '__main__':
    path = sys.argv[1]
    uc, regs, state, img = run(path, 0x1000)
    try:
        uc.emu_start(regs['cs']*16+regs['ip'], 0, count=int(sys.argv[2]) if len(sys.argv)>2 else 30_000_000)
    except UcError as e:
        print('err', e, hex(uc.reg_read(UC_X86_REG_CS)), hex(uc.reg_read(UC_X86_REG_IP)))
    print('instructions', state['n'])
    for j in state['jumps'][:20]: print('  far', ' '.join(hex(x) for x in j))
