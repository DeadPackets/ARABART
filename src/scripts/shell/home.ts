// The home page moves through his eras. The section under the middle of the screen sets the era of the whole page
// (menu, taskbar, colors); the wallpaper behind it slides between eras as each new section scrolls in.
import { ERAS, ORDER, type Era } from '../../lib/eras/eras';
import { canGL, dprCap } from './tier';

const root = document.documentElement;
const secs = [...document.querySelectorAll<HTMLElement>('.era-sec[data-era]')];
const sh = document.querySelector<HTMLElement>('[data-sh]')!;
const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
const idx = (s: HTMLElement) => ORDER.indexOf(s.dataset.era as Era);

let cur = root.dataset.era as Era;
function setEra(e: Era) {
  if (e === cur) return;
  cur = e;
  root.dataset.era = e;
  const [place, year] = ERAS[e].when;
  document.querySelectorAll('[data-when-place]').forEach(el => (el.textContent = place));
  document.querySelectorAll('[data-when-year]').forEach(el => (el.textContent = year));
  if (meta) meta.content = ERAS[e].theme;
  sh.classList.remove('redraw');
  void sh.offsetWidth;
  sh.classList.add('redraw');
}
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setEra((e.target as HTMLElement).dataset.era as Era)), {
  rootMargin: '-48% 0px -51% 0px',
});
secs.forEach(s => io.observe(s));

// Wallpaper: WebGL where it will be smooth; otherwise each section keeps its own CSS background
async function wallpaper() {
  if (!canGL()) return;
  const canvas = document.querySelector<HTMLCanvasElement>('.era-bg');
  if (!canvas) return;
  try {
    const { createBackdrop } = await import('./backdrop');
    const bg = createBackdrop(canvas, dprCap());
    root.classList.add('gl-bg');
    // the boundary nearest the middle of the screen: the era above it and the era below it
    const mix = () => {
      const vh = innerHeight;
      let best = Infinity, a = idx(secs[0]), b = a, y = 1e5;
      for (let i = 1; i < secs.length; i++) {
        const top = secs[i].getBoundingClientRect().top;
        if (top < vh * 0.5) { a = b = idx(secs[i]); y = -1e5; }
      }
      for (let i = 1; i < secs.length; i++) {
        const ea = idx(secs[i - 1]), eb = idx(secs[i]), top = secs[i].getBoundingClientRect().top;
        if (ea === eb || top < -vh * 0.4 || top > vh * 1.4) continue;
        const d = Math.abs(top - vh / 2);
        if (d < best) { best = d; a = ea; b = eb; y = top; }
      }
      bg.set(a, b, y);
    };
    mix();
    addEventListener('scroll', mix, { passive: true });
    addEventListener('resize', mix);
  } catch {
    root.classList.remove('gl-bg');
  }
}
wallpaper();

import('./smooth').then(m => m.smooth());

// F9 runs his programs, as F9 ran the program in his Borland IDE
addEventListener('keydown', e => {
  if (e.key !== 'F9') return;
  e.preventDefault();
  const lenis = (window as unknown as { lenis?: { scrollTo(t: string): void } }).lenis;
  if (lenis) lenis.scrollTo('#programs'); else document.getElementById('programs')?.scrollIntoView();
});
