# E2E for the home page's two pickers and the program pages' key bar, at desktop and phone width, with and without
# reduced motion. Writes a screenshot per app and width plus home.json to research/e2e/out/.
#   uv run -q --with playwright python -I research/e2e/home.py [SITE]   (SITE default: the dev server on :4322)
import json, pathlib, sys
from playwright.sync_api import sync_playwright

SITE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:4322'
OUT = pathlib.Path(__file__).parent / 'out'
OUT.mkdir(exist_ok=True)
APPS = ['memmaid', 'handyswitcher', 'handymenu', 'handylauncher', 'taptext', 'hijridate']
NOISE = ('AudioContext', 'WebGL', 'GPU stall', 'favicon', 'Autoplay', 'deprecated')
results = []

def check(tag, name, ok, note=''):
    results.append({'tag': tag, 'check': name, 'ok': bool(ok), 'note': str(note)[:160]})
    print('PASS' if ok else 'FAIL', f'[{tag}]', name, f'({note})' if note and not ok else '')

with sync_playwright() as p:
    b = p.chromium.launch(channel='chrome')
    for w, h, rm in [(1440, 900, False), (390, 844, False), (390, 844, True)]:
        tag = f'{w}{"-rm" if rm else ""}'
        ctx = b.new_context(viewport={'width': w, 'height': h}, is_mobile=w < 500, has_touch=w < 500, reduced_motion='reduce' if rm else 'no-preference')
        pg = ctx.new_page()
        errs = []
        pg.on('console', lambda m: m.type == 'error' and not any(n in m.text for n in NOISE) and errs.append(m.text[:160]))
        pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:160]))
        pg.goto(f'{SITE}/', wait_until='load')
        pg.wait_for_timeout(1200)

        # Program Manager: the balloon points at the icons and leaves after the first click
        tip = pg.locator('.pm-wrap [data-balloon]')
        pg.locator('#sakhr').evaluate('e => e.scrollIntoView()'); pg.wait_for_timeout(1300)
        check(tag, 'the Click me balloon shows on the Program Manager', tip.is_visible())
        pg.locator('#sk-t-api').click(); pg.wait_for_timeout(500)
        check(tag, 'a click on an icon, even under the balloon, opens its window and the balloon leaves', pg.locator('#sk-p-api').is_visible() and not tip.is_visible())

        # Solution Explorer: every project runs its own live remake on the device, with its Properties
        sol = pg.locator('[data-dse]')
        sol.evaluate('e => e.scrollIntoView()'); pg.wait_for_timeout(600)
        check(tag, 'the Solution Explorer balloon shows', pg.locator('.dse-tree-wrap [data-balloon]').is_visible())
        for app in APPS:
            if app != 'memmaid': pg.locator(f'#dse-t-{app}').click(); pg.wait_for_timeout(700)
            pane = pg.locator(f'#dse-p-{app}')
            live = pane.locator('.dse-live')
            box = live.bounding_box() if live.count() else None
            check(tag, f'{app}: its live remake is on the device', pane.is_visible() and box and box['width'] > 200 and box['height'] > 300, box)
            check(tag, f'{app}: no screenshot carousel instead', pane.locator('.dsd').count() == 0)
            check(tag, f'{app}: Properties names it', app.lower() in (pane.locator('.dse-word').text_content() or '').lower())
            if not rm: pane.screenshot(path=str(OUT / f'home-{app}-{tag}.png'))
        check(tag, 'only the picked project is shown', pg.locator('.dse-pane:visible').count() == 1)
        check(tag, 'no horizontal overflow', pg.evaluate('document.documentElement.scrollWidth') <= w, pg.evaluate('document.documentElement.scrollWidth'))
        check(tag, 'no console errors on the home page', not errs, errs)

        # A program page ends with Previous and Next, and no longer repeats the fifteen-program panels
        errs.clear()
        pg.goto(f'{SITE}/program/taher/', wait_until='load'); pg.wait_for_timeout(800)
        nav = pg.locator('nav.nc-keys')
        check(tag, 'a program page has Previous and Next', nav.locator('a[rel="prev"]').count() == 1 and nav.locator('a[rel="next"]').count() == 1)
        check(tag, 'a program page has no program panels at the end', pg.locator('#programs').count() == 0)
        nxt = nav.locator('a[rel="next"]').get_attribute('href')
        nav.locator('a[rel="next"]').click(); pg.wait_for_load_state('load')
        check(tag, 'Next goes to the next program', pg.url.endswith(nxt), pg.url)
        check(tag, 'no console errors on the program pages', not errs, errs)
        ctx.close()
    b.close()

fails = [r for r in results if not r['ok']]
(OUT / 'home.json').write_text(json.dumps({'checks': len(results), 'fails': len(fails), 'results': results}, indent=1))
print(f'{len(results) - len(fails)}/{len(results)} checks passed')
sys.exit(1 if fails else 0)
