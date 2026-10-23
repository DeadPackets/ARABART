# Proves src/lib/dinarsoft/handyswitcher.ts against HandySwitcher's own check routine, run in unicorn (ARM).
# Run from the repo root:  uv run -q --with unicorn --with pefile python -I research/dinarsoft/re/handyswitcher/prove.py
import os, sys
sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from armemu import prove

BUILDS = [
    dict(name='2.7 (2006-07-15)', src=('DinarSoftHandySwitcher27_20061223.exe', False), file='HANDYS~1.001',
         product='HandySwitcher', check=0x12c4c, lic=0x1ee88, state=0x1f088, days=0x1db4c,
         trial=('file', '\\Windows\\tonter.bin'), universal=False),
    dict(name='3.1 first build (2008-04-15)', src=('CHIP-2008-06_DinarSoftHandySwitcher_Setup.exe', True), file='HANDYS~1.004',
         product='HandySwitcher3', check=0x100045a0, lic=0x1001ce20, state=0x1001ce18, days=0x1001ba2c,
         trial=('reg', 'RppHelp', 'Tedy'), universal=True),
    dict(name='3.1 Build 78 (2008-07-20)', src=('DinarSoftHandySwitcher_Demo.CAB', False), file='HANDYS~1.004',
         product='HandySwitcher3', check=0x100045c8, lic=0x1001de48, state=0x1001de40, days=0x1001ca50,
         trial=('reg', 'RppHelp', 'Tedy'), universal=True),
]

prove('HandySwitcher', 'src/lib/dinarsoft/handyswitcher.ts', BUILDS, 'HandyMenu', HERE)
