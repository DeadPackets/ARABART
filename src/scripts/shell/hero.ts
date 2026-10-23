// The home hero: his ARABART engine draws the text, every pixel a square on the GPU. Typing re-draws it; scrolling plays the film:
// the word splits into letters, one letter shows its four shapes, the word joins again, his name and Port Said 1991 arrive,
// and the pixels fly into Norton Commander's two panels, which come alive with his real files.
// Weak devices and reduced motion get the same engine painted once in 2D.
import { load, render, draw, translate, fromKey, fromUnicode, toUnicode, paint, type Bin, type Bitmap } from '../../lib/arabart';
import { canGL, dprCap, probe, RM } from './tier';
import { compose, scatter, createPixels, type State, type Pixels } from './pixels';

type Text = State & { end: [number, number] };
const OPT = { font: 3, color: 14, mode: '3d', shadow: 4 } as const;
const MAXK = 16;
const DEFAULT = 'الفن العربي';
const NAME = ['ياسر عوض', 'بورسعيد ١٩٩١'];

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)!;
const hero = $('[data-hero]'), pin = $('.hero-pin', hero), stage = $('[data-stage]', hero);
const input = $<HTMLInputElement>('#hero-in'), caret = $('.stage-caret', hero), glc = $<HTMLCanvasElement>('.hero-gl', hero);
const c2d = $<HTMLCanvasElement>('.stage-2d', hero), said = $('[data-said]', hero), meaning = $('[data-meaning]', hero);
const keysOut = [...hero.querySelectorAll<HTMLElement>('[data-keys]')], letterOut = [...hero.querySelectorAll<HTMLElement>('[data-letter]')];
const caps = [...hero.querySelectorAll<HTMLElement>('[data-film] > li')], formLabels = [...hero.querySelectorAll<HTMLElement>('[data-forms] > span')];
const fades = [...hero.querySelectorAll<HTMLElement>('[data-fade]')];
const panels = [...hero.querySelectorAll<HTMLElement>('[data-ncp]')];

let bin: Bin;
let keys = fromUnicode(DEFAULT);
let px: Pixels | null = null;
let states: State[] = [];
let scales: number[] = [];
let centers: [number, number][] = [];
let formAt: [number, number][] = [];
let dpr = 1, film = 0, seg = -1, typed = false;

