// The hero film is a sticky screen inside a tall section (CSS does the pinning). This reports how far through it you are, 0 to 1.
export function pinFilm(hero: HTMLElement, pin: HTMLElement, set: (p: number) => void) {
  let last = -1;
  const read = (e?: Event) => {
    const r = hero.getBoundingClientRect(), top = parseFloat(getComputedStyle(pin).top) || 0;
    const span = r.height - pin.offsetHeight;
    const p = span > 0 ? Math.min(1, Math.max(0, (top - r.top) / span)) : 0;
    // past the film the value stays 1: no redraw of a canvas nobody sees while the rest of the page scrolls
    if (p !== last || e?.type === 'resize') { last = p; set(p); }
  };
  addEventListener('scroll', read, { passive: true });
  addEventListener('resize', read);
  read();
  return { kill() { removeEventListener('scroll', read); removeEventListener('resize', read); } };
}
