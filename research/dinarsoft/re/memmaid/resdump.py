# Dump dialogs, menus, string tables and bitmaps list of a WinCE PE to JSON (and BMPs to a folder).
# Usage: python -I resdump.py <pe> <out.json> [bmp-dir]
import struct, sys, json, pathlib, pefile

pe = pefile.PE(sys.argv[1])
img = pe.get_memory_mapped_image()
out = {'dialogs': {}, 'menus': {}, 'strings': {}, 'bitmaps': {}, 'icons': []}
CLS = {0x80: 'Button', 0x81: 'Edit', 0x82: 'Static', 0x83: 'ListBox', 0x84: 'ScrollBar', 0x85: 'ComboBox'}

def sz_or_ord(b, o):
    w = struct.unpack_from('<H', b, o)[0]
    if w == 0: return None, o + 2
    if w == 0xffff: return struct.unpack_from('<H', b, o + 2)[0], o + 4
    e = o
    while struct.unpack_from('<H', b, e)[0]: e += 2
    return b[o:e].decode('utf-16le'), e + 2
al4 = lambda o: (o + 3) & ~3

def dialog(b):
    ex = struct.unpack_from('<HH', b, 0) == (1, 0xffff)
    if ex:
        _, _, _, exst, style, n, x, y, cx, cy = struct.unpack_from('<HHIIIHhhhh', b, 0); o = 26
    else:
        style, exst, n, x, y, cx, cy = struct.unpack_from('<IIHhhhh', b, 0); o = 18
    menu, o = sz_or_ord(b, o); cls, o = sz_or_ord(b, o); title, o = sz_or_ord(b, o)
    font = None
    if style & 0x40:
        pt = struct.unpack_from('<H', b, o)[0]; o += 2
        if ex: o += 4
        face, o = sz_or_ord(b, o); font = [face, pt]
    items = []
    for _ in range(n):
        o = al4(o)
        if ex:
            _hid, iexst, istyle, ix, iy, icx, icy, iid = struct.unpack_from('<IIIhhhhI', b, o); o += 24
        else:
            istyle, iexst, ix, iy, icx, icy, iid = struct.unpack_from('<IIhhhhH', b, o); o += 18
        c, o = sz_or_ord(b, o); t, o = sz_or_ord(b, o)
        extra = struct.unpack_from('<H', b, o)[0]; o += 2 + extra
        items.append({'id': iid, 'class': CLS.get(c, c), 'text': t, 'x': ix, 'y': iy, 'w': icx, 'h': icy, 'style': hex(istyle)})
    return {'title': title, 'x': x, 'y': y, 'w': cx, 'h': cy, 'style': hex(style), 'font': font, 'items': items}

def menu(b):
    o = 4 + struct.unpack_from('<H', b, 2)[0]
    def level(o):
        res = []
        while True:
            fl = struct.unpack_from('<H', b, o)[0]; o += 2
            if fl & 0x10:
                t, o = sz_or_ord(b, o); sub, o = level(o); res.append({'text': t, 'popup': sub})
            else:
                mid = struct.unpack_from('<H', b, o)[0]; o += 2
                t, o = sz_or_ord(b, o); res.append({'id': mid, 'text': t or '-'})
            if fl & 0x80: return res, o
    return level(o)[0]

for t in pe.DIRECTORY_ENTRY_RESOURCE.entries if hasattr(pe, 'DIRECTORY_ENTRY_RESOURCE') else []:
    for n in t.directory.entries:
        for l in n.directory.entries:
            d = l.data.struct; b = img[d.OffsetToData:d.OffsetToData + d.Size]
            key = f'{n.name or n.id}' + (f'@{l.id}' if l.id != 1033 else '')
            try:
                if t.id == 5: out['dialogs'][key] = dialog(b)
                elif t.id == 4: out['menus'][key] = menu(b)
                elif t.id == 6:
                    o = 0
                    for i in range(16):
                        ln = struct.unpack_from('<H', b, o)[0]; o += 2
                        if ln: out['strings'][f'{(n.id - 1) * 16 + i}' + (f'@{l.id}' if l.id != 1033 else '')] = b[o:o + ln * 2].decode('utf-16le')
                        o += ln * 2
                elif t.id == 2:
                    w, h, _, bpp = struct.unpack_from('<iiHH', b, 4); out['bitmaps'][key] = f'{w}x{h}x{bpp}'
                    if len(sys.argv) > 3:
                        hs = struct.unpack_from('<I', b, 0)[0]; clr = struct.unpack_from('<I', b, 32)[0] or (1 << bpp if bpp <= 8 else 0)
                        if hs == 40 and struct.unpack_from('<I', b, 16)[0] == 3: clr = 3
                        off = 14 + hs + clr * 4
                        pathlib.Path(sys.argv[3]).mkdir(parents=True, exist_ok=True)
                        pathlib.Path(sys.argv[3], f'{key}.bmp').write_bytes(b'BM' + struct.pack('<IHHI', 14 + len(b), 0, 0, off) + b)
                elif t.id == 3: out['icons'].append(f'{key}:{d.Size}')
            except Exception as e:
                out.setdefault('errors', []).append(f'{t.id}/{key}: {e}')
json.dump(out, open(sys.argv[2], 'w'), indent=1, ensure_ascii=False)
print(len(out['dialogs']), 'dialogs', len(out['menus']), 'menus', len(out['strings']), 'strings', len(out['bitmaps']), 'bitmaps', out.get('errors'))