/* ---------- pictures ---------- */
const letterKeys = (k: string) => k.replace(/[@!#$*\n]/g, '');

/** The typed text drawn by his engine: on one line, or one word per line. end = where his pen stopped, on the last baseline. */
function textState(k: string, stacked = false): Text {
  const words = stacked ? k.split(' ').filter(Boolean) : [k];
  const parts: { img: Bitmap; x: number; y: number }[] = [];
  let y = 0, end: [number, number] = [0, 0];
  for (const w of words.length ? words : ['']) {
    const img = render(bin, w, OPT), x = -Math.round(img.width / 2);
    parts.push({ img, x, y });
    end = [x + img.x - img.advance, y + img.y];
    y += img.height + 8;
  }
  const s = compose(parts);
  return { ...s, end: [end[0] - s.cx!, end[1] - s.cy!] };
}

function splitState(k: string, maxW: number): State {
  const words = letterKeys(k).split(' ').filter(Boolean);
  const glyphs = words.map(w => [...w].map(ch => draw(bin, [translate(bin, ch)[0] & 0x3f], OPT)));
  const gap = 7, wgap = 22;
  const wordW = glyphs.map(g => g.reduce((s, b) => s + b.advance, 0) + gap * (g.length - 1));
  const stacked = wordW.reduce((s, w) => s + w, 0) + wgap * (words.length - 1) > maxW;
  const parts: { img: Bitmap; x: number; y: number }[] = [];
  let pen = 0, y = 0;
  glyphs.forEach((g, wi) => {
    if (stacked) { pen = Math.round(wordW[wi] / 2); y = wi * 48; }
    for (const b of g) { parts.push({ img: b, x: pen - b.x, y: y - b.y }); pen -= b.advance + gap; }
    pen -= wgap - gap;
  });
  return compose(parts);
}

/** One letter in its four shapes, right to left: alone, at the start, in the middle, at the end. ع if the text has one.
 *  On a phone they sit two by two, so each pixel can stay large. */
function formsState(k: string, twoRows = false): State {
  const ks = [...letterKeys(k)];
  const i = ks.includes('u') ? ks.indexOf('u') : ks.findIndex(ch => (translate(bin, ch)[0] & 0xc0) === 0xc0);
  const key = i < 0 ? 'u' : ks[i];
  letterOut.forEach(el => (el.textContent = toUnicode(key)));
  const c = translate(bin, key)[0] & 0x3f;
  const parts: { img: Bitmap; x: number; y: number }[] = [], mids: [number, number][] = [];
  let pen = 0, row = 0;
  [c, c | 0x80, c | 0xc0, c | 0x40].forEach((code, n) => {
    if (twoRows && n === 2) { pen = 0; row = 62; }
    const b = draw(bin, [code], OPT);
    parts.push({ img: b, x: pen - b.x, y: row - b.y });
    mids.push([pen - b.advance / 2, row]);
    pen -= b.advance + (twoRows ? 44 : 30);
  });
  const s = compose(parts);
  formAt = mids.map(([x, y]) => [x - s.cx!, y - s.cy!]);
  return s;
}

/** His name over Port Said 1991; on a phone the city and the year take a line each. */
function nameState(narrow = false): State {
  const lines = narrow ? [NAME[0], ...NAME[1].split(' ')] : NAME;
  let y = 0;
  return compose(lines.map(t => {
    const img = render(bin, fromUnicode(t), OPT), part = { img, x: -Math.round(img.width / 2), y };
    y += img.height + 10;
    return part;
  }));
}

/** The pixels' landing: the frames, column lines, cursor bar and file names of the panels on screen, around canvas point c. */
function panelsState(c: [number, number], s: number): State {
  const out: number[] = [];
  const pr = pin.getBoundingClientRect();
  const u = (v: number, o: number) => Math.round((v * dpr - o) / s);
  const hline = (x0: number, x1: number, y: number, col: number) => { for (let x = u(x0, c[0]); x <= u(x1, c[0]); x++) out.push(x, u(y, c[1]), col, 1); };
  const vline = (x: number, y0: number, y1: number, col: number) => { for (let y = u(y0, c[1]); y <= u(y1, c[1]); y++) out.push(u(x, c[0]), y, col, 1); };
  for (const p of panels) {
    const r = p.getBoundingClientRect();
    if (!r.width) continue;
    const L = r.left - pr.left, T = r.top - pr.top, R = L + r.width, B = T + r.height;
    for (const d of [0, 3]) { hline(L + 6 + d, R - 6 - d, T + 9 + d, 11); hline(L + 6 + d, R - 6 - d, B - 6 - d, 11); vline(L + 6 + d, T + 9 + d, B - 6 - d, 11); vline(R - 6 - d, T + 9 + d, B - 6 - d, 11); }
    const list = p.querySelector('.ncf-rows')!.getBoundingClientRect(), ch = 9;
    p.querySelectorAll<HTMLElement>('.ncf-rows li:first-child a > span:not(:first-child)').forEach(c => {
      if (c.offsetWidth) vline(c.getBoundingClientRect().left - pr.left, list.top - pr.top, list.bottom - pr.top, 11);
    });
    p.querySelectorAll<HTMLElement>('.ncf-rows a').forEach(a => {
      const ar = a.getBoundingClientRect(), y = ar.top - pr.top + ar.height / 2, x = ar.left - pr.left + 8;
      if (a.classList.contains('on')) for (let k = -4; k <= 4; k += 2) hline(ar.left - pr.left, ar.right - pr.left, y + k, 3);
      else hline(x, x + a.querySelector('.n')!.textContent!.trimEnd().length * ch, y, a.classList.contains('x') ? 15 : 11);
    });
  }
  const n = out.length / 4, rows: number[][] = [];
  for (let i = 0; i < n; i++) rows.push(out.slice(i * 4, i * 4 + 4));
  rows.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  return { px: new Float32Array(rows.flat()), n, w: 0, h: 0 };
}

/* ---------- layout: each picture gets its own whole-number pixel size, so every ARABART pixel lands on whole device pixels ---------- */
const whole = (css: number) => Math.max(1, Math.floor(css * dpr));
const fitS = (s: State, bw: number, bh: number, cap: number) => whole(s.n ? Math.min(bw / s.w, bh / s.h, cap) : 1);

/** The hero text at the largest size that fits the stage: one line, or one word per line when that is larger. */
function heroText(bw: number, bh: number, cap: number): [Text, number] {
  const one = textState(keys), sOne = fitS(one, bw, bh, cap);
  if (!keys.includes(' ')) return [one, sOne];
  const two = textState(keys, true), sTwo = fitS(two, bw, bh, cap);
  return sTwo > sOne ? [two, sTwo] : [one, sOne];
}

/** Puts the blinking underscore where his pen stopped, and the meaning line under the letters. o = stage position of point (0, 0). */
function marks(s: Text, o: [number, number], k: number) {
  const w = Math.max(10, 8 * k), h = Math.max(3, 2 * k);
  caret.style.cssText = `left:${o[0] + (s.n ? (s.end[0] - 3) * k - w : -w / 2)}px;top:${o[1] + (s.end[1] + 3) * k}px;width:${w}px;height:${h}px`;
  meaning.style.setProperty('--meaning-top', `${o[1] + (s.h / 2 + 4) * k + 18}px`);
}

function build() {
  const W = pin.clientWidth, H = pin.clientHeight, phone = W < 760;
  const pr = pin.getBoundingClientRect(), sr = stage.getBoundingClientRect();
  const fw = W * (phone ? 0.94 : 0.9), fh = H * (phone ? 0.44 : 0.52);
  const [s0, sS] = heroText(W * (phone ? 0.98 : 0.92), sr.height * 0.72, phone ? 6 : 10);
  const joined = textState(keys), forms = formsState(keys, phone), name = nameState(phone);
  const sJ = fitS(joined, fw, fh, phone ? 6 : 10);
  const sF = fitS(forms, phone ? fw : fw * 0.8, phone ? fh * 0.8 : fh, phone ? 6 : 9);
  const sN = fitS(name, fw, fh, phone ? 5 : 8);
  const split = splitState(keys, (fw * dpr) / sJ);
  const sP = fitS(split, fw, fh, sJ / dpr);
  const cStage: [number, number] = [(sr.left - pr.left + sr.width / 2) * dpr, (sr.top - pr.top + sr.height * 0.44) * dpr];
  const cFilm: [number, number] = [(W / 2) * dpr, H * (phone ? 0.36 : 0.42) * dpr];
  const sL = whole(2);
  states = [s0, split, forms, joined, name, panelsState(cFilm, sL)];
  scales = [sS, sP, sF, sJ, sN, sL];
  centers = [cStage, cFilm, cFilm, cFilm, cFilm, cFilm];
  formLabels.forEach((el, i) => {
    const [x, y] = formAt[i] ?? [0, 0];
    el.style.left = `${(cFilm[0] + x * sF) / dpr}px`;
    el.style.top = `${(cFilm[1] + (y + 14) * sF) / dpr + 6}px`;
  });
  marks(s0, [cStage[0] / dpr - (sr.left - pr.left), cStage[1] / dpr - (sr.top - pr.top)], sS / dpr);
}

/* ---------- drawing on demand: no loop runs while nothing moves ---------- */
let queued = false;
const frame = () => { queued = false; px?.draw(); };
const redraw = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };

function useSeg(i: number) {
  if (!px || seg === i) return;
  seg = i;
  px.pair(states[i], states[i + 1]);
  px.u.uC0.value = centers[i];
  px.u.uC1.value = centers[i + 1];
  px.u.uS0.value = scales[i];
  px.u.uS1.value = scales[i + 1];
  px.u.uSpread.value = i === 4 ? 0.5 : 0.35;
  px.u.uArc.value = i === 4 ? 0.3 : i === 0 || i === 2 ? 0.5 : 1;
}

/** Scroll position of the film, 0 to 1. Each step rests at both ends so the picture holds while you read. */
function setFilm(p: number) {
  film = p;
  const f = p * 5, i = Math.min(4, Math.floor(f)), t = f - i;
  const m = Math.min(1, Math.max(0, (t - 0.18) / 0.64));
  const cap = i + (m > 0.5 ? 1 : 0);
  if (px && (p > 0 || seg >= 0)) { tweens.forEach(k => k.kill()); tweens.length = 0; useSeg(i); px.u.uT.value = m; redraw(); }
  caps.forEach((li, k) => li.classList.toggle('on', k + 1 === cap));
  hero.dataset.step = String(cap);
  if (p > 0.04 && document.activeElement === input) input.blur();
  const head = Math.max(0, 1 - f / 0.3);
  fades.forEach(el => { el.style.opacity = String(head); el.style.visibility = head ? '' : 'hidden'; });
  ncLive(!!px && i === 4 && m > 0.82);
}

/* ---------- the panels: a cursor bar that walks his files until you take over ---------- */
let ncOn = false, ncTimer = 0, ncHeld = false;
function ncPick(p: HTMLElement, a: HTMLAnchorElement) {
  panels.forEach(q => q.classList.toggle('is-active', q === p));
  p.querySelectorAll('.ncf-rows a.on').forEach(x => x.classList.remove('on'));
  a.classList.add('on');
  $('[data-st-file]', p).textContent = a.dataset.file!;
  $('[data-st-title]', p).textContent = a.dataset.title!;
}
function ncStep() {
  if (ncHeld) return;
  const p = panels.find(q => q.classList.contains('is-active') && q.offsetWidth) ?? panels[0];
  const rows = [...p.querySelectorAll<HTMLAnchorElement>('.ncf-rows a')], i = rows.findIndex(a => a.classList.contains('on'));
  ncPick(p, rows[(i + 1) % rows.length]);
}
function ncLive(on: boolean) {
  if (on === ncOn) return;
  ncOn = on;
  hero.classList.toggle('nc-live', on);
  clearInterval(ncTimer);
  if (on && !RM) ncTimer = window.setInterval(ncStep, 1100);
}
panels.forEach(p => {
  p.querySelectorAll<HTMLAnchorElement>('.ncf-rows a').forEach((a, i, all) => {
    a.addEventListener('pointerenter', () => { ncHeld = true; ncPick(p, a); });
    a.addEventListener('focus', () => { ncHeld = true; ncPick(p, a); });
    a.addEventListener('keydown', e => {
      const d = { ArrowDown: 1, ArrowUp: -1 }[e.key];
      if (d) { e.preventDefault(); all[Math.max(0, Math.min(all.length - 1, i + d))].focus(); }
    });
  });
  p.addEventListener('pointerleave', () => (ncHeld = false));
  p.addEventListener('focusout', () => (ncHeld = false));
});

/* ---------- typing ---------- */
const tweens: { kill(): void }[] = [];
function tween(dur: number) {
  if (!px) return;
  const t0 = performance.now();
  let live = true;
  const step = (now: number) => {
    if (!live || !px) return;
    const k = Math.min(1, (now - t0) / dur);
    px.u.uT.value = 1 - Math.pow(1 - k, 3);
    px.draw();
    if (k < 1) requestAnimationFrame(step); else live = false;
  };
  requestAnimationFrame(step);
  tweens.push({ kill: () => { live = false; } });
}

let sayT = 0;
function setKeys(k: string) {
  if (k === keys) return;
  keys = k;
  keysOut.forEach(el => (el.textContent = keys));
  clearTimeout(sayT);
  sayT = window.setTimeout(() => (said.textContent = toUnicode(keys)), 500);
  if (px) {
    const snap = px.snapshot();
    build();
    if (film < 0.02) {
      tweens.forEach(t => t.kill()); tweens.length = 0;
      seg = -1;
      px.pair(snap, states[0]);
      px.u.uC0.value = centers[0]; px.u.uC1.value = centers[0]; px.u.uS0.value = px.u.uS1.value = scales[0]; px.u.uT.value = 0; px.u.uSpread.value = 0.25; px.u.uArc.value = 0.25;
      tween(520);
    } else { const s = seg; seg = -1; useSeg(Math.max(0, s)); redraw(); }
  } else paint2d();
}

// Latin letters (a phone's English keyboard, a paste) count as keys on his US keyboard, as they did for him
function fromValue() {
  let v = [...input.value].map(ch => (ch < '\x80' && ch !== ' ' ? toUnicode(ch) : ch)).join('');
  let k = fromUnicode(v);
  if (k.length > MAXK) { k = k.slice(0, MAXK); v = toUnicode(k); }
  if (v !== input.value) input.value = v;
  setKeys(k);
}
function firstKey() {
  if (!typed) { typed = true; if (input.value === DEFAULT) input.value = ''; }
}
/** A key pressed on a physical keyboard: the letter at that spot on an Arabic keyboard, whatever layout the visitor uses. */
function typeKey(e: KeyboardEvent): boolean {
  if (e.isComposing || e.key.length !== 1) return false;
  if (/[؀-ۿ]/.test(e.key)) { firstKey(); input.value += e.key; fromValue(); return true; }
  const k = fromKey(e), u = k === ' ' ? ' ' : k ? toUnicode(k) : '';
  if (!u) return false;
  firstKey();
  input.value += u;
  fromValue();
  return true;
}

input.addEventListener('keydown', e => {
  if (e.key === 'Escape') return input.blur();
  if (e.key === 'Backspace') firstKey();
  if (typeKey(e)) e.preventDefault();
});
input.addEventListener('input', () => { firstKey(); fromValue(); });
input.addEventListener('focus', () => hero.classList.add('typing'));
input.addEventListener('blur', () => {
  hero.classList.remove('typing');
  if (!input.value.trim()) { input.value = DEFAULT; typed = false; fromValue(); }
});
// Typing anywhere on the hero types into it, the way his editor took every key
addEventListener('keydown', e => {
  if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || e.key === ' ' || e.key.length !== 1) return;
  if ((e.target as Element).closest('input, textarea, select, [contenteditable]') || film > 0.03 || hero.getBoundingClientRect().bottom < 120) return;
  input.focus({ preventScroll: true });
  if (typeKey(e)) e.preventDefault();
});
function focusTyping(e?: Event) {
  e?.preventDefault();
  const lenis = (window as unknown as { lenis?: { scrollTo(y: number): void } }).lenis;
  if (scrollY > 4) lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
  input.focus({ preventScroll: true });
}
hero.querySelectorAll('[data-type]').forEach(b => b.addEventListener('click', focusTyping));
document.querySelectorAll('[data-act="type"]').forEach(b => b.addEventListener('click', focusTyping));
addEventListener('keydown', e => { if (e.key === 'F2') focusTyping(e); });
stage.addEventListener('pointerdown', () => setTimeout(() => input.focus({ preventScroll: true })));

