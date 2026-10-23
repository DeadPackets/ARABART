# E2E bug checks for EDITOR.EXE: (A) load/save adds 0xFF (feof), (B) Del on long line corrupts next line (memmove length).
import sys, os, struct; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edos import EDos
def k(s): return [ord(c) for c in s]
ENTER, F2, F3, UP, HOME, RIGHT, DEL, DOWN = 0x1c0d, 0x3c00, 0x3d00, 0x4800, 0x4700, 0x4d00, 0x5300, 0x5000
root = os.path.abspath('run'); dg = 0x1000 + 0x762
def run(keys, shot=None):
    d = EDos('../unpacked/EDIT_EDITOR.EXE', keys, root=root, maxins=800_000_000).run()
    if shot: d.shot(shot)
    return d
def lines(d, n):
    out = []
    for i in range(n):
        off, seg = struct.unpack('<HH', d.rd(dg, 0xa72 + 4*i, 4))
        out.append((hex(seg), hex(off), d.rd(seg, off, 12) if seg else None))
    return out
# A: load T1.TXT and save as T2.TXT, twice
run([F3] + k('T1.TXT') + [ENTER, F2] + k('T2.TXT') + [ENTER])
run([F3] + k('T2.TXT') + [ENTER, F2] + k('T3.TXT') + [ENTER])
for f in ('T1.TXT', 'T2.TXT', 'T3.TXT'): print(f, open(os.path.join(root, f), 'rb').read())
# B: 150-char line, short next line, Del at column 100 of line 0
pre = k('A' * 150) + [ENTER] + k('HELLO') + [UP, HOME] + [RIGHT] * 100
d0 = run(pre + [F2] + k('B0.TXT') + [ENTER])
print('before Del: line ptrs', lines(d0, 2), 'heap hdr of line1 block', d0.rd(int(lines(d0,2)[1][0],16), 0, 4).hex() if False else '')
d1 = run(pre + [DEL, F2] + k('B1.TXT') + [ENTER], shot='editor_del_bug.png')
print('after Del:  line ptrs', lines(d1, 2))
for f in ('B0.TXT', 'B1.TXT'):
    b = open(os.path.join(root, f), 'rb').read(); print(f, len(b), b.split(b'\r\n')[1][:20], 'line0 len', len(b.split(b'\r\n')[0]))
