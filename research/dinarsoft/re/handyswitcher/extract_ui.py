# Pulls each Handy app's own dialogs, menus, strings, icons and bitmaps out of the archived installers, for the
# interface rebuilds on the site. Run from the repo root:
#   uv run -q --with pefile --with pillow python -I research/dinarsoft/re/handyswitcher/extract_ui.py
import io, json, os, struct, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import pefile
from PIL import Image
from armemu import extract, REPO
from rsrc import walk
import dlg

def dib(data):
    size = struct.unpack_from('<I', data, 0)[0]
    bpp, comp, ncol = struct.unpack_from('<H', data, 14)[0], struct.unpack_from('<I', data, 16)[0], struct.unpack_from('<I', data, 32)[0]
    ncol = ncol or (1 << bpp if bpp <= 8 else 0)
    if comp == 3: ncol = 3
    return Image.open(io.BytesIO(b'BM' + struct.pack('<IHHI', 14 + len(data), 0, 0, 14 + size + ncol * 4) + data))

def keyed(im, key=(255, 0, 255)):
    """Magenta is his transparent color; make it real transparency."""
    im = im.convert('RGBA')
    im.putdata([(0, 0, 0, 0) if p[:3] == key else p for p in im.getdata()])
    return im

def dump(pe, want_dialogs):
    out = {'dialogs': {}, 'menus': {}, 'strings': {}}
    for tn, nn, lang, data in walk(pe):
        if tn == 'DIALOG' and (not want_dialogs or nn in want_dialogs):
            d = dlg.parse(data)
            out['dialogs'][str(nn)] = {'title': d['title'], 'w': d['rect'][2], 'h': d['rect'][3], 'font': d['font'][1] if d['font'] else None,
                'items': [{'id': it['id'] if it['id'] != 0xFFFF else -1, 'cls': it['cls'], 'text': it['text'], 'style': it['style'], 'r': list(it['rect'])} for it in d['items']]}
        elif tn == 'STRING':
            out['strings'].update({str(k): v for k, v in dlg.strings(data, nn).items()})
    return out

APPS = {
    'handyswitcher': [
        ('DinarSoftHandySwitcher27_20061223.exe', False, 'HANDYS~1.001', '27', [105, 186, 502, 503, 504, 505, 506], {'108': 'logo-2006', '188': 'menu-actions-27'}),
        ('DinarSoftHandySwitcher_Demo.CAB', False, 'HANDYS~1.004', '31', [105, 186, 502, 503, 504, 505, 506, 507, 508, 510], {'108': 'logo-2008', '104': 'actions-16'}),
        ('DinarSoftHandySwitcher27_20061223.exe', False, '00HHTask.003', 'hhtask', [], {'109': 'topbar-32', '106': 'topbar-16'}),
    ],
    'handymenu': [
        ('DinarSoftHandyMenu.CAB', False, 'HANDYM~1.001', '37', [105, 502, 503, 504, 505, 507], {'184': 'logo-2008', '181': 'items-16'}),
        ('DinarSoftHandyMenu36.CAB', False, 'HANDYM~1.001', '36', [], {'108': 'logo-2006'}),
    ],
    'handylauncher': [
        ('DinarSoftHandyLauncher34.CAB', False, 'HANDYL~1.001', '34', [103, 104, 105, 179, 502, 503, 504, 505], {'108': 'logo-2006'}),
    ],
}
LOOSE = {  # files that sit beside the program in the CAB
    'handyswitcher': [('DinarSoftHandySwitcher_Demo.CAB', 'HANDYS~1.003', 'actions-32')],
    'handymenu': [('DinarSoftHandyMenu.CAB', 'HANDYM~1.003', 'items-32')],
}

for app, builds in APPS.items():
    dst = os.path.join(REPO, 'src', 'components', 'toys', 'ds-' + app)
    os.makedirs(dst, exist_ok=True)
    res = {}
    for src, upx, f, tag, dlgs, bmps in builds:
        pe = pefile.PE(os.path.join(extract(src, upx), f))
        if dlgs: res[tag] = dump(pe, dlgs)
        for tn, nn, lang, data in walk(pe):
            if tn == 'BITMAP' and str(nn) in bmps:
                keyed(dib(data)).save(os.path.join(dst, bmps[str(nn)] + '.png'), optimize=True)
            if tn == 'GROUP_ICON' and tag in ('27', '37', '34'):
                n = struct.unpack_from('<H', data, 4)[0]
                for k in range(n):
                    w, h, cc, r, pl, bc, sz, iid = struct.unpack_from('<BBBBHHIH', data, 6 + 14 * k)
                    icon = next(d for t2, n2, l2, d in walk(pe) if t2 == 'ICON' and n2 == iid)
                    ico = struct.pack('<HHH', 0, 1, 1) + struct.pack('<BBBBHHII', w, h, cc, r, pl, bc, len(icon), 22) + icon
                    Image.open(io.BytesIO(ico)).convert('RGBA').save(os.path.join(dst, 'icon-%s-%d.png' % (nn, w or 256)), optimize=True)
    for src, f, name in LOOSE.get(app, []):
        keyed(Image.open(os.path.join(extract(src), f))).save(os.path.join(dst, name + '.png'), optimize=True)
    if app == 'handymenu':
        text = open(os.path.join(extract('DinarSoftHandyMenu.CAB'), 'HANDYM~1.004'), 'rb').read().decode('utf-16')
        langs, cur = {}, None
        for line in text.splitlines():
            line = line.strip()
            if line.startswith('[') and line.endswith(']'): cur = line[1:-1]; langs[cur] = {}
            elif cur and '=' in line and line.startswith('IX'):
                k, v = line.split('=', 1); langs[cur][int(k[2:])] = v.replace('&&', '&')
        res['languages'] = langs
    json.dump(res, open(os.path.join(dst, 'ui.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    print(app, sorted(os.listdir(dst)))
