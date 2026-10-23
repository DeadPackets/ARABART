# Small ARM (WinCE PE) reverse-engineering helper: function bounds from .pdata, import thunks, string xrefs, annotated
# disassembly. Import as a module or run: python -I armre.py <coredll_ordinals.txt> <pe> <cmd> [args]
#   cmd: xref <utf16 text> | dis <hex va> | funcs | strat <hex va>
import struct, sys, re, pefile, capstone

class Bin:
    def __init__(self, path, ordfile):
        self.pe = pe = pefile.PE(path)
        self.base = pe.OPTIONAL_HEADER.ImageBase
        self.img = pe.get_memory_mapped_image()
        ords = dict(l.split(None, 1) for l in open(ordfile).read().splitlines())
        self.iat = {}
        for e in getattr(pe, 'DIRECTORY_ENTRY_IMPORT', []):
            for i in e.imports:
                n = i.name.decode() if i.name else (ords.get(str(i.ordinal), f'#{i.ordinal}') if e.dll.lower() == b'coredll.dll' else f'{e.dll.decode()}#{i.ordinal}')
                self.iat[i.address] = n
        self.funcs = []
        pd = pe.OPTIONAL_HEADER.DATA_DIRECTORY[3]
        for o in range(pd.VirtualAddress, pd.VirtualAddress + pd.Size, 8):
            beg, w = struct.unpack_from('<II', self.img, o)
            if beg: self.funcs.append((beg, beg + ((w >> 8) & 0x3fffff) * 4))
        self.funcs.sort()
        self.cs = capstone.Cs(capstone.CS_ARCH_ARM, capstone.CS_MODE_ARM)
        self.cs.detail = True
        self.thunks = {}
        text = next(s for s in pe.sections if s.Name.startswith(b'.text'))
        t0, t1 = self.base + text.VirtualAddress, self.base + text.VirtualAddress + text.Misc_VirtualSize
        self.text = (t0, t1)
        for va in range(t0, t1 - 8, 4):  # ldr r12,[pc]; ldr pc,[r12]; dcd iat
            a, b, c = struct.unpack_from('<III', self.img, va - self.base)
            if a == 0xe59fc000 and b == 0xe59cf000 and c in self.iat: self.thunks[va] = self.iat[c]

    def u32(self, va): return struct.unpack_from('<I', self.img, va - self.base)[0]
    def wstr(self, va, n=200):
        o = va - self.base; e = o
        while e < len(self.img) - 1 and self.img[e:e + 2] != b'\0\0' and e - o < n * 2: e += 2
        return self.img[o:e].decode('utf-16le', 'replace')
    def find_wstr(self, s):
        return [self.base + m.start() for m in re.finditer(re.escape(s.encode('utf-16le')), self.img) if m.start() % 2 == 0]
    def func_of(self, va):
        for b, e in self.funcs:
            if b <= va - self.base < e: return self.base + b, self.base + e
    def xrefs(self, target):
        """Code addresses whose literal pool holds `target`."""
        out = []
        t0, t1 = self.text
        pools = [va for va in range(t0, t1, 4) if self.u32(va) == target]
        for p in pools:
            for va in range(max(t0, p - 4096), p, 4):
                w = self.u32(va)
                if (w & 0x0f7f0000) == 0x051f0000 and va + 8 + (w & 0xfff) * (1 if w & 0x800000 else -1) == p: out.append(va)
                if (w & 0x0fff0000) == 0x028f0000: pass
        return out
    def callers(self, fva):
        out = []
        t0, t1 = self.text
        for va in range(t0, t1, 4):
            w = self.u32(va)
            if (w & 0x0f000000) == 0x0b000000:
                off = (w & 0xffffff); off = off - (1 << 24) if off & 0x800000 else off
                if va + 8 + off * 4 == fva: out.append(va)
        return out
    def note(self, ins):
        if ins.mnemonic.startswith('bl') and ins.op_str.startswith('#'):
            t = int(ins.op_str[1:], 16)
            return self.thunks.get(t) or f'sub_{t:x}'
        m = re.match(r'(\w+), \[pc, #(-?0x[0-9a-f]+|-?\d+)\]', ins.op_str)
        if ins.mnemonic.startswith('ldr') and m:
            p = ins.address + 8 + int(m.group(2), 0); v = self.u32(p)
            if v in self.iat: return f'&{self.iat[v]}'
            if self.base <= v < self.base + len(self.img):
                s = self.wstr(v, 60)
                if len(s) >= 2 and all(32 <= ord(c) < 127 for c in s): return f'{v:#x} L"{s}"'
                return f'{v:#x}'
            return f'={v:#x} ({v})'
        return ''
    def dis(self, beg, end=None):
        if end is None: beg, end = self.func_of(beg) or (beg, beg + 0x200)
        code = self.img[beg - self.base:end - self.base]
        out = []
        for o in range(0, len(code) - 3, 4):
            ins = next(self.cs.disasm(code[o:o + 4], beg + o), None)
            if ins is None: out.append(f'{beg + o:08x}  .word    {self.u32(beg + o):#010x}'); continue
            n = self.note(ins)
            out.append(f'{ins.address:08x}  {ins.mnemonic:8} {ins.op_str:28} {"; " + n if n else ""}')
        return '\n'.join(out)

if __name__ == '__main__':
    ordf, path, cmd, *args = sys.argv[1:]
    b = Bin(path, ordf)
    if cmd == 'xref':
        for s in b.find_wstr(args[0]):
            print(f'string {s:#x}')
            for x in b.xrefs(s): print(f'  ref {x:#x} in func {b.func_of(x)[0]:#x}' if b.func_of(x) else f'  ref {x:#x}')
    elif cmd == 'dis': print(b.dis(int(args[0], 16), int(args[1], 16) if len(args) > 1 else None))
    elif cmd == 'callers':
        for c in b.callers(int(args[0], 16)): print(f'{c:#x} in {b.func_of(c)[0]:#x}' if b.func_of(c) else hex(c))
    elif cmd == 'funcs': print(len(b.funcs), 'functions;', len(b.thunks), 'thunks')
