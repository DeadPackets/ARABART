# MemMaid 2.3's 709 interface strings in all 8 languages. English: run MemMaid.exe's own table builder (4EFDC) in
# unicorn. Others: each mm_xxx.dll's GetString() table. Usage:
#   uv run -q --with unicorn --with pefile python -I strings.py <extracted v23multi/named dir> <out.json>
import json, struct, sys, pefile
from unicorn import Uc, UC_ARCH_ARM, UC_MODE_ARM, UC_HOOK_CODE
from unicorn.arm_const import *

d, out = sys.argv[1], sys.argv[2]
N = 709  # GetString(i) answers only i < 0x2C5

def wstr(img, base, va):
    o = va - base; e = o
    while img[e:e + 2] != b'\0\0': e += 2
    return img[o:e].decode('utf-16le')

pe = pefile.PE(f'{d}/MemMaid.exe'); base = pe.OPTIONAL_HEADER.ImageBase; img = pe.get_memory_mapped_image()
memset = next(i.address for e in pe.DIRECTORY_ENTRY_IMPORT for i in e.imports if i.ordinal == 1047 or i.name == b'memset')
uc = Uc(UC_ARCH_ARM, UC_MODE_ARM)
uc.mem_map(base, (len(img) + 0xFFFF) & ~0xFFFF); uc.mem_write(base, img)
uc.mem_map(0x0F000000, 0x1000); uc.mem_write(0x0F000000, struct.pack('<I', 0xE1A0F00E))  # mov pc, lr
uc.mem_write(memset, struct.pack('<I', 0x0F000000))
uc.mem_map(0x7E000000, 0x100000)
uc.hook_add(UC_HOOK_CODE, lambda uc, a, s, _: uc.mem_write(uc.reg_read(UC_ARM_REG_R0), bytes([uc.reg_read(UC_ARM_REG_R1)]) * uc.reg_read(UC_ARM_REG_R2)), begin=0x0F000000, end=0x0F000003)
uc.reg_write(UC_ARM_REG_SP, 0x7E0FF000); uc.reg_write(UC_ARM_REG_LR, 0x0E000000); uc.mem_map(0x0E000000, 0x1000)
uc.emu_start(0x4EFDC, 0x0E000000)
table = 0x890B0
res = {'en': {'name': 'English', 'strings': [wstr(img, base, p) if (p := struct.unpack('<I', uc.mem_read(table + 4 * i, 4))[0]) else None for i in range(N)]}}

for lang in ['ger', 'fra', 'chs', 'csy', 'sky', 'ita', 'rus']:
    pe = pefile.PE(f'{d}/mm_{lang}.dll'); b = pe.OPTIONAL_HEADER.ImageBase; im = pe.get_memory_mapped_image()
    ex = {s.name.decode(): s.address for s in pe.DIRECTORY_ENTRY_EXPORT.symbols}
    tab = struct.unpack_from('<I', im, ex['GetString'] + 0x1C)[0]  # GetString's literal pool: the table address
    name = struct.unpack_from('<I', im, struct.unpack_from('<I', im, ex['GetLangName'] + 0xC)[0] - b)[0]  # GetLangName returns *[pool]
    u = Uc(UC_ARCH_ARM, UC_MODE_ARM)  # the table is filled by the DLL's own start-up code: run it
    u.mem_map(b, (len(im) + 0xFFFF) & ~0xFFFF); u.mem_write(b, im)
    u.mem_map(0x0F000000, 0x1000); u.mem_write(0x0F000000, struct.pack('<I', 0xE1A0F00E) * 4)
    for e in pe.DIRECTORY_ENTRY_IMPORT:
        for k, i in enumerate(e.imports): u.mem_write(i.address, struct.pack('<I', 0x0F000000 + 4 * (i.name == b'memset' or i.ordinal == 1047)))
    u.hook_add(UC_HOOK_CODE, lambda uc, a, s, _: uc.mem_write(uc.reg_read(UC_ARM_REG_R0), bytes([uc.reg_read(UC_ARM_REG_R1)]) * uc.reg_read(UC_ARM_REG_R2)), begin=0x0F000004, end=0x0F000007)
    u.mem_map(0x7E000000, 0x100000); u.mem_map(0x0E000000, 0x1000)
    u.reg_write(UC_ARM_REG_SP, 0x7E0FF000); u.reg_write(UC_ARM_REG_LR, 0x0E000000)
    u.reg_write(UC_ARM_REG_R0, b); u.reg_write(UC_ARM_REG_R1, 1); u.reg_write(UC_ARM_REG_R2, 0)
    u.emu_start(b + pe.OPTIONAL_HEADER.AddressOfEntryPoint, 0x0E000000)
    im = bytes(u.mem_read(b, len(im)))
    res[lang] = {'name': wstr(im, b, name), 'strings': [wstr(im, b, p) if (p := struct.unpack_from('<I', im, tab - b + 4 * i)[0]) else None for i in range(N)]}
json.dump(res, open(out, 'w'), ensure_ascii=False, indent=0)
print({k: (v['name'], sum(s is not None for s in v['strings'])) for k, v in res.items()})
