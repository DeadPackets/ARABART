# E2E: run the REAL unpacked ARABART.EXE under Unicorn: install as TSR, then call its INT 10h/AH=36h API
# exactly like DEMO.EXE does, with a minimal VGA planar model (write mode 0 + set/reset + bit mask).
import sys, os, struct; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from unicorn import Uc, UC_ARCH_X86, UC_MODE_16, UC_HOOK_INTR, UC_HOOK_INSN, UC_HOOK_MEM_WRITE
from unicorn.x86_const import *
from arabart_model import png

exe = open(sys.argv[1], 'rb').read()
hdr = struct.unpack_from('<14H', exe, 0)
PSP, LOAD = 0x1000, 0x1010
mu = Uc(UC_ARCH_X86, UC_MODE_16); mu.mem_map(0, 0x100000)
mu.mem_write(LOAD*16, exe[hdr[4]*16:])
for i in range(hdr[3]):
    o, s = struct.unpack_from('<HH', exe, hdr[12] + 4*i); a = (LOAD+s)*16 + o
    mu.mem_write(a, struct.pack('<H', struct.unpack('<H', mu.mem_read(a, 2))[0] + LOAD))
mu.mem_write(0xF1230, b'\xcf' * 16)          # fake original INT 10h handler (iret)
ivt = {0x10: (0xF123, 0)}
gc = {'idx': 0, 1: 0, 0: 0, 8: 0xFF}; retrace = [0]; log = []
W, H = 640, 480; fb = [0]*(W*H)
R = lambda r: mu.reg_read(r)
def intr(uc, no, _):
    ah, al = R(UC_X86_REG_AH), R(UC_X86_REG_AL)
    if no == 0x21 and ah == 0x35: s, o = ivt[al]; uc.reg_write(UC_X86_REG_ES, s); uc.reg_write(UC_X86_REG_BX, o)
    elif no == 0x21 and ah == 0x25: ivt[al] = (R(UC_X86_REG_DS), R(UC_X86_REG_DX)); log.append(f'INT 21h/25h hook INT {al:02X}h -> {ivt[al][0]:04X}:{ivt[al][1]:04X}')
    elif no == 0x21 and ah == 0x09:
        m = bytes(uc.mem_read(R(UC_X86_REG_DS)*16 + R(UC_X86_REG_DX), 300)); log.append('PRINT ' + m[:m.index(b'$')].decode('latin-1').strip())
    elif no == 0x21 and ah == 0x4C: log.append('EXIT 4Ch'); uc.emu_stop()
    elif no == 0x27: log.append(f'INT 27h keep DX={R(UC_X86_REG_DX):04X}h bytes from PSP'); uc.emu_stop()
    elif no == 0x10 and ah == 0x0F: uc.reg_write(UC_X86_REG_AX, 0x5012)        # 80 cols, mode 12h
    elif no == 0x10 and ah == 0x00: pass
    else: log.append(f'unhandled INT {no:02X}h AH={ah:02X}h'); uc.emu_stop()
def port_in(uc, port, size, _):
    if port == 0x3DA: retrace[0] ^= 8; return retrace[0]
    return 0
def port_out(uc, port, size, value, _):
    if port == 0x3CE:
        gc['idx'] = value & 0xFF
        if size == 2: gc[value & 0xFF] = value >> 8
    elif port == 0x3CF: gc[gc['idx']] = value & 0xFF
def vram(uc, access, addr, size, value, _):
    off = addr - 0xA0000
    if gc.get(1, 0) != 0x0F: return                 # ARABART always writes with set/reset enabled
    for b in range(8):
        if gc.get(8, 0xFF) & (0x80 >> b):
            p = off*8 + b
            if p < W*H: fb[p] = gc.get(0, 0) & 15
mu.hook_add(UC_HOOK_INTR, intr)
mu.hook_add(UC_HOOK_INSN, port_in, None, 1, 0, UC_X86_INS_IN)
mu.hook_add(UC_HOOK_INSN, port_out, None, 1, 0, UC_X86_INS_OUT)
mu.hook_add(UC_HOOK_MEM_WRITE, vram, None, 0xA0000, 0xAFFFF)

def start(cs, ip, ss=0x9000, sp=0xFFF0):
    for r, v in [(UC_X86_REG_CS, cs), (UC_X86_REG_IP, ip), (UC_X86_REG_DS, PSP), (UC_X86_REG_ES, PSP),
                 (UC_X86_REG_SS, ss), (UC_X86_REG_SP, sp)]: mu.reg_write(r, v)
    mu.emu_start(cs*16 + ip, 0xFFFFF, count=5_000_000)

# 1) install
start(LOAD + hdr[11], hdr[10]); print('\n'.join(log)); log.clear()
# 2) second load must refuse
start(LOAD + hdr[11], hdr[10]); print('2nd run:', ' | '.join(log)); log.clear()

