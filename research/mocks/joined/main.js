(() => {
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const G = window.gsap;
if (G) G.registerPlugin(...[window.ScrollTrigger, window.SplitText].filter(Boolean));
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const msg = $('#slmsg'), rejoinBtn = $('#rejoin');
let quiet = false;
const say = html => { if (!quiet) msg.innerHTML = html; };

// Hero: الفن العربي as a verlet chain. Each letter is a rod between its two baseline joints.
const ZWJ = '\u200D', FORMS = { iso: 'isolated', ini: 'initial', med: 'medial', fin: 'final' }, SHORT = { iso: 'iso', ini: 'ini', med: 'med', fin: 'fin' };
const shape = (c, f) => (f === 'med' || f === 'fin' ? ZWJ : '') + c + (f === 'med' || f === 'ini' ? ZWJ : '');
const hero = $('.hero'), layer = $('.word'), slot = $('.hero-slot'), jsvg = $('.jsvg');
const LT = [], spaceAfter = new Set();
for (const s of 'ا:R:alif ل:D:lam ف:D:fa ن:D:nun | ا:R:alif ل:D:lam ع:D:ayn ر:R:ra ب:D:ba ي:D:ya'.split(' ')) {
  if (s === '|') { spaceAfter.add(LT.length - 1); continue; }
  const [c, t, name] = s.split(':');
  LT.push({ c, t, name, i: LT.length, r: {}, l: {} });
}
// R-type letters (alif, ra) never join the letter after them.
const links = LT.slice(1).map((_, i) => ({ a: i, b: i + 1, space: spaceAfter.has(i), joins: LT[i].t === 'D' && !spaceAfter.has(i), cut: false }));
const active = q => !LT[q.a].free && !LT[q.b].free && !q.cut;
const formOf = i => {
  const p = links[i - 1], n = links[i], jp = p && p.joins && active(p), jn = n && n.joins && active(n);
  return jp && jn ? 'med' : jp ? 'fin' : jn ? 'ini' : 'iso';
};
const NS = 'http://www.w3.org/2000/svg';
const mk = (tag, cls) => { const e = document.createElementNS(NS, tag); e.setAttribute('class', cls); jsvg.append(e); return e; };
const baseRule = mk('line', 'base');
links.forEach(q => { q.kash = mk('line', 'kash'); q.thread = mk('line', 'thread'); q.riv = mk('circle', q.joins ? 'riv' : 'riv ring'); q.riv.setAttribute('r', 3.5); });
LT.forEach(l => {
  l.ghost = Object.assign(document.createElement('span'), { className: 'ghost', dir: 'rtl', hidden: true });
  l.el = Object.assign(document.createElement('span'), { className: 'lt', dir: 'rtl', tabIndex: 0 });
  l.el.setAttribute('role', 'button');
  l.el.innerHTML = '<span class="g"></span><span class="f" dir="ltr"></span>';
  [l.g, l.f] = l.el.children;
  l.el._i = l.i;
  layer.append(l.ghost, l.el);
});

let M, W, H, fs, k, cxw, by;
function measure() {
  const probe = Object.assign(document.createElement('span'), { className: 'probe', dir: 'rtl' });
  layer.append(probe);
  const wOf = s => { probe.textContent = s; return probe.getBoundingClientRect().width; };
  LT.forEach(l => { l.w100 = {}; for (const f in FORMS) l.w100[f] = wOf(shape(l.c, f)); });
  const space = wOf(' ');
  probe.innerHTML = 'ب<i style="display:inline-block;width:0;height:0"></i>';
  const base = probe.lastChild.getBoundingClientRect().top - probe.getBoundingClientRect().top;
  const cx = document.createElement('canvas').getContext('2d');
  cx.font = `700 100px ${getComputedStyle(probe).fontFamily}`;
  const word = cx.measureText('الفن العربي'), kash = cx.measureText('ـ');
  probe.remove();
  M = { base, space, asc: word.actualBoundingBoxAscent, desc: word.actualBoundingBoxDescent,
    kc: (kash.actualBoundingBoxAscent - kash.actualBoundingBoxDescent) / 2, kt: kash.actualBoundingBoxAscent + kash.actualBoundingBoxDescent };
}

function size() {
  W = hero.clientWidth; H = hero.clientHeight;
  const hr = hero.getBoundingClientRect(), sr = slot.getBoundingClientRect(), lab = 30;
  const rest = LT.reduce((t, l) => t + l.w100[l.rest], 0) + M.space * spaceAfter.size;
  fs = Math.min(W * (W < 760 ? 0.86 : 0.6) / rest * 100, (sr.height - lab - 24) / (M.asc + M.desc) * 100);
  k = fs / 100;
  cxw = sr.left - hr.left + sr.width / 2;
  by = sr.top - hr.top + (sr.height - (M.asc + M.desc) * k - lab) / 2 + M.asc * k;
  layer.style.setProperty('--fs', fs + 'px');
  layer.style.setProperty('--lab', (M.base + M.desc) * k + 10 + 'px');
  links.forEach(q => q.kash.style.strokeWidth = M.kt * k + 0.5);
  attrs(baseRule, { x1: 0, x2: W, y1: by + 0.5, y2: by + 0.5 });
  LT.forEach(l => { l.w = l.w100[l.form] * k; l.ghost.textContent = shape(l.c, l.rest); });
  layout();
}

function layout() {
  const sp = M.space * k, sw = l => l.w100[l.free ? l.rest : l.form] * k;
  let x = cxw + (LT.reduce((t, l) => t + sw(l), 0) + sp * spaceAfter.size) / 2;
  LT.forEach((l, i) => {
    l.r.hx = x; l.r.hy = by; x -= sw(l); l.l.hx = l.free ? l.r.hx - l.w : x; l.l.hy = by;
    l.ghost.style.transform = `translate(${x}px,${by - M.base * k}px)`;
    if (spaceAfter.has(i)) x -= sp;
  });
  links.forEach(q => q.gap = q.space ? sp : 0);
}

const put = (p, x, y) => { p.x = p.px = x; p.y = p.py = y; };
const settle = () => LT.forEach(l => { put(l.r, l.r.hx, l.r.hy); put(l.l, l.l.hx, l.l.hy); });
const dist = (p, x, y) => Math.hypot(p.x - x, p.y - y);

function refresh() {
  const changed = [];
  LT.forEach((l, i) => {
    const f = formOf(i);
    if (f !== l.form) changed.push([l, l.form, f]);
    l.form = f; l.w = l.w100[f] * k;
    l.g.textContent = shape(l.c, f);
    l.f.textContent = (W < 760 ? SHORT : FORMS)[f];
    l.el.classList.toggle('free', !!l.free);
    l.ghost.hidden = !l.free;
    if (!RM) l.el.setAttribute('aria-label', `${l.name}, ${FORMS[f]} form${l.free ? ', pulled out' : ''}`);
  });
  changed.forEach(([l]) => { l.el.classList.remove('reshaped'); void l.el.offsetWidth; l.el.classList.add('reshaped'); });
  layout();
  rejoinBtn.hidden = !LT.some(l => l.free);
  return changed;
}

const cap = s => s[0].toUpperCase() + s.slice(1);
const nm = l => `${l.name} <span class="a">${l.c}</span>`;
const list = ch => ch.map(([l, a, b]) => `${nm(l)} ${FORMS[a]} → ${FORMS[b]}`).join(', ');
function detach(l) {
  const was = l.form;
  l.free = true; l.homing = false;
  const ch = refresh().filter(c => c[0] !== l);
  say(`${cap(nm(l))} broke free (${FORMS[was]} → isolated). ` + (ch.length ? `Re-shaped: ${list(ch)}.` : `Nothing else changed: ${l.name} never joins the letter after it.`));
}
function attach(l) {
  l.free = false; l.homing = false;
  const ch = refresh();
  say(`${cap(nm(l))} re-joined. ${list(ch) || 'No shapes changed'}.`);
}

// Typographic joins are stiff; plain neighbors (alif, ra, the word space) hang on an elastic thread.
const DAMP = 0.9, DAMP_FREE = 0.95, HOME = 0.08, JST = 0.07, LST = 0.03, ITER = 6, BREAK = 0.25, BREAK_LINK = 0.6, PULL = 0.9, SNAP = 0.8;
function solve(p, q, len, s) {
  const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy);
  if (d < 1e-4) return;
  const f = (d - len) / d * 0.5 * s;
  p.x += dx * f; p.y += dy * f; q.x -= dx * f; q.y -= dy * f;
}
let drag = null;
function pin() {
  const l = drag.l, t = drag.t;
  const dx = drag.x - drag.ox - (l.r.x + (l.l.x - l.r.x) * t), dy = drag.y - drag.oy - (l.r.y + (l.l.y - l.r.y) * t);
  l.r.x += dx; l.r.y += dy; l.l.x += dx; l.l.y += dy;
}
const near = l => dist(l.r, l.r.hx, l.r.hy) < SNAP * fs;
function step() {
  let e = 0;
  for (const l of LT) for (const p of [l.r, l.l]) {
    const d = l.free ? DAMP_FREE : DAMP, vx = (p.x - p.px) * d, vy = (p.y - p.py) * d;
    p.px = p.x; p.py = p.y; p.x += vx; p.y += vy;
    if (!l.free || l.homing) { p.x += (p.hx - p.x) * HOME; p.y += (p.hy - p.y) * HOME; }
    e += Math.abs(vx) + Math.abs(vy);
  }
  for (let n = 0; n < ITER; n++) {
    for (const q of links) if (active(q)) solve(LT[q.a].l, LT[q.b].r, q.gap, q.joins ? JST : LST);
    for (const l of LT) solve(l.r, l.l, l.w, 1);
    if (drag) pin();
  }
  const m = 0.2 * fs;
  for (const l of LT) for (const p of [l.r, l.l]) {
    p.x = Math.min(W - m, Math.max(m, p.x));
    p.y = Math.min(H - 0.45 * fs, Math.max(0.95 * fs, p.y));
  }
  if (drag && !drag.l.free) {
    const l = drag.l, t = drag.t, i = l.i;
    const pull = Math.hypot(drag.x - drag.ox - (l.r.hx + (l.l.hx - l.r.hx) * t), drag.y - drag.oy - l.r.hy) / fs;
    if (pull > PULL || [links[i - 1], links[i]].some(q => q && active(q) && dist(LT[q.a].l, LT[q.b].r.x, LT[q.b].r.y) - q.gap > (q.joins ? BREAK : BREAK_LINK) * fs)) detach(l);
  }
  // A free letter keeps its isolated width, so only its right joint and its heading must line up with the slot.
  for (const l of LT) if (l.homing && dist(l.r, l.r.hx, l.r.hy) < 0.06 * fs && (l.r.x - l.l.x) / l.w > 0.97) attach(l);
  if (drag && drag.l.free) drag.l.ghost.classList.toggle('near', near(drag.l));
  return e;
}

const attrs = (el, o) => { for (const a in o) el.setAttribute(a, o[a].toFixed ? o[a].toFixed(1) : o[a]); };
function draw() {
  const bl = M.base * k, ky = M.kc * k;
  for (const l of LT) {
    const a = Math.atan2(l.l.y - l.r.y, l.l.x - l.r.x) + Math.PI;
    l.el.style.transform = `translate(${l.r.x}px,${l.r.y}px) rotate(${a}rad) translate(${-l.w}px,${-bl}px)`;
  }
  for (const q of links) {
    const p = LT[q.a].l, r = LT[q.b].r, on = active(q), d = dist(p, r.x, r.y);
    q.kash.style.display = on && q.joins && d > 0.6 ? '' : 'none';
    attrs(q.kash, { x1: p.x, y1: p.y - ky, x2: r.x, y2: r.y - ky });
    q.thread.style.display = on && !q.joins && d - q.gap > 3 ? '' : 'none';
    attrs(q.thread, { x1: p.x, y1: p.y, x2: r.x, y2: r.y });
    q.riv.style.display = on && !q.space ? '' : 'none';
    attrs(q.riv, { cx: (p.x + r.x) / 2, cy: (p.y + r.y) / 2 - (q.joins ? ky : 0) });
  }
}

let running = false, still = 0, last = 0, acc = 0, energy = 1, onScreen = true;
function wake() {
  still = 0;
  if (!running && onScreen && !document.hidden && !RM && M) { running = true; last = performance.now(); acc = 0; requestAnimationFrame(tick); }
}
function tick(now) {
  if (!onScreen || document.hidden) { running = false; return; }
  acc = Math.min(acc + now - last, 50); last = now;
  while (acc >= 16.6) { energy = step(); acc -= 16.6; }
  draw();
  still = energy < 0.05 && !drag && !LT.some(l => l.homing) ? still + 1 : 0;
  if (still > 30) { running = false; return; }
  requestAnimationFrame(tick);
}
new IntersectionObserver(([en]) => { onScreen = en.isIntersecting; wake(); }).observe(hero);
document.addEventListener('visibilitychange', wake);

const local = e => { const r = hero.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
layer.addEventListener('pointerdown', e => {
  const el = e.target.closest('.lt');
  if (!el || RM || !M) return;
  const l = LT[el._i], P = local(e), dx = l.l.x - l.r.x, dy = l.l.y - l.r.y;
  const t = Math.min(1, Math.max(0, ((P.x - l.r.x) * dx + (P.y - l.r.y) * dy) / (dx * dx + dy * dy || 1)));
  drag = { l, t, x: P.x, y: P.y, ox: P.x - (l.r.x + dx * t), oy: P.y - (l.r.y + dy * t), id: e.pointerId };
  el.setPointerCapture(e.pointerId);
  el.classList.add('held'); layer.classList.add('active');
  l.homing = false;
  e.preventDefault();
  wake();
});
layer.addEventListener('pointermove', e => { if (drag && e.pointerId === drag.id) Object.assign(drag, local(e)); });
const drop = e => {
  if (!drag || e.pointerId !== drag.id) return;
  const l = drag.l;
  drag = null;
  l.el.classList.remove('held'); l.ghost.classList.remove('near'); layer.classList.remove('active');
  if (l.free) {
    if (near(l)) l.homing = true;
    else say(`Drop ${nm(l)} on its outline to re-join it, or press Esc.`);
  }
  wake();
};
layer.addEventListener('pointerup', drop);
layer.addEventListener('pointercancel', drop);
layer.addEventListener('keydown', e => {
  const el = e.target.closest('.lt');
  if (!el || RM || (e.key !== 'Enter' && e.key !== ' ')) return;
  e.preventDefault();
  const l = LT[el._i];
  if (l.free) l.homing = true;
  else { detach(l); l.r.py = l.r.y + 0.05 * fs; l.l.py = l.l.y + 0.08 * fs; }
  wake();
});
const rejoinAll = () => { LT.forEach(l => { if (l.free) l.homing = true; }); wake(); };
rejoinBtn.addEventListener('click', rejoinAll);

function intro() {
  quiet = true;
  LT.forEach(l => { l.free = true; });
  refresh();
  LT.forEach((l, i) => {
    const sx = (4.5 - i) * 0.16 * fs, sy = (i % 2 ? -0.42 : 0.36) * fs, a = ((i % 3) - 1) * 0.28;
    put(l.r, l.r.hx + sx, l.r.hy + sy);
    put(l.l, l.r.x - Math.cos(a) * l.w, l.r.y - Math.sin(a) * l.w);
    setTimeout(() => { if (l.free && !(drag && drag.l === l)) { l.homing = true; wake(); } }, 450 + i * 110);
  });
  setTimeout(() => { quiet = false; say('Pull a letter out of the word. Its neighbors change shape.'); }, 450 + LT.length * 110 + 900);
}

function stepper() {
  const btn = $('.rm-step'), seq = ['med', 'fin', 'iso', 'ini'], ayn = LT[6];
  let s = 0;
  btn.hidden = false;
  btn.addEventListener('click', () => {
    s = (s + 1) % 4;
    const f = seq[s];
    links[5].cut = f === 'iso' || f === 'ini';
    links[6].cut = f === 'iso' || f === 'fin';
    const ch = refresh().filter(c => c[0] !== ayn);
    settle(); draw();
    say(`Ayn <span class="a">ع</span> is ${FORMS[f]}.` + (ch.length ? ` Re-shaped: ${list(ch)}.` : ''));
    btn.textContent = `Show ع ${FORMS[seq[(s + 1) % 4]]}`;
  });
  say('Use the button to step ayn <span class="a">ع</span> through its four forms.');
}

document.fonts.load('700 100px "Reem Kufi"', 'الفن العربي').catch(() => {}).finally(() => {
  measure();
  LT.forEach(l => { l.rest = l.form = formOf(l.i); });
  size(); settle();
  hero.classList.add('live');
  if (RM) {
    LT.forEach(l => { l.el.removeAttribute('role'); l.el.removeAttribute('aria-label'); l.el.tabIndex = -1; });
    hero.classList.add('still');
    hero.dataset.keys = 'F1:Glossary';
    $('#slkeys').innerHTML = '<span><b>F1</b>Glossary</span>';
    $('.hint').textContent = 'Step ayn ع through its four shapes. Its neighbors change shape too.';
    refresh(); draw(); stepper();
  }
  else { intro(); draw(); wake(); }
});

// Collection: one line of type per program, the screenshot clipped inside the letterforms.
const GLANCE = {
  'arabart-demo': 'Shows everything the ARABART library can do with Arabic on a DOS graphics screen.',
  'arabart-editor': "Type Arabic and try the ARABART library's features for yourself.",
  'arabart-commercial': "An animated ad for an Egyptian computer store: ARABART's first practical use.",
  'digi-test': 'The on-screen half of his graduation project: build digital circuits, then simulate them.',
  'text-editor-gui': 'His interview assignment for his first professional job: a text editor that saves, loads, scrolls and inserts.',
  'text-editor-demo': 'The same interview assignment, rebuilt with a windows-inspired interface.',
  'formula-solver': 'A paid challenge: floating-point math in Assembly with no math co-processor, done with BCD.',
  'kvc-antivirus': 'An antivirus for Koko, an Egyptian virus that wiped hard drives and that no antivirus of the time detected.',
  'kemyam-splash': 'A splash screen that introduces the members of his graduation-project group, KEMYAM.',
  'arabic-basmallah': 'The Basmallah in many styles and colors, written to show what ARABART can do.',
  'portsaid-cs-splash': 'The boot screen on every PC that Port Said Computer Systems sold. In return, he got his first mouse.',
  'portsaid-it-screensaver': "A gift from his internship: the screensaver on every computer in Port Said's Governorate IT Department.",
  'brave-sun': 'Arabic educational software about the sun. Third place in the PC Middle East programming competition.',
  'taher': "A calligraphic Arabic splash screen, an extra gift for a lab physician's results software.",
  'winkey': 'A demo of the windowing library he began, with 3D buttons that animate when pressed.',
};
const USES_ARABART = new Set(['arabart-demo', 'arabart-editor', 'arabart-commercial', 'arabic-basmallah']);
const spec = $('.specimen');
const progs = [...(window.PROGRAMS || [])].sort((a, b) => a.year - b.year);
spec.innerHTML = progs.map(p => {
  const [main, sub] = p.title.split(' - ');
  const txt = esc(main) + (sub ? `<tspan class="t2"> ${esc(sub)}</tspan>` : '');
  const bytes = p.size.toLocaleString('en-US');
  return `<li class="row">
  <button class="spec" type="button" aria-expanded="false" aria-controls="m-${p.id}">
    <span class="yr">${p.year}</span>
    <span class="ttl"><span class="sr">${esc(p.title)}</span><svg class="spec-svg" aria-hidden="true"><defs><clipPath id="c-${p.id}"><text class="t" x="0" y="0.84em">${txt}</text></clipPath></defs><g class="pic" clip-path="url(#c-${p.id})"><image href="../../images/${p.image}" preserveAspectRatio="xMidYMid slice"/></g><text class="t ink" x="0" y="0.84em">${txt}</text></svg></span>
    <span class="aside" aria-hidden="true"><span class="meta"><b>${esc(p.language)}</b>${bytes} bytes</span><span class="gl-line">${esc(GLANCE[p.id] || p.subtitle)}</span></span>
  </button>
  <div class="more" id="m-${p.id}" inert><div class="more-in"><div class="more-grid">
    <img src="../../images/${p.image}" width="962" height="600" loading="lazy" alt="${esc(p.title)}, ${esc(p.subtitle)}: screenshot">
    <div><p class="lead">${esc(GLANCE[p.id] || p.subtitle)}</p>
      <dl class="facts"><dt>File</dt><dd><code>${esc(p.folder)}\\${esc(p.executable)}</code></dd><dt>Size</dt><dd>${bytes} bytes</dd><dt>Language</dt><dd>${esc(p.language)}</dd><dt>Year</dt><dd>${p.year}</dd></dl>
      ${USES_ARABART.has(p.id) ? '<a class="go" href="#arabart">Read the ARABART exhibit</a>' : ''}
    </div>
  </div></div></div>
</li>`;
}).join('');

function fitTitles() {
  for (const svg of $$('.spec-svg', spec)) {
    svg.style.removeProperty('--fs-row');
    const ink = $('.ink', svg), base = parseFloat(getComputedStyle(svg).fontSize), len = ink.getComputedTextLength(), avail = svg.clientWidth;
    if (len > avail) svg.style.setProperty('--fs-row', base * avail / len * 0.985 + 'px');
    const b = ink.getBBox();
    attrs($('image', svg), { x: b.x, y: b.y, width: b.width, height: b.height });
  }
}
const setRow = (li, open) => {
  li.classList.toggle('open', open);
  $('.spec', li).setAttribute('aria-expanded', open);
  $('.more', li).inert = !open;
};
spec.addEventListener('click', e => {
  const b = e.target.closest('.spec');
  if (!b) return;
  const li = b.parentElement, open = !li.classList.contains('open');
  $$('.row.open', spec).forEach(r => r !== li && setRow(r, false));
  setRow(li, open);
});

// Exhibit: Glance, Story, Code as three joints, opened in sequence.
const joints = $$('.joint');
let depth = 0;
function setDepth(n) {
  depth = n;
  joints.forEach((j, i) => {
    const o = i <= n;
    j.dataset.open = o;
    $('.joint-btn', j).setAttribute('aria-expanded', o);
    $('.joint-body', j).inert = !o;
  });
}
setDepth(0);
joints.forEach((j, i) => {
  const b = $('.joint-btn', j);
  let y0 = null, pulled = false;
  b.addEventListener('click', () => {
    if (pulled) { pulled = false; return; }
    setDepth(i === 0 ? 0 : depth === i ? i - 1 : i);
  });
  // Mouse users can also pull a closed joint downward to open it.
  b.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || i <= depth) return;
    y0 = e.clientY; pulled = false; b.setPointerCapture(e.pointerId); j.classList.add('pulling');
  });
  b.addEventListener('pointermove', e => {
    if (y0 === null) return;
    const d = Math.max(0, Math.min(56, e.clientY - y0));
    j.style.setProperty('--pull', d + 'px');
    if (d > 28 && !pulled) { pulled = true; setDepth(i); }
  });
  const end = () => { y0 = null; j.classList.remove('pulling'); j.style.setProperty('--pull', '0px'); };
  b.addEventListener('pointerup', end);
  b.addEventListener('pointercancel', end);
});

