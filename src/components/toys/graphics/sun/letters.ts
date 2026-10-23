// Four of his lines and how his helpers draw them, pass by pass. Shared by the server image and the Letters toy.
import type { Bin } from '../../../../lib/arabart/index.ts';
import { draw, shape, translate } from '../../../../lib/arabart/index.ts';
import { Scr, passes, lineHeight, type Fx, type RGB6 } from './sun.ts';
export type { Fx };

export interface Line { keys: string; ar: string; en: string; font: number; color: number; edge: number; fx: Fx; pal?: Record<number, RGB6> }
// Fonts, colors and effects as his calls use them. The section titles' gold is slot 4 after his sun has been drawn.
export const LINES: Line[] = [
  { keys: '$!hgl[l,um hgalsdm', ar: 'المجموعة الشمسية', en: 'A section title', font: 3, color: 4, edge: 0, fx: 'title', pal: { 4: [63, 45, 0] } },
  { keys: ',#hgals# j[vd glsjrv gih', ar: 'والشمس تجري لمستقر لها', en: 'A verse card', font: 3, color: 14, edge: 0, fx: 'outline' },
  { keys: '#hgals', ar: 'الشمس', en: 'His menu, font 5', font: 5, color: 15, edge: 0, fx: 'outline' },
  { keys: 'lik]s L dhsv lpl] ugd', ar: 'مهندس / ياسر محمد على', en: 'His name, title card', font: 4, color: 0, edge: 0, fx: 'shadow' },
];
const NAMES: Record<number, string> = { 0: 'black', 4: 'gold', 8: 'dark blue-gray', 14: 'yellow', 15: 'white' };
const where = (dx: number, dy: number) => (dx === 0 && dy === 0 ? 'in place' : dx === 6 ? '6 pixels right and 6 down' : `1 pixel ${dx < 0 ? 'left' : 'right'} and ${dy < 0 ? 'up' : 'down'}`);

let frame: [number, number] | null = null;
/** One size for every line, so switching lines never moves the page: the biggest line plus room for shadow and outline. */
function frameSize(bin: Bin): [number, number] {
  if (frame) return frame;
  const sizes = LINES.map(l => draw(bin, shape(translate(bin, l.keys)), { font: l.font, color: 1 }));
  return (frame = [Math.max(...sizes.map(s => s.width)) + 30, Math.max(...sizes.map(s => s.height)) + 30]);
}

/** The line on his panel color with the first k + 1 draws of this effect, centered in one fixed frame, plus what that draw did. */
export function compose(bin: Bin, l: Line, fx: Fx, k: number) {
  const s = new Scr();
  Object.entries(l.pal ?? {}).forEach(([i, c]) => (s.pal[+i] = c));
  const img = draw(bin, shape(translate(bin, l.keys)), { font: l.font, color: 1 });
  const h = lineHeight(bin, l.keys, l.font), x = 320 + Math.round(img.width / 2), y = 200 - h;
  const left = x - img.x, top = y + h - img.y;
  const [w, hh] = frameSize(bin);
  const bx = Math.round(left + (img.width + 6) / 2 - w / 2), by = Math.round(top + (img.height + 6) / 2 - hh / 2);
  s.bar(bx, by, bx + w - 1, by + hh - 1, 3);
  const ps = passes(fx, l.color, l.edge), n = ps.length, upto = Math.min(k, n - 1);
  for (let i = 0; i <= upto; i++) s.text(bin, l.keys, x + ps[i].dx, y + ps[i].dy, l.font, ps[i].color);
  const px = new Uint8Array(w * hh);
  for (let r = 0; r < hh; r++) px.set(s.px.subarray((by + r) * 640 + bx, (by + r) * 640 + bx + w), r * w);
  const p = ps[upto];
  const say = `Draw <b>${upto + 1} of ${n}</b>: color ${p.color}, ${NAMES[p.color] ?? ''}, ${where(p.dx, p.dy)}.` +
    (fx === 'plain' ? ' One call to ARABART, nothing more.' : upto === n - 1 ? ' Done: the last draw puts the line itself on top.' : '');
  return { px, w, h: hh, rgb: s.rgb(), n, say, pen: [x + p.dx - bx, y + h + p.dy - by] };
}
