# The page's MemMaid images, cut from MemMaid's own bitmaps (resdump.py output). Magenta and the toolbar's black become
# transparent. Usage: uv run -q --with pillow python -I assets.py <res dir from resdump.py> <out dir>
import sys, pathlib
from PIL import Image

res, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)

def key(src, dst, color=(255, 0, 255), tol=40):
    im = Image.open(res / src).convert('RGBA')
    px = [(0, 0, 0, 0) if all(abs(c - k) <= tol for c, k in zip(p[:3], color)) else p for p in im.getdata()]
    im.putdata(px); im.save(out / dst, optimize=True)
    print(dst, im.size)

key('v23vga-bmp/260.bmp', 'tabs.png')          # the six big tab icons, 64 x 50 each
key('v23vga-bmp/256.bmp', 'tools.png', (0, 0, 0))  # 28 toolbar glyphs, 22 x 22 each
key('v23vga-bmp/234.bmp', 'files.png')         # 14 item icons, 32 x 32 each
key('v23vga-bmp/247.bmp', 'regtypes.png')      # registry value types, 32 x 30 each
key('v23vga-bmp/235.bmp', 'checks.png', (255, 255, 255), 0)
key('v23en-bmp/108.bmp', 'logo-2.png', (999, 999, 999), 0)   # About screen logo, 1.73 and 2.x
key('v172-bmp/108.bmp', 'logo-1.png', (999, 999, 999), 0)    # About screen logo, 1.5a and 1.72
key('v173-bmp/220@4105.bmp', 'tabs-1.png')     # the 1.7x tab icons, 32 x 25 each
