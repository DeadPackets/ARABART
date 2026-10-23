# Rebuild the KEMYAM defence circuit (FIL0.CIR) netlist from Digi-Test's own files, then simulate it
# with Digi-Test's gate model (controlling value + inversion) in 5-valued logic.
import sys, os, struct
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import decode_formats as df
D = sys.argv[1] if len(sys.argv) > 1 else '/Users/deadpackets/workspace/DOSArchive/programs/DIGI_T'
rd = lambda n: open(os.path.join(D, n), 'rb').read()

def group(ext):
    _, lines, _ = df.group(rd('GROUP.' + ext)); return [l.split(': ', 1)[1].split()[0] for l in lines]

def load_cir(name):
    d = rd(name); h, r = df.common(d, 0x34, 0x3c); n = r.u16(); objs = []
    for _ in range(n):
        x, y, t = r.i16(), r.i16(), r.u8()
        if t == 0: a18 = r.u8(); part = r.name().split()[0]; inst = r.u8(); r.u8(); objs.append(('IC', x, y, part, inst))
        elif t == 3: objs.append(('NODE', x, y, r.u8()))
        elif t == 4: num, side, kind = r.u8(), r.u8(), r.u16(); objs.append(('PRIME', x, y, num, kind))
        elif t == 2:
            ex, ey, pa, pb, ia, ib, ka, kb, m = r.u16(), r.u16(), r.u8(), r.u8(), r.u16(), r.u16(), r.u16(), r.u16(), r.u16(); r.raw(m)
            objs.append(('WIRE', (x, y), (ex, ey), (ka, ia, pa), (kb, ib, pb)))
    return objs

def load_ic(fil):
    d = rd(fil); h, r = df.common(d, 0x2d, 0x3c); n = r.u8()
    pins = [tuple(r.raw(4)) for _ in range(n)]; gtype = r.name().split()[0]
    return pins, gtype

GATES = {}  # gate type name -> (controlling, inversion) from the .GAT files, values in Digi-Test codes
for i, nm in enumerate(group('GAT')):
    d = rd(f'FIL{i}.GAT'); GATES[nm] = (d[0x34], d[0x35])
GATES.setdefault('Not', (1, 2))  # ponytail: no Not.GAT in the archive; a 1-input NAND is an inverter
ICLIB = {p: f'FIL{i}.IC' for i, p in enumerate(group('IC'))}

def endpoint(k, i, p):
    return ('IC', i, p) if k == 2 else ('N', i) if k == 1 else ('P', p)

def netlist(objs):
    parent = {}
    def f(a):
        parent.setdefault(a, a)
        while parent[a] != a: parent[a] = parent[parent[a]]; a = parent[a]
        return a
    for o in objs:
        if o[0] == 'WIRE': parent[f(endpoint(*o[3]))] = f(endpoint(*o[4]))
    nets = {}
    for a in list(parent): nets.setdefault(f(a), set()).add(a)
    return list(nets.values())

# Digi-Test logic codes and its 5-valued operators (0d8d:034c AND, 03e3 OR, 047a NOT)
Z, O, DD, DB, X = 1, 2, 6, 9, 15   # D (good 1, faulty 0) is 6: the tester (2529:00c7) drives a 1 for code 6
NAME = {Z: '0', O: '1', DB: "D'", DD: 'D', X: 'X'}
def NOT(v): return {Z: O, O: Z, DB: DD, DD: DB}.get(v, X)
def AND(a, b):
    if a == b: return a
    if Z in (a, b): return Z
    if a == O: return b
    if b == O: return a
    if X in (a, b): return X
    return Z                                   # D AND D' = 0
def OR(a, b): return NOT(AND(NOT(a), NOT(b)))
def gate(c, inv, ins):
    out = ins[0]
    for v in ins[1:]: out = AND(out, v) if c == Z else OR(out, v)
    if c == Z and len(ins) == 1: out = ins[0]
    return NOT(out) if inv == O else out

if __name__ == '__main__':
    objs = load_cir(sys.argv[2] if len(sys.argv) > 2 else 'FIL0.CIR')
    ics = {o[4]: o[3] for o in objs if o[0] == 'IC'}
    primes = {o[3]: o[4] for o in objs if o[0] == 'PRIME'}
    nets = netlist(objs)
    netof = {e: k for k, s in enumerate(nets) for e in s}
    print('ICs:', ics); print('primes:', {k: df.PIN.get(v, v) for k, v in primes.items()})
    gates = []
    for inst, part in ics.items():
        pins, gt = load_ic(ICLIB[part])
        by = {}
        for pn, (g, t, _, k) in enumerate(pins, 1):
            if t in (0x20, 0x40): by.setdefault(g, {'in': [], 'out': None})
            if t == 0x20: by[g]['in'].append(pn)
            if t == 0x40: by[g]['out'] = pn
        for g, io in sorted(by.items()):
            used = [netof.get(('IC', inst, p)) for p in io['in']] + [netof.get(('IC', inst, io['out']))]
            if any(u is not None for u in used):
                gates.append((f'{part}#{inst}.g{g}', gt, [netof.get(('IC', inst, p)) for p in io['in']], netof.get(('IC', inst, io['out'])), io))
    for gname, gt, ins, out, io in gates: print(f'{gname:12} {gt:8} pins in {io["in"]} -> out {io["out"]}  nets {ins} -> {out}')
    for k, s in enumerate(nets): print(f'net {k}: {sorted(s, key=str)}')