// Glossary popovers: hover on fine pointers, tap or click everywhere.
const pop = $('#gpop');
let cur = null, pinned = false, ht;
const isOpen = () => pop.matches(':popover-open');
function place(btn) {
  const r = btn.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
  const x = Math.min(Math.max(12, r.left), innerWidth - pw - 12);
  const y = r.bottom + ph + 46 > innerHeight ? r.top - ph - 10 : r.bottom + 10;
  pop.style.left = x + 'px'; pop.style.top = y + 'px';
}
function showTerm(btn, pin) {
  const id = btn.dataset.term, dt = document.getElementById('g-' + id);
  if (!dt) return;
  pop.innerHTML = `<p class="gp-t">${dt.textContent}</p><p>${dt.nextElementSibling.innerHTML}</p><a href="#g-${id}">Open the glossary</a>`;
  if (cur && cur !== btn) cur.setAttribute('aria-expanded', 'false');
  if (!isOpen()) pop.showPopover();
  place(btn);
  cur = btn; pinned = pin;
  btn.setAttribute('aria-expanded', 'true');
}
$$('.term').forEach(t => { t.setAttribute('aria-controls', 'gpop'); t.setAttribute('aria-expanded', 'false'); });
pop.addEventListener('toggle', e => { if (e.newState === 'closed' && cur) { cur.setAttribute('aria-expanded', 'false'); cur = null; } });
document.addEventListener('click', e => { const t = e.target.closest('.term'); if (t) showTerm(t, true); });
if (matchMedia('(hover: hover)').matches) {
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('.term');
    if (t) { clearTimeout(ht); ht = setTimeout(() => showTerm(t, false), 120); }
    else if (e.target.closest('#gpop')) clearTimeout(ht);
  });
  document.addEventListener('pointerout', e => {
    if (!e.target.closest('.term, #gpop')) return;
    clearTimeout(ht);
    ht = setTimeout(() => { if (!pinned && isOpen()) pop.hidePopover(); }, 260);
  });
}
addEventListener('scroll', () => { if (cur && isOpen()) place(cur); }, { passive: true });

