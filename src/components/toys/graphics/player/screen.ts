// A 16-color screen in a canvas: pixels go in one at a time (his player plots them), the canvas updates once a frame.
import { EGA } from '../ega.ts';

export class Screen {
  ctx: CanvasRenderingContext2D; img: ImageData; d: Uint32Array; w: number; h: number; x0: number; y0: number;
  abgr = EGA.map(c => (0xff000000 | ((c & 0xff) << 16) | (c & 0xff00) | (c >> 16)) >>> 0);
  /** A window onto his 640x350 screen: (x0, y0) is its top-left corner. */
  constructor(canvas: HTMLCanvasElement, w = 640, h = 350, x0 = 0, y0 = 0) {
    canvas.width = w; canvas.height = h;
    this.w = w; this.h = h; this.x0 = x0; this.y0 = y0;
    this.ctx = canvas.getContext('2d')!;
    this.img = this.ctx.createImageData(w, h);
    this.d = new Uint32Array(this.img.data.buffer);
    this.clear();
  }
  set(x: number, y: number, c: number) {
    x -= this.x0; y -= this.y0;
    if (x >= 0 && x < this.w && y >= 0 && y < this.h) this.d[y * this.w + x] = this.abgr[c & 15];
  }
  clear() { this.d.fill(this.abgr[0]); }
  /** Copy a whole 640x350 frame of color indexes. */
  load(pix: Uint8Array, W = 640) {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) this.d[y * this.w + x] = this.abgr[pix[(y + this.y0) * W + x + this.x0] & 15];
  }
  flush() { this.ctx.putImageData(this.img, 0, 0); }
}

export const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Runs tick() once per display frame while the element is on screen and the tab is visible. tick returns false to stop. */
export function loop(el: Element, tick: () => boolean | void) {
  let raf = 0, on = false, seen = false;
  const go = () => { raf = 0; if (!on || !seen || document.hidden) return; if (tick() === false) { on = false; return; } raf = requestAnimationFrame(go); };
  const kick = () => { if (on && seen && !raf) raf = requestAnimationFrame(go); };
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; kick(); }).observe(el);
  document.addEventListener('visibilitychange', kick);
  return {
    get on() { return on; },
    start() { on = true; kick(); },
    stop() { on = false; if (raf) cancelAnimationFrame(raf); raf = 0; },
  };
}

/** A radio group of buttons (role=radio): one tab stop, arrows move and pick. */
export function radios(group: HTMLElement, onPick: (b: HTMLButtonElement, i: number) => void) {
  const bs = [...group.querySelectorAll<HTMLButtonElement>('[role=radio]')];
  const pick = (b: HTMLButtonElement, focus = false) => {
    bs.forEach(x => { const on = x === b; x.setAttribute('aria-checked', String(on)); x.tabIndex = on ? 0 : -1; });
    if (focus) b.focus();
    onPick(b, bs.indexOf(b));
  };
  bs.forEach(b => b.addEventListener('click', () => pick(b)));
  group.addEventListener('keydown', e => {
    const k = bs.indexOf(document.activeElement as HTMLButtonElement);
    if (k < 0) return;
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    const to = e.key === 'Home' ? 0 : e.key === 'End' ? bs.length - 1 : d ? (k + d + bs.length) % bs.length : -1;
    if (to < 0) return;
    e.preventDefault(); pick(bs[to], true);
  });
  return { pick, get value() { return bs.findIndex(b => b.getAttribute('aria-checked') === 'true'); } };
}

export const NAMES = ['black', 'blue', 'green', 'cyan', 'red', 'magenta', 'brown', 'light gray', 'dark gray', 'light blue', 'light green', 'light cyan', 'light red', 'pink', 'yellow', 'white'];
export const hx = (v: number) => v.toString(16).toUpperCase().padStart(2, '0');
