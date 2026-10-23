# E2E crawl of the built site (astro preview on :4321): every route at desktop and phone width.
# Checks HTTP status, console errors, horizontal overflow, broken internal links and missing images;
# writes a screenshot per route and width plus results.json to research/e2e/out/.
#   npx astro build && npx astro preview --port 4321 &   then:   uv run -q --with playwright python -I research/e2e/crawl.py
import json, pathlib, re, urllib.request
from playwright.sync_api import sync_playwright

SITE = 'http://localhost:4321/ARABART'
OUT = pathlib.Path(__file__).parent / 'out'
OUT.mkdir(exist_ok=True)
DIST = pathlib.Path(__file__).resolve().parents[2] / 'dist'
routes = sorted('/' + str(p.parent.relative_to(DIST)).replace('.', '') for p in DIST.rglob('index.html'))
routes = [r if r.endswith('/') else r + '/' for r in routes]
# js-dos and WebGL emit warnings we do not control; only real errors count
NOISE = re.compile(r'AudioContext|WebGL|GPU stall|favicon|Autoplay|ERR_BLOCKED_BY_CLIENT|deprecated', re.I)

results, links = [], set()
with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome')
    for w, h, tag in [(1440, 900, 'd'), (390, 844, 'p')]:
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1)
        for r in routes:
            pg = ctx.new_page()
            errs = []
            pg.on('console', lambda m: m.type == 'error' and not NOISE.search(m.text) and errs.append(m.text[:200]))
            pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:200]))
            resp = pg.goto(SITE + r, wait_until='load')
            pg.wait_for_timeout(1200)
            info = pg.evaluate("""() => ({
              overflow: document.documentElement.scrollWidth - innerWidth,
              brokenImgs: [...document.images].filter(i => i.complete && !i.naturalWidth && !i.loading?.includes('lazy')).map(i => i.src),
              links: [...document.querySelectorAll('a[href]')].map(a => new URL(a.getAttribute('href'), location.href).href).filter(h => h.startsWith(location.origin) && h.includes('/ARABART')),
              terms: document.querySelectorAll('.term').length,
              steps: document.querySelectorAll('[data-steps]').length,
            })""")
            links.update(l.split('#')[0] for l in info.pop('links'))
            name = (r.strip('/') or 'home').replace('/', '_')
            pg.screenshot(path=str(OUT / f'{name}-{tag}.png'))
            ok = resp.status == 200 and not errs and info['overflow'] <= 0 and not info['brokenImgs']
            results.append({'route': r, 'width': w, 'status': resp.status, 'errors': errs, **info, 'ok': ok})
            print('PASS' if ok else 'FAIL', tag, r, '' if ok else json.dumps({'status': resp.status, 'errors': errs, **info})[:300])
            pg.close()
        ctx.close()
    b.close()

bad_links = []
for l in sorted(links):
    try: urllib.request.urlopen(urllib.request.Request(l, method='HEAD'))
    except Exception as e: bad_links.append(f'{l} {e}')
print(f'{len(links)} internal links, {len(bad_links)} broken', *bad_links[:10], sep='\n')
passed = sum(r['ok'] for r in results)
(OUT / 'results.json').write_text(json.dumps({'passed': passed, 'total': len(results), 'bad_links': bad_links, 'results': results}, indent=1))
print(f'{passed}/{len(results)} page checks passed')
