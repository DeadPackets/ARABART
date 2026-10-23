// Performance tier: shaders run only where they will be smooth. Everything else gets the static look.
export const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** WebGL is worth trying: motion allowed and not a low-memory device. The context itself is the final test. */
export function canGL(): boolean {
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  return !RM && !(mem !== undefined && mem < 4) && !(navigator.hardwareConcurrency <= 2);
}

/** Canvas pixels per CSS pixel: the device ratio divided by a whole number, at most 1.5. A pixelated canvas then lands on whole device pixels. */
export function dprCap(): number {
  const d = devicePixelRatio || 1;
  return d / Math.ceil(d / 1.5);
}

/** Median frame time over the next n frames, in ms. */
export function probe(n = 24): Promise<number> {
  return new Promise(done => {
    const t: number[] = [];
    let last = 0;
    const tick = (now: number) => {
      if (last) t.push(now - last);
      last = now;
      if (t.length < n) requestAnimationFrame(tick);
      else done(t.sort((a, b) => a - b)[n >> 1]);
    };
    requestAnimationFrame(tick);
  });
}

/** Calls run(true) while el is on screen and the tab is visible, run(false) otherwise. */
export function whileVisible(el: Element, run: (on: boolean) => void, margin = '0px') {
  let seen = false;
  const sync = () => run(seen && !document.hidden);
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; sync(); }, { rootMargin: margin }).observe(el);
  document.addEventListener('visibilitychange', sync);
}
