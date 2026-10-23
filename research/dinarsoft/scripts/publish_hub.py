# Builds public/dinarsoft/ for the DinarSoft hub from the local research copies: installers (byte for byte, checked
# against SHA256SUMS), the traced logo, product icons, device screenshots, and the press captures (privacy blurs and
# trims applied here). Writes public/dinarsoft/manifest.json: every published file, its source, and what was blurred.
# Run from the repo root: uv run -q --with pillow --with pefile python -I research/dinarsoft/scripts/publish_hub.py
# (needs potrace and 7zz)
import pathlib, hashlib, json, os, re, shutil, subprocess, tempfile
from PIL import Image, ImageFilter

R = 'research/dinarsoft'
OUT = 'public/dinarsoft'
CAP = f'{R}/captures'
SITE = f'{R}/site/images'
shutil.rmtree(OUT, ignore_errors=True)
for d in ('downloads', 'screens', 'press', 'icons', 'site'):
    os.makedirs(f'{OUT}/{d}', exist_ok=True)
man = {'images': {}, 'downloads': []}

def save(im, rel, lossless=True, q=82):
    im.save(f'{OUT}/{rel}', 'WEBP', lossless=lossless, quality=100 if lossless else q, method=6)
    w, h = im.size
    return {'src': f'dinarsoft/{rel}', 'w': w, 'h': h, 'bytes': os.path.getsize(f'{OUT}/{rel}')}

# 1. Installers, untouched
sums = dict(reversed(l.split()) for l in open(f'{R}/SHA256SUMS') if l.strip())
for e in json.load(open(f'{R}/downloads.json')):
    if e.get('kept') is False: continue
    src = f"{R}/downloads/{e['file']}"
    data = open(src, 'rb').read()
    h = hashlib.sha256(data).hexdigest()
    assert h == e['sha256'] == sums[e['file']], e['file']
    shutil.copyfile(src, f"{OUT}/downloads/{e['file']}")
    man['downloads'].append({k: e.get(k) for k in ('file', 'version', 'bytes', 'sha256', 'timestamp', 'original_url', 'archive_item', 'date_in_iso')})

# 2. Logo: built by scripts/logo/build.py (exact 5-circle mark plus a smoothed trace of the wordmark)
subprocess.run(['uv', 'run', '-q', '--with', 'pillow', '--with', 'numpy', '--with', 'scipy', 'python', '-I',
                str(pathlib.Path(__file__).parent / 'logo' / 'build.py')], check=True)
man['images']['logo'] = {'src': 'dinarsoft/logo.svg', 'w': 2640, 'h': 600, 'from': 'site/images/press/logo_name_50.png (mark rebuilt from circles, wordmark traced)'}
man['images']['mark'] = {'src': 'dinarsoft/mark.svg', 'w': 1200, 'h': 1200, 'from': 'site/images/press/logo_100.png (rebuilt from 5 fitted circles)'}

# 3. Product icons, 100x100 with true alpha
for p in ('MemMaid', 'HandySwitcher', 'HandyMenu', 'HandyLauncher', 'TapText', 'HijriDate'):
    rec = save(Image.open(f'{SITE}/press/{p}_100.png').convert('RGBA'), f'icons/{p.lower()}.webp')
    man['images'][f'icon-{p.lower()}'] = {**rec, 'from': f'site/images/press/{p}_100.png'}

# 4. Device screenshots from DinarSoft's product pages: doubled with nearest neighbor so the pixels stay sharp
SCREENS = ['mm2-1', 'mm2-6', 'mm2-5', 'mm2-4', 'mm2-sc', 'mm2-2', 'mm2-3', 'mm2-lf', 'HS3-6', 'HS3-1', 'HS3-3', 'HS3-4',
           'HM', 'hmcolors', 'hmenuscreen', 'hlauncherscreen', 'taptextscreen', 'hijriscreen']
for n in SCREENS:
    im = Image.open(f'{SITE}/{n}.gif').convert('RGB')
    assert im.size == (240, 320), n
    rec = save(im.resize((480, 640), Image.NEAREST), f'screens/{n.lower()}.webp')
    man['images'][f'screen-{n.lower()}'] = {**rec, 'from': f'site/images/{n}.gif'}
# TapText's menus and options are partial screenshots on its product page
for n in ('ttmc', 'tto'):
    im = Image.open(f'{SITE}/{n}.gif').convert('RGB')
    rec = save(im.resize((im.width * 2, im.height * 2), Image.NEAREST), f'screens/{n}.webp')
    man['images'][f'screen-{n}'] = {**rec, 'from': f'site/images/{n}.gif'}

