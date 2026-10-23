# Common byte runs (>=10) between NAMES.COM code and PORTSAID user code.
from difflib import SequenceMatcher
n = (b'\0'*0x100 + open('../unpacked/NAMES_NAMES.COM','rb').read())
p = open('../unpacked/PORTSAID_PORTSAID.EXE','rb').read()[0x50:]
A = n[0x56f:0x9b8]; B = p[0x311:0xa08] + p[0x6ce7:0x6dc6]
boff = lambda j: 0x311 + j if j < 0xa08-0x311 else 0x6ce7 + j - (0xa08-0x311)
sm = SequenceMatcher(None, A, B, autojunk=False); tot = 0
for blk in sm.get_matching_blocks():
    if blk.size >= 10:
        tot += blk.size; print(f'NAMES {0x56f+blk.a:04x} == PORTSAID {boff(blk.b):04x} len {blk.size}: {A[blk.a:blk.a+blk.size][:24].hex()}')
print('NAMES code bytes', len(A), 'PORTSAID user code bytes', len(B), 'shared runs>=10:', tot)
# unordered: maximal runs of A found anywhere in B (greedy, min 8 bytes)
i = 0; runs = []
while i < len(A):
    best = 0
    for L in range(8, len(A) - i + 1):
        if A[i:i+L] in B: best = L
        else: break
    if best: runs.append((0x56f+i, best, B.find(A[i:i+best]))); i += best
    else: i += 1
for a, L, j in runs: print(f'unordered: NAMES {a:04x} len {L} -> PORTSAID {boff(j):04x}  {A[a-0x56f:a-0x56f+L].hex()}')
print('unordered shared bytes', sum(r[1] for r in runs))