/* ---------- static: his engine painted once, crisp, no shaders ---------- */
function toBitmap(s: State): Bitmap & { x0: number; y0: number } {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < s.n; i++) { const x = s.px[i * 4], y = s.px[i * 4 + 1]; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const width = s.n ? x1 - x0 + 1 : 0, height = s.n ? y1 - y0 + 1 : 0, data = new Uint8Array(width * height).fill(255);
  for (let i = 0; i < s.n; i++) data[(s.px[i * 4 + 1] - y0) * width + s.px[i * 4] - x0] = s.px[i * 4 + 2];
  return { width, height, data, x: 0, y: 0, advance: 0, x0, y0 };
}
function paint2d() {
  const sr = stage.getBoundingClientRect(), phone = innerWidth < 760, d = devicePixelRatio || 1;
  dpr = d;
  // Centered in the stage, the letters leave room under them for the meaning line (18 px + 4 pixels of up to 10 px, see marks)
  const [s, k] = heroText(sr.width * (phone ? 0.98 : 0.92), Math.min(sr.height * 0.72, sr.height - 2 * (meaning.offsetHeight + 58)), phone ? 6 : 10);
  const img = toBitmap(s);
  paint(c2d, img, k / d);
  c2d.hidden = !img.width;
  const cr = c2d.getBoundingClientRect();
  marks(s, [cr.left - sr.left - img.x0 * (k / d), cr.top - sr.top - img.y0 * (k / d)], k / d);
}

