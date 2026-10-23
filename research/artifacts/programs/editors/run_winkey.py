# E2E: run WINKEY.EXE (EGA mode 10h) with MENU2.DAT; snapshot after each button's animation and at exit.
import sys, os, time; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from edos import EDos
from unicorn import UC_HOOK_CODE
d = EDos('../unpacked/WINKEY_WINKEY.EXE', [], root=os.path.abspath('runw'), maxins=2_000_000_000)
n = {'btn': 0}
def h(uc, addr, size, _):
    n['btn'] += 1
    if n['btn'] in (45,):  # mid-run frame: 2nd button pressed/raised cycle
        d.shot('winkey_mid.png', 640, 350)
base = (0x1000) * 16
d.uc.hook_add(UC_HOOK_CODE, h, begin=base + 0x8a3, end=base + 0x8a3)
t = time.time(); d.run(); print('secs', round(time.time() - t, 1), 'button draws', n['btn'], 'mode', hex(d.mode), 'calls', d.calls[:6], getattr(d, 'err', ''))
d.shot('winkey_final.png', 640, 350)
