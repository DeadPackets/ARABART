# RUN.BAT scenario: ARABART 4.15 resident first, then SUN's ARAB-ART 7.15, then SUN.
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sunrun import Sun, files, K, rgb
from sheet import sheet
m = Sun('../unpacked/ARABART_ARABART.EXE', files=files, maxins=50_000_000); m.run()
print('4.15 TSR:', getattr(m, 'tsr', False), 'INT10 ->', m.uc.mem_read(0x40, 4).hex())
m.tsr = False; m.load('../unpacked/SUN_ARAB-ART.EXE', 0x3000); m.run()
print('7.15 TSR:', getattr(m, 'tsr', False), 'INT10 ->', m.uc.mem_read(0x40, 4).hex(), 'printed:', bytes(m.out[-90:]).decode('latin1').strip())
m.load('../unpacked/SUN_SUN.EXE', 0x4000)
m.script = [K['ENT'], K['ENT'], K['ENT']]; m.buf = None; m.polls = 0; m.shots = []; m.maxins = 3_000_000_000
m.run(); m.shot()
sheet('sun_with_arabart415.png', m.shots[:4], rgb, cols=2, w=640, h=480)
print('shots', len(m.shots))
