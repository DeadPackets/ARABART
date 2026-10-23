# E2E check of the 3 editor writeups: per-section screenshots (desktop, phone, no-JS), console errors, overflow, smallest SVG text.
import sys
from playwright.sync_api import sync_playwright
OUT = "/private/tmp/claude-501/-Users-deadpackets-workspace-DOSArchive/bb845a97-0c40-416d-bb30-299debf3ecff/scratchpad/shots/"
PAGES = {'text-editor-gui': 'eg', 'text-editor-demo': 'ed', 'winkey': 'wk'}
only = sys.argv[1].split(',') if len(sys.argv) > 1 else list(PAGES)
modes = sys.argv[2].split(',') if len(sys.argv) > 2 else ['d', 'p', 'nojs']
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")
    for tag, w, h, js in (('d', 1440, 900, True), ('p', 390, 844, True), ('nojs', 1440, 900, False)):
        if tag not in modes: continue
        phone = w < 500
        for pid in only:
            ctx = b.new_context(viewport={"width": w, "height": h}, is_mobile=phone, has_touch=phone, java_script_enabled=js, device_scale_factor=1)
            pg = ctx.new_page(); errs = []
            pg.on("console", lambda m: m.type == "error" and errs.append(m.text))
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.goto(f"http://localhost:4322/ARABART/program/{pid}/"); pg.wait_for_timeout(2500)
            try:
                pg.evaluate("for (const e of document.querySelectorAll('body *')) { const p = getComputedStyle(e).position; if (p == 'fixed' || p == 'sticky') e.style.visibility = 'hidden'; } document.querySelector('astro-dev-toolbar')?.remove();")
            except Exception as ex: print('hide failed', ex)
            secs = pg.evaluate(f"[...document.querySelectorAll('section[id^={PAGES[pid]}-]')].map(s => s.id)")
            for s in secs:
                for _ in range(3):
                    try:
                        pg.locator(f'#{s}').screenshot(path=f"{OUT}{pid}-{tag}-{s}.png"); break
                    except Exception:
                        pg.wait_for_timeout(2000)
            small = pg.evaluate("""() => { let m = 99, who = '';
              for (const t of document.querySelectorAll('section svg.dg text')) {
                const r = t.getBoundingClientRect(); if (!r.height || t.closest('.fig-body') && getComputedStyle(t.closest('svg')).display == 'none') continue;
                const ctm = t.getScreenCTM(); if (!ctm) continue;
                const fs = parseFloat(getComputedStyle(t).fontSize) * ctm.a;
                if (fs < m) { m = fs; who = t.textContent; } }
              return [Math.round(m * 10) / 10, who]; }""") if js else None
            print(pid, tag, 'sections', len(secs), 'scrollWidth', pg.evaluate("document.documentElement.scrollWidth"), 'smallest svg text px', small, 'errors', errs[:3])
            ctx.close()
    b.close()
