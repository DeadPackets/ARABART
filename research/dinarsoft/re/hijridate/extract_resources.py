"""Pull HijriDate's and TapText's resources out of their CABs for the site: bitmaps, dialogs, the default TapText menu.

Writes research copies (research/dinarsoft/re/<app>/resources/) and the web data the page toys use
(src/components/toys/ds-<app>/). Reads the installers as data only.
Run: uv run -q --with pefile --with pillow python -I research/dinarsoft/re/hijridate/extract_resources.py
"""
import os, sys, io, json, re, struct
import pefile
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from cab import extract

REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
CLS = {0x80: 'Button', 0x81: 'Edit', 0x82: 'Static', 0x83: 'ListBox', 0x84: 'ScrollBar', 0x85: 'ComboBox'}


def resources(pe, type_id):
    for t in pe.DIRECTORY_ENTRY_RESOURCE.entries:
        if t.id == type_id:
            for n in t.directory.entries:
                l = n.directory.entries[0]
                yield n.id, pe.get_data(l.data.struct.OffsetToData, l.data.struct.Size)


def bitmap(d):
    hs = struct.unpack_from('<I', d)[0]
    bpp, clr = struct.unpack_from('<H', d, 14)[0], struct.unpack_from('<I', d, 32)[0]
    ncol = clr or (1 << bpp if bpp <= 8 else 0)
    bmp = b'BM' + struct.pack('<IHHI', 14 + len(d), 0, 0, 14 + hs + 4 * ncol) + d
    im = Image.open(io.BytesIO(bmp)); im.load()
    return im


def icons(pe, out, prefix):
    """Rebuild each icon group as a .ico in memory and save its largest image as PNG."""
    raw = dict(resources(pe, 3))
    saved = []
    for gid, g in resources(pe, 14):
        n = struct.unpack_from('<H', g, 4)[0]
        ents, datas = [], []
        for i in range(n):
            w, h, cc, r, planes, bpp, size, rid = struct.unpack_from('<BBBBHHIH', g, 6 + 14 * i)
            ents.append((w, h, cc, r, planes, bpp, len(raw[rid]))); datas.append(raw[rid])
        off = 6 + 16 * n; ico = struct.pack('<HHH', 0, 1, n)
        for e in ents: ico += struct.pack('<BBBBHHII', *e, off); off += e[-1]
        im = Image.open(io.BytesIO(ico + b''.join(datas)))
        for size in sorted(im.info.get('sizes', [im.size]), reverse=True)[:1]:
            im.size = size; im.load()
            name = f'{prefix}-icon-{gid}-{size[0]}.png'
            im.convert('RGBA').save(os.path.join(out, name)); saved.append(name)
    return saved


def sz(d, o):
    w = struct.unpack_from('<H', d, o)[0]
    if w == 0xffff: return struct.unpack_from('<H', d, o + 2)[0], o + 4
    s = ''
    while True:
        c = struct.unpack_from('<H', d, o)[0]; o += 2
        if c == 0: return s, o
        s += chr(c)


def dialog(d):
    style, _, n, x, y, cx, cy = struct.unpack_from('<IIHhhhh', d, 0)
    o = 18
    _, o = sz(d, o); _, o = sz(d, o); title, o = sz(d, o)
    if style & 0x40: o += 2; _, o = sz(d, o)
    items = []
    for _ in range(n):
        o = (o + 3) & ~3
        st, _, ix, iy, icx, icy, iid = struct.unpack_from('<IIhhhhH', d, o); o += 18
        c, o = sz(d, o); t, o = sz(d, o)
        o += 2 + struct.unpack_from('<H', d, o)[0]
        items.append(dict(id=iid, cls=CLS.get(c, c) if isinstance(c, int) else c, text=t, x=ix, y=iy, w=icx, h=icy, style=st))
    return dict(title=title, w=cx, h=cy, items=items)


def dump(pe, out):
    os.makedirs(out, exist_ok=True)
    bmps = {}
    for rid, d in resources(pe, 2):
        im = bitmap(d); bmps[rid] = im
        im.convert('RGB').save(os.path.join(out, f'bitmap-{rid}.png'))
    dlgs = {rid: dialog(d) for rid, d in resources(pe, 5)}
    # Contact addresses other than @dinarsoft.com stay out of the repo (privacy rule)
    for dl in dlgs.values():
        for it in dl['items']:
            if isinstance(it['text'], str): it['text'] = re.sub(r'\n\n[\w.]+@(?!dinarsoft\.com)[\w.]+', '', it['text'])
    json.dump(dlgs, open(os.path.join(out, 'dialogs.json'), 'w'), indent=1)
    return bmps


def hijridate():
    pe = pefile.PE(extract('DinarSoftHijriDate15.CAB', 'HIJRIP~1.001'))
    bmps = dump(pe, os.path.join(HERE, 'resources'))
    web = os.path.join(REPO, 'src/components/toys/ds-hijridate')
    glyphs = {}
    for rid, im in bmps.items():
        if im.mode != '1' and im.mode != 'P' or im.width > 80 or im.height != 16: continue
        g = im.convert('L')
        rows = [''.join('1' if g.getpixel((x, y)) < 128 else '0' for x in range(g.width)) for y in range(16)]
        glyphs[rid] = {'w': g.width, 'rows': [hex(int(r, 2))[2:].rjust((g.width + 3) // 4, '0') for r in rows]}
    json.dump(glyphs, open(os.path.join(web, 'glyphs.json'), 'w'), separators=(',', ':'))
    print('icons', icons(pe, web, 'hd'))
    bmps[157].convert('RGB').save(os.path.join(web, 'logo-dinar-ar.png'))
    bmps[162].convert('RGB').save(os.path.join(web, 'logo-dinar.png'))
    print('hijridate:', len(glyphs), 'word bitmaps')


def taptext():
    pe = pefile.PE(extract('DinarSoftTapText13.CAB', '0TapText.001'))
    bmps = dump(pe, os.path.join(HERE, '..', 'taptext', 'resources'))
    web = os.path.join(REPO, 'src/components/toys/ds-taptext')
    for rid, name in ((103, 'icons.png'), (105, 'toolbar.png')):
        im = bmps[rid].convert('RGBA')
        px = im.load()
        for y in range(im.height):
            for x in range(im.width):
                if px[x, y][:3] == (255, 0, 255) or (rid == 105 and False): px[x, y] = (0, 0, 0, 0)
        im.save(os.path.join(web, name))
    bmps[108].convert('RGB').save(os.path.join(web, 'logo-dinar.png'))
    print('icons', icons(pe, web, 'tt'))
    print('taptext: icons', bmps[103].size, 'toolbar', bmps[105].size)


if __name__ == '__main__':
    hijridate()
    taptext()
