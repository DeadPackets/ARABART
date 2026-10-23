# SVG fragments for the WINKEY writeup, generated from MENU2.DAT and the style table in WINKEY.EXE (CS:09B2).
import sys
EGA = ['#000000','#0000AA','#00AA00','#00AAAA','#AA0000','#AA00AA','#AA5500','#AAAAAA','#555555','#5555FF','#55FF55','#55FFFF','#FF5555','#FF55FF','#FFFF55','#FFFFFF']
dat = open('/Users/deadpackets/workspace/DOSArchive/programs/WINKEY/MENU2.DAT','rb').read()
exe = open('/Users/deadpackets/workspace/DOSArchive/research/artifacts/programs/unpacked/WINKEY_WINKEY.EXE','rb').read()[0x30:]
def runs(ofs):  # mirrors 0000:027C
    ox, oy = dat[ofs], dat[ofs+1]; i = ofs + 2; out = []
    while True:
        color, row = dat[i], oy - dat[i+1]; i += 2
        while True:
            c = dat[i]; i += 1
            if c == 0xef: row -= 1; continue
            if c == 0xfc: break
            if c > 0xfc: return out
            n = dat[i]; i += 1
            out.append((ox - c - n + 1, row, n, color))
def icon(ofs, x0, y0, s, steps=None):
    o = []
    for k, (x, y, n, c) in enumerate(runs(ofs)):
        ds = f' data-s="{steps(k)}"' if steps else ''
        o.append(f'<rect x="{x0+x*s:g}" y="{y0+y*s:g}" width="{n*s:g}" height="{s:g}" fill="{EGA[c]}"{ds} />')
    return '\n'.join(o)
def rings(style):  # mirrors 0000:08A3
    t = 0x9b2 + style - 0x10; out = []
    while exe[t] != 0x10: out.append((exe[t], exe[t+1])); t += 2
    return out
def button(x0, y0, w, h, style, s, face=7):
    o = []; x, y, x2, y2 = 0, 0, w - 1, h - 1
    for c1, c2 in rings(style):
        o.append(f'<rect x="{x0+x*s:g}" y="{y0+y*s:g}" width="{(x2-x+1)*s:g}" height="{s:g}" fill="{EGA[c1]}" />')
        o.append(f'<rect x="{x0+x*s:g}" y="{y0+y*s:g}" width="{s:g}" height="{(y2-y+1)*s:g}" fill="{EGA[c1]}" />')
        o.append(f'<rect x="{x0+x2*s:g}" y="{y0+y*s:g}" width="{s:g}" height="{(y2-y+1)*s:g}" fill="{EGA[c2]}" />')
        o.append(f'<rect x="{x0+x*s:g}" y="{y0+y2*s:g}" width="{(x2-x+1)*s:g}" height="{s:g}" fill="{EGA[c2]}" />')
        x += 1; y += 1; x2 -= 1; y2 -= 1
    o.append(f'<rect x="{x0+x*s:g}" y="{y0+y*s:g}" width="{(x2-x+1)*s:g}" height="{(y2-y+1)*s:g}" fill="{EGA[face]}" />')
    return '\n'.join(o)
if __name__ == '__main__':
    for st in (0x40, 0x50, 0x60): print(hex(st), rings(st))
    print(len(runs(0xac2)), 'runs; first', runs(0xac2)[:4])
