import numpy as np, json, sys
from PIL import Image
from scipy import optimize, ndimage
im = np.asarray(Image.open(sys.argv[1]).convert('RGBA')).astype(float)/255
T = im[...,3]
S = 3; T4 = ndimage.zoom(T, S, order=1)
yy, xx = (np.mgrid[0:T4.shape[0], 0:T4.shape[1]] + 0.5) / S
def cov(cx, cy, r): return np.clip((r - np.hypot(xx-cx, yy-cy)) * S + 0.5, 0, 1)
def model(p):
    O, A, B, C, Dt = (p[i:i+3] for i in range(0, 15, 3))
    return np.maximum(np.maximum(np.minimum(cov(*O), 1-cov(*A)), np.minimum(cov(*B), 1-cov(*C))), cov(*Dt))
base = np.array([44,48.5,41, 39,50,36.5, 41,48,31, 30,50,30, 26,56,21], float)
rng = np.random.default_rng(1); best = None
for t in range(24):
    p0 = base + (rng.normal(0, 2.0, 15) if t else 0)
    r = optimize.least_squares(lambda p: (model(p) - T4).ravel(), p0, diff_step=1e-3, max_nfev=300)
    M = model(r.x); iou = np.minimum(M, T4).sum() / np.maximum(M, T4).sum()
    if best is None or iou > best[0]: best = (iou, r.x)
iou, p = best; M = model(p)
print('best IoU', round(float(iou), 4), 'mean abs err', round(float(np.abs(M-T4).mean()), 4), 'pixels >0.5 off', int((np.abs(M-T4) > 0.5).sum()), 'of', M.size)
print([tuple(np.round(p[i:i+3], 3)) for i in range(0, 15, 3)])
json.dump(p.tolist(), open(sys.argv[2], 'w'))