/* ---------- start ---------- */
let trigger: { kill(): void } | null = null;
async function start() {
  bin = await load(`${import.meta.env.BASE_URL}/arabart/fonts.bin`);
  hero.classList.add('live');
  keysOut.forEach(el => (el.textContent = keys));
  said.textContent = DEFAULT;
  let gl = canGL();
  if (gl) {
    try {
      dpr = dprCap();
      px = createPixels(glc, dpr);
      hero.classList.add('gl', 'is-film');
      let built = '';
      const size = () => {
        const key = `${pin.clientWidth}x${pin.clientHeight}`;
        if (!px || key === built) return;
        built = key;
        px.size(pin.clientWidth, pin.clientHeight);
        build();
        const s = seg;
        seg = -1;
        if (film > 0 || s >= 0) useSeg(Math.min(4, Math.floor(film * 5)));
        else {
          tweens.forEach(t => t.kill()); tweens.length = 0;
          px.pair(states[0], states[0]);
          px.u.uC0.value = px.u.uC1.value = centers[0]; px.u.uS0.value = px.u.uS1.value = scales[0]; px.u.uT.value = 1;
        }
        redraw();
      };
      size();
      // the opening: his pixels assemble out of scattered dust
      const s0 = states[0];
      px.pair(scatter(s0, (pin.clientWidth * dpr) / scales[0], (pin.clientHeight * dpr) / scales[0], 0), s0);
      px.u.uC0.value = centers[0]; px.u.uC1.value = centers[0]; px.u.uS0.value = px.u.uS1.value = scales[0]; px.u.uSpread.value = 0.55; px.u.uArc.value = 0.3;
      px.u.uT.value = 0;
      tween(1700);
      let rt = 0;
      new ResizeObserver(() => { clearTimeout(rt); rt = window.setTimeout(size, 120); }).observe(pin);
      const { pinFilm } = await import('./film');
      trigger = pinFilm(hero, pin, setFilm);
      // a device that cannot hold 30 frames a second while the opening plays gets the static picture
      if ((await probe(24)) > 34) throw new Error('slow');
    } catch {
      gl = false;
      teardown();
    }
  }
  if (!gl) { paint2d(); new ResizeObserver(() => paint2d()).observe(stage); }
}
function teardown() {
  tweens.forEach(t => t.kill());
  px = null;
  trigger?.kill();
  hero.classList.remove('gl', 'is-film');
  glc.hidden = true;
  setFilm(0);
}

start();
