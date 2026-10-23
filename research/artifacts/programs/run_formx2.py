import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dosemu import Dos
from unicorn import UC_HOOK_CODE
from capstone import Cs, CS_ARCH_X86, CS_MODE_16
d = Dos('unpacked/FORM_X_FORM_X.EXE', b'x*x+1\r1\r10\r ')
seen = []
def h(uc, addr, size, _):
    cs = d.r('cs'); ip = d.r('ip')
    if cs == 0x116a and ip in (0xf13, 0xc5b, 0x52, 0xf16, 0xa6f, 0xb73, 0x36e):
        seen.append((ip, bytes(uc.mem_read(addr, 3)).hex()))
d.uc.hook_add(UC_HOOK_CODE, h)
d.run()
print(seen)
code = bytes(d.uc.mem_read(0x116a*16+0xb20, 0x40))
md = Cs(CS_ARCH_X86, CS_MODE_16)
for i in md.disasm(code, 0xb20): print(f'{i.address:04x} {i.bytes.hex():<12} {i.mnemonic} {i.op_str}')
print('final screen:'); print(d.screen())
print(d.log[-5:])
print('PAGE0:'); print(d.screen(0))
print(bytes(d.uc.mem_read(0x1000*16+0x479, 0x20)))
