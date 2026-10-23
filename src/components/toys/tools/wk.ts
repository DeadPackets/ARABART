// WINKEY's drawing, rebuilt from WINKEY.EXE (unpacked) and MENU2.DAT. Pure functions for the server and the browser.

export const EGA = ['#000000', '#0000AA', '#00AA00', '#00AAAA', '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA',
  '#555555', '#5555FF', '#55FF55', '#55FFFF', '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'];
export const COLOR_NAMES = ['black', 'blue', 'green', 'cyan', 'red', 'magenta', 'brown', 'gray',
  'dark gray', 'light blue', 'light green', 'light cyan', 'light red', 'pink', 'yellow', 'white'];
export const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(2, '0');

// CS:09B2..0A11: six button styles, 16 bytes each. Pairs of (top and left, bottom and right) colors; 10h ends a style.
export const TABLE = Uint8Array.from(
  ('0f0f0f0f100000000000000000000000' + '080f080f100000000000000000000000' + '0f080f08100000000000000000000000' +
   '0f080f08070707070707080f080f1000' + '00000807080710000000000000000000' + '00000f080f0810000000000000000000')
    .match(/../g)!.map(h => parseInt(h, 16)));
export const STYLES = [
  { s: 0x10, name: 'Flat', say: 'two white rings' },
  { s: 0x20, name: 'Sunken', say: 'shadow on the top and left' },
  { s: 0x30, name: 'Raised', say: 'light on the top and left' },
  { s: 0x40, name: 'Panel', say: 'raised, a flat band, then sunken' },
  { s: 0x50, name: 'Pressed', say: 'black outline, then shadow on the top and left' },
  { s: 0x60, name: 'Released', say: 'black outline, then light on the top and left' },
];
export function rings(style: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = style - 0x10; TABLE[i] !== 0x10; i += 2) out.push([TABLE[i], TABLE[i + 1]]);
  return out;
}
// His face-color rule: every ring color except black (0) and dark gray (8) moves by (face - 7)
export const tint = (c: number, face: number) => (c === 0 || c === 8 ? c : (c + face - 7) & 15);

export type FB = { w: number; h: number; px: Uint8Array };
export const fb = (w: number, h: number, c = 0): FB => ({ w, h, px: new Uint8Array(w * h).fill(c) });
export function fill(f: FB, x0: number, y0: number, x1: number, y1: number, c: number) {
  for (let y = Math.max(0, y0); y <= Math.min(f.h - 1, y1); y++)
    for (let x = Math.max(0, x0); x <= Math.min(f.w - 1, x1); x++) f.px[y * f.w + x] = c;
}

/** 0000:08A3 button(x, y, w, h, style, face): each ring is top, left, then right, bottom; then a bar fills the face. */
export function button(f: FB, x: number, y: number, w: number, h: number, style: number, face: number) {
  let x2 = x + w - 1, y2 = y + h - 1;
  for (const [a, b] of rings(style)) {
    fill(f, x, y, x2, y, tint(a, face)); fill(f, x, y, x, y2, tint(a, face));
    fill(f, x2, y, x2, y2, tint(b, face)); fill(f, x, y2, x2, y2, tint(b, face));
    x++; y++; x2--; y2--;
  }
  fill(f, x, y, x2, y2, face);
}

// MENU2.DAT: 8 icon offsets, then icons. Icon: dx, dy (its bottom-right corner), then segments of
// color, start row, and commands: EFh one row up, FCh new color, FDh-FFh end, else (skip, length).
export type Tok =
  | { t: 'size'; at: number; b: number[]; w: number; h: number }
  | { t: 'color'; at: number; b: number[]; c: number; row: number }
  | { t: 'up'; at: number; b: number[]; row: number }
  | { t: 'run'; at: number; b: number[]; x: number; y: number; n: number; c: number; skip: number }
  | { t: 'new'; at: number; b: number[] }
  | { t: 'end'; at: number; b: number[] };
