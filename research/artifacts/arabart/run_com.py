# Run the unpacked commercial in Unicorn, capture BIOS pixel writes (INT 10h/0Ch) per slide, write PNGs.
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from unicorn import Uc, UC_ARCH_X86, UC_MODE_16, UC_HOOK_INTR
from unicorn.x86_const import *
from arabart_model import png
PSP = 0x1000
mu = Uc(UC_ARCH_X86, UC_MODE_16); mu.mem_map(0, 0x100000)
mu.mem_write(PSP*16 + 0x100, open(sys.argv[1], 'rb').read())
for r, v in [(UC_X86_REG_CS, PSP), (UC_X86_REG_DS, PSP), (UC_X86_REG_ES, PSP), (UC_X86_REG_SS, PSP), (UC_X86_REG_SP, 0xfffe), (UC_X86_REG_IP, 0x100)]:
    mu.reg_write(r, v)
W, H = 640, 350
fb = [0]*(W*H); slides = []; calls = {}
def intr(uc, no, _):
    ah = uc.reg_read(UC_X86_REG_AH); al = uc.reg_read(UC_X86_REG_AL)
    calls[(no, ah)] = calls.get((no, ah), 0) + 1
    if no == 0x10 and ah == 0x0C:
        x, y = uc.reg_read(UC_X86_REG_CX), uc.reg_read(UC_X86_REG_DX)
        if 0 <= x < W and 0 <= y < H: fb[y*W + x] = al & 15
    elif no == 0x10 and ah == 0:
        if any(fb): slides.append(fb[:])
        fb[:] = [0]*(W*H)
    elif no == 0x21 and ah == 0x0B: uc.reg_write(UC_X86_REG_AL, 0)
    elif no == 0x21 and ah == 0x09:
        ds, dx = uc.reg_read(UC_X86_REG_DS), uc.reg_read(UC_X86_REG_DX)
        m = bytes(uc.mem_read(ds*16 + dx, 200)); print('PRINT:', m[:m.index(b'$')])
    elif no == 0x20: uc.emu_stop()
mu.hook_add(UC_HOOK_INTR, intr)
mu.emu_start(PSP*16 + 0x100, 0xfffff, count=200_000_000)
if any(fb): slides.append(fb[:])
print('calls', {f'INT {k[0]:02X}h/AH={k[1]:02X}h': v for k, v in calls.items()})
for i, s in enumerate(slides): png(f'com_slide{i+1}.png', s, W, H)
print('slides', len(slides))
