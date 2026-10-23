# Run the real FORM_X.EXE in the Unicorn DOS harness for each key string; print page 1 when keys run out.
# Usage: uv run -q --with unicorn python -I emu_batch.py cases.json emu.json
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
from dosemu import Dos

EXE = os.path.join(os.path.dirname(HERE), 'unpacked', 'FORM_X_FORM_X.EXE')
cases = json.load(open(sys.argv[1]))
out = []
for c in cases:
    d = Dos(EXE, c['keys'].encode('latin1'), maxins=c.get('maxins', 200_000_000)).run()
    out.append({'id': c['id'], 'waiting': bool(d.snaps), 'finished': d.done,
                'screen': d.snaps[-1] if d.snaps else d.screen()})
json.dump(out, open(sys.argv[2], 'w'), indent=0)
