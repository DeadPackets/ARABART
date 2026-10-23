// Small helpers around Yasser's ARABART engine (src/lib/arabart), shared by the server render and the toys.
import { draw, load, shape, translate, fromUnicode, PALETTE, type Bin, type Bitmap } from '../../../lib/arabart/index.ts';

export * from '../../../lib/arabart/index.ts';

const BASE = 0x682;
const word = (bin: Bin, a: number) => bin[a - BASE] | (bin[a - BASE + 1] << 8);
const fontPtr = (bin: Bin, font: number) => word(bin, 0x6e8 + 2 * (Math.min(5, Math.max(1, font)) - 1));

export const FORMS = ['isolated', 'final', 'initial', 'medial'] as const;
export const hex = (n: number, w = 2) => n.toString(16).toUpperCase().padStart(w, '0');
export const bits8 = (n: number) => n.toString(2).padStart(8, '0');
export const rgb = (i: number) => `#${PALETTE[i & 15].toString(16).padStart(6, '0')}`;
export const isStyle = (c: number) => (c >= 0xc8 && c <= 0xcb) || c === 0xd0;

/** Line height and 3-D offset, from glyph slots 1 and 2 of the font table, where he kept them. */
export function metrics(bin: Bin, font: number) {
  const f = fontPtr(bin, font);
  return { h: word(bin, f + 2), s: word(bin, f + 4) };
}

/** One glyph as he stored it: advance, start row, then (skip, length) runs; EF = next row up, F0-FF = end. */
export function glyphBytes(bin: Bin, font: number, code: number) {
  const g = word(bin, fontPtr(bin, font) + 2 * code) - BASE;
  const out = [bin[g], bin[g + 1]];
  for (let p = g + 2; out.length < 400; p++) {
    out.push(bin[p]);
    if (bin[p] > 0xef) break;
    if (bin[p] !== 0xef) out.push(bin[++p]);
  }
  return out;
}

/** No bidi in ARABART: number runs are stored reversed, the way his programs stored them. */
export const flipNumbers = (s: string) => s.replace(/\d[\d<>]*\d|\d/g, r => [...r].reverse().join(''));

/** Any text -> ARABART keys in typing order. ASCII is already keys (a US keyboard in the Arabic layout); Arabic goes through fromUnicode. */
export function keysFromText(s: string) {
  return s.replace(/\r/g, '').replace(/[^\x20-\x7e\n]+/g, run => flipNumbers(fromUnicode(run)));
}

/** A glyph or line drawn by his engine, as SVG paths per color: one 1-pixel-tall rect per run. For the no-JS state. */
export function svgRuns(img: Bitmap) {
  const by = new Map<number, string[]>();
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; ) {
      const c = img.data[y * img.width + x];
      if (c === 255) { x++; continue; }
      let n = 1;
      while (x + n < img.width && img.data[y * img.width + x + n] === c) n++;
      if (!by.has(c)) by.set(c, []);
      by.get(c)!.push(`M${x} ${y}h${n}v1h-${n}z`);
      x += n;
    }
  }
  return [...by].map(([c, d]) => ({ fill: rgb(c), d: d.join('') }));
}

/** A single code, unshaped, as the toys show it. */
export const glyph = (bin: Bin, code: number, font = 3, color = 14) => draw(bin, [code], { font, color });

/** The same bitmap as an <svg> string, for the browser side of a toy. scale = CSS pixels per ARABART pixel. */
export function svgMarkup(img: Bitmap, scale = 2, cls = 'pix') {
  return `<svg class="${cls}" viewBox="0 0 ${img.width} ${img.height}" width="${img.width * scale}" height="${img.height * scale}" shape-rendering="crispEdges" aria-hidden="true">` +
    svgRuns(img).map(p => `<path fill="${p.fill}" d="${p.d}"/>`).join('') + '</svg>';
}

let binP: Promise<Bin> | null = null;
/** His key table, font table and five fonts (public/arabart/fonts.bin), fetched once per page. */
export const fonts = () => (binP ??= load(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/arabart/fonts.bin`));

export type Tok =
  | { t: 'head'; adv: number; d: number; b: number[] }
  | { t: 'run'; skip: number; len: number; y: number; b: number[] }
  | { t: 'up'; y: number; b: number[] }
  | { t: 'end'; b: number[] };

/** A glyph's bytes as steps: the header, then each run, each "next row up" and the end. Rows count up from the line bottom (0). */
export function glyphTokens(bytes: number[]): Tok[] {
  const out: Tok[] = [{ t: 'head', adv: bytes[0], d: bytes[1], b: bytes.slice(0, 2) }];
  let y = -bytes[1];
  for (let p = 2; p < bytes.length; p++) {
    const b = bytes[p];
    if (b > 0xef) { out.push({ t: 'end', b: [b] }); break; }
    if (b === 0xef) { y--; out.push({ t: 'up', y, b: [b] }); continue; }
    out.push({ t: 'run', skip: b, len: bytes[p + 1], y, b: [b, bytes[p + 1]] });
    p++;
  }
  return out;
}

/** A word slanted by t (0 to 1) like his italic: each row shifts one pixel left per row up. anchor 'line' is his way
 *  (the slant is measured from the line, the same for every letter); 'top' measures it from each letter's own top. */
export function slanted(bin: Bin, keys: string, font: number, t: number, anchor: 'line' | 'top') {
  const codes = shape(translate(bin, keys));
  const px: number[] = [];
  let pen = 0;
  for (const c of codes) {
    const g = draw(bin, [c], { font, color: 14 });
    let top = 0;
    for (let i = 0; i < g.data.length; i++) if (g.data[i] !== 255) { top = Math.floor(i / g.width) - g.y; break; }
    for (let i = 0; i < g.data.length; i++) {
      if (g.data[i] === 255) continue;
      const X = pen + (i % g.width) - g.x, Y = Math.floor(i / g.width) - g.y;
      px.push(X + Math.round(t * (Y - (anchor === 'line' ? 2 : top))), Y);
    }
    pen -= g.advance;
  }
  return px;
}

/** Pixel pairs [x0, y0, x1, y1, ...] as one SVG path, a rect per horizontal run. */
export function pixPath(px: number[]) {
  const rows = new Map<number, number[]>();
  for (let i = 0; i < px.length; i += 2) (rows.get(px[i + 1]) ?? rows.set(px[i + 1], []).get(px[i + 1])!).push(px[i]);
  let d = '';
  for (const [y, xs] of rows) {
    const u = [...new Set(xs)].sort((a, b) => a - b);
    for (let i = 0; i < u.length; ) {
      let n = 1;
      while (i + n < u.length && u[i + n] === u[i] + n) n++;
      d += `M${u[i]} ${y}h${n}v1h-${n}z`;
      i += n;
    }
  }
  return d;
}
