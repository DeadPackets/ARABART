# More WINKEY fragments: memory map, routine strip, pixel-step cells.
from wk_frags import w
R = [(0x239,1),(0x27c,16),(0x353,3),(0x363,3),(0x37b,0),(0x3be,1),(0x3ea,0),(0x47b,0),(0x4d7,1),(0x4e3,0),(0x5ba,1),(0x66f,0),(0x765,8),(0x85c,0),(0x8a3,17)]
def strip(x0, x1, y, h):
    s = (x1 - x0) / 2013; o = []
    for i, (a, n) in enumerate(R):
        b = R[i+1][0] if i + 1 < len(R) else 0xa16
        cls = 'box-hi' if n else 'box-dash'
        o.append(f'<rect class="{cls}" x="{x0 + (a-0x239)*s:.1f}" y="{y}" width="{(b-a)*s:.1f}" height="{h}" />')
    return '\n'.join(o)
w('strip_wide', strip(20, 740, 150, 36))
w('strip_narrow', strip(10, 350, 248, 32))
def cells(x0, y, cw, ch, s3, s4, hl):
    o = []
    for i in range(16):
        x = 24 + i; cx = x0 + i*cw
        o.append(f'<rect x="{cx}" y="{y}" width="{cw}" height="{ch}" fill="#AAAAAA" stroke="#555555" />')
        if 32 <= x <= 37: o.append(f'<rect x="{cx}" y="{y}" width="{cw}" height="{ch}" fill="#FF5555" stroke="#555555" data-s="{s3}" />')
        if 29 <= x <= 31: o.append(f'<rect x="{cx}" y="{y}" width="{cw}" height="{ch}" fill="#FF5555" stroke="#555555" data-s="{s4}" />')
    o.append(f'<rect class="wire-hi" x="{x0 + 13*cw}" y="{y}" width="{cw}" height="{ch}" data-s="{hl}" />')
    return '\n'.join(o)
w('cells_wide', cells(60, 96, 40, 40, '3+', '4+', '2'))
w('cells_narrow', cells(20, 84, 20, 30, '3+', '4+', '2'))
