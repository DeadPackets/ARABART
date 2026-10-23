# Static decoder for the commercial's slide script (ARABIC/DEMO.COM, script at CS:01EC). Mirrors the player at 0116-01A9.
import struct, json, sys
d = open('com_dec.img', 'rb').read()          # 0x100 zero bytes + decrypted COM, so offsets = CS offsets
si = 0x1EC; slides = [[]]; lines = []
while True:
    h = d[si:si+5]; di, bx = struct.unpack_from('<HH', d, si+5); si += 9
    step = {0x43: 1, 0x4B: -1}[h[0]]          # opcode patched into 0149: 'x' = dec bx (4Bh) in every header
    shadow = h[2] == 0; c1, c2 = h[3], h[4]
    line = {'slide': len(slides), 'c1': c1, 'c2': c2, 'shadow': shadow, 'row0': di, 'col0': bx, 'runs': []}
    lines.append(line)
    while True:
        dl = d[si]; si += 1
        if dl == 0x78: bx += step; continue                      # 'x'
        if dl == 0x77: bx -= step; continue                      # 'w'
        if dl in (0x79, 0x7A, 0x88): break
        n = d[si]; si += 1
        line['runs'].append([bx, di + dl, n])                    # vertical run: column bx, rows di+dl .. +n-1
        slides[-1].append(len(lines) - 1)
    if dl == 0x7A: break
    if dl == 0x88: slides.append([])
print('slides', len(slides), 'lines', len(lines), 'runs', sum(len(l['runs']) for l in lines))
for i, l in enumerate(lines): print(i, 'slide', l['slide'], 'c1', l['c1'], 'c2', l['c2'], 'shadow', l['shadow'], 'runs', len(l['runs']), 'cols', min(r[0] for r in l['runs']), max(r[0] for r in l['runs']))
json.dump(lines, open('com_lines.json', 'w'))
