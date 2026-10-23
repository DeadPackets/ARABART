# Simulate KEMYAM (FIL0.CIR) gate by gate in Digi-Test's 5-valued logic with one stuck-at fault injected.
import sys, os, itertools
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kemyam_netlist as k
objs = k.load_cir('FIL0.CIR'); nets = k.netlist(objs)
netof = {e: i for i, s in enumerate(nets) for e in s}
ics = {o[4]: o[3] for o in objs if o[0] == 'IC'}
gates = []
for inst, part in ics.items():
    pins, gt = k.load_ic(k.ICLIB[part]); by = {}
    for pn, (g, t, _, kk) in enumerate(pins, 1):
        if t == 0x20: by.setdefault(g, [[], None])[0].append(pn)
        if t == 0x40: by.setdefault(g, [[], None])[1] = pn
    for g, (ins, out) in by.items():
        if netof.get(('IC', inst, out)) is not None:
            gates.append((f'{part} pins {",".join(map(str, ins))}->{out}', k.GATES[gt], [netof[('IC', inst, p)] for p in ins], netof[('IC', inst, out)]))
INPUTS = {p: netof[('P', p)] for p, kind in ((o[3], o[4]) for o in objs if o[0] == 'PRIME') if kind == 0x20}
OUT = netof[('P', 8)]
def run(vec, fault=None, trace=False):
    v = {n: k.X for n in range(len(nets))}
    v[netof[('P', 5)]] = k.O; v[netof[('P', 11)]] = k.Z
    for p, n in INPUTS.items(): v[n] = vec[p]
    done = set(); level = 0
    while len(done) < len(gates):
        level += 1; ready = [g for g in gates if g[0] not in done and all(v[i] != k.X or i not in [gg[3] for gg in gates] for i in g[2])]
        for name, (c, inv), ins, out in ready:
            r = k.gate(c, inv, [v[i] for i in ins])
            if fault and fault[0] == out:
                good = r; r = k.DD if (good == k.O and fault[1] == 0) else k.DB if (good == k.Z and fault[1] == 1) else r
            v[out] = r; done.add(name)
            if trace: print(f'  level {level}: {name:22} ins={[k.NAME[v[i]] for i in ins]} -> {k.NAME[r]}  (net {out})')
    return v[OUT]
vec = {1: k.O, 2: k.O, 3: k.O, 4: k.O, 6: k.Z, 7: k.Z, 9: k.Z, 10: k.Z}
b = netof[('IC', 3, 6)]
print('fault: 7408 pin 6 (net', b, ') stuck at 0; vector P1-P4=1, P6 P7 P9 P10=0')
print('output =', k.NAME[run(vec, (b, 0), trace=True)])
# brute-force check with plain binary good/faulty machines
def binsim(vec, force=None):
    v = {}
    v.update({netof[('P', 5)]: 1, netof[('P', 11)]: 0}); v.update({n: (force[1] if force and force[0] == n else int(vec[p] == k.O)) for p, n in INPUTS.items()})
    pend = list(gates)
    while pend:
        for g in list(pend):
            name, (c, inv), ins, out = g
            if all(i in v for i in ins):
                x = [v[i] for i in ins]; r = (all(x) if c == k.Z else any(x)) if len(x) > 1 else x[0]
                r = int(r) ^ (inv == k.O); v[out] = force[1] if force and force[0] == out else r; pend.remove(g)
    return v[OUT]
print('binary good =', binsim(vec), 'faulty =', binsim(vec, (b, 0)))
det = [bits for bits in itertools.product([0, 1], repeat=8) if (lambda vv: binsim(vv) != binsim(vv, (b, 0)))({p: (k.O if x else k.Z) for p, x in zip(sorted(INPUTS), bits)})]
print('vectors (P1,P2,P3,P4,P6,P7,P9,P10) that detect it:', len(det), 'of 256; e.g.', det[:4])
ones = sum(binsim({p: (k.O if x else k.Z) for p, x in zip(sorted(INPUTS), bits)}) for bits in itertools.product([0, 1], repeat=8))
print('truth table: output is 1 in', ones, 'of 256 rows')
# every single stuck-at fault on a signal net: how many of the 256 patterns reveal it
sig = sorted({g[3] for g in gates} | set(INPUTS.values()))
vecs = [{p: (k.O if x else k.Z) for p, x in zip(sorted(INPUTS), bits)} for bits in itertools.product([0, 1], repeat=8)]
good = [binsim(v) for v in vecs]
und = []
for n in sig:
    for s in (0, 1):
        c = sum(binsim(v, (n, s)) != g for v, g in zip(vecs, good))
        if c == 0: und.append((n, s))
print('signal nets', len(sig), 'faults', 2 * len(sig), 'undetectable', len(und), und)
name = {}
for g in gates: name[g[3]] = g[0].split(' ')[0] + ' pin ' + g[0].split('->')[1]
for p, n in INPUTS.items(): name[n] = f'input P{p}'
print('undetectable:', [f'{name[n]} s-a-{s}' for n, s in und])
