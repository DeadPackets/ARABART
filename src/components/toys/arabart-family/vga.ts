// A 16-color screen for the ARABART family toys: an indexed frame, his engine's bitmaps stamped into it, a canvas view
// and the same frame as SVG for the server-rendered, no-JS state.
import { PALETTE, rgb, type Bitmap } from '../arabart/core.ts';

export interface Frame { w: number; h: number; data: Uint8Array }
export const frame = (w = 640, h = 480): Frame => ({ w, h, data: new Uint8Array(w * h) });

/** Copies a bitmap's lit pixels so its pen start (right edge, line bottom) lands on (x, y). minX hides pixels left of it. */
export function stamp(f: Frame, img: Bitmap, x: number, y: number, minX = -1) {
  const left = x - img.x, top = y - img.y;
  for (let r = 0; r < img.height; r++) {
    const Y = top + r;
    if (Y < 0 || Y >= f.h) continue;
    for (let c = 0; c < img.width; c++) {
      const v = img.data[r * img.width + c], X = left + c;
      if (v !== 255 && X >= 0 && X < f.w && X > minX) f.data[Y * f.w + X] = v;
    }
  }
}

const ABGR = PALETTE.map(c => (0xff000000 | ((c & 0xff) << 16) | (c & 0xff00) | (c >> 16)) >>> 0);

/** One canvas pixel per screen pixel; CSS scales it with image-rendering: pixelated. */
export function show(canvas: HTMLCanvasElement, f: Frame) {
  if (canvas.width !== f.w) canvas.width = f.w;
  if (canvas.height !== f.h) canvas.height = f.h;
  const ctx = canvas.getContext('2d')!, img = ctx.createImageData(f.w, f.h), d = new Uint32Array(img.data.buffer);
  for (let i = 0; i < d.length; i++) d[i] = ABGR[f.data[i] & 15];
  ctx.putImageData(img, 0, 0);
}

/** The frame as one SVG path per color, a rect per horizontal run. */
export function framePaths(f: Frame) {
  const by = new Map<number, string[]>();
  for (let y = 0; y < f.h; y++) {
    for (let x = 0; x < f.w; ) {
      const c = f.data[y * f.w + x];
      if (!c) { x++; continue; }
      let n = 1;
      while (x + n < f.w && f.data[y * f.w + x + n] === c) n++;
      (by.get(c) ?? by.set(c, []).get(c)!).push(`M${x} ${y}h${n}v1h-${n}z`);
      x += n;
    }
  }
  return [...by].map(([c, d]) => ({ fill: rgb(c), d: d.join('') }));
}

export const NAMES = ['black', 'blue', 'green', 'cyan', 'red', 'magenta', 'brown', 'light gray', 'dark gray', 'light blue',
  'light green', 'light cyan', 'light red', 'pink', 'yellow', 'white'];
export const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Draws part of an offscreen frame canvas into a visible canvas sized to its CSS box, without smoothing. */
export function blit(canvas: HTMLCanvasElement, off: HTMLCanvasElement, v: { x: number; y: number; w: number; h: number }) {
  const r = canvas.getBoundingClientRect(), k = Math.min(devicePixelRatio || 1, 2);
  const cw = Math.max(1, Math.round(r.width * k)), ch = Math.max(1, Math.round(r.height * k));
  if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
  const c = canvas.getContext('2d')!;
  c.imageSmoothingEnabled = false;
  c.fillStyle = '#000';
  c.fillRect(0, 0, cw, ch);
  c.drawImage(off, v.x, v.y, v.w, v.h, 0, 0, cw, ch);
}

/** The largest zoom that fits a box with a margin, for a 4:3 view of a 640x480 screen, centered and kept on screen. */
export function camera(x0: number, y0: number, x1: number, y1: number, m = 28) {
  const bw = x1 - x0 + 2 * m, bh = y1 - y0 + 2 * m;
  const z = [4, 3, 2.5, 2, 1.5, 1.25, 1].find(z => bw <= 640 / z && bh <= 480 / z) ?? 1;
  const w = 640 / z, h = 480 / z;
  return { x: Math.max(0, Math.min(640 - w, (x0 + x1) / 2 - w / 2)), y: Math.max(0, Math.min(480 - h, (y0 + y1) / 2 - h / 2)), w, h };
}