export const ICONS = [
  { ofs: 0x0ac2, name: 'DOS logo' }, { ofs: 0x02b9, name: 'Disk drive' }, { ofs: 0x0164, name: 'Floppy, arrow right' },
  { ofs: 0x03d6, name: 'Page and pen' }, { ofs: 0x0010, name: 'Floppy, arrow left' }, { ofs: 0x072a, name: 'Page, brown letters' },
  { ofs: 0x055d, name: 'Page, green letters' }, { ofs: 0x0904, name: 'Page, blue letters' },
];
/** 0000:027C, as tokens. x, y of runs are relative to the icon's top-left (0,0); its corner is (dx, dy). */
export function tokens(d: Uint8Array, ofs: number): Tok[] {
  const ox = d[ofs], oy = d[ofs + 1], out: Tok[] = [{ t: 'size', at: ofs, b: [ox, oy], w: ox, h: oy }];
  let i = ofs + 2;
  for (;;) {
    const c = d[i]; let row = oy - d[i + 1];
    out.push({ t: 'color', at: i, b: [c, d[i + 1]], c, row }); i += 2;
    for (;;) {
      const v = d[i];
      if (v === 0xef) { row--; out.push({ t: 'up', at: i, b: [v], row }); i++; continue; }
      if (v === 0xfc) { out.push({ t: 'new', at: i, b: [v] }); i++; break; }
      if (v > 0xfc) { out.push({ t: 'end', at: i, b: [v] }); return out; }
      const n = d[i + 1];
      out.push({ t: 'run', at: i, b: [v, n], x: ox - v - n + 1, y: row, n, c, skip: v });
      i += 2;
    }
  }
}
export function icon(f: FB, toks: Tok[], x: number, y: number, upto = Infinity) {
  toks.forEach((k, i) => { if (k.t === 'run' && i <= upto) fill(f, x + k.x, y + k.y, x + k.x + k.n - 1, y + k.y, k.c); });
}

// main (0000:0A16): the panel, then 8 buttons pressed (style 50h, icon 2 px down and right) and released, 11 times each
export const PANEL = { x: 5, y: 5, w: 200, h: 306 };
export const BTN = (i: number) => ({ x: 18, y: 18 + 35 * i, w: 48, h: 34, ix: 20, iy: 24 + 35 * i });
export type Call = { i: number; pressed: boolean; cycle: number };
export const CALLS: Call[] = [];
for (let i = 0; i < 8; i++) for (let k = 0; k < 11; k++) for (const p of [true, false]) CALLS.push({ i, pressed: p, cycle: k + 1 });
/** Draw the demo screen after `step` steps (0: the panel only; 176: the end). `held` presses buttons by hand. */
export function panel(f: FB, icons: Tok[][], step: number, held: Set<number> = new Set()) {
  f.px.fill(0);
  button(f, PANEL.x, PANEL.y, PANEL.w, PANEL.h, 0x40, 7);
  const last = new Map<number, boolean>();
  for (let s = 1; s <= step && s <= CALLS.length; s++) last.set(CALLS[s - 1].i, CALLS[s - 1].pressed);
  for (const i of held) last.set(i, true);
  for (const [i, p] of last) drawButton(f, icons[i], i, p);
}
export function drawButton(f: FB, toks: Tok[], i: number, pressed: boolean) {
  const b = BTN(i), sh = pressed ? 2 : 0;
  button(f, b.x, b.y, b.w, b.h, pressed ? 0x50 : 0x60, 7);
  icon(f, toks, b.ix + sh, b.iy + sh);
}

