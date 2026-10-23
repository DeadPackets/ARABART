// The live typewriter: his engine draws every key into a VGA frame; a strip shows each letter's two join bits.
import { gsap } from 'gsap';
import { fonts, draw, paint, fromKey, toUnicode, PALETTE, FORMS, hex, keysFromText, flipNumbers, type Step } from './core.ts';
import { compose, camera, W, H, type Opts, type Mode } from './screen.ts';
import type { CRT } from './crt.ts';

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const MAX = 240, MAX_LINES = 8;

export async function mount(root: HTMLElement) {
  const bin = await fonts();
  const $ = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const screen = $('[data-screen]'), input = $<HTMLTextAreaElement>('textarea'), canvas = $<HTMLCanvasElement>('canvas.k-tw-canvas');
  const caret = $('.k-tw-caret'), strip = $('[data-strip]'), said = $('[data-said]'), stored = $('[data-stored]');
  const d = root.dataset;
  let keys = d.keys ?? '';
  const o: Opts & { glow: boolean; whole: boolean } = {
    font: +d.font!, color: +d.color!, shadow: +d.shadow!, mode: d.mode as Mode,
    bold: false, italic: false, underline: false, double: false, glow: d.glow === 'true', whole: false,
  };

  // The frame as RGBA, for both the plain canvas and the shader
  const rgba = new Uint8Array(W * H * 4);
  const off = Object.assign(document.createElement('canvas'), { width: W, height: H });
  const offCtx = off.getContext('2d')!, img = offCtx.createImageData(W, H);
  const ctx2d = () => canvas.getContext('2d')!;
  let gl: CRT | null = null, glCanvas: HTMLCanvasElement | null = null;
  const cam = { x: 0, y: 0, w: W, h: H };
  let last = { pen: [0, 0, 0] as number[], trace: [] as Step[], codes: '' };

  function blit() {
    if (gl) { gl.view(cam.x, cam.y, cam.w, cam.h); placeCaret(); return; }
    const r = screen.getBoundingClientRect(), k = Math.min(devicePixelRatio || 1, 2);
    const cw = Math.round(r.width * k), ch = Math.round(r.height * k);
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    const c = ctx2d();
    c.imageSmoothingEnabled = false;
    c.fillStyle = '#000';
    c.fillRect(0, 0, cw, ch);
    c.drawImage(off, cam.x, cam.y, cam.w, cam.h, 0, 0, cw, ch);
    placeCaret();
  }
  function placeCaret() {
    const r = screen.getBoundingClientRect(), s = r.width / cam.w;
    const [px, py, ph] = last.pen;
    gsap.set(caret, { x: (px - 2 - cam.x) * s, y: (py - ph * 0.8 - cam.y) * s, width: Math.max(2, 2 * s), height: ph * 0.8 * s });
  }

  function update(how: 'type' | 'jump' = 'type') {
    const f = compose(bin, keys, o);
    last = f;
    for (let i = 0; i < W * H; i++) {
      const c = PALETTE[f.data[i]], j = i * 4;
      rgba[j] = c >> 16; rgba[j + 1] = (c >> 8) & 255; rgba[j + 2] = c & 255; rgba[j + 3] = 255;
    }
    img.data.set(rgba);
    offCtx.putImageData(img, 0, 0);
    gl?.frame(rgba);
    const v = camera(f.box, o.whole);
    gsap.to(cam, { ...v, duration: how === 'jump' || reduce() ? 0 : 0.7, ease: 'expo.out', overwrite: true, onUpdate: blit });
    blit();
    strips(f.trace, f.codes, how);
    const text = toUnicode(flipNumbers(keys));
    said.textContent = text;
    stored.textContent = flipNumbers(keys).replace(/\n/g, '↵') || ' ';
  }

  // The strip: one tile per letter of the line being typed, in screen order (right to left)
  let prev: { code: number; out: number }[] = [];
  function strips(trace: Step[], codes: string, how: string) {
    const tiles = trace.map(t => ({ ...t, key: codes[t.i] }));
    const old = [...strip.children] as HTMLElement[];
    tiles.forEach((t, i) => {
      let li = old[i];
      const same = prev[i] && prev[i].code === t.code && prev[i].out === t.out && li?.dataset.font === String(o.font);
      if (same) return;
      const fresh = !li;
      if (fresh) { li = document.createElement('li'); li.className = 'k-tw-tile'; strip.append(li); }
      const blank = t.code === 3, letter = toUnicode(t.key);
      li.dataset.font = String(o.font);
      li.classList.toggle('is-blank', blank);
      const l = t.out >> 7 & 1, r = t.out >> 6 & 1;
      li.innerHTML = blank ? '<span class="k-tw-sp">space</span>' :
        `<span class="k-tw-hand" data-on="${!!r}" title="bit 6: joins the letter before">${r}</span><canvas aria-hidden="true"></canvas><span class="k-tw-hand" data-on="${!!l}" title="bit 7: joins the letter after">${l}</span>` +
        `<span class="k-tw-code">${hex(t.out)}h</span><span class="k-tw-form">${FORMS[t.out >> 6]}</span><span class="sr-only">${letter} ${FORMS[t.out >> 6]}</span>`;
      const cv = li.querySelector('canvas');
      if (cv) paint(cv, draw(bin, [t.out], { font: o.font === 5 ? 5 : 3, color: 14 }), 1.5);
      if (how === 'type' && !reduce()) {
        if (fresh) gsap.from(li, { x: -24, opacity: 0, duration: 0.45, ease: 'expo.out' });
        else gsap.fromTo(li, { backgroundColor: 'rgba(255,255,85,0.35)' }, { backgroundColor: 'rgba(255,255,85,0)', duration: 0.8, ease: 'power2.out', clearProps: 'backgroundColor' });
      }
    });
    old.slice(tiles.length).forEach(li => li.remove());
    tiles.forEach((t, i) => (strip.children[i] as HTMLElement).classList.toggle('j-next', !!(t.out & 0x80) && !!(tiles[i + 1] && tiles[i + 1].out & 0x40)));
    prev = tiles.map(t => ({ code: t.code, out: t.out }));
    strip.scrollTo({ left: -strip.scrollWidth, behavior: reduce() || how === 'jump' ? 'auto' : 'smooth' });
  }

  // Typing. Physical keys go through fromKey, so any keyboard types like a 1993 US keyboard; Arabic layouts,
  // phones and paste arrive as text and go through fromUnicode.
  const add = (k: string) => {
    if (!k) return;
    const next = (keys + k).slice(0, MAX);
    if (next.split('\n').length > MAX_LINES) return;
    keys = next; update();
  };
  const del = () => { if (keys) { keys = keys.slice(0, -1); update(); } };
  input.addEventListener('keydown', e => {
    if (e.isComposing || e.keyCode === 229 || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Backspace') { e.preventDefault(); del(); return; }
    if (e.key === 'Enter') { e.preventDefault(); add('\n'); return; }
    if (e.key === 'Escape') { input.blur(); return; }
    if (e.key.length !== 1 || /[^\x20-\x7e]/.test(e.key)) return; // an Arabic layout: let it arrive as text
    const k = fromKey(e);
    if (k) { e.preventDefault(); add(k); }
  });
  input.addEventListener('beforeinput', e => {
    const t = e.inputType;
    if (t === 'insertCompositionText') return;
    e.preventDefault();
    if (t.startsWith('delete')) del();
    else if (t === 'insertLineBreak' || t === 'insertParagraph') add('\n');
    else add(keysFromText(e.data ?? e.dataTransfer?.getData('text/plain') ?? ''));
  });
  input.addEventListener('compositionend', () => { add(keysFromText(input.value)); input.value = ''; });
  input.addEventListener('focus', () => root.classList.add('is-typing'));
  input.addEventListener('blur', () => root.classList.remove('is-typing'));
  // Start typing anywhere while the typewriter is on screen
  addEventListener('keydown', e => {
    if (document.activeElement === input || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1 || e.key === ' ') return;
    if ((e.target as Element).closest?.('input, textarea, select, button, a, [contenteditable]')) return;
    const r = screen.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    e.preventDefault();
    input.focus({ preventScroll: true });
    add(/[^\x20-\x7e]/.test(e.key) ? keysFromText(e.key) : fromKey(e));
  });

  // On-screen keys
  root.querySelector('[data-keys]')!.addEventListener('click', e => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button[data-k]');
    if (!b) return;
    const k = b.dataset.k!;
    if (k === 'del') del(); else if (k === 'clear') { keys = ''; update(); } else add(k);
  });

  // Options
  const group = (name: string, apply: (v: string) => void) => {
    const bs = [...root.querySelectorAll<HTMLButtonElement>(`[data-opt="${name}"]`)];
    const pick = (b: HTMLButtonElement) => {
      bs.forEach(x => { x.setAttribute('aria-checked', String(x === b)); x.tabIndex = x === b ? 0 : -1; });
      apply(b.dataset.v!);
      update('jump');
    };
    bs.forEach((b, i) => {
      b.addEventListener('click', () => pick(b));
      b.addEventListener('keydown', e => {
        const dlt = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!dlt) return;
        e.preventDefault();
        const t = bs[(i + dlt + bs.length) % bs.length]; pick(t); t.focus();
      });
    });
  };
  group('font', v => { o.font = +v; root.dataset.font = v; });
  group('color', v => { o.color = +v; });
  group('shadow', v => { o.shadow = +v; });
  group('mode', v => { o.mode = v as Mode; root.dataset.mode = v; });
  root.querySelectorAll<HTMLButtonElement>('[data-toggle]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.toggle as 'bold' | 'italic' | 'underline' | 'double' | 'glow' | 'whole';
    o[k] = !o[k];
    b.setAttribute('aria-pressed', String(o[k]));
    if (k === 'glow') setGlow(o.glow); else update('jump');
  }));
  root.querySelector('[data-sun]')?.addEventListener('click', () => { keys = 'hgals'; update(); });

  // The phosphor shader, loaded only when wanted and possible
  async function setGlow(on: boolean) {
    if (on && !gl && !reduce()) {
      const { crt } = await import('./crt.ts');
      glCanvas = document.createElement('canvas');
      glCanvas.className = 'k-tw-gl';
      glCanvas.setAttribute('aria-hidden', 'true');
      screen.insertBefore(glCanvas, canvas.nextSibling);
      gl = crt(glCanvas);
      if (!gl) { glCanvas.remove(); glCanvas = null; }
      else { gl.frame(rgba); gl.view(cam.x, cam.y, cam.w, cam.h); }
    } else if (!on && gl) { gl.destroy(); gl = null; glCanvas?.remove(); glCanvas = null; }
    // Reduced motion or no usable GPU: the plain screen stays, and the switch says so
    o.glow = !!gl;
    root.querySelector('[data-toggle="glow"]')?.setAttribute('aria-pressed', String(o.glow));
    root.classList.toggle('is-glow', !!gl);
    blit();
  }

  new ResizeObserver(() => { gl?.resize(); blit(); }).observe(screen);
  update('jump');
  root.classList.add('is-live');
  if (o.glow) setGlow(true);
}
