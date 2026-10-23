# Build synthetic Koko-marked COM/EXE files from the layout KVC checks, run KVC on them, verify cleaning.
import os, sys, struct, shutil; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fsdos import FSDos
HERE = os.path.dirname(os.path.abspath(__file__))
kvc = open(os.path.join(HERE, 'unpacked/KVC_KVC.EXE'), 'rb').read()[0x40:]
DS = 0x3780
COMSIG = kvc[DS+0x59f:DS+0x59f+21]; BODYSIG = kvc[DS+0x5c1:DS+0x5c1+20]
root = os.path.join(HERE, 'kvc_disk'); shutil.rmtree(root, ignore_errors=True); os.makedirs(root + '/SUB')
# COM: host 300 bytes; virus body appended at paragraph boundary
host = bytes([0xB4, 0x09, 0xBA, 0x08, 0x01, 0xCD, 0x21, 0xC3]) + b'ORIGINAL HOST$' + bytes(range(256))[:278]
paras = (len(host) + 15) // 16
body = bytearray(0x200)
body[0x18:0x1a] = struct.pack('<H', len(host))             # original size (KVC subtracts it from file size)
body[0x22:0x22+26] = host[:26]                              # saved original first 26 bytes
body[0x127:0x127+6] = bytes.fromhex('bf0001be2201')         # second-stage check
infected = bytearray(host.ljust(paras*16, b'\0')) + body
infected[0:5] = bytes([0x8C, 0xC8, 0x05]) + struct.pack('<H', paras)
infected[5:26] = COMSIG
open(root + '/HOST.COM', 'wb').write(infected)
open(root + '/CLEAN.COM', 'wb').write(host)
# EXE: original 1024-byte image; virus appended; header CS:IP points at virus entry
img = bytes(1024); orig = bytearray(0x20); orig[0:2] = b'MZ'; orig[8:10] = struct.pack('<H', 2)
orig[0x0e:0x18] = struct.pack('<HHHHH', 0x30, 0x200, 0, 0x10, 0x00)   # SS SP csum IP CS
clean_exe = bytes(orig) + img
entry = len(clean_exe) + 0x100      # KVC: original size = entry offset - 0x100
vir = bytearray(0x800)
vir[0:4] = bytes([0xEB, 0x60, 0x90, 0xEA])
vir[0x4d:0x55] = struct.pack('<HHHH', 0x00, 0x30, 0x10, 0x200)        # saved CS SS IP SP
vir[0x5f0:0x5f0+20] = BODYSIG
vir[0x6da+5:0x6da+5+21] = COMSIG
ex = bytearray(clean_exe.ljust(entry, b'\0')) + vir
ecs = (entry - 0x20) // 16; eip = (entry - 0x20) % 16
ex[0x14:0x18] = struct.pack('<HH', eip, ecs); ex[0x0e:0x12] = struct.pack('<HH', 0x99, 0xC0C1)   # Koko EXE marker: initial SP = C0C1h
sz = len(ex); ex[2:6] = struct.pack('<HH', sz % 512, (sz + 511)//512)
open(root + '/SUB/PROG.EXE', 'wb').write(ex)
before = {f: os.path.getsize(os.path.join(root, f)) for f in ('HOST.COM', 'CLEAN.COM', 'SUB/PROG.EXE')}
d = FSDos(os.path.join(HERE, 'unpacked/KVC_KVC.EXE'), keys=b'    ', args=b' C:', root=root).run()
out = bytes(d.out).decode('cp437')
print('\n'.join(l.rstrip() for l in out.replace('\r\n', '\n').split('\n') if l.strip())[:3000])
print('FS calls:', [c for c in d.calls if isinstance(c, tuple)])
after = {f: os.path.getsize(os.path.join(root, f)) for f in before}
print('sizes before', before, 'after', after)
com = open(root + '/HOST.COM', 'rb').read(); exe = open(root + '/SUB/PROG.EXE', 'rb').read()
assert com == host, 'COM not restored byte-exact'
assert len(exe) == entry - 0x100 and struct.unpack('<HHHHH', exe[0x0e:0x18]) == (0x30, 0x200, 0, 0x10, 0) and struct.unpack('<HH', exe[2:6]) == (1056 % 512, 3), struct.unpack('<HHHHH', exe[0x0e:0x18])
print('E2E OK: COM restored byte-exact; EXE truncated to', len(exe), 'with CS:IP/SS:SP restored (SP marker C0C1h removed), page count fixed')