# 5. Press captures. Blur: the contact email line in the 2003 to 2005 magazine entries (DinarSoft's free-mail address).
# Trim: keep the praise and leave out the rest of a paragraph.
def email_line(im):
    g = im.convert('L'); px = g.load(); w, h = g.size
    rows = [sum(1 for x in range(8, min(470, w)) if px[x, y] < 120) for y in range(h)]
    bands, s = [], None
    for y, d in enumerate(rows + [0]):
        if d and s is None: s = y
        if not d and s is not None: bands.append((s, y - 1)); s = None
    return bands[-2]  # Developer / Email / Web: the email is second to last
def blur(im, box):
    x0, y0, x1, y1 = box
    region = im.crop(box)
    small = region.resize((max(1, (x1 - x0) // 8), max(1, (y1 - y0) // 8)), Image.BILINEAR).resize(region.size, Image.NEAREST)
    im.paste(small.filter(ImageFilter.GaussianBlur(4)), box)
    return im

meta = {m['file']: m for m in json.load(open(f'{CAP}/manifest.json'))}
EMAIL = ['tp-2003-ppcmag-nominations--handymenu'] + [f'tp-{y}-ppcmag-nominations--{a}' for y, apps in (('2004', 'memmaid handymenu handyswitcher'), ('2005', 'memmaid handymenu handyswitcher taptext')) for a in apps.split()]
TRIM = {
    'tp-2007-08-gadgeteer-taptext--verdict': (0, 0, None, 78),
    'tp-2007-gadgetmix-handymenu--verdict': (0, 0, 308, None),
    'tp-2006-06-treocentral-shootout--dinarsoft': (0, 0, None, 274),
}
PRESS = EMAIL + [
    'tp-2005-smartphonemag-winners--memmaid', 'tp-2006-smartphonemag-winners--memmaid',
    *[f'tp-2006-ppcmag-nominations--{a}' for a in 'memmaid handymenu handyswitcher taptext'.split()],
    *[f'tp-2007-ppcmag-nominations--{a}' for a in 'memmaid handymenu handyswitcher taptext handylauncher'.split()],
    *[f'tp-2007-smartphonemag-winners--{a}' for a in 'memmaid handyswitcher taptext'.split()],
    *[f'tp-2008-smartphonemag-winners-p2--{a}' for a in 'memmaid handymenu handyswitcher taptext handylauncher'.split()],
    'tp-2006-10-tucows-favorite--headline',
    'tp-2004-07-geekzone-memmaid--headline', 'tp-2004-07-pocketpcdubai-memmaid--headline', 'tp-2004-09-emobie-memmaid--headline',
    'tp-2004-09-emobie-memmaid--verdict', 'tp-2004-11-pocketpcreviews-memmaid--verdict', 'tp-2005-01-pocketnow-memmaid--headline',
    'tp-2005-06-pda247-memmaid--headline', 'tp-2006-07-jamm-memmaid--headline', 'tp-2006-09-tucows-memmaid--verdict',
    'tp-2007-01-pocketland-net-memmaid--headline', 'tp-2007-01-technologyatplay-memmaid--headline', 'tp-2007-gadgetmix-memmaid--headline',
    'tp-2007-05-clintonfitch-memmaid--headline', 'tp-2007-07-mobileview-memmaid--headline', 'tp-2007-09-jamm-memmaid2-vs-sktools--headline',
    'tp-2007-09-etenblog-memmaid--headline', 'tp-2007-09-etenblog-memmaid--verdict', 'tp-2007-10-aximsite-memmaid2--headline',
    'tp-2007-10-aximsite-memmaid2--rating', 'tp-2007-mypdacafe-memmaid--headline', 'tp-2009-01-windowscentral-memmaid--headline',
    'tp-2004-04-pocketpclife-handymenu--headline', 'tp-2004-04-pocketpclife-handymenu--rating', 'tp-2004-07-geekzone-handymenu--headline',
    'tp-2004-09-ppcthoughts-handymenu--headline', 'tp-2007-gadgetmix-handymenu--headline', 'tp-2007-gadgetmix-handymenu--verdict',
    'tp-2004-04-pocketpclife-handyswitcher--headline', 'tp-2004-04-pocketpclife-handyswitcher--rating', 'tp-2006-03-pdablast-handyswitcher--headline',
    'tp-2006-06-treocentral-shootout--headline', 'tp-2006-06-treocentral-shootout--dinarsoft', 'tp-2007-gadgetmix-handyswitcher--headline',
    'tp-2007-gadgetmix-handyswitcher--verdict', 'tp-2007-06-gadgetmix-handyswitcher3--verdict',
    'tp-2005-03-aximsite-taptext--headline', 'tp-2005-04-ppcthoughts-taptext--headline', 'tp-2006-08-ppcthoughts-taptext--headline',
    'tp-2007-08-gadgeteer-taptext--headline', 'tp-2007-08-gadgeteer-taptext--verdict', 'tp-2007-12-etenblog-taptext--headline',
    'tp-chip-2006-06--entry', 'tp-chip-2007-05--entry', 'tp-chip-2008-06--entry', 'tp-chip-2008-09--entry',
]
assert len(PRESS) == len(set(PRESS))
for n in PRESS:
    m = meta[f'{n}.png']
    im = Image.open(f'{CAP}/{n}.png').convert('RGB')
    done = []
    if n in EMAIL:
        y0, y1 = email_line(im)
        blur(im, (0, max(0, y0 - 3), im.width, min(im.height, y1 + 4)))
        done.append(f'contact email line blurred (rows {y0 - 3} to {y1 + 4})')
    if n in TRIM:
        x0, y0, x1, y1 = TRIM[n]
        im = im.crop((x0, y0, x1 or im.width, y1 or im.height))
        done.append(f'trimmed to {im.width}x{im.height}')
    rec = save(im, f'press/{n}.webp')
    man['images'][n] = {**rec, 'from': f'captures/{n}.png', 'owner': m['owner'], 'shows': m['shows'],
                        'wayback': m['wayback_url'], 'timestamp': m['timestamp'], 'edits': done}

# 6. DinarSoft's home page before and after the November 2006 relaunch, and a home-page banner
for n in ('ds-2006-05-home-frames', 'ds-2006-home-relaunch'):
    m = meta[f'{n}.png']
    im = Image.open(f'{CAP}/{n}.png').convert('RGB')
    rec = save(im, f'site/{n}.webp', lossless=False)
    save(im.resize((640, 450), Image.LANCZOS), f'site/{n}-640.webp', lossless=False)
    man['images'][n] = {**rec, 'from': f'captures/{n}.png', 'owner': 'DinarSoft', 'shows': m['shows'], 'wayback': m['wayback_url'],
                        'timestamp': m['timestamp'], 'edits': ['none (checked: no address, phone or email on the page)']}
rec = save(Image.open(f'{SITE}/banners/banneri84.jpg').convert('RGB'), 'site/banner.webp', lossless=False, q=85)
man['images']['banner'] = {**rec, 'from': 'site/images/banners/banneri84.jpg'}

# 7. The logo before November 2006, recovered from inside the installers (BRAND.md had it as lost). HijriDate 1.5's
# Today plug-in keeps it in 24-bit color: bitmap 162 (DiNAR and a globe) and 157 (its Arabic twin). MemMaid 1.5a and
# 1.72 carry the same logo as bitmap 108, reduced to 256 colors. Read from the CAB as data; published pixel for pixel.
import io, struct, pefile
with tempfile.TemporaryDirectory() as t:
    subprocess.run(['7zz', 'e', '-y', f'-o{t}', f'{R}/downloads/DinarSoftHijriDate15.CAB', 'HIJRIP~1.001'], check=True, capture_output=True)
    pe = pefile.PE(f'{t}/HIJRIP~1.001')
    bm = {n.id: n.directory.entries[0].data.struct for e in pe.DIRECTORY_ENTRY_RESOURCE.entries if e.id == 2 for n in e.directory.entries}
    for rid, name in ((162, 'logo-2005.webp'), (157, 'logo-2005-ar.webp')):
        d = pe.get_data(bm[rid].OffsetToData, bm[rid].Size)
        hs, bpp, clr = struct.unpack_from('<I', d)[0], struct.unpack_from('<H', d, 14)[0], struct.unpack_from('<I', d, 32)[0]
        ncol = clr or (1 << bpp if bpp <= 8 else 0)
        im = Image.open(io.BytesIO(b'BM' + struct.pack('<IHHI', 14 + len(d), 0, 0, 14 + hs + 4 * ncol) + d)).convert('RGB')
        im.save(f'{OUT}/{name}', lossless=True, quality=100, method=6)
        assert Image.open(f'{OUT}/{name}').convert('RGB').tobytes() == im.tobytes()
        man['images'][name[:-5]] = {'src': f'dinarsoft/{name}', 'w': im.width, 'h': im.height, 'bytes': os.path.getsize(f'{OUT}/{name}'),
                                    'from': f'downloads/DinarSoftHijriDate15.CAB, HIJRIP~1.001 (the Today plug-in), bitmap {rid}, {bpp}-bit', 'edits': ['none, lossless WebP']}

json.dump(man, open(f'{OUT}/manifest.json', 'w'), indent=1)
tot = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(OUT) for f in fs)
print(f"{len(man['downloads'])} installers, {len(man['images'])} images, {tot / 1e6:.2f} MB in {OUT}")
