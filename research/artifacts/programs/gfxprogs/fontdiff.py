# Render the same SUN key script under ARAB-ART 7.15 (own driver) and under ARABART 4.15 resident; count differing pixels per screen.
import sys, os
G = '/Users/deadpackets/workspace/DOSArchive/research/artifacts/programs/gfxprogs'
sys.path.insert(0, G); os.chdir(G)
from sunrun import Sun, files, K
def frames(pre415, script):
    if pre415:
        m = Sun('../unpacked/ARABART_ARABART.EXE', files=files, maxins=50_000_000); m.run()
        m.tsr = False; m.load('../unpacked/SUN_ARAB-ART.EXE', 0x3000); m.run(); seg = 0x4000
    else:
        m = Sun('../unpacked/SUN_ARAB-ART.EXE', files=files, maxins=50_000_000); m.run(); seg = 0x2000
    m.load('../unpacked/SUN_SUN.EXE', seg)
    m.script = [K[k] for k in script]; m.buf = None; m.polls = 0; m.shots = []; m.maxins = 3_000_000_000
    m.run(); m.shot(); return [s[0] for s in m.shots]
script = 'ENT,ENT,ENT,ENT,SP,SP,SP,SP,ESC,DN,DN,ENT,SP,SP,SP'.split(',')
a = frames(False, script); b = frames(True, script)
for i, (p, q) in enumerate(zip(a, b)):
    keys = set(p) | set(q); d = [k for k in keys if p.get(k, 0) != q.get(k, 0)]
    bb = (min(x for x, y in d), min(y for x, y in d), max(x for x, y in d), max(y for x, y in d)) if d else None
    print(f'screen {i:2d}: {len(d):6d} px differ  bbox {bb}')