/** Paint an FB region onto a canvas, one canvas pixel per screen pixel. */
export function blit(cv: HTMLCanvasElement, f: FB, x0 = 0, y0 = 0, w = f.w, h = f.h) {
  if (cv.width !== w) cv.width = w;
  if (cv.height !== h) cv.height = h;
  const ctx = cv.getContext('2d')!, img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = EGA[f.px[(y + y0) * f.w + x + x0]], o = (y * w + x) * 4;
    img.data[o] = parseInt(c.slice(1, 3), 16); img.data[o + 1] = parseInt(c.slice(3, 5), 16);
    img.data[o + 2] = parseInt(c.slice(5, 7), 16); img.data[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}
export const bytesOf = (el: HTMLElement) => Uint8Array.from(atob(el.dataset.dat!), c => c.charCodeAt(0));
export const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// The run loop (0000:02D0..0337) on the first run of the DOS logo: skip 25, paint 9, row 44, right edge x = 62.
export type LoopStep = { a: number; c: number; say: string; regs: { name: string; value: string; means: string; changed?: boolean }[];
  painted: number[]; mask: number; cur: number; di: number; writes: number };
export function loopSteps(): LoopStep[] {
  const out: LoopStep[] = [];
  let painted: number[] = [], mask = 0, cur = -1, di = 0, writes = 0;
  const bin = (m: number) => m.toString(2).padStart(8, '0');
  const S = (a: number, c: number, say: string, regs: LoopStep['regs']) =>
    out.push({ a, c, say, regs, painted: [...painted], mask, cur, di, writes });
  S(2, 0, 'Every run starts at the icon’s right edge: <b>x = 62</b> on row 44.', [{ name: 'DX', value: '62', means: 'x of the right edge', changed: true }, { name: 'BX', value: '44', means: 'the row' }]);
  S(3, 1, 'Read the next byte of MENU2.DAT: <b>19h</b>, which is 25.', [{ name: 'AL', value: '19h', means: '25', changed: true }]);
  S(4, 2, 'Is it EFh, “one row up”? No.', [{ name: 'AL', value: '19h', means: '25' }]);
  S(5, 3, 'Is it FCh, “new color”? No.', [{ name: 'AL', value: '19h', means: '25' }]);
  S(6, 4, 'FDh or more would end the icon. It is smaller, so it is a run.', [{ name: 'AL', value: '19h', means: 'a run' }]);
  S(7, 5, 'Skip 25 pixels to the left: <b>x = 62 − 25 = 37</b>.', [{ name: 'DX', value: '37', means: 'x where the run starts', changed: true }]);
  S(8, 6, 'The next byte says how many pixels to paint: <b>9</b>.', [{ name: 'AL', value: '09h', means: '9 pixels', changed: true }]);
  di = 44 * 80;
  S(11, 7, 'Each row of the screen is 80 bytes, so row 44 starts at byte <b>3,520</b>.', [{ name: 'DI', value: '3520', means: 'row 44 × 80', changed: true }]);
  S(13, 7, 'Three shifts split x: <b>37 ÷ 8 = 4</b> is the byte, and the 3 bits that fall out, 101, say which pixel. (His own trick: the last section takes it apart.)', [{ name: 'DX', value: '4', means: 'x ÷ 8', changed: true }, { name: 'BX', value: '101b', means: 'the low bits, reversed', changed: true }]);
  di += 4;
  S(15, 7, 'So the run starts in byte <b>3,524</b>.', [{ name: 'DI', value: '3524', means: 'the byte to paint', changed: true }]);
  cur = 37;
  S(16, 8, 'His table turns the bits back: pixel <b>5</b> of the byte, counting from the left.', [{ name: 'CL', value: '5', means: 'x mod 8', changed: true }]);
  S(17, 8, 'BX now holds the pixel, CX the 9 pixels still to paint.', [{ name: 'BX', value: '5', means: 'the pixel in the byte', changed: true }, { name: 'CX', value: '9', means: 'pixels left', changed: true }]);
  S(19, 9, 'Tell the card that the next value goes into its <b>Bit Mask</b>: which of the 8 pixels a write may change.', [{ name: 'DX', value: '3CEh', means: 'the Graphics Controller', changed: true }]);
  S(20, 9, 'Start with an empty mask.', [{ name: 'AL', value: '00000000', means: 'the mask', changed: true }]);
  let bit = 5, left = 9;
  while (left > 0) {
    mask |= 0x80 >> bit; cur = di * 8 - 3520 * 8 + bit;
    S(21, 11, `Add pixel <b>${cur}</b> to the mask.`, [{ name: 'AL', value: bin(mask), means: 'the mask', changed: true }, { name: 'BX', value: String(bit), means: 'the pixel in the byte' }, { name: 'CX', value: String(left), means: 'pixels left' }]);
    if (bit === 0) {
      S(22, 12, 'Pixel 0 is the left end of this byte. Time to paint.', [{ name: 'BX', value: '0', means: 'left end' }]);
      S(23, 13, `Send the mask: <b>${bin(mask)}</b>. Only these pixels can change.`, [{ name: 'AL', value: bin(mask), means: 'Bit Mask', changed: true }]);
      S(24, 14, 'Read the byte. The card quietly copies all 4 planes of it into its latches.', [{ name: 'DI', value: String(di), means: 'the byte' }]);
      painted = [...painted, ...[0, 1, 2, 3, 4, 5, 6, 7].filter(b => mask & (0x80 >> b)).map(b => (di - 3520) * 8 + b)]; writes++;
      S(25, 14, `Write it back. <b>${painted.length} pixels change color with one write</b>, in all 4 planes. The rest come back from the latches untouched.`, [{ name: 'DI', value: String(di), means: 'the byte', changed: true }]);
      di--; mask = 0;
      S(26, 15, 'Move one byte to the left.', [{ name: 'DI', value: String(di), means: 'the next byte', changed: true }]);
      bit = 8;
      S(27, 15, 'Start a new, empty mask.', [{ name: 'AL', value: '00000000', means: 'the mask', changed: true }, { name: 'BX', value: '8', means: 'past the right end' }]);
    }
    bit--; left--;
    S(28, 17, left ? 'One pixel to the left, and loop.' : 'No pixels left: the loop ends.', [{ name: 'BX', value: String(bit), means: 'the pixel in the byte', changed: true }, { name: 'CX', value: String(left), means: 'pixels left', changed: true }]);
  }
  S(29, 19, `Send the last mask: <b>${bin(mask)}</b>.`, [{ name: 'AL', value: bin(mask), means: 'Bit Mask', changed: true }]);
  S(30, 19, 'Read the byte: the latches fill.', [{ name: 'DI', value: String(di), means: 'the byte' }]);
  painted = [...painted, ...[0, 1, 2, 3, 4, 5, 6, 7].filter(b => mask & (0x80 >> b)).map(b => (di - 3520) * 8 + b)]; writes++;
  cur = -1;
  S(31, 19, `Write: 3 more pixels. <b>9 pixels, 2 writes.</b>`, [{ name: 'DI', value: String(di), means: 'the byte', changed: true }]);
  S(32, 20, 'On to the next byte of the file: the next run.', [{ name: 'BX', value: '44', means: 'the row, back from the stack', changed: true }]);
  return out;
}

// His x mod 8: shift the 3 low bits of x out one at a time into BX (they arrive reversed), then a table turns them back
export const REV = [0, 4, 2, 6, 1, 5, 3, 7];
export type Mod8Step = { a: number; c: number; say: string; regs: LoopStep['regs']; dx: number; bx: number; cf: number; nb: number; done: boolean };
export function mod8Steps(x: number): Mod8Step[] {
  const out: Mod8Step[] = [];
  let dx = x, bx = 0, cf = -1, nb = 0;
  const b3 = (v: number, n: number) => v.toString(2).padStart(n, '0');
  const S = (a: number, c: number, say: string, regs: LoopStep['regs'], done = false) => out.push({ a, c, say, regs, dx, bx, cf, nb, done });
  S(0, 1, `Three times round. x is <b>${x}</b>, ${b3(x, 10)} in binary.`, [{ name: 'DX', value: b3(dx, 10), means: `x = ${x}`, changed: true }, { name: 'CX', value: '3', means: 'turns', changed: true }]);
  S(1, 0, 'BX starts empty. The bits will land here.', [{ name: 'BX', value: '000', means: 'empty', changed: true }]);
  for (let k = 0; k < 3; k++) {
    cf = dx & 1; dx >>= 1;
    S(2, 2, `<b>shr</b>: everything in DX moves one place right, and the lowest bit, <b>${cf}</b>, falls out into the carry flag.`, [{ name: 'DX', value: b3(dx, 10), means: String(dx), changed: true }, { name: 'CF', value: String(cf), means: 'the bit that fell out', changed: true }]);
    bx = ((bx << 1) | cf) & 7; nb++; cf = -1;
    S(3, 3, `<b>rcl</b>: BX moves one place left and the carry slides in on the right. BX = <b>${b3(bx, 3).slice(3 - nb)}</b>.`, [{ name: 'BX', value: b3(bx, 3), means: `${nb} bit${nb > 1 ? 's' : ''} in`, changed: true }]);
    S(4, 1, k < 2 ? `<b>loop</b>: ${2 - k} more.` : '<b>loop</b>: done. The first bit out went in first, so it now sits on the left: the order is reversed.', [{ name: 'CX', value: String(2 - k), means: 'turns left', changed: true }]);
  }
  S(5, 5, `DX is now <b>${dx}</b>: x ÷ 8, the byte. Three shifts right is the same as dividing by 8.`, [{ name: 'DX', value: String(dx), means: 'x ÷ 8: the byte', changed: true }]);
  S(6, 6, `His little table turns ${b3(bx, 3)} back: entry ${bx} holds <b>${REV[bx]}</b>. That is x mod 8, the pixel inside the byte.`, [{ name: 'CL', value: String(REV[bx]), means: `${x} mod 8`, changed: true }], true);
  return out;
}
