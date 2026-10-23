"""Annotated ARM disassembly of a Windows CE PE: import names by ordinal, .pdata function bounds, literal pools."""
import sys, struct, re, pefile, os
from capstone import Cs, CS_ARCH_ARM, CS_MODE_ARM
REF = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ordinals')  # mingw-w64 libce .def files (public domain)

def load_def(name):
    m = {}
    p = os.path.join(REF, name.lower().replace('.dll', '') + '.def')
    if not os.path.exists(p): return m
    for line in open(p):
        mm = re.match(r'\s*(\S+)\s+@(\d+)', line)
        if mm: m[int(mm.group(2))] = mm.group(1)
    return m

class Img:
    def __init__(self, path):
        self.pe = pe = pefile.PE(path)
        self.base = pe.OPTIONAL_HEADER.ImageBase
        self.mem = bytearray(pe.get_memory_mapped_image())
        self.imports = {}
        for e in getattr(pe, 'DIRECTORY_ENTRY_IMPORT', []):
            d = load_def(e.dll.decode())
            for i in e.imports:
                n = i.name.decode() if i.name else d.get(i.ordinal, f'{e.dll.decode()}#{i.ordinal}')
                self.imports[i.address] = n
        self.funcs = {}
        pd = [s for s in pe.sections if s.Name.startswith(b'.pdata')][0]
        raw = pd.get_data()[:pd.Misc_VirtualSize]
        for k in range(0, len(raw) - 7, 8):
            beg, info = struct.unpack_from('<II', raw, k)
            if beg == 0: continue
            if beg >= self.base: beg -= self.base
            flen = (info >> 8) & 0x3fffff
            self.funcs[beg] = beg + flen * 4
        self.names = {}
        for e in getattr(getattr(pe, 'DIRECTORY_ENTRY_EXPORT', None), 'symbols', []) or []:
            self.names[self.base + e.address] = e.name.decode() if e.name else f'ord{e.ordinal}'
        self.md = Cs(CS_ARCH_ARM, CS_MODE_ARM)
    def u32(self, va): return struct.unpack_from('<I', self.mem, va - self.base)[0]
    def ok(self, va): return self.base <= va < self.base + len(self.mem)
    def wstr(self, va, n=80):
        o = va - self.base; s = ''
        while o + 1 < len(self.mem) and len(s) < n:
            c = self.mem[o] | self.mem[o+1] << 8
            if c == 0: break
            if (c < 32 and c not in (9, 10, 13)) or 0xd800 <= c < 0xe000 or c > 0x7e and not (0x600 <= c < 0x700 or 0xa0 <= c < 0x100): return None
            s += chr(c); o += 2
        return s if len(s) >= 2 else None
    def astr(self, va, n=80):
        o = va - self.base; s = b''
        while o < len(self.mem) and self.mem[o] and len(s) < n:
            if not (32 <= self.mem[o] < 127 or self.mem[o] in (9, 10)): return None
            s += bytes([self.mem[o]]); o += 1
        return s.decode() if len(s) >= 3 else None
    def desc(self, v):
        if v in self.imports: return 'IAT:' + self.imports[v]
        if v in self.names: return self.names[v]
        if self.ok(v + 8) and self.u32(v) == 0xe59fc000 and self.u32(v + 4) == 0xe59cf000 and self.u32(v + 8) in self.imports:
            return self.imports[self.u32(v + 8)]
        if (v - self.base) in self.funcs: return f'sub_{v:x}'
        if self.ok(v):
            w = self.wstr(v)
            if w: return 'L"' + w + '"'
            a = self.astr(v)
            if a: return '"' + a + '"'
            return f'&{v:x}'
        return None
    def func_at(self, va):
        r = va - self.base
        for b, e in self.funcs.items():
            if b <= r < e: return self.base + b, self.base + e
        return None
    def dis(self, start, end=None, out=sys.stdout):
        if end is None:
            f = self.func_at(start); end = f[1] if f else start + 0x200
        code = bytes(self.mem[start - self.base:end - self.base])
        for ins in self.md.disasm(code, start):
            note = ''
            m = re.match(r'(\w+), \[pc, #(-?0x[0-9a-f]+|-?\d+)\]', ins.op_str)
            if ins.mnemonic.startswith('ldr') and m:
                lit = ins.address + 8 + int(m.group(2), 0)
                v = self.u32(lit)
                d = self.desc(v)
                note = f'=0x{v:x}' + (f' {d}' if d else '')
            if ins.mnemonic in ('bl', 'b') or ins.mnemonic.startswith('bl'):
                try:
                    t = int(ins.op_str.lstrip('#'), 16)
                    d = self.desc(t)
                    if d and ins.mnemonic.startswith('bl'): note = d
                except ValueError: pass
            if self.base + 0 <= ins.address and ins.address in self.names: print(f'{self.names[ins.address]}:', file=out)
            print(f'  {ins.address:08x}: {ins.bytes.hex():8}  {ins.mnemonic:6} {ins.op_str:28} {";" + note if note else ""}', file=out)

if __name__ == '__main__':
    img = Img(sys.argv[1])
    if len(sys.argv) > 2 and sys.argv[2] == 'all':
        for b in sorted(img.funcs):
            print(f'\n== sub_{img.base+b:x} ({(img.funcs[b]-b)} bytes)')
            img.dis(img.base + b, img.base + img.funcs[b])
    else:
        for a in sys.argv[2:]:
            img.dis(int(a, 16))
