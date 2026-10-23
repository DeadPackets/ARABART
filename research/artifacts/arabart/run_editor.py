# Genuine EDITOR.EXE capture: ARABART 4.15 TSR resident, then EDITOR.EXE, keys typed one by one (reuses gfxprogs harness).
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__)); GFX = os.path.join(HERE, '..', 'programs', 'gfxprogs')
sys.path.insert(0, GFX); os.chdir(GFX)
from sunrun import Sun, rgb
from sheet import sheet
UNP = os.path.join(HERE, '..', 'programs', 'unpacked')
BGI = '/Users/deadpackets/workspace/DOSArchive/programs/ARABART/EGAVGA.BGI'
keys = sys.argv[1].encode('latin-1') if len(sys.argv) > 1 else b'E~gtk ~guvfd'
keys = keys.replace(b'^@', b'\0')                 # ^@ = the 0 byte getch() returns first for arrow and F keys
out = os.path.abspath(os.path.join(HERE, sys.argv[2] if len(sys.argv) > 2 else 'editor_capture.png'))
m = Sun(os.path.join(UNP, 'ARABART_ARABART.EXE'), files={'EGAVGA.BGI': BGI}, maxins=50_000_000); m.run()
print('TSR installed:', getattr(m, 'tsr', False))
m.load(os.path.join(UNP, 'ARABART_EDITOR.EXE'), 0x2000)
m.keys = list(keys); m.script = []; m.buf = None; m.polls = 0; m.shots = []; m.maxins = 2_000_000_000
m.run(); m.shot()
print('done', m.done, 'err', getattr(m, 'err', None), 'mode', hex(m.vgamode), 'keys left', len(m.keys))
print('unhandled', [l for l in m.log if isinstance(l[0], str)][:10])
sheet(out, m.shots[-1:], rgb, cols=1, w=640, h=480)
print('wrote', out)
