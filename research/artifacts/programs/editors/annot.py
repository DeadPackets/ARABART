# Annotated linear disassembly of user segments: names for far targets, DGROUP string refs.
import sys, os, re, json, struct; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tools import load
from capstone import *
m = load(sys.argv[1]); img = m['img']
cfg = json.load(open(sys.argv[2]))
dg = int(cfg['dgroup'], 16) * 16
names = {k.lower(): v for k, v in cfg.get('names', {}).items()}
md = Cs(CS_ARCH_X86, CS_MODE_16)
def sref(v):
    a = dg + v
    if 0 <= a < len(img):
        s = re.match(rb'[\x20-\x7e]{3,}', img[a:a+60])
        if s and (a == dg or img[a-1] == 0 or v in cfg.get('force', [])): return repr(s.group().decode())
    return None
for seg, a, b in cfg['ranges']:
    seg, a, b = int(seg,16), int(a,16), int(b,16)
    off = a; base = seg*16
    while off < b:
        for ins in md.disasm(img[base+off:base+b], off):
            txt = f'{ins.mnemonic} {ins.op_str}'
            note = ''
            if ins.mnemonic == 'lcall' and ins.bytes[0] == 0x9a:
                o, s = struct.unpack_from('<HH', ins.bytes, 1)
                key = f'{s:04x}:{o:04x}'; txt = f'lcall {names.get(key, key)}'
            mm = re.search(r'0x([0-9a-f]{2,4})\b', ins.op_str)
            if mm and ins.mnemonic in ('push', 'mov', 'lea'):
                r = sref(int(mm.group(1), 16))
                if r: note = '  ; ' + r
            print(f'{seg:04x}:{ins.address:04x} {ins.bytes.hex():<14} {txt}{note}')
            off = ins.address + ins.size
        if off < b: print(f'{seg:04x}:{off:04x} db {img[base+off]:02x}'); off += 1
