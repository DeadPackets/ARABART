# Proves src/lib/dinarsoft/handymenu.ts against HandyMenu's own check routine, run in unicorn (ARM).
# Run from the repo root:  uv run -q --with unicorn --with pefile python -I research/dinarsoft/re/handymenu/prove.py
import os, sys
sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'handyswitcher'))
from armemu import prove

BUILDS = [
    dict(name='3.6 (2006-03-06)', src=('DinarSoftHandyMenu36.CAB', False), file='HANDYM~1.001',
         product='HandyMenu', check=0x12f84, lic=0x1d118, state=0x1d338, days=0x1b81c,
         trial=('file', '\\Windows\\xintra.dat'), universal=False),
    dict(name='3.7 Build 40 (2008-06-24)', src=('DinarSoftHandyMenu.CAB', False), file='HANDYM~1.001',
         product='HandyMenu', check=0x18044, lic=0x1d008, state=0x1d000, days=0x1c55c,
         trial=('file', '\\Windows\\xintra.dat'), universal=True),
]
prove('HandyMenu', 'src/lib/dinarsoft/handymenu.ts', BUILDS, 'HandySwitcher3', HERE)
