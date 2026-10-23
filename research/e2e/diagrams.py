# E2E diagram check on the dev server (:4322): every route at 390, 768, 1024 and 1440 px. A diagram is any outermost
# figure or window in <main> (the emulator excepted). The check walks each one's steps (the shared Step control to the end,
# then Run) and its Run / Next / Play buttons, and in every state measures: SVG text that spills out of the shape that
# holds it or out of its SVG, text on other text, text on boxes or wires it does not sit in, art that spills out of its
# box, content outside the figure or causing page scroll, figures that must scroll sideways, and text under 12 px at 390.
# Writes research/e2e/out/diagrams.json and a screenshot per failing state (faults outlined in magenta) to out/diagrams/.
#   uv run -q --with playwright python -I research/e2e/diagrams.py [/route/ ...] [--w 390,1440] [--out name]
import json, pathlib, re, sys
from multiprocessing import Pool
from playwright.sync_api import sync_playwright

SITE = 'http://localhost:4322'
OUT = pathlib.Path(__file__).parent / 'out'
SHOTS = OUT / 'diagrams'
DIST = pathlib.Path(__file__).resolve().parents[2] / 'dist'
WIDTHS = [390, 768, 1024, 1440]
BUTTONS = re.compile(r'^(Run|Next|Play)\b', re.I)

