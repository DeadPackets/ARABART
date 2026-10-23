# Share cards (1200 x 630) for every page in the sitemap, rendered from the built site into public/og/<slug>.png.
# The Arabic is his engine's own render, taken from the home page's 2D canvas. After a build, with the preview up:
#   npx astro preview --port 4321 &   uv run -q --with playwright python -I scripts/og/cards.py [SITE]
import pathlib, re, sys
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
SITE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:4321'
OUT = ROOT / 'public/og'
OUT.mkdir(exist_ok=True)
APPS = {i: dict(name=n, pre=a, post=b, slogan=s) for i, n, a, b, s in re.findall(
    r"id: '([a-z]+)', name: '([^']+)', pre: '([^']+)', post: '([^']+)', slogan: '([^']+)'", (ROOT / 'src/data/dinarsoft.ts').read_text())}
paths = [re.sub(r'^https?://[^/]+', '', u) for u in re.findall(r'<loc>([^<]+)</loc>', (ROOT / 'dist/sitemap.xml').read_text())]
local = lambda u: re.sub(r'^https?://[^/]+', SITE, u)
slug = lambda p: p.strip('/').replace('/', '-') or 'home'


def kind(p):
    if p == '/': return 'home'
    if p.startswith('/program/'): return 'dos'
    if p == '/dinarsoft/': return 'hub'
    return 'app' if p.startswith('/dinarsoft/') else 'sec'


READ = """() => {
  const q = s => document.querySelector(s);
  const ld = JSON.parse(q('script[type="application/ld+json"]').textContent)['@graph'].find(n => n.primaryImageOfPage);
  return { h1: q('h1')?.innerText.trim(), when: q('.ph .when')?.innerText.trim(), desc: q('meta[name=description]').content,
    screen: ld?.primaryImageOfPage, logo: q('.dsh-h1 img')?.src, big: q('.dsh-big')?.innerText.trim() };
}"""

with sync_playwright() as pw:
    # WebGL off, so the hero draws with its 2D canvas: his pixels on a transparent background
    b = pw.chromium.launch(channel='chrome', args=['--disable-webgl', '--disable-3d-apis', '--allow-file-access-from-files'])
    pg = b.new_page(viewport={'width': 1600, 'height': 900})
    pg.goto(SITE + '/'); pg.wait_for_selector('.stage-2d:not([hidden])'); pg.wait_for_timeout(1500)
    arabic = pg.evaluate("() => document.querySelector('.stage-2d').toDataURL('image/png')")
    card = b.new_page(viewport={'width': 1200, 'height': 630})
    card.goto((ROOT / 'scripts/og/card.html').as_uri())
    for p in paths:
        pg.goto(SITE + p); d = pg.evaluate(READ)
        k = kind(p)
        d.update(kind=k, arabic=arabic, screen=local(d['screen'] or ''), logo=local(d['logo'] or ''))
        d['lede'] = re.split(r'(?<=\.)\s', d['desc'])[0]
        if k == 'dos':
            d['year'], d['path'] = d['when'].split(' · ', 1)
        if k == 'app':
            a = p.strip('/').split('/')[1]
            d.update(APPS[a], icon=f'{SITE}/dinarsoft/icons/{a}.webp')
        if k == 'hub':
            d['apps'] = [dict(v, icon=f'{SITE}/dinarsoft/icons/{i}.webp') for i, v in APPS.items()]
        card.evaluate('d => fill(d)', d)
        card.locator('#card').screenshot(path=str(OUT / f'{slug(p)}.png'))
        print(f'{k:4} {slug(p)}')
    b.close()
