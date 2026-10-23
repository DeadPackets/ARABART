# Writes SVG fragments used by src/writeups/winkey.astro into frags/*.svgf
import os
from wk_svg import icon, button
os.makedirs('frags', exist_ok=True)
def w(name, s): open(f'frags/{name}.svgf', 'w').write(s + '\n')
step = lambda k: '3+' if k == 0 else ('4+' if k < 3 else '5+')
# icon steps: wide (scale 6 at 470,50), narrow (scale 5 at 75,40)
w('icon_wide', icon(0xac2, 470, 50, 6, step))
w('icon_narrow', icon(0xac2, 75, 40, 5, step))
# buttons: wide scale 4; narrow scale 3
def btn(x0, y0, style, shift, s):
    return button(x0, y0, 48, 34, style, s) + '\n' + icon(0xac2, x0 + (2 + shift) * s, y0 + (6 + shift) * s, s)
w('panel_wide', button(20, 30, 40, 30, 0x40, 4))
w('rel_wide', btn(240, 30, 0x60, 0, 4))
w('pre_wide', btn(500, 30, 0x50, 2, 4))
w('panel_narrow', button(120, 20, 40, 30, 0x40, 3))
w('rel_narrow', btn(20, 186, 0x60, 0, 3))
w('pre_narrow', btn(196, 186, 0x50, 2, 3))
print('ok')
