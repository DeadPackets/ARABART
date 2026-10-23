// Browser helpers for the KemYam and Port Said toys: his file, decoded once per page, and a canvas painter.
import { blit, mem } from '../ega.ts';
import { kemyam, portsaid, NAMES, PORTSAID, type Screen } from './rle.ts';

export const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

let k: Promise<ReturnType<typeof kemyam>> | null = null, p: Promise<ReturnType<typeof portsaid>> | null = null;
/** NAMES.COM, fetched and decoded with his own decoder. */
export const names = () => (k ??= mem(NAMES).then(kemyam));
/** PORTSAID.EXE, fetched and decoded. */
export const boot = () => (p ??= mem(PORTSAID).then(portsaid));

/** Paints a screen (or raw indexed pixels) into a canvas at its own resolution; CSS does the scaling. */
export function paint(canvas: HTMLCanvasElement, s: Screen | Uint8Array, w?: number, h?: number, mask = 15) {
  if (s instanceof Uint8Array) blit(canvas, s, w!, h!);
  else blit(canvas, s.pixels(mask), s.pitch * 8, s.rows);
}

/** Runs fn every animation frame while the element is on screen and the tab is visible; returns a stop function. */
export function frames(el: Element, fn: (t: number) => boolean | void) {
  let raf = 0, seen = true, done = false;
  const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) go(); });
  const tick = (t: number) => { raf = 0; if (done) return; if (fn(t) === false) return stop(); go(); };
  const go = () => { if (!raf && seen && !document.hidden && !done) raf = requestAnimationFrame(tick); };
  const vis = () => go();
  const stop = () => { done = true; cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener('visibilitychange', vis); };
  io.observe(el);
  document.addEventListener('visibilitychange', vis);
  go();
  return stop;
}
