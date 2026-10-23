# Report long common byte runs between two binaries (code reuse evidence).
import sys
a = open(sys.argv[1], 'rb').read(); b = open(sys.argv[2], 'rb').read(); k = int(sys.argv[3]) if len(sys.argv) > 3 else 24
idx = {}
for i in range(0, len(b) - k):
    idx.setdefault(b[i:i+k], i)
i = 0; runs = []
while i < len(a) - k:
    j = idx.get(a[i:i+k])
    if j is not None and a[i:i+k].count(a[i:i+1]) < k:
        n = k
        while i+n < len(a) and j+n < len(b) and a[i+n] == b[j+n]: n += 1
        runs.append((n, i, j)); i += n
    else: i += 1
runs.sort(reverse=True)
print('total shared bytes in runs >=', k, ':', sum(r[0] for r in runs), 'runs:', len(runs))
for n, i, j in runs[:8]: print(f'  len {n:5}  A@{i:#06x}  B@{j:#06x}')