// Career arc: one joined line. Upright strokes are as tall as the years spent in each era.
const arc = $('.arc'), arcSvg = $('.arc-line'), pDone = $('.arc-done'), pOpen = $('.arc-open'), cursor = $('.cursor'), nodes = $$('.node', arc);
const YEARS = [2.5, 3.3, 10.1];
let arcLen = 0, fracs = [];
function buildArc() {
  const ar = arc.getBoundingClientRect();
  const pts = nodes.map(n => { const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2 - ar.left, y: r.top + r.height / 2 - ar.top }; });
  const horiz = Math.abs(pts[1].y - pts[0].y) < 4, u = 14;
  attrs(arcSvg, { width: ar.width, height: ar.height });
  let x = horiz ? 0 : pts[0].x, y = horiz ? pts[0].y : pts[0].y - 24, d = `M${x},${y}`, len = 0;
  fracs = [];
  pts.slice(0, 3).forEach((p, i) => {
    len += Math.hypot(p.x - x, p.y - y); fracs.push(len);
    d += ` L${p.x},${p.y}`;
    if (horiz) { d += ` l0,${-YEARS[i] * u} l0,${YEARS[i] * u}`; len += YEARS[i] * u * 2; }
    x = p.x; y = p.y;
  });
  arcLen = len;
  fracs = fracs.map(f => f / len);
  pDone.setAttribute('d', d);
  const end = horiz ? { x: ar.width - 24, y: pts[3].y } : { x: pts[3].x, y: ar.height - 8 };
  pOpen.setAttribute('d', `M${pts[2].x},${pts[2].y} L${pts[3].x},${pts[3].y} L${end.x},${end.y}`);
  cursor.style.left = end.x + 'px'; cursor.style.top = end.y + 'px';
  cursor.style.rotate = horiz ? '0deg' : '90deg';
  if (arc.classList.contains('drawing')) { pDone.style.strokeDasharray = arcLen; }
}
function setArc(pr) {
  pDone.style.strokeDashoffset = arcLen * (1 - pr);
  nodes.slice(0, 3).forEach((n, i) => n.classList.toggle('lit', pr >= fracs[i] - 0.005));
  nodes[3].classList.toggle('lit', pr > 0.98);
  arc.classList.toggle('done', pr > 0.98);
}
buildArc();
if (G && window.ScrollTrigger && !RM) {
  arc.classList.add('drawing');
  buildArc();
  ScrollTrigger.create({ trigger: arc, start: 'top 78%', end: 'bottom 70%', onUpdate: s => setArc(s.progress), onRefresh: s => setArc(s.progress) });
}

