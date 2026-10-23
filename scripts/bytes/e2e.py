# E2E for /bytes/ and BytesMap: drives the dev server in headless Chrome over CDP (real time, no virtual time)
# and checks what each interaction changes. Writes screenshots plus results.json to $EB_OUT.
#   uv run --quiet --with websockets python -I scripts/bytes/e2e.py
import asyncio, base64, hashlib, json, os, pathlib, re, subprocess, sys, tempfile, time, urllib.request
import websockets

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import avscan  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
SITE = os.environ.get('EB_SITE', 'http://localhost:4322/ARABART')
OUT = pathlib.Path(os.environ.get('EB_OUT', tempfile.mkdtemp(prefix='eb-e2e-')))
OUT.mkdir(parents=True, exist_ok=True)
CH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
PRIVATE = [rb'\(\d\d\) ?\d{3}-\d{3,}', rb'\d{3}-\d{3,}', rb'w>f> \d+']
# Literal numbers kept out of the source: digit runs of these lengths whose SHA-256 matches are leaks too
PRIVATE_SHA = {(6, '4071613614586d7e0b83d4d10a0c901179a8c845ff115ede98d65357afc5110a'), (6, '94b956fbe1a7665823589a9491e86ae24dbc395ee50cd8c272dd132c4595ac33'), (6, 'd864f8fd8f76e61708f3213689b5f6c7442a56c6c6adf2dddc8aadc932e0fced'), (6, 'da1cd0af7479d3397d6b1b195ce13171fce89ecd4d4adddfbf8f887de1dedf8f')}
def sha_leak(b):
    return any(hashlib.sha256(m.group(1)).hexdigest() == h for l, h in PRIVATE_SHA for m in re.finditer(rb'(?=(\d{%d}))' % l, b))

results = []


def check(name, ok, got):
    results.append({'name': name, 'ok': bool(ok), 'got': str(got)[:300]})
    print('PASS' if ok else 'FAIL', name, '->', str(got)[:160])


# Privacy: no published byte or label may hold the personal numbers (both layers, code listings, metadata)
leaks = [(p.name, pat.decode()) for p in (ROOT / 'public/bytes').rglob('*') if p.is_file() for pat in PRIVATE if re.search(pat, p.read_bytes())]
leaks += [(p.name, 'sha') for p in (ROOT / 'public/bytes').rglob('*') if p.is_file() and sha_leak(p.read_bytes())]
check('no personal numbers in public/bytes', not leaks, leaks)
# Antivirus safety: Koko's signature (KVC's own table) never sits in plain form in a hosted file
hits = avscan.scan('public')
check('no Koko signature run in public/', not hits, hits)

chrome = subprocess.Popen([CH, '--headless=new', '--remote-debugging-port=9335', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
                           '--window-size=1440,900', '--hide-scrollbars', f'--user-data-dir={tempfile.mkdtemp()}', 'about:blank'], stderr=subprocess.DEVNULL)
for _ in range(50):
    try: tabs = json.load(urllib.request.urlopen('http://127.0.0.1:9335/json')); break
    except Exception: time.sleep(0.2)
WS = [t for t in tabs if t['type'] == 'page'][0]['webSocketDebuggerUrl']


