import struct
CLS = {0x80:'BUTTON',0x81:'EDIT',0x82:'STATIC',0x83:'LISTBOX',0x84:'SCROLLBAR',0x85:'COMBOBOX'}
def sz(b, p):
    w = struct.unpack_from('<H', b, p)[0]
    if w == 0: return '', p+2
    if w == 0xFFFF: return struct.unpack_from('<H', b, p+2)[0], p+4
    e = p
    while struct.unpack_from('<H', b, e)[0]: e += 2
    return b[p:e].decode('utf-16le'), e+2
def al(p): return (p + 3) & ~3
def parse(b):
    ex = struct.unpack_from('<HH', b, 0) == (1, 0xFFFF)
    p = 0
    if ex:
        _, _, helpid, exstyle, style, n, x, y, cx, cy = struct.unpack_from('<HHIIIHhhhh', b, 0); p = 26
    else:
        style, exstyle, n, x, y, cx, cy = struct.unpack_from('<IIHhhhh', b, 0); p = 18
    menu, p = sz(b, p); cls, p = sz(b, p); title, p = sz(b, p)
    font = None
    if style & 0x40:
        if ex:
            pt, wt, it, cs = struct.unpack_from('<HHBB', b, p); p += 6
        else:
            pt = struct.unpack_from('<H', b, p)[0]; p += 2
        face, p = sz(b, p); font = (pt, face)
    d = dict(style=style, exstyle=exstyle, rect=(x, y, cx, cy), menu=menu, cls=cls, title=title, font=font, items=[])
    for _ in range(n):
        p = al(p)
        if ex:
            hid, exs, st, x, y, cx, cy, cid = struct.unpack_from('<IIIhhhhI', b, p); p += 24
        else:
            st, exs, x, y, cx, cy, cid = struct.unpack_from('<IIhhhhH', b, p); p += 18
        c, p = sz(b, p); c = CLS.get(c, c) if isinstance(c, int) else c
        t, p = sz(b, p)
        extra = struct.unpack_from('<H', b, p)[0]; p += 2 + extra
        d['items'].append(dict(id=cid, cls=c, text=t, style=st, rect=(x, y, cx, cy)))
    return d
def menu(b):
    # standard MENUITEMTEMPLATE
    p = 4; out = []; stack = [out]
    while p < len(b):
        fl = struct.unpack_from('<H', b, p)[0]; p += 2
        if fl & 0x10:
            t, p = sz(b, p); it = dict(popup=True, text=t, items=[]); stack[-1].append(it)
            if fl & 0x80 and len(stack) > 1: pass
            stack.append(it['items']); last = fl & 0x80
            continue
        mid = struct.unpack_from('<H', b, p)[0]; p += 2
        t, p = sz(b, p); stack[-1].append(dict(id=mid, text=t))
        if fl & 0x80:
            stack.pop()
            while len(stack) > 1 and False: pass
        if len(stack) == 0: break
    return out
def strings(b, block):
    p = 0; out = {}
    for i in range(16):
        n = struct.unpack_from('<H', b, p)[0]; p += 2
        if n: out[(block - 1) * 16 + i] = b[p:p+2*n].decode('utf-16le')
        p += 2*n
    return out
