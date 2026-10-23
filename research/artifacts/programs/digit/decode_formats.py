# Decode Digi-Test (MAIN.EXE, 1993) data files. Layouts recovered from the save/load code in MAIN.EXE.
import sys, os, struct, glob
LOGIC = {1: '0', 2: '1', 6: "D'", 9: 'D', 15: 'X'}  # 5-valued D-calculus codes used by the simulator
KEYPAD = {1:(-1,1),2:(0,1),3:(1,1),4:(-1,0),6:(1,0),7:(-1,-1),8:(0,-1),9:(1,-1)}
WIRES = [0]
PIN = {0x20: 'in', 0x40: 'out', 0x10: 'GND', 0x02: 'VCC'}
class R:
    def __init__(s, d, off): s.d, s.o = d, off
    def u8(s): v = s.d[s.o]; s.o += 1; return v
    def u16(s): v, = struct.unpack_from('<H', s.d, s.o); s.o += 2; return v
    def i16(s): v, = struct.unpack_from('<h', s.d, s.o); s.o += 2; return v
    def raw(s, n): v = s.d[s.o:s.o+n]; s.o += n; return v
    def name(s, n=12):
        b = s.raw(n); z = b.split(b'\0')[0]
        return z.decode('latin1') + (f'  [+{n-len(z)-1} uninitialised bytes: {b[len(z)+1:].hex()}]' if any(b[len(z)+1:]) else '')
def common(d, hdr_len, data_off):
    assert d[hdr_len] == 0x1a, 'no ^Z after header'
    assert struct.unpack('<I', d[-4:])[0] == len(d), 'length trailer mismatch'
    return d[:hdr_len].split(b'\0')[0].decode('latin1'), R(d, data_off)
def group(d):
    h, r = common(d, 0x1f, 0x32); n = r.u16()
    return h, [f'{i}: {r.name()} flag={r.u8()}' for i in range(n)], r
def gat(d):
    h, r = common(d, 0x2d, 0x32)
    nin, nout, ctrl, inv, dual = r.u8(), r.u8(), r.u8(), r.u8(), r.u16()
    kind = {(1, 1): 'AND', (1, 2): 'NAND', (2, 1): 'OR', (2, 2): 'NOR'}.get((ctrl, inv), '?')
    return h, [f'{nin} in / {nout} out, controlling value={LOGIC[ctrl]}, inversion={LOGIC[inv]} -> {kind}, dual-output={dual}'], r
def ic(d):
    h, r = common(d, 0x2d, 0x3c); n = r.u8(); out = []
    for p in range(n):
        g, t, z, k = r.raw(4)
        out.append(f'pin {p+1:2}: ' + (PIN.get(t, hex(t)) if t in (0x10, 0x02) else f'gate {g} {PIN.get(t, hex(t))} #{k}') + (f' b2={z}' if z else ''))
    out.append(f'gate type: {r.name()}')
    a24, a26, a25, a27 = r.u8(), r.u8(), r.u8(), r.u16()
    out.append(f'+24={a24} gates(+26)={a26} +25={a25} +27={a27}')
    return h, out, r
def tck(d):
    h, r = common(d, 0x34, 0x3c)
    a13, a1c, a18, a19, oc = r.u8(), r.u16(), r.u8(), r.u8(), r.u8(); five = r.raw(5); n = r.u16(); txt = r.raw(n)
    return h, [f'+13={a13} +1c={a1c} +18={a18} +19={a19} open-collector={oc} +0e..12={five.hex()} text={txt!r}'], r
def cir(d):
    h, r = common(d, 0x34, 0x3c); n = r.u16(); out = []
    for i in range(n):
        x, y, t = r.i16(), r.i16(), r.u8()
        if t == 0: out.append(f'IC   @({x},{y}) +18={r.u8()} part={r.name()} +1a={r.u8()} +19={r.u8()}')
        elif t == 3: out.append(f'NODE @({x},{y}) +13={r.u8()}')
        elif t == 4:
            num, side, k = r.u8(), r.u8(), r.u16()
            out.append(f'PRIME@({x},{y}) #{num} kind={PIN.get(k, hex(k))} side(+13)={side}')
        elif t == 2:
            f = [r.u16(), r.u16(), r.u8(), r.u8(), r.u16(), r.u16(), r.u16(), r.u16()]; m = r.u16(); path = r.raw(m)
            # path = keypad directions walked from the end point back to (x,y); 0x60|(dir+4) = jump 7 cells
            px, py = f[0], f[1]
            for b in path.rstrip(b'\0'):
                dx, dy = KEYPAD[b] if b in KEYPAD else tuple(7*v for v in KEYPAD[(b & 0xf) - 4])
                px += dx; py += dy
            assert (px, py) == (x, y), f'wire path does not reach start {x},{y}'
            WIRES[0] += 1
            out.append(f'WIRE ({f[0]},{f[1]})->({x},{y}) pins {f[2]}/{f[3]} refs={f[4:]} path={path.rstrip(bytes(1)).hex()}')
        else: out.append(f'type {t} @({x},{y}) (no extra fields)')
    return h, out, r
KIND = {'.CIR': cir, '.GAT': gat, '.IC': ic, '.TCK': tck}
if __name__ == '__main__':
    root = sys.argv[1]; bad = 0
    for p in sorted(glob.glob(os.path.join(root, '*.*'))):
        ext = os.path.splitext(p)[1].upper(); base = os.path.basename(p).upper()
        if ext not in KIND: continue
        d = open(p, 'rb').read()
        h, lines, r = (group if base.startswith('GROUP') else KIND[ext])(d)
        ok = r.o == len(d) - 4; bad += not ok
        print(f'== {base} ({len(d)} bytes) header="{h}" parse_end={"OK" if ok else "MISMATCH %d" % r.o}')
        for l in lines: print('   ' + l)
    print('files with parse mismatch:', bad, '| wire paths verified:', WIRES[0]); assert bad == 0