STR_SEG = 0x2000
def api(ax, bx=0, cx=0, dx=0, s=None):
    if s is not None: mu.mem_write(STR_SEG*16, s.encode('latin-1') + b'\0' * 100)
    seg, off = ivt[0x10]
    sp = 0xFFF0 - 6; mu.mem_write(0x90000 + sp, struct.pack('<HHH', 0xFFF0, 0x3000, 0x0202))   # IP, CS, FLAGS
    mu.mem_write(0x3000*16 + 0xFFF0, b'\xf4')
    for r, v in [(UC_X86_REG_AX, ax), (UC_X86_REG_BX, bx), (UC_X86_REG_CX, cx), (UC_X86_REG_DX, dx),
                 (UC_X86_REG_DS, STR_SEG), (UC_X86_REG_ES, STR_SEG), (UC_X86_REG_SS, 0x9000), (UC_X86_REG_SP, sp),
                 (UC_X86_REG_CS, seg), (UC_X86_REG_IP, off)]: mu.reg_write(r, v)
    mu.emu_start(seg*16 + off, 0x3000*16 + 0xFFF0, count=20_000_000)
    fl = struct.unpack('<H', mu.mem_read(0x90000 + sp + 4, 2))[0]
    return dict(ax=R(UC_X86_REG_AX), bx=R(UC_X86_REG_BX), cx=R(UC_X86_REG_CX), dx=R(UC_X86_REG_DX), cf=fl & 1)

r = api(0x3600); print('fn0 install check:', {k: hex(v) for k, v in r.items()})
print('fn3 font 6 (out of range):', {k: hex(v) for k, v in api(0x3603, cx=6).items()})
print('fn3 font 0 (out of range):', {k: hex(v) for k, v in api(0x3603, cx=0).items()})
if len(sys.argv) > 2 and sys.argv[2] == 'perf':
    from unicorn import UC_HOOK_CODE
    cnt = {'i': 0, 'out': 0}
    def ci(uc, a, sz, _):
        cnt['i'] += 1
        if uc.mem_read(a, 1)[0] in (0xEE, 0xEF): cnt['out'] += 1
    mu.hook_add(UC_HOOK_CODE, ci)
    for f in (1, 3):
        api(0x3603, cx=f); api(0x3601, cx=15); fb[:] = [0]*(W*H); cnt.update(i=0, out=0)
        api(0x3607, cx=620, bx=100, s='~gtk ~guvfd 51<4')
        px = sum(1 for p in fb if p)
        print(f'font {f}: {cnt["i"]} instructions, {cnt["out"]} OUTs, {px} pixels -> {cnt["i"]/px:.1f} instr/pixel')
    sys.exit()
if len(sys.argv) > 2 and sys.argv[2] == 'xclip':
    api(0x3603, cx=3); api(0x3601, cx=15)
    for x, y in ((650, 100), (700, 100), (650, 500)):
        fb[:] = [0]*(W*H); r = api(0x3607, cx=x, bx=y, s='f')
        lit = [(i % W, i // W) for i, p in enumerate(fb) if p]
        print(f'x={x} y={y}: AL={r["ax"] & 0xff} CF={r["cf"]} lit={len(lit)} xs={min(p[0] for p in lit) if lit else "-"}..{max(p[0] for p in lit) if lit else "-"}')
    sys.exit()
if len(sys.argv) > 2 and sys.argv[2] == 'hibit':   # byte >= 80h: which code gets drawn?
    api(0x3603, cx=3); api(0x3601, cx=15)
    for tail in ('\0', '\x28'):
        fb[:] = [0]*(W*H)
        api(0x3607, cx=600, bx=100, s='\x80\0' + '\0'*84 + tail)
        print('caller byte 86 =', repr(tail), '-> lit pixels', sum(1 for p in fb if p))
    sys.exit()
if len(sys.argv) > 2:      # style showcase: same word with each inline style code, plus fn 8 (3-D)
    api(0x3603, cx=3)
    rows = [('plain', 0x3607, '~gtk ~guvfd'), ('@ bold', 0x3607, '@~gtk ~guvfd'), ('! italic', 0x3607, '!~gtk ~guvfd'),
            ('# underline', 0x3607, '#~gtk ~guvfd'), ('$ size x2', 0x3607, '$~gtk ~guvfd'), ('fn 8: 3-D', 0x3608, '~gtk ~guvfd'),
            ('lam+alef typed g,h', 0x3607, 'gh'), ('lam-alef key b', 0x3607, 'b'), ('tatweel J', 0x3607, '~gtJJJk')]
    y = 40
    for name, fn, txt in rows:
        api(0x3601, cx=0x0F04 if fn == 0x3608 else 0x0E)
        api(fn, cx=620, bx=y, s=txt); print(name, '->', txt); y += 70 if txt.startswith('$') else 44
    png('emu_styles.png', fb, W, H); sys.exit()
s = ' #~gtk ~guvfd 51<4#        '
x = 630
for font in (1, 2, 3):
    api(0x3603, cx=font); hgt = api(0x3604)['dx']; y = 0
    for col in range(4, 16):
        api(0x3601, cx=col)
        r = api(0x3607, cx=x, bx=y + hgt, s=s); y += hgt
    w = api(0x3605, s=s)['cx']
    print(f'font {font}: height {hgt}, width {w}, last draw returned AL={r["ax"] & 0xff} CF={r["cf"]} CX(new x)={r["cx"]}')
    x -= w
w5, w6 = api(0x3605, s=s)['cx'], api(0x3606, s=s)['cx']
print('measure fn5 vs fn6 (3-D):', w5, w6)
png('emu_demo_screen1.png', fb, W, H)
