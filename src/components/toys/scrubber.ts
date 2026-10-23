// One play, pause, step and scrub control for every diagram on the site. Markup: Scrubber.astro.
import { gsap } from 'gsap';

export type How = 'jump' | 'step' | 'play' | 'scrub';
export interface Scrub {
  readonly i: number;
  readonly n: number;
  readonly playing: boolean;
  go(i: number, how?: How): void;
  play(): void;
  pause(): void;
  step(): void;
  back(): void;
  reset(): void;
  resize(n: number, at?: number): void;
}

const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const all = new Set<{ root: HTMLElement; s: Scrub }>();

/** root is a [data-scrub] element. onStep runs for every change; speed is seconds per step while playing. */
export function scrubber(root: HTMLElement, onStep: (i: number, how: How) => void, o: { speed?: number } = {}): Scrub {
  const range = root.querySelector<HTMLInputElement>('input[type=range]')!;
  const out = root.querySelector<HTMLOutputElement>('output')!;
  const btn = (a: string) => root.querySelector<HTMLButtonElement>(`[data-act="${a}"]`);
  const playBtn = btn('play');
  let i = +(root.dataset.at ?? 0), n = +(root.dataset.n ?? 1), timer: gsap.core.Tween | null = null;

  const paint = () => {
    range.max = String(n - 1);
    range.value = String(i);
    range.setAttribute('aria-valuetext', `Step ${i + 1} of ${n}`);
    range.style.setProperty('--p', String(n > 1 ? i / (n - 1) : 1));
    out.textContent = `${i + 1} of ${n}`;
    // aria-disabled, not disabled: a focused button keeps focus when it reaches the end
    for (const a of ['back', 'reset']) btn(a)?.setAttribute('aria-disabled', String(i === 0));
    for (const a of ['step', 'fwd']) btn(a)?.setAttribute('aria-disabled', String(i >= n - 1));
    if (playBtn) {
      playBtn.setAttribute('aria-pressed', String(!!timer));
      playBtn.querySelector('[data-label]')!.textContent = timer ? 'Pause' : 'Run';
    }
  };
  const s: Scrub = {
    get i() { return i; },
    get n() { return n; },
    get playing() { return !!timer; },
    go(k, how = 'jump') {
      i = Math.max(0, Math.min(n - 1, Math.round(k)));
      paint();
      onStep(i, how);
    },
    pause() { timer?.kill(); timer = null; paint(); },
    play() {
      if (timer) return s.pause();
      if (reduce()) return s.go(n - 1, 'step');
      if (i >= n - 1) s.go(0, 'step');
      const tick = () => {
        s.go(i + 1, 'play');
        timer = i < n - 1 ? gsap.delayedCall(o.speed ?? 0.4, tick) : null;
        paint();
      };
      timer = gsap.delayedCall(o.speed ?? 0.4, tick);
      paint();
    },
    step() { s.pause(); s.go(i + 1, 'step'); },
    back() { s.pause(); s.go(i - 1, 'step'); },
    reset() { s.pause(); s.go(0, 'step'); },
    resize(m, at = i) { s.pause(); n = Math.max(1, m); s.go(at, 'jump'); },
  };

  range.addEventListener('input', () => { const v = +range.value; s.pause(); s.go(v, 'scrub'); });
  root.addEventListener('click', e => {
    const a = (e.target as Element).closest<HTMLElement>('[data-act]')?.dataset.act;
    if (a === 'play') s.play();
    else if (a === 'step' || a === 'fwd') s.step();
    else if (a === 'back') s.back();
    else if (a === 'reset') s.reset();
  });
  // Stop playing when it scrolls away or the tab hides
  new IntersectionObserver(([e]) => { if (!e.isIntersecting && timer) s.pause(); }).observe(root);
  all.add({ root, s });
  paint();
  return s;
}

// F7 step, F9 run, Ctrl+F2 reset, as in his IDE: they act on the control nearest the middle of the screen
addEventListener('keydown', e => {
  const act = e.key === 'F7' ? 'step' : e.key === 'F9' ? 'play' : e.key === 'F2' && e.ctrlKey ? 'reset' : '';
  if (!act || !all.size) return;
  let best: Scrub | null = null, d = Infinity;
  for (const { root, s } of all) {
    const r = root.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight || !r.width) continue;
    const dist = Math.abs((r.top + r.bottom) / 2 - innerHeight / 2);
    if (dist < d) { d = dist; best = s; }
  }
  if (!best) return;
  e.preventDefault();
  best[act]();
});
