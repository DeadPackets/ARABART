# Rebuilds public/dinarsoft/{mark,logo}.svg. The mark is 5 circles fitted to logo_100.png (mark-circles.json, refit with
# fit_mark.py); the wordmark is traced from logo_name_50.png's alpha at 16x with light smoothing, because no vector
# original was archived (replace it with the original artwork if the family has it).
# Run: uv run -q --with pillow --with numpy --with scipy python -I research/dinarsoft/scripts/logo/build.py
import json, math, re, subprocess, tempfile, pathlib
import numpy as np
from PIL import Image
from scipy import ndimage
HERE = pathlib.Path(__file__).parent; ROOT = HERE.parents[3]
PRESS = ROOT / 'research/dinarsoft/site/images/press'; OUT = ROOT / 'public/dinarsoft'
RED, DARK, K = '#CF2F2F', '#433C3C', 16

def meet(X, Y):
    (x0, y0, r0), (x1, y1, r1) = X, Y
    d = math.hypot(x1-x0, y1-y0); a = (r0*r0 - r1*r1 + d*d) / (2*d); h = math.sqrt(r0*r0 - a*a)
    mx, my = x0 + a*(x1-x0)/d, y0 + a*(y1-y0)/d
    return (mx + h*(y1-y0)/d, my - h*(x1-x0)/d), (mx - h*(y1-y0)/d, my + h*(x1-x0)/d)
def f(v): return f'{v:.3f}'.rstrip('0').rstrip('.')
def arc(X, P, Q, keep):
    a0, a1 = math.atan2(P[1]-X[1], P[0]-X[0]), math.atan2(Q[1]-X[1], Q[0]-X[0])
    for sweep in (1, 0):
        span = (a1 - a0) % (2*math.pi) if sweep else -((a0 - a1) % (2*math.pi))
        m = a0 + span/2
        if keep((X[0] + X[2]*math.cos(m), X[1] + X[2]*math.sin(m))):
            return f'A{f(X[2])} {f(X[2])} 0 {int(abs(span) > math.pi)} {sweep} {f(Q[0])} {f(Q[1])}'
def inside(p, X): return math.hypot(p[0]-X[0], p[1]-X[1]) < X[2]
def crescent(X, Y):
    P, Q = meet(X, Y)
    return f'M{f(P[0])} {f(P[1])}' + arc(X, P, Q, lambda q: not inside(q, Y)) + arc(Y, Q, P, lambda q: inside(q, X)) + 'Z'
p = json.load(open(HERE / 'mark-circles.json')); O, A, B, C, Dt = (p[i:i+3] for i in range(0, 15, 3))
mark = crescent(O, A) + crescent(B, C) + (f'M{f(Dt[0]-Dt[2])} {f(Dt[1])}a{f(Dt[2])} {f(Dt[2])} 0 1 0 {f(2*Dt[2])} 0'
                                          f'a{f(Dt[2])} {f(Dt[2])} 0 1 0 {f(-2*Dt[2])} 0Z')
(OUT / 'mark.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="{RED}" d="{mark}"/></svg>\n')

# Wordmark: alpha coverage of the charcoal ink, smoothed, upsampled, traced
png = np.asarray(Image.open(PRESS / 'logo_name_50.png').convert('RGBA')).astype(float) / 255
red = (png[..., 0] - png[..., 1]) > 0.25
ink = png[..., 3].copy(); ink[red] = 0
up = ndimage.zoom(ndimage.gaussian_filter(ink, 0.65), K, order=3)
with tempfile.TemporaryDirectory() as t:
    Image.fromarray(np.where(up > 0.5, 0, 255).astype('uint8')).save(f'{t}/w.pbm')
    subprocess.run(['potrace', '-s', '--flat', '-a', '1.25', '-O', '2.5', '-t', str(K*K//4), '-u', '100', '-o', f'{t}/w.svg', f'{t}/w.pbm'], check=True)
    g = re.search(r'<g transform="([^"]+)"[^>]*>(.*?)</g>', open(f'{t}/w.svg').read(), re.S)
h, w = ink.shape

# Place the exact mark where the press PNG's own mark sits (its red bounding box)
ys, xs = np.where(red & (png[..., 3] > 0.5)); bx0, bx1, by0, by1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
m100 = np.asarray(Image.open(PRESS / 'logo_100.png').convert('RGBA'))[..., 3] > 128
my, mx = np.where(m100); s = ((bx1 - bx0) / (mx.max() + 1 - mx.min()) + (by1 - by0) / (my.max() + 1 - my.min())) / 2
tx, ty = bx0 - mx.min() * s, by0 - my.min() * s
(OUT / 'logo.svg').write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">'
    f'<path fill="{RED}" transform="translate({f(tx)} {f(ty)}) scale({f(s)})" d="{mark}"/>'
    f'<g transform="scale({f(1/K)})"><g transform="{g.group(1)}" fill="{DARK}">{re.sub(r"[ ]*\n[ ]*", " ", g.group(2)).strip()}</g></g></svg>\n')
print('mark.svg', len((OUT / 'mark.svg').read_text()), 'bytes; logo.svg', len((OUT / 'logo.svg').read_text()), 'bytes')