JS = r"""
(() => {
const NO = 'defs, clipPath, mask, symbol, marker, pattern, title';
const R = e => e.getBoundingClientRect();
const cut = (a, b) => ({ w: Math.min(a.right, b.right) - Math.max(a.left, b.left), h: Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) });
const over = (a, c) => [c.left - a.left, a.right - c.right, c.top - a.top, a.bottom - c.bottom];
const exceeds = (a, c, tx, ty) => { const [l, r, t, b] = over(a, c); return Math.max(l, r) > tx || Math.max(t, b) > ty; };
const has = (c, x, y) => x >= c.left && x <= c.right && y >= c.top && y <= c.bottom;
const clip = (a, c) => c ? { left: Math.max(a.left, c.left), right: Math.min(a.right, c.right), top: Math.max(a.top, c.top), bottom: Math.min(a.bottom, c.bottom) } : a;
const area = r => (r.right - r.left) * (r.bottom - r.top);
const name = e => {
  if (!e) return '';
  if (e.nodeType === 3) return JSON.stringify(e.textContent.trim().replace(/\s+/g, ' ').slice(0, 40));
  const cls = typeof e.className === 'string' ? e.className : e.className.baseVal;
  const t = e.tagName === 'text' ? ' ' + JSON.stringify(e.textContent.trim().slice(0, 40)) : '';
  const at = /^(rect|circle|ellipse)$/.test(e.tagName) ? `@${e.getAttribute('x') ?? e.getAttribute('cx')},${e.getAttribute('y') ?? e.getAttribute('cy')}` : '';
  return e.tagName.toLowerCase() + (cls ? '.' + cls.trim().split(/\s+/).slice(0, 2).join('.') : '') + at + t;
};

window.__dgInit = () => {
  document.querySelectorAll('main details').forEach(d => (d.open = true));
  const main = document.querySelector('main') || document.body;
  const roots = [...main.querySelectorAll('figure, .win[data-win]')]
    .filter(e => !e.parentElement.closest('figure, .win[data-win]') && !e.closest('[data-player]') && !e.matches('.listing'));
  // A toy outside any figure or window: its own outermost box below the section that holds it
  const loose = new Set();
  for (const e of main.querySelectorAll('svg, canvas, [data-scrub]')) {
    if (e.parentElement.closest('svg') || e.closest('[data-player]') || roots.some(x => x.contains(e))) continue;
    const q = R(e);
    // Icons, and full-width backdrops that decorate the page rather than explain anything
    if ((e.tagName === 'svg' && (q.width < 60 || q.height < 30)) || e.closest('[aria-hidden="true"]') || q.width >= innerWidth - 2) continue;
    let t = e;
    while (t.parentElement && !/^(SECTION|ARTICLE|MAIN|BODY)$/.test(t.parentElement.tagName) && !roots.some(x => t.parentElement.contains(x))) t = t.parentElement;
    loose.add(t);
  }
  window.__dgR = [...roots, ...loose];
  return __dgR.map((e, i) => ({ i, w: R(e).width, title: (e.querySelector('.win-title')?.textContent || e.getAttribute('aria-label') || e.querySelector('figcaption')?.textContent || e.getAttribute('class') || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 70) }));
};
// A window with no step control of its own follows the one its toy keeps beside it (a code stepper's panes)
window.__dgScrubs = i => {
  let t = __dgR[i];
  while (!t.querySelector('[data-scrub]') && t.parentElement && !/^(SECTION|ARTICLE|MAIN|BODY)$/.test(t.parentElement.tagName)) t = t.parentElement;
  return [...t.querySelectorAll('[data-scrub]')].filter(s => !s.hidden && s.getClientRects().length);
};
window.__dgButtons = (i, re) => [...__dgR[i].querySelectorAll('button')].filter(b => !b.closest('[data-scrub]') && b.getClientRects().length && new RegExp(re, 'i').test(b.textContent.trim()));
window.__dgSettle = async () => {
  await new Promise(r => setTimeout(r, 220));
  const t0 = performance.now();
  while (performance.now() - t0 < 1500) {
    const busy = document.getAnimations().filter(a => a.playState === 'running' && isFinite(a.effect?.getComputedTiming?.().endTime));
    if (!busy.length) break;
    await new Promise(r => setTimeout(r, 60));
  }
  await document.fonts.ready;
};
// GSAP tweens are not Web Animations: speed them up by importing the page's own copy of the module
window.__dgFast = async () => {
  const u = performance.getEntriesByType('resource').map(e => e.name).find(n => /\/gsap\.js(\?|$)/.test(n));
  if (!u) return false;
  const m = await import(u);
  (m.gsap || m.default).globalTimeline.timeScale(6);
  return true;
};

window.__dgMeasure = (i, small) => {
  const root = __dgR[i], rr = R(root), out = [], seen = new Set(), ops = new Map();
  const op = e => {
    if (!e || e.nodeType !== 1) return 1;
    if (ops.has(e)) return ops.get(e);
    const v = +getComputedStyle(e).opacity * op(e.parentElement);
    ops.set(e, v);
    return v;
  };
  const vis = e => getComputedStyle(e).visibility !== 'hidden' && op(e) >= 0.1;
  const push = (kind, a, b, boxes, extra) => {
    const k = kind + name(a) + name(b);
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ kind, label: name(a), other: name(b), boxes: boxes.map(r => [r.left + scrollX, r.top + scrollY, r.right - r.left, r.bottom - r.top].map(Math.round)), ...extra });
  };
  const pool = [], tiny = [];
  // A scroller that takes focus or snaps is built to scroll; a sticky control bar floats over the figure on purpose
  const scroller = e => e.hasAttribute('tabindex') || getComputedStyle(e).scrollSnapType !== 'none' || /^(radiogroup|tablist|listbox)$/.test(e.getAttribute('role') || '');
  const sc = new Map();
  const scaled = e => {
    if (!e || e.nodeType !== 1) return false;
    if (!sc.has(e)) { const s = getComputedStyle(e); sc.set(e, s.transform !== 'none' || s.scale !== 'none' || s.zoom !== '1' || scaled(e.parentElement)); }
    return sc.get(e);
  };
  const stuck = e => { for (let a = e.nodeType === 1 ? e : e.parentElement; a && a !== root.parentElement; a = a.parentElement) if (getComputedStyle(a).position === 'sticky') return true; return false; };

  // SVG: text, containers (rects and filled shapes), wires (stroked lines, sampled), art (nested svg, image)
  for (const s of [...root.querySelectorAll('svg')].filter(s => !s.parentElement.closest('svg'))) {
    const sr = R(s);
    if (sr.width < 40 || sr.height < 20 || !vis(s)) continue;
    const T = [], K = [], L = [], A = [];
    for (const e of s.querySelectorAll('text, rect, circle, ellipse, polygon, path, line, polyline, svg, image, foreignObject')) {
      if (e.closest(NO) || !vis(e)) continue;
      const r = R(e), own = e.parentElement.closest('svg') === s;
      if (r.width < 1 || r.height < 1) continue;
      if (e.tagName === 'text') { if (e.textContent.trim()) T.push({ el: e, r }); continue; }
      if (!own) continue;
      if (/^(svg|image|foreignObject)$/.test(e.tagName)) {
        const kids = [...e.querySelectorAll('path, rect, polygon, circle')].filter(k => !k.closest(NO)).map(R).filter(q => q.width);
        const u = kids.length ? kids.reduce((a, q) => ({ left: Math.min(a.left, q.left), top: Math.min(a.top, q.top), right: Math.max(a.right, q.right), bottom: Math.max(a.bottom, q.bottom) })) : r;
        A.push({ el: e, r: u });
        continue;
      }
      const cs = getComputedStyle(e);
      const filled = cs.fill !== 'none' && +cs.fillOpacity > 0.05, stroked = cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0 && +cs.strokeOpacity > 0.05;
      if (!filled && !stroked) continue;
      if (e.tagName === 'line' || (!filled && /^(path|polyline)$/.test(e.tagName))) {
        const m = e.getScreenCTM(), len = e.getTotalLength(), n = Math.min(1500, Math.ceil(len * Math.hypot(m.a, m.b) / 2) + 1), pts = [];
        for (let j = 0; j <= n; j++) { const p = e.getPointAtLength(len * j / n); pts.push({ x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f }); }
        L.push({ el: e, r, pts });
      } else if (r.width >= 10 && r.height >= 10) K.push({ el: e, r, filled });
    }
    for (const t of T) {
      const cs = getComputedStyle(t.el), vy = t.r.height * 0.22;
      const ink = { left: t.r.left + 1, right: t.r.right - 1, top: t.r.top + vy, bottom: t.r.bottom - vy };
      const halo = cs.stroke !== 'none' && parseFloat(cs.strokeWidth) >= 2;
      pool.push({ r: ink, el: t.el, st: stuck(t.el) });
      if (small) { const m = t.el.getScreenCTM(), px = parseFloat(cs.fontSize) * Math.hypot(m.a, m.b); if (px < 11.9) tiny.push([name(t.el), px]); }
      if (exceeds(t.r, sr, 1, vy)) push('text-out-of-svg', t.el, s, [t.r, sr]);
      const cx = (t.r.left + t.r.right) / 2, cy = (t.r.top + t.r.bottom) / 2;
      const holders = K.filter(k => has(k.r, cx, cy)).sort((a, b) => area(a.r) - area(b.r));
      if (holders[0] && exceeds(t.r, holders[0].r, 1, vy)) push('text-spills-box', t.el, holders[0].el, [t.r, holders[0].r]);
      for (const k of K) { if (holders.includes(k)) continue; const x = cut(ink, k.r); if (x.w > 1 && x.h > 1) push('text-on-box', t.el, k.el, [t.r, k.r]); }
      if (halo) continue;
      for (const l of L) {
        if (holders.some(k => k.filled && l.el.compareDocumentPosition(k.el) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
        if (l.pts.some(p => has(ink, p.x, p.y))) push('text-on-wire', t.el, l.el, [t.r, l.r]);
      }
    }
    // Sizing: a band of nothing at the top or bottom of the SVG, counting every part of every step
    if (s.viewBox?.baseVal?.height) {
      let top = Infinity, bot = -Infinity;
      for (const e of s.querySelectorAll('text, rect, circle, ellipse, polygon, path, line, polyline, image, svg')) {
        if (e.closest(NO) || e.parentElement.closest('svg') !== s) continue;
        const q = R(e);
        if (q.width || q.height) { top = Math.min(top, q.top); bot = Math.max(bot, q.bottom); }
      }
      const ss = getComputedStyle(s), ct = sr.top + parseFloat(ss.borderTopWidth) + parseFloat(ss.paddingTop), cb = sr.bottom - parseFloat(ss.borderBottomWidth) - parseFloat(ss.paddingBottom);
      const gap = Math.max(top - ct, cb - bot);
      if (gap > Math.max(24, (cb - ct) * 0.12)) push('svg-empty-band', s, null, [sr], { by: Math.round(gap) });
    }
    for (const a of A) {
      const cx = (a.r.left + a.r.right) / 2, cy = (a.r.top + a.r.bottom) / 2;
      const h = K.filter(k => has(k.r, cx, cy)).sort((p, q) => area(p.r) - area(q.r))[0];
      if (h && exceeds(a.r, h.r, 2, 2)) push('art-spills-box', a.el, h.el, [a.r, h.r]);
      else if (!h && exceeds(a.r, sr, 2, 2)) push('art-out-of-svg', a.el, s, [a.r, sr]);
      for (const t of T) { const x = cut(t.r, a.r); if (x.w > 2 && x.h > 2 && !(h && has(h.r, (t.r.left + t.r.right) / 2, (t.r.top + t.r.bottom) / 2))) push('text-on-art', t.el, a.el, [t.r, a.r]); }
    }
  }

  // HTML: outermost elements outside the figure or the viewport (after clipping), sideways scrollers
  const walk = (el, c, done) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.position === 'fixed') return;
    const r = R(el);
    if (!done && el !== root && r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && op(el) >= 0.1) {
      const v = clip(r, c);
      if (v.right > v.left && v.bottom > v.top) {
        if (exceeds(v, rr, 1, 1)) { push('outside-figure', el, null, [v, rr]); done = true; }
        else if (v.right > innerWidth + 1 || v.left < -1) { push('outside-viewport', el, null, [v]); done = true; }
      }
    }
    if (el !== root && /(auto|scroll)/.test(cs.overflowX + cs.overflowY) && !el.matches('pre, code, .code, textarea') && !scroller(el) && r.width > 0) {
      if (el.scrollWidth > el.clientWidth + 1) push('scrolls-sideways', el, null, [r], { by: el.scrollWidth - el.clientWidth });
      else if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 1 && cs.maxHeight === 'none' && cs.height !== 'auto') push('scrolls-down', el, null, [r], { by: el.scrollHeight - el.clientHeight });
    }
    if (el.tagName === 'svg') return;
    const nc = cs.overflowX !== 'visible' || cs.overflowY !== 'visible' || cs.clipPath !== 'none' ? clip(r, c) : c;
    for (const ch of el.children) walk(ch, nc, done);
  };
  walk(root, null, false);
  if (rr.right > innerWidth + 1 || rr.left < -1) push('outside-viewport', root, null, [rr]);

  // HTML text: spill out of its block, text under 12 px
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let n; (n = tw.nextNode());) {
    const p = n.parentElement;
    if (!n.textContent.trim() || !p || p.closest('svg, script, style, template, noscript, select, option') || !vis(p)) continue;
    let b = p;
    while (b !== root && /^(inline|contents)$/.test(getComputedStyle(b).display)) b = b.parentElement;
    const bs = getComputedStyle(b), br = R(b);
    if (br.width <= 2 || br.height <= 2 || bs.clipPath !== 'none' || bs.clip !== 'auto') continue;
    // Leading and trailing spaces are not ink, and pre-wrapped ones hang past the line end
    range.setStart(n, n.textContent.search(/\S/));
    range.setEnd(n, n.textContent.search(/\s*$/));
    const rects = [...range.getClientRects()].filter(q => q.width > 1);
    // Pre-wrapped text hangs its trailing space past the line end; an ellipsis box clips on purpose
    const tx = /pre/.test(getComputedStyle(p).whiteSpace) ? 0.7 * parseFloat(getComputedStyle(p).fontSize) : 1.5;
    let c = null, scrolls = false;
    for (let a = p; a && a !== root.parentElement; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.overflowX !== 'visible' || s.overflowY !== 'visible') c = clip(c || R(a), R(a));
      if (/(auto|scroll)/.test(s.overflowX) && scroller(a)) scrolls = true;
    }
    const st = stuck(p);
    for (const q of rects) {
      const v = clip(q, c);
      if (v.right - v.left > 2 && v.bottom - v.top > 2) pool.push({ r: { left: v.left + 1, right: v.right - 1, top: v.top + q.height * 0.15, bottom: v.bottom - q.height * 0.15 }, el: n, st });
      if (bs.textOverflow !== 'ellipsis' && !scrolls && exceeds(q, br, tx, Math.max(2, q.height * 0.3))) push('text-spills-block', n, b, [q, br]);
    }
    if (small && rects.length) { const px = parseFloat(getComputedStyle(p).fontSize) * (scaled(p) && p.offsetWidth ? R(p).width / p.offsetWidth : 1); if (px < 11.9) tiny.push([name(n), px]); }
  }

  // Text on text, SVG and HTML alike
  for (let a = 0; a < pool.length; a++) for (let b = a + 1; b < pool.length; b++) {
    const P = pool[a], Q = pool[b];
    if (P.el === Q.el || P.st !== Q.st || P.el.contains?.(Q.el) || Q.el.contains?.(P.el)) continue;
    // The same words drawn twice in one place: a lit copy laid over its label on purpose
    if (P.el.textContent.trim() === Q.el.textContent.trim() && Math.abs(P.r.left - Q.r.left) < 2 && Math.abs(P.r.top - Q.r.top) < 2) continue;
    const x = cut(P.r, Q.r);
    if (x.w > 2 && x.h > 0.3 * Math.min(P.r.bottom - P.r.top, Q.r.bottom - Q.r.top)) push('text-on-text', P.el, Q.el, [P.r, Q.r]);
  }
  if (document.documentElement.scrollWidth > innerWidth) out.push({ kind: 'page-scroll', label: `page is ${document.documentElement.scrollWidth - innerWidth}px wider than the window`, other: '', boxes: [] });
  return { faults: out, tiny };
};
})();
"""