async def main():
    async with websockets.connect(WS, max_size=50_000_000) as ws:
        n = 0; errs = []; pending = {}
        # Other writers' saves make the dev server reload open pages: answer Vite's client module with a quiet stub
        STUB = base64.b64encode(b"export const createHotContext = () => ({ accept() {}, dispose() {}, prune() {}, invalidate() {}, on() {}, off() {}, send() {}, data: {} });"
                                b"export const updateStyle = (id, css) => { let s = document.querySelector(`style[data-vite-dev-id='${id}']`);"
                                b"if (!s) { s = document.createElement('style'); s.setAttribute('data-vite-dev-id', id); document.head.append(s); } s.textContent = css; };"
                                b"export const removeStyle = () => {}; export const injectQuery = u => u; export class ErrorOverlay {};").decode()

        async def reader():
            async for raw in ws:
                r = json.loads(raw)
                if r.get('id') in pending: pending.pop(r['id']).set_result(r.get('result', {})); continue
                m = r.get('method')
                if m == 'Fetch.requestPaused':
                    await ws.send(json.dumps({'id': 0, 'method': 'Fetch.fulfillRequest', 'params': {'requestId': r['params']['requestId'], 'responseCode': 200,
                                  'responseHeaders': [{'name': 'Content-Type', 'value': 'application/javascript'}], 'body': STUB}}))
                if m == 'Runtime.exceptionThrown':
                    d = r['params']['exceptionDetails']; errs.append((d.get('exception', {}).get('description') or d.get('text'))[:300])
                if m == 'Runtime.consoleAPICalled' and r['params']['type'] == 'error':
                    errs.append(' '.join(str(a.get('value', a.get('description'))) for a in r['params']['args'])[:300])
        asyncio.get_running_loop().create_task(reader())

        async def cmd(m, **params):
            nonlocal n; n += 1; i = n
            fut = asyncio.get_running_loop().create_future(); pending[i] = fut
            await ws.send(json.dumps({'id': i, 'method': m, 'params': params}))
            return await fut

        async def ev(js):
            return (await cmd('Runtime.evaluate', expression=js, returnByValue=True, awaitPromise=True))['result'].get('value')

        async def go(url, wait=3.5):
            await cmd('Page.navigate', url=url); await asyncio.sleep(wait); await ev('window.__mark = 1')

        async def shot(name):
            d = await cmd('Page.captureScreenshot', format='png'); (OUT / f'{name}.png').write_bytes(base64.b64decode(d['data']))

        async def key(k, code=None, vk=0):
            await cmd('Input.dispatchKeyEvent', type='keyDown', key=k, code=code or k, text=k if len(k) == 1 else '', windowsVirtualKeyCode=vk)
            await cmd('Input.dispatchKeyEvent', type='keyUp', key=k, code=code or k, windowsVirtualKeyCode=vk)

        crumbs = lambda: ev("[...document.querySelectorAll('.bx-crumbs button')].map(b=>b.textContent).join(' > ')")
        head = lambda: ev("document.querySelector('.bx-p-head h2')?.textContent || ''")
        await cmd('Runtime.enable'); await cmd('Page.enable')
        await cmd('Fetch.enable', patterns=[{'urlPattern': '*/@vite/client*'}])

        async def block(fn):
            # other writers' file saves make the dev server reload the page; rerun a step group when that happens
            for attempt in range(4):
                k = len(results); await fn()
                if await ev('window.__mark') == 1 or attempt == 3: return
                del results[k:]; print('  dev server reloaded the page, rerunning', fn.__name__)

        async def load_zoom_layers():
            # 1. load: whole archive, labels placed, no errors
            await go(f'{SITE}/bytes/')
            await ev("document.querySelector('.bx').scrollIntoView()"); await asyncio.sleep(1.2)
            check('loads at All files', await crumbs() == 'All files', await crumbs())
            labels = await ev("document.querySelectorAll('.bx-tl.on').length")
            check('file labels placed', labels >= 12, labels)
            check('WebGL map is live', await ev("document.querySelector('.bx').classList.contains('has-gl')"), 'has-gl')
            await shot('1-all-files')

            # 2. wheel zoom into the biggest file (DIGI_T MAIN.EXE)
            x, y = await ev("(()=>{const r=[...document.querySelectorAll('.bx-tl.on')].find(b=>b.textContent.startsWith('MAIN.EXE')).getBoundingClientRect();return [r.left+120,r.bottom+60]})()")
            for _ in range(7):
                await cmd('Input.dispatchMouseEvent', type='mouseWheel', x=x, y=y, deltaX=0, deltaY=-120); await asyncio.sleep(0.05)
            await asyncio.sleep(1.2)
            c = await crumbs(); check('wheel zooms into a file', c.startswith('All files > MAIN.EXE'), c)

            # 3. layer switch: button, URL, panel; L key toggles back
            await ev("document.querySelector('[data-set-layer=disk]').click()"); await asyncio.sleep(1.6)
            url = await ev('location.search')
            check('On disk button switches layer and URL', 'layer=disk' in url, url)
            regs = await ev("[...document.querySelectorAll('.bx-regs b')].map(b=>b.textContent).join(' | ')")
            check('disk layer lists DIET regions', 'Packed program' in regs and 'DIET unpacker' in regs, regs)
            await shot('2-main-disk')
            await ev("document.querySelector('.bx-map').focus()"); await key('l', 'KeyL', 76); await asyncio.sleep(1.6)
            check('L key switches back to memory', await ev("document.querySelector('.bx').dataset.layer") == 'memory', await ev("document.querySelector('.bx').dataset.layer"))

        await block(load_zoom_layers)

        async def sun_deep_link():
            # 4. deep link to a byte: level, region, byte inspector
            await go(f'{SITE}/bytes/?f=SUN_SUN.EXE&layer=memory&at=1b70')
            c = await crumbs(); check('deep link lands on the region at that byte', c == 'All files > SUN.EXE > Borland C++ startup (c0)', c)
            b = await ev("document.querySelector('.bx-p-byte').innerText")
            check('byte inspector shows that byte', 'BAh' in b and '01B70' in b, b.replace('\n', ' '))
            lk = await ev("document.querySelector('.bx-p-head .bx-go')?.getAttribute('href')")
            check('region links to its writeup section', bool(re.fullmatch(r'/ARABART/program/brave-sun/#[\w-]+', lk or '')), lk)

            # 5. ladder to Code: an instruction is under the camera
            await ev("document.querySelector('.bx-ladder [data-go=code]').click()"); await asyncio.sleep(2.6)
            ins = await ev("document.querySelector('.bx-ins')?.textContent || ''")
            check('Code level shows a disassembled instruction', bool(re.match(r'[a-z]{2,6}\b', ins)), ins)
            await shot('3-sun-code')

            # 6. Escape climbs back to the file
            await ev("document.querySelector('.bx-map').focus()"); await key('Escape', 'Escape', 27); await asyncio.sleep(0.2)
            await key('Escape', 'Escape', 27); await asyncio.sleep(2.4)
            c = await crumbs(); check('Escape climbs to the file level', c == 'All files > SUN.EXE', c)

            # 7. picking a region in the panel pins it
            await ev("[...document.querySelectorAll('.bx-regs button')].find(b=>b.textContent.includes('Cycle of life')).click()"); await asyncio.sleep(2.4)
            h = await head(); check('panel region button opens that region', h.startswith('Cycle of life'), h)

            # 8. "Only Yasser's code" filter
            await ev("document.querySelector('.bx-onlyhis input').click()"); await asyncio.sleep(0.8)
            await shot('4-sun-only-his')
            await ev("document.querySelector('.bx-onlyhis input').click()")

        await block(sun_deep_link)

        async def contract():
            # writeups may write at= with or without 0x; an unknown file falls back to the overview
            await go(f'{SITE}/bytes/?f=KVC_KVC.EXE&layer=memory&at=0x40')
            b = await ev("document.querySelector('.bx-p-byte').innerText")
            check('at= accepts a 0x prefix', 'file offset 00040' in b, b.replace('\n', ' '))
            check('scrambled KVC bytes read back true (first instruction BAh)', b.startswith('BAh'), b.replace('\n', ' '))
            await go(f'{SITE}/bytes/?f=NOPE.EXE&layer=memory&at=10')
            c = await crumbs(); check('unknown f= falls back to All files', c == 'All files', c)
        await block(contract)

        async def privacy():
            # 9. privacy in the live page: KVC phone bytes read as hidden
            await go(f'{SITE}/bytes/?f=KVC_KVC.EXE&layer=memory&at=1d9f')
            b = await ev("document.querySelector('.bx-p-byte').innerText")
            check('KVC phone byte is hidden in the inspector', 'Hidden' in b, b.replace('\n', ' '))

        await block(privacy)

        async def automatic():
            # 10. the panel says where the map came from (all 17 files now have an authored anatomy)
            await go(f'{SITE}/bytes/?f=KVC_KVC.EXE&layer=memory')
            src = await ev("document.querySelector('.bx-src')?.textContent || ''")
            check('an authored map names its source', src.startswith('Mapped by hand'), src)
            await shot('5-kvc-memory')

        await block(automatic)

        async def annotated():
            # 10b. annotated routine lines: the panel lists them, a click flies to the instruction and shows its note
            await go(f'{SITE}/bytes/?f=NAMES_NAMES.COM&layer=memory&at=7a4')
            await ev("document.querySelector('.bx-lines [data-off=\"1956\"]').click()"); await asyncio.sleep(2.8)
            note = await ev("document.querySelector('.bx-callout.on')?.textContent || ''")
            check('annotated line shows its note on the map', note.startswith('cmp al, 37h;') and len(note.split(';', 1)[1].strip()) > 3, note)
            await shot('5b-names-annotated-line')

        await block(annotated)

        async def bytesmap():
            # 11. BytesMap on a program page: links use the documented deep-link format and land on that region
            await go(f'{SITE}/program/brave-sun/', 3)
            maps = await ev("document.querySelectorAll('#bytes .bm-win').length")
            check('brave-sun shows SUN.EXE and ARAB-ART.EXE', maps == 2, maps)
            hrefs = await ev("[...document.querySelectorAll('#bytes .bm-top a')].map(a=>a.getAttribute('href'))")
            bad = [u for u in hrefs if not re.fullmatch(r'/ARABART/bytes/\?f=[A-Z_\-.]+&layer=(memory|disk)&at=[0-9a-f]+', u)]
            check('BytesMap links match the deep-link format', hrefs and not bad, bad or len(hrefs))
            label = await ev("document.querySelector('#bytes .bm-top .t').textContent")
            await ev("document.getElementById('bytes').scrollIntoView()"); await asyncio.sleep(0.4)
            await shot('6-program-bytesmap')
            await go(SITE.split('/ARABART')[0] + hrefs[0])
            h = await head(); check('BytesMap link opens the same region in /bytes/', h == label, f'{label!r} vs {h!r}')

        await block(bytesmap)

        async def phone():
            # 12. phone: pinch zoom, then tap a file
            await cmd('Emulation.setDeviceMetricsOverride', width=390, height=844, deviceScaleFactor=2, mobile=True)
            await cmd('Emulation.setTouchEmulationEnabled', enabled=True, maxTouchPoints=5)
            await go(f'{SITE}/bytes/')
            await ev("document.querySelector('.bx').scrollIntoView()"); await asyncio.sleep(1.2)
            await shot('7-phone-all')
            r = await ev("(()=>{const r=document.querySelector('.bx-map').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()")
            s0 = await ev('__bx.cam.s')
            await cmd('Input.dispatchTouchEvent', type='touchStart', touchPoints=[{'x': r[0] - 25, 'y': r[1], 'id': 1}, {'x': r[0] + 25, 'y': r[1], 'id': 2}])
            for k in range(1, 11):
                await cmd('Input.dispatchTouchEvent', type='touchMove', touchPoints=[{'x': r[0] - 25 - k * 10, 'y': r[1], 'id': 1}, {'x': r[0] + 25 + k * 10, 'y': r[1], 'id': 2}]); await asyncio.sleep(0.016)
            await cmd('Input.dispatchTouchEvent', type='touchEnd', touchPoints=[]); await asyncio.sleep(0.5)
            s1 = await ev('__bx.cam.s'); check('pinch zooms on a phone', s1 > s0 * 1.5, f'{s0:.2f} -> {s1:.2f}')
            await go(f'{SITE}/bytes/')
            await ev("document.querySelector('.bx').scrollIntoView()"); await asyncio.sleep(1.2)
            tx, ty = await ev("(()=>{const r=[...document.querySelectorAll('.bx-tl.on')].find(b=>b.textContent.startsWith('MAIN.EXE')).getBoundingClientRect();return [r.left+40,r.bottom+20]})()")
            await cmd('Input.dispatchTouchEvent', type='touchStart', touchPoints=[{'x': tx, 'y': ty, 'id': 1}])
            await cmd('Input.dispatchTouchEvent', type='touchEnd', touchPoints=[]); await asyncio.sleep(2.4)
            c = await crumbs(); check('tapping a file on a phone opens it', c == 'All files > MAIN.EXE', f"{c} tap at {tx:.0f},{ty:.0f} hit {await ev(f'document.elementFromPoint({tx},{ty})?.className')}")
            await shot('8-phone-file')
            sw = await ev('document.documentElement.scrollWidth'); check('no sideways scroll at 390 px', sw <= 390, sw)

        await block(phone)

        check('no console errors or exceptions', not errs, errs)


try:
    asyncio.run(main())
finally:
    chrome.terminate()
(OUT / 'results.json').write_text(json.dumps(results, indent=1))
fails = [r for r in results if not r['ok']]
print(f"{len(results) - len(fails)}/{len(results)} passed · {OUT}")
sys.exit(1 if fails else 0)
