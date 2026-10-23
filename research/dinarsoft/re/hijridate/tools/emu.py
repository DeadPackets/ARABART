"""Minimal Windows CE ARM user-mode harness: maps a PE at its base, routes every import to a Python handler."""
import struct, math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from unicorn import Uc, UC_ARCH_ARM, UC_MODE_ARM, UC_HOOK_CODE, UcError
from unicorn.arm_const import *
from ana import Img

STUB = 0x0F000000; STACK = 0x0E000000; HEAP = 0x0D000000; STOP = 0x0FF00000
R = [UC_ARM_REG_R0, UC_ARM_REG_R1, UC_ARM_REG_R2, UC_ARM_REG_R3]

def d2w(x): return struct.unpack('<II', struct.pack('<d', x))
def w2d(lo, hi): return struct.unpack('<d', struct.pack('<II', lo & 0xffffffff, hi & 0xffffffff))[0]
def f2w(x): return struct.unpack('<I', struct.pack('<f', x))[0]
def w2f(w): return struct.unpack('<f', struct.pack('<I', w & 0xffffffff))[0]
def s32(v): return v - (1 << 32) if v & 0x80000000 else v
def trunc(x): return int(x)  # C cast: toward zero

class Emu:
    def __init__(self, path, handlers=None, trace_float=False):
        self.img = img = Img(path)
        self.uc = uc = Uc(UC_ARCH_ARM, UC_MODE_ARM)
        size = (len(img.mem) + 0xfff) & ~0xfff
        uc.mem_map(img.base, size)
        uc.mem_write(img.base, bytes(img.mem))
        uc.mem_map(STUB, 0x10000); uc.mem_map(STACK - 0x100000, 0x100000); uc.mem_map(HEAP, 0x400000)
        uc.mem_map(STOP, 0x1000)
        uc.mem_write(STOP, struct.pack('<I', 0xe1a00000))
        self.heap = HEAP
        self.stubs = {}
        for i, (iat, name) in enumerate(sorted(img.imports.items())):
            a = STUB + i * 4
            self.stubs[a] = name
            uc.mem_write(iat, struct.pack('<I', a))
            uc.mem_write(a, struct.pack('<I', 0xe12fff1e))  # bx lr (only hit if hook is missing)
        self.h = dict(self.default_handlers())
        if handlers: self.h.update(handlers)
        self.trace_float = trace_float
        self.log = []
        self.missing = set()
        uc.hook_add(UC_HOOK_CODE, self._hook, begin=STUB, end=STUB + 0xffff)

    # memory helpers
    def r(self, i): return self.uc.reg_read(R[i]) if i < 4 else struct.unpack('<I', self.uc.mem_read(self.uc.reg_read(UC_ARM_REG_SP) + 4 * (i - 4), 4))[0]
    def u32(self, a): return struct.unpack('<I', self.uc.mem_read(a, 4))[0]
    def w32(self, a, v): self.uc.mem_write(a, struct.pack('<I', v & 0xffffffff))
    def wstr(self, a):
        s = ''
        while True:
            c = struct.unpack('<H', self.uc.mem_read(a, 2))[0]
            if c == 0: return s
            s += chr(c); a += 2
    def put_wstr(self, a, s): self.uc.mem_write(a, s.encode('utf-16le') + b'\0\0')
    def alloc(self, n, data=None):
        a = self.heap; self.heap += (n + 15) & ~15
        if data is not None: self.uc.mem_write(a, data)
        return a
    def wbuf(self, s): return self.alloc(len(s) * 2 + 2, s.encode('utf-16le') + b'\0\0')

    def _ret(self, v, hi=None):
        self.uc.reg_write(UC_ARM_REG_R0, v & 0xffffffff)
        if hi is not None: self.uc.reg_write(UC_ARM_REG_R1, hi & 0xffffffff)

    def _hook(self, uc, addr, size, ud):
        name = self.stubs.get(addr)
        if name is None: return
        fn = self.h.get(name)
        if fn is None:
            self.missing.add(name); res = 0
        else:
            res = fn(self)
        if res is not None:
            if isinstance(res, tuple): self._ret(*res)
            else: self._ret(res)
        uc.reg_write(UC_ARM_REG_PC, uc.reg_read(UC_ARM_REG_LR))

    def dargs(self): return w2d(self.r(0), self.r(1)), w2d(self.r(2), self.r(3))
    def fop(self, name, f):
        def h(e):
            a, b = e.dargs(); v = f(a, b)
            if e.trace_float: e.log.append((name, a, b, v))
            return d2w(v)
        return h
    def default_handlers(self):
        def cmp(f):
            return lambda e: int(f(*e.dargs()))
        def sdiv(e):
            d, n = s32(e.r(0)), s32(e.r(1))
            q = abs(n) // abs(d) * (1 if (n < 0) == (d < 0) else -1)
            return (q, n - q * d)
        def udiv(e):
            d, n = e.r(0), e.r(1); return (n // d, n % d)
        def wsprintf(e):
            import re as _re
            fmt, out, argi = e.wstr(e.r(1)), '', 2
            def arg():
                nonlocal argi
                v = e.r(argi); argi += 1; return v
            for m in _re.finditer(r'%(-?0?\d*)(h|l)?([dusSxXc%])|[^%]+', fmt):
                if not m.group(3): out += m.group(0); continue
                flag, size, conv = m.groups()
                if conv == '%': out += '%'; continue
                v = arg()
                if conv in 'du': s_ = str(s32(v) if conv == 'd' else v)
                elif conv in 'xX': s_ = format(v, conv)
                elif conv == 'c': s_ = chr(v & 0xffff)
                elif conv == 's' and size != 'h': s_ = e.wstr(v)
                else:
                    b = b''
                    while e.uc.mem_read(v + len(b), 1) != b'\0': b += bytes(e.uc.mem_read(v + len(b), 1))
                    s_ = b.decode('latin-1')
                w = int(flag or 0)
                s_ = s_.rjust(abs(w), '0' if flag.startswith('0') else ' ') if w > 0 else s_.ljust(abs(w))
                out += s_
            e.put_wstr(e.r(0), out)
            return len(out)
        def trace1(name, f):
            def h(e):
                v = f(e)
                if e.trace_float: e.log.append((name, v))
                return v
            return h
        return {
            '__addd': self.fop('add', lambda a, b: a + b), '__subd': self.fop('sub', lambda a, b: a - b),
            '__muld': self.fop('mul', lambda a, b: a * b), '__divd': self.fop('div', lambda a, b: a / b),
            '__negd': lambda e: d2w(-w2d(e.r(0), e.r(1))),
            '__itod': lambda e: d2w(float(s32(e.r(0)))), '__dtoi': lambda e: trunc(w2d(e.r(0), e.r(1))),
            '__itos': lambda e: f2w(float(s32(e.r(0)))), '__stoi': lambda e: trunc(w2f(e.r(0))),
            '__stod': lambda e: d2w(w2f(e.r(0))), '__dtos': lambda e: f2w(w2d(e.r(0), e.r(1))),
            '__adds': lambda e: f2w(w2f(e.r(0)) + w2f(e.r(1))),
            '__led': cmp(lambda a, b: a <= b), '__ged': cmp(lambda a, b: a >= b), '__gtd': cmp(lambda a, b: a > b),
            '__ltd': cmp(lambda a, b: a < b), '__eqd': cmp(lambda a, b: a == b), '__ned': cmp(lambda a, b: a != b),
            '__rt_sdiv': sdiv, '__rt_udiv': udiv,
            'sin': lambda e: (lambda x: (e.log.append(('sin', x, math.sin(x))) if e.trace_float else None, d2w(math.sin(x)))[1])(w2d(e.r(0), e.r(1))),
            'wcslen': lambda e: len(e.wstr(e.r(0))),
            'wcscpy': lambda e: (e.put_wstr(e.r(0), e.wstr(e.r(1))), e.r(0))[1],
            'wcscat': lambda e: (e.put_wstr(e.r(0), e.wstr(e.r(0)) + e.wstr(e.r(1))), e.r(0))[1],
            'lstrcmpW': lambda e: (lambda a, b: (a > b) - (a < b))(e.wstr(e.r(0)), e.wstr(e.r(1))) & 0xffffffff,
            'wsprintfW': wsprintf, 'swprintf': wsprintf,
            'memset': lambda e: (e.uc.mem_write(e.r(0), bytes([e.r(1) & 0xff]) * e.r(2)), e.r(0))[1],
            'memcpy': lambda e: (e.uc.mem_write(e.r(0), bytes(e.uc.mem_read(e.r(1), e.r(2)))), e.r(0))[1],
        }

    def call(self, fn, *args, max_ins=50_000_000):
        uc = self.uc
        sp = STACK - 0x1000
        regs = list(args[:4]); extra = list(args[4:])
        sp -= 4 * len(extra)
        for i, v in enumerate(extra): self.w32(sp + 4 * i, v)
        for i, v in enumerate(regs): uc.reg_write(R[i], v & 0xffffffff)
        uc.reg_write(UC_ARM_REG_SP, sp)
        uc.reg_write(UC_ARM_REG_LR, STOP)
        uc.emu_start(fn, STOP, count=max_ins)
        return uc.reg_read(UC_ARM_REG_R0), uc.reg_read(UC_ARM_REG_R1)