def routes():
    rs = sorted('/' + str(p.parent.relative_to(DIST)).replace('.', '') for p in DIST.rglob('index.html'))
    return [r if r.endswith('/') else r + '/' for r in rs]


def load(pg, r):
    # Vite answers 504 Outdated Optimize Dep, or reloads the page when someone saves a file: try again
    for k in range(4):
        try:
            resp = pg.goto(SITE + r, wait_until='load')
            if resp and resp.status == 504: raise RuntimeError('504 Outdated Optimize Dep')
            pg.wait_for_timeout(600)
            pg.evaluate('__dgFast()')
            return pg.evaluate('__dgInit()')
        except Exception:
            if k == 3: raise
            pg.wait_for_timeout(1000)


def shoot(pg, path, faults):
    boxes = [b for f in faults for b in f['boxes']]
    pg.evaluate("""bs => { for (const [x, y, w, h] of bs) document.body.append(Object.assign(document.createElement('div'), { className: '__dgbox',
      style: `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;outline:2px solid #f0f;pointer-events:none;z-index:99999` })) }""", boxes)
    x0, y0 = min(b[0] for b in boxes) - 24, min(b[1] for b in boxes) - 24
    x1, y1 = max(b[0] + b[2] for b in boxes) + 24, max(b[1] + b[3] for b in boxes) + 24
    pw = pg.evaluate('document.documentElement.scrollWidth')
    x0, x1 = max(0, x0), min(pw, x1)
    pg.screenshot(path=str(path), full_page=True, clip={'x': x0, 'y': max(0, y0), 'width': max(1, x1 - x0), 'height': max(1, y1 - max(0, y0))})
    pg.evaluate("document.querySelectorAll('.__dgbox').forEach(e => e.remove())")


