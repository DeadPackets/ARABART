# DOS file-system services (subset) for the harness, backed by a host directory.
import os, struct, fnmatch, sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dosemu import Dos
class FSDos(Dos):
    def __init__(self, *a, root, **k):
        super().__init__(*a, **k); self.root = root; self.fh = {}; self.searches = {}; self.calls = []
        env = b'COMSPEC=C:\\COMMAND.COM\0PATH=C:\\\0\0\x01\0C:\\PROG.EXE\0'
        envseg = 0x0900; self.uc.mem_write(envseg*16, env); self.uc.mem_write(self.psp*16+0x2c, struct.pack('<H', envseg))
    def cstr(self, seg, off):
        a = seg*16 + off; s = b''
        while True:
            c = self.uc.mem_read(a, 1)[0]
            if c == 0: return s.decode('latin1')
            s += bytes([c]); a += 1
    def host(self, p):
        p = p.replace('\\', '/');  p = p[2:] if len(p) > 1 and p[1] == ':' else p
        return os.path.join(self.root, p.lstrip('/'))
    def ok(self, ax=None):
        if ax is not None: self.w('ax', ax)
        self.cf(False)
    def fail(self, code=2): self.w('ax', code); self.cf(True)
    def fill_dta(self, entry):
        name, path = entry; st = os.stat(path); isdir = os.path.isdir(path)
        seg, off = self.dta; b = bytearray(43)
        b[21] = 0x10 if isdir else 0x20
        b[22:26] = struct.pack('<HH', 0, 0x1a21); b[26:30] = struct.pack('<I', 0 if isdir else st.st_size)
        b[30:30+len(name)] = name.upper().encode()[:12]
        self.uc.mem_write(seg*16+off, bytes(b))
    def intr(self, uc, n, _):
        ah = self.r('ax') >> 8; al = self.r('ax') & 0xff
        if n == 0x21 and ah in (0x3c, 0x3d, 0x3e, 0x3f, 0x40, 0x41, 0x42, 0x43, 0x4e, 0x4f, 0x57, 0x0e, 0x19, 0x47, 0x3b):
            self.calls.append(hex(ah))
            if ah == 0x3d or ah == 0x3c:
                p = self.host(self.cstr(self.r('ds'), self.r('dx')))
                if ah == 0x3d and not os.path.isfile(p): return self.fail(2)
                if ah == 0x3d and (al & 3) and getattr(self, 'ro', {}).get(p): return self.fail(5)
                f = open(p, 'r+b' if ah == 0x3d and (al & 3) else ('rb' if ah == 0x3d else 'w+b'))
                h = self.nexth; self.nexth += 1; self.fh[h] = f; self.calls.append(('open', os.path.basename(p), al)); return self.ok(h)
            if ah == 0x3e:
                f = self.fh.pop(self.r('bx'), None)
                if f: f.close(); return self.ok(0)
                return self.fail(6)
            if ah == 0x3f:
                h = self.r('bx')
                if h == 0:
                    return self.ok(0)
                data = self.fh[h].read(self.r('cx')); uc.mem_write(self.r('ds')*16 + self.r('dx'), data); return self.ok(len(data))
            if ah == 0x40:
                h = self.r('bx'); cnt = self.r('cx')
                if h in (1, 2): return super().intr(uc, n, _)
                f = self.fh[h]
                if cnt == 0: f.truncate(); self.calls.append(('truncate', f.tell())); return self.ok(0)
                data = bytes(uc.mem_read(self.r('ds')*16 + self.r('dx'), cnt)); f.write(data); self.calls.append(('write', cnt, f.tell()-cnt)); return self.ok(cnt)
            if ah == 0x42:
                f = self.fh[self.r('bx')]; off = (self.r('cx') << 16) | self.r('dx')
                if off & 0x80000000: off -= 1 << 32
                f.seek(off, al); pos = f.tell(); self.w('dx', pos >> 16); return self.ok(pos & 0xffff)
            if ah == 0x43:
                p = self.host(self.cstr(self.r('ds'), self.r('dx')))
                if not os.path.exists(p): return self.fail(2)
                self.ro = getattr(self, 'ro', {})
                if al == 0: self.w('cx', 0x21 if self.ro.get(p) else 0x20); return self.ok()
                self.ro[p] = bool(self.r('cx') & 1); self.calls.append(('setattr', os.path.basename(p), self.r('cx'))); return self.ok()
            if ah == 0x4e:
                spec = self.cstr(self.r('ds'), self.r('dx')); attr = self.r('cx'); d = os.path.dirname(self.host(spec)); pat = os.path.basename(spec.replace('\\','/'))
                ents = []
                for nm in sorted(os.listdir(d)) if os.path.isdir(d) else []:
                    fp = os.path.join(d, nm)
                    if os.path.isdir(fp) and not attr & 0x10: continue
                    if all(fnmatch.fnmatch(a, b) for a, b in zip((nm.upper()+'.').split('.')[:2], (pat.upper()+'.').split('.')[:2])): ents.append((nm, fp))
                if attr & 0x10: ents = [('.', d), ('..', d)] + ents
                self.searches[self.dta] = ents
                if not ents: return self.fail(0x12)
                self.fill_dta(ents.pop(0)); return self.ok(0)
            if ah == 0x4f:
                ents = self.searches.get(self.dta, [])
                if not ents: return self.fail(0x12)
                self.fill_dta(ents.pop(0)); return self.ok(0)
            if ah == 0x57:
                if al == 0: self.w('cx', 0x6000); self.w('dx', 0x1a21); return self.ok()
                self.calls.append(('setdate', hex(self.r('cx')), hex(self.r('dx')))); return self.ok()
            if ah == 0x19: return self.ok((self.r('ax') & 0xff00) | 2)
            if ah == 0x0e: return self.ok()
            if ah == 0x47: uc.mem_write(self.r('ds')*16 + self.r('si'), b'\0'); return self.ok()
            if ah == 0x3b: return self.ok()
        super().intr(uc, n, _)
