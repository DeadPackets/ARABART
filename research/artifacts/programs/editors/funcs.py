# Find function prologues; classify as user (ENTER or stack-check) vs library.
import sys, os, re, struct; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tools import load
m = load(sys.argv[1]); img = m['img']; end = int(sys.argv[2], 16)
chk = bytes.fromhex(sys.argv[3]) if len(sys.argv) > 3 else None  # stack-check pattern e.g. 39269603
for mm in re.finditer(rb'(\xc8..\x00|\x55\x8b\xec)', img[:end]):
    a = mm.start(); tail = img[a:a+16]
    sc = chk is not None and chk in tail
    kind = 'ENTER' if img[a] == 0xc8 else 'pushbp'
    print(f'{a:05x} {kind:6} stackchk={int(sc)} {tail.hex()}')