def check(width, rlist):
    found, tiny, errors, states = {}, {}, [], 0

    def walk(pg, r, rname, d):
        i = d['i']
        pg.evaluate('i => __dgR[i].scrollIntoView({ block: "center" })', i)
        pg.wait_for_timeout(300)

        def measure(state):
            nonlocal states
            states += 1
            pg.evaluate('__dgSettle()')
            m = pg.evaluate('([i, s]) => __dgMeasure(i, s)', [i, width == 390])
            for lab, px in m['tiny']:
                tiny.setdefault((r, i), {'route': r, 'width': width, 'diagram': i, 'title': d['title'], 'texts': {}})['texts'][lab] = round(px, 1)
            new = []
            for f in m['faults']:
                k = (r, i, f['kind'], f['label'], f['other'])
                if k in found: found[k]['states'].append(state)
                else:
                    found[k] = {'route': r, 'width': width, 'diagram': i, 'title': d['title'], 'kind': f['kind'], 'label': f['label'], 'other': f['other'], 'states': [state], **({'by': f['by']} if 'by' in f else {})}
                    new.append(f)
            if new:
                shot = SHOTS / re.sub(r'[^\w.-]', '_', f'{rname}-{width}-d{i}-{state}.png')
                try: shoot(pg, shot, new)
                except Exception as e: shot = f'screenshot failed: {e}'
                for f in new: found[(r, i, f['kind'], f['label'], f['other'])]['shot'] = str(shot)

        measure('init')
        for k in range(min(3, pg.evaluate('i => __dgScrubs(i).length', i))):
            S = f'__dgScrubs({i})[{k}]'
            n = pg.evaluate(f'+{S}.querySelector("input[type=range]").max + 1')
            pg.evaluate(f'{S}.querySelector("[data-act=reset]")?.click()')
            if n <= 30:
                for j in range(n):
                    measure(f's{k}.{j + 1}')
                    if pg.evaluate(f'{S}.querySelector("[data-act=step]")?.getAttribute("aria-disabled") === "true"'): break
                    pg.evaluate(f'{S}.querySelector("[data-act=step]").click()')
            else:
                for j in sorted({round(t * (n - 1) / 23) for t in range(24)}):
                    pg.evaluate(f'j => {{ const x = {S}.querySelector("input[type=range]"); x.value = j; x.dispatchEvent(new Event("input", {{ bubbles: true }})) }}', j)
                    measure(f's{k}.{j + 1}')
            if pg.evaluate(f'!!{S}.querySelector("[data-act=play]")'):
                pg.evaluate(f'{S}.querySelector("[data-act=play]").click()')
                pg.wait_for_function(f'{S}.querySelector("[data-act=play]").getAttribute("aria-pressed") === "false"', timeout=30000, polling=100)
                measure(f's{k}.run')
        pat = json.dumps(BUTTONS.pattern)
        for j, lab in enumerate(pg.evaluate(f'i => __dgButtons(i, {pat}).map(b => b.textContent.trim())', i)[:4]):
            if pg.evaluate(f'([i, j]) => {{ const b = __dgButtons(i, {pat})[j]; if (!b || b.disabled || b.getAttribute("aria-disabled") === "true") return false; b.click(); return true }}', [i, j]):
                pg.wait_for_timeout(1200)
                measure('btn-' + re.sub(r'\W+', '-', lab)[:24])

    with sync_playwright() as p:
        b = p.chromium.launch(channel='chrome')
        ctx = b.new_context(viewport={'width': width, 'height': 900}, device_scale_factor=1)
        ctx.add_init_script(JS)
        for r in rlist:
            pg = ctx.new_page()
            rname = r.strip('/').replace('/', '_') or 'home'
            for d in load(pg, r):
                if not d['w']: continue
                # The dev server reloads the page when someone saves a file: start this diagram again once
                for attempt in range(2):
                    try:
                        walk(pg, r, rname, d)
                        break
                    except Exception as e:
                        if attempt: errors.append({'route': r, 'width': width, 'diagram': d['i'], 'title': d['title'], 'error': str(e)[:300]})
                        load(pg, r)
            print(width, r, sum(1 for f in found.values() if f['route'] == r), 'faults', flush=True)
            pg.close()
        b.close()
    return list(found.values()), list(tiny.values()), states, errors


