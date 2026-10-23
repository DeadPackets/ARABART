// The live parts of HandyLauncher's screen, shared by the build and hold toys: his menu, and the tap-or-hold icon.
import { gsap } from 'gsap';
import { GLYPH, reduce, type Item } from './hl.ts';

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function menuHTML(items: Item[], name: string) {
  return `<li class="hl-menu-cap" role="presentation">${esc(name)}</li>` + items.map((it, i) => it.kind === 'sep'
    ? '<li role="separator"></li>'
    : `<li role="none"><button type="button" role="menuitem" data-i="${i}">${GLYPH[it.kind]}<span>${esc(it.name)}</span></button></li>`).join('');
}

/** Windows Mobile's tap-and-hold: eight red dots appear around the stylus, then it counts as a hold. */
export const HOLD_MS = 650;
export const ringSVG = () => `<svg class="hl-ring" viewBox="-22 -22 44 44" aria-hidden="true">${
  Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * Math.PI * 2 - Math.PI / 2; return `<circle cx="${(16 * Math.cos(a)).toFixed(1)}" cy="${(16 * Math.sin(a)).toFixed(1)}" r="2.6"/>`; }).join('')}</svg>`;

interface Hooks { tap(): void; hold(): void; start?(): void; cancel?(): void }

/** Pointer down starts the ring; lift early for a tap, keep it down for a hold. Enter is a tap, Shift+F10 or the menu key a hold. */
export function tapOrHold(btn: HTMLElement, h: Hooks) {
  if (!btn.querySelector('.hl-ring')) btn.insertAdjacentHTML('beforeend', ringSVG());
  const dots = [...btn.querySelectorAll<SVGCircleElement>('.hl-ring circle')];
  let timer: number | undefined, tl: gsap.core.Timeline | null = null, down = false;
  const clear = () => { tl?.kill(); tl = null; gsap.set(dots, { opacity: 0 }); window.clearTimeout(timer); timer = undefined; };
  btn.addEventListener('contextmenu', e => e.preventDefault());
  btn.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    down = true;
    btn.setPointerCapture?.(e.pointerId);
    h.start?.();
    if (!reduce()) tl = gsap.timeline().to(dots, { opacity: 1, duration: 0.05, stagger: HOLD_MS / 1000 / 8 });
    timer = window.setTimeout(() => { timer = undefined; down = false; gsap.set(dots, { opacity: 1 }); h.hold(); window.setTimeout(clear, 250); }, HOLD_MS);
  });
  const up = () => { if (!down) return; down = false; if (timer !== undefined) { clear(); h.tap(); } };
  btn.addEventListener('pointerup', up);
  btn.addEventListener('pointercancel', () => { down = false; clear(); h.cancel?.(); });
  btn.addEventListener('keydown', e => {
    if ((e.key === 'F10' && e.shiftKey) || e.key === 'ContextMenu') { e.preventDefault(); h.hold(); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); h.tap(); }
  });
}

/** Keyboard for an open menu: arrows move, Escape closes. */
export function menuKeys(menu: HTMLElement, close: () => void) {
  menu.addEventListener('keydown', e => {
    const items = [...menu.querySelectorAll<HTMLButtonElement>('button')];
    const k = items.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      items[(k + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
    }
  });
}