// Latin headings join up: letters start apart and close in, the way the Arabic letters do.
document.fonts.ready.then(() => {
  fitTitles();
  if (!G || !window.SplitText || RM) return;
  $$('h1.split, h2.split').forEach(h => {
    const s = SplitText.create(h, { type: 'words,chars' }), n = s.chars.length;
    const from = { x: i => (i - (n - 1) / 2) * 10, duration: 1.2, ease: 'expo.out', stagger: { each: 0.012, from: 'center' } };
    if (h.tagName === 'H1') G.from(s.chars, { ...from, delay: 0.5 });
    else G.from(s.chars, { ...from, scrollTrigger: { trigger: h, start: 'top 90%' } });
  });
  if (window.ScrollTrigger) ScrollTrigger.refresh();
});

// Status line: context keys for the section in view, F1 and Esc.
const keys = $('#slkeys'), sl = $('.statusline');
const io = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) sl.classList.toggle('in-hero', en.target === hero);
  if (en.isIntersecting) keys.innerHTML = en.target.dataset.keys.split('|').map(s => { const [a, b] = s.split(':'); return `<span><b>${a}</b>${b}</span>`; }).join('');
}), { rootMargin: '-45% 0px -45% 0px' });
$$('[data-keys]').forEach(s => io.observe(s));
document.addEventListener('keydown', e => {
  if (e.key === 'F1') { e.preventDefault(); $('#glossary').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); }
  if (e.key === 'Escape' && LT.some(l => l.free) && !isOpen()) rejoinAll();
});

let rt, lastW = innerWidth;
addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    if (M) {
      const wch = innerWidth !== lastW;
      lastW = innerWidth;
      if (wch) { LT.forEach(l => { l.free = false; l.homing = false; }); refresh(); }
      size();
      if (wch) settle();
      draw(); wake();
    }
    fitTitles(); buildArc();
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }, 150);
});
window.__joined = { LT, links, get fs() { return fs; } };
})();
