# Recursive-descent disassembly of a flat 16-bit image; prints listing of reached code, marks data gaps.
import sys
from capstone import Cs, CS_ARCH_X86, CS_MODE_16
img = open(sys.argv[1], 'rb').read()
entries = [int(x, 0) for x in sys.argv[2].split(',')]
md = Cs(CS_ARCH_X86, CS_MODE_16)
seen = {}; work = list(entries); refs = {}
while work:
    a = work.pop()
    while a < len(img) and a not in seen:
        ins = next(md.disasm(img[a:a+16], a), None)
        if ins is None: break
        seen[a] = ins
        m = ins.mnemonic
        if (m.startswith('j') or m in ('call', 'loop', 'loope', 'loopne', 'jcxz')) and ins.op_str.startswith('0x'):
            t = int(ins.op_str, 16); work.append(t); refs.setdefault(t, set()).add(a)
        if m in ('ret', 'retf', 'iret', 'jmp', 'ljmp', 'hlt') or (m == 'int' and ins.op_str in ('0x27',)):
            break
        a += ins.size
out = []
prev_end = None
for a in sorted(seen):
    i = seen[a]
    if prev_end is not None and a > prev_end:
        out.append(f'        ; ---- data {prev_end:05x}-{a-1:05x} ({a-prev_end} bytes)')
    lab = 'L' if a in refs else ' '
    out.append(f'{lab}{a:05x}: {i.bytes.hex():<14} {i.mnemonic} {i.op_str}')
    prev_end = a + i.size
open(sys.argv[3], 'w').write('\n'.join(out) + '\n')
print('code bytes', sum(i.size for i in seen.values()), 'instrs', len(seen))
