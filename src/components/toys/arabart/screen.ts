// The typewriter's VGA screen: lines drawn by his engine into one 640x480, 16-color frame, plus a camera that
// frames what was written. Shared by the server (the no-JS image) and the browser.
import { render, metrics, flipNumbers, type Bin, type Step } from './core.ts';

export const W = 640, H = 480, RIGHT = 630;
export type Mode = 'plain' | '3d' | 'shadow' | 'outline';
export interface Opts { font: number; color: number; shadow: number; mode: Mode; bold: boolean; italic: boolean; underline: boolean; double: boolean }
export interface Frame { data: Uint8Array; box: [number, number, number, number]; pen: [number, number, number]; trace: Step[]; codes: string }

/** Every line right-aligned at x = 630 like his demo, the block centered on the screen; old lines scroll off the top. */
export function compose(bin: Bin, keys: string, o: Opts): Frame {
  const data = new Uint8Array(W * H);
  const { h } = metrics(bin, o.font);
  const lines = keys.split('\n').map(line => {
    const k = flipNumbers(line), trace: Step[] = [];
    return { k, trace, img: render(bin, k, { ...o, x: RIGHT, trace }) };
  });
  const gap = 6, step = (l: (typeof lines)[0]) => Math.max(l.img.height, h * (o.double ? 2 : 1)) + gap;
  const total = lines.reduce((s, l) => s + step(l), 0) - gap;
  // Centered on the screen; once it is too tall, scroll so the last line stays on screen
  let y = total <= H - 24 ? Math.round((H - total) / 2) : H - 12 - total;
  let x0 = W, y0 = H, x1 = 0, y1 = 0, pen: [number, number, number] = [RIGHT, y + h, h];
  for (const l of lines) {
    const { img } = l, left = RIGHT - img.x, top = y;
    for (let r = 0; r < img.height; r++) {
      const fy = top + r;
      if (fy < 0 || fy >= H) continue;
      for (let c = 0; c < img.width; c++) {
        const v = img.data[r * img.width + c], fx = left + c;
        if (v === 255 || fx < 0 || fx >= W) continue;
        data[fy * W + fx] = v;
        if (fx < x0) x0 = fx; if (fx > x1) x1 = fx; if (fy < y0) y0 = fy; if (fy > y1) y1 = fy;
      }
    }
    pen = [RIGHT - img.advance, top + img.y, h * (o.double ? 2 : 1)];
    y += step(l);
  }
  // The pen is part of what the camera must show
  x0 = Math.min(x0, pen[0] - 10); x1 = Math.max(x1, Math.min(W - 1, pen[0] + 2));
  y0 = Math.min(y0, pen[1] - pen[2]); y1 = Math.max(y1, pen[1] + 2);
  const last = lines[lines.length - 1];
  return { data, box: [x0, y0, x1, y1], pen, trace: last.trace, codes: last.k };
}

/** The largest zoom (4 down to 1) that fits the writing with a margin, centered on it, kept inside the screen. */
export function camera(box: Frame['box'], whole = false) {
  const [x0, y0, x1, y1] = box, bw = x1 - x0 + 1 + 36, bh = y1 - y0 + 1 + 36;
  const z = whole ? 1 : [4, 3, 2.5, 2, 1.5, 1.25, 1].find(z => bw <= W / z && bh <= H / z) ?? 1;
  const w = W / z, h = H / z;
  const x = Math.max(0, Math.min(W - w, (x0 + x1) / 2 - w / 2));
  const y = Math.max(0, Math.min(H - h, (y0 + y1) / 2 - h / 2));
  return { x, y, w, h };
}

/** The part of the frame the camera sees, as SVG paths per color (one 1-pixel-tall rect per run). For the no-JS image. */
export function framePaths(data: Uint8Array, v: { x: number; y: number; w: number; h: number }, palette: (i: number) => string) {
  const by = new Map<number, string[]>();
  const x0 = Math.floor(v.x), y0 = Math.floor(v.y), x1 = Math.min(W, Math.ceil(v.x + v.w)), y1 = Math.min(H, Math.ceil(v.y + v.h));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; ) {
      const c = data[y * W + x];
      if (!c) { x++; continue; }
      let n = 1;
      while (x + n < x1 && data[y * W + x + n] === c) n++;
      if (!by.has(c)) by.set(c, []);
      by.get(c)!.push(`M${x} ${y}h${n}v1h-${n}z`);
      x += n;
    }
  }
  return [...by].map(([c, d]) => ({ fill: palette(c), d: d.join('') }));
}
