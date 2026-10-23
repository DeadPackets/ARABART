# Proves src/lib/dinarsoft/handylauncher.ts against HandyLauncher's own check routine, run in unicorn (ARM).
# Run from the repo root:  uv run -q --with unicorn --with pefile python -I research/dinarsoft/re/handylauncher/prove.py
import os, sys
sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'handyswitcher'))
from armemu import prove

BUILDS = [
    dict(name='3.4 (2006-03-20)', src=('DinarSoftHandyLauncher34.CAB', False), file='HANDYL~1.001',
         product='HandyLauncher3', check=0x11f3c, lic=0x1d690, state=0x1d89c, days=0x1c8d8,
         trial=('file', '\\Windows\\mcterthr.dat'), universal=True),
]
prove('HandyLauncher', 'src/lib/dinarsoft/handylauncher.ts', BUILDS, 'HandyMenu', HERE)
