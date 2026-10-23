# SEO check of the built site: every page in dist/ has a unique title and description of sane length, one h1, a canonical
# URL that matches its path, Open Graph tags, valid JSON-LD, alt on every image and a lang on Arabic text. The sitemap
# lists every indexable page and nothing else. Writes research/e2e/out/seo.json.
#   python3 -I research/e2e/seo.py [DIST]
import json, pathlib, re, sys
from html.parser import HTMLParser

DIST = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'dist')
SITE = 'https://arabart.deadpackets.pw'
ARABIC = re.compile('[؀-ۿ]')

VOID = {'meta', 'link', 'img', 'br', 'input', 'source', 'hr', 'wbr', 'area', 'col', 'embed', 'param', 'track', 'base'}

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.meta, self.links, self.h1, self.imgs, self.ld, self.title = {}, {}, 0, [], [], ''
        self.stack, self.body, self.bare_arabic = [], False, []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'body': self.body = True
        if tag not in VOID: self.stack.append((tag, a.get('lang'), a.get('type')))
        if tag == 'meta': self.meta[a.get('name') or a.get('property')] = a.get('content')
        if tag == 'link' and a.get('rel'): self.links[a['rel']] = a.get('href')
        if tag == 'h1': self.h1 += 1
        if tag == 'img': self.imgs.append(a)
    def handle_endtag(self, tag):
        if any(t == tag for t, _, _ in self.stack):
            while self.stack and self.stack.pop()[0] != tag: pass
    def handle_data(self, data):
        top = self.stack[-1] if self.stack else ('', None, None)
        if top[0] == 'title' and not self.body: self.title += data
        if top[0] == 'script' and top[2] == 'application/ld+json': self.ld.append(data)
        if top[0] in ('script', 'style', 'title'): return
        if ARABIC.search(data) and not any(l and l.startswith('ar') for _, l, _ in self.stack): self.bare_arabic.append(data.strip()[:60])

results = []
def check(page, name, ok, note: object = ''):
    results.append({'page': page, 'check': name, 'ok': bool(ok), 'note': str(note)[:200]})
    if not ok: print('FAIL', page, name, note)

pages, titles, descs = {}, {}, {}
for f in sorted(DIST.rglob('index.html')):
    rel = f.parent.relative_to(DIST).as_posix()
    path = '/' + ('' if rel == '.' else rel + '/')
    if 'http-equiv="refresh"' in f.read_text()[:600]: continue
    p = Page(); p.feed(f.read_text()); pages[path] = p
for path, p in pages.items():
    t, d = p.title.strip(), p.meta.get('description') or ''
    titles.setdefault(t, []).append(path); descs.setdefault(d, []).append(path)
    check(path, 'title is 15 to 65 characters', 15 <= len(t) <= 65, f'{len(t)}: {t}')
    check(path, 'description is 70 to 200 characters', 70 <= len(d) <= 200, f'{len(d)}: {d}')
    check(path, 'one h1', p.h1 == 1, p.h1)
    check(path, 'canonical is this page', p.links.get('canonical') == SITE + path, p.links.get('canonical'))
    check(path, 'Open Graph title, description, image and url', all(p.meta.get(k) for k in ('og:title', 'og:description', 'og:image', 'og:url')))
    check(path, 'og:image is an absolute URL to a built file', (p.meta.get('og:image') or '').startswith(SITE + '/') and (DIST / p.meta['og:image'][len(SITE + '/'):]).is_file(), p.meta.get('og:image'))
    try:
        graph = json.loads(''.join(p.ld))['@graph']; types = [n['@type'] for n in graph]
        check(path, 'JSON-LD parses, with WebSite, Person and a page node', {'WebSite', 'Person'} <= set(types) and len(types) >= 3, types)
    except Exception as e:
        check(path, 'JSON-LD parses, with WebSite, Person and a page node', False, e)
    check(path, 'every image has alt (empty for decoration)', all('alt' in i for i in p.imgs), [i.get('src') for i in p.imgs if 'alt' not in i][:3])
    check(path, 'Arabic text has lang="ar"', not p.bare_arabic, p.bare_arabic[:3])
for t, ps in titles.items(): check(ps[0], 'title is unique', len(ps) == 1, ps)
for d, ps in descs.items(): check(ps[0], 'description is unique', len(ps) == 1, ps)

sm = (DIST / 'sitemap.xml').read_text()
locs = set(re.findall(r'<loc>([^<]+)</loc>', sm))
want = {SITE + p for p, pg in pages.items() if pg.meta.get('robots') != 'noindex' and p != '/404/'}
check('sitemap.xml', 'lists every indexable page and nothing else', locs == want, {'missing': sorted(want - locs), 'extra': sorted(locs - want)})
check('robots.txt', 'names the sitemap', (DIST / 'robots.txt').is_file() and f'Sitemap: {SITE}/sitemap.xml' in (DIST / 'robots.txt').read_text())
check('404', 'the 404 page is noindex', (DIST / '404.html').is_file() and 'name="robots" content="noindex"' in (DIST / '404.html').read_text())

fails = [r for r in results if not r['ok']]
out = pathlib.Path(__file__).parent / 'out'; out.mkdir(exist_ok=True)
(out / 'seo.json').write_text(json.dumps({'pages': len(pages), 'checks': len(results), 'fails': len(fails), 'results': results}, indent=1, ensure_ascii=False))
print(f'{len(pages)} pages, {len(results) - len(fails)}/{len(results)} checks passed')
sys.exit(1 if fails else 0)