def job(a):
    global SHOTS
    SHOTS = a[2]  # worker processes import this file afresh
    return check(a[0], a[1])


if __name__ == '__main__':
    args = sys.argv[1:]
    widths, name = WIDTHS, 'diagrams'
    if '--w' in args:
        k = args.index('--w')
        widths = [int(w) for w in args[k + 1].split(',')]
        args = args[:k] + args[k + 2:]
    if '--out' in args:  # a partial run writes beside the full one: out/<name>.json and out/<name>/
        k = args.index('--out')
        name = args[k + 1]
        args = args[:k] + args[k + 2:]
        SHOTS = OUT / name
    rlist = [r for r in routes() if not args or r in args]
    OUT.mkdir(exist_ok=True)
    SHOTS.mkdir(exist_ok=True)
    for f in SHOTS.glob('*.png'): f.unlink()
    with Pool(len(widths)) as pool:
        parts = pool.map(job, [(w, rlist, SHOTS) for w in widths])
    faults = sorted((f for p in parts for f in p[0]), key=lambda f: (f['route'], f['width'], f['diagram'], f['kind']))
    small = [t for p in parts for t in p[1]]
    for t in small: t['count'], t['smallest'] = len(t['texts']), min(t['texts'].values())
    kinds = {}
    for f in faults: kinds[f['kind']] = kinds.get(f['kind'], 0) + 1
    if small: kinds['small-text'] = len(small)
    errors = [e for p in parts for e in p[3]]
    (OUT / f'{name}.json').write_text(json.dumps({'routes': len(rlist), 'widths': widths, 'states': sum(p[2] for p in parts), 'faults': len(faults) + len(small), 'kinds': kinds, 'errors': errors, 'list': faults, 'small_text_390': small}, indent=1))
    print(f"{sum(p[2] for p in parts)} states measured, {len(faults) + len(small)} faults, {len(errors)} diagrams not checked", json.dumps(kinds))
