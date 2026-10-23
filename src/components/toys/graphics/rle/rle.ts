// Yasser's picture format and screen code from NAMES.COM (1993), ported line by line, and the PORTSAID.EXE boot
// screen built on the same decoder. Shared by the server (no-JS images) and the browser toys.

export const NAMES = 'NAMES_NAMES.COM', PORTSAID = 'PORTSAID_PORTSAID.EXE';

/** A decoded picture: 4 bit planes one after another (stride bytes each), w bytes (8 pixels each) wide. */
export interface Pic { buf: Uint8Array; w: number; h: number; stride: number; packed: number }

/** NAMES.COM 0899: copy each byte; 37h n v = n copies of v; 37h 00 = the end, then the plane size as a word. */
export function decodeNames(bin: Uint8Array, at: number, w: number): Pic {
  let si = at - 0x100; // a .COM file sits at offset 100h in memory
  const out: number[] = [];
  for (;;) {
    const a = bin[si++];
    if (a !== 0x37) { out.push(a); continue; }
    const n = bin[si++];
    if (n === 0) break;
    const v = bin[si++];
    for (let i = 0; i < n; i++) out.push(v);
  }
  const stride = bin[si] | (bin[si + 1] << 8);
  return { buf: Uint8Array.from(out), w, h: stride / w, stride, packed: si + 2 - (at - 0x100) };
}

/** PORTSAID.EXE 0360: the same loop inside a C function. Pictures start with their width (bytes) and height. */
export function decodePs(bin: Uint8Array, at: number): Pic {
  let si = at + 0x50; // the EXE header is 50h bytes; code offset = image offset
  const w = bin[si] | (bin[si + 1] << 8), h = bin[si + 2] | (bin[si + 3] << 8);
  const start = si;
  si += 4;
  const out = new Uint8Array(w * h * 4);
  let di = 0;
  for (;;) {
    const a = bin[si++];
    if (a !== 0x37) { out[di++] = a; continue; }
    const n = bin[si++];
    if (n === 0) break;
    out.fill(bin[si++], di, di + n);
    di += n;
  }
  return { buf: out, w, h, stride: w * h, packed: si - start };
}

/** EGA video memory: 4 planes of 64 KB; pitch bytes per row (40 in 320x200, 80 in 640x350). */
export class Screen {
  planes: Uint8Array[];
  pitch: number;
  rows: number;
  constructor(pitch: number, rows: number, from?: Screen) {
    this.pitch = pitch; this.rows = rows;
    this.planes = [0, 1, 2, 3].map(k => (from ? from.planes[k].slice() : new Uint8Array(0x10000)));
  }
  /** His plane copy (NAMES 0981, PORTSAID 039C): n bytes into each plane in turn, Map Mask 1, 2, 4, 8. */
  blit(p: Pic, src: number, dst: number, n: number, only = 15) {
    for (let k = 0; k < 4; k++) {
      if (!(only >> k & 1)) continue;
      const pl = this.planes[k], base = k * p.stride;
      for (let i = 0; i < n; i++) pl[(dst + i) & 0xffff] = p.buf[base + src + i] | 0;
    }
  }
  /** Each pixel takes one bit from each plane: color = plane0 + 2 plane1 + 4 plane2 + 8 plane3. */
  pixels(mask = 15) {
    const W = this.pitch * 8, out = new Uint8Array(W * this.rows);
    for (let o = 0; o < this.pitch * this.rows; o++) {
      const b0 = this.planes[0][o], b1 = this.planes[1][o], b2 = this.planes[2][o], b3 = this.planes[3][o];
      for (let bit = 0; bit < 8; bit++) {
        const m = 0x80 >> bit;
        out[o * 8 + bit] = ((b0 & m ? 1 : 0) | (b1 & m ? 2 : 0) | (b2 & m ? 4 : 0) | (b3 & m ? 8 : 0)) & mask;
      }
    }
    return out;
  }
}

/** A picture on its own, as indexed pixels: w*8 by h. */
export function picPixels(p: Pic, rows = p.h, y0 = 0) {
  const s = new Screen(p.w, rows);
  for (let r = 0; r < rows; r++) s.blit(p, (y0 + r) * p.w, r * p.w, p.w);
  return s.pixels();
}

// ---------------------------------------------------------------- NAMES.COM: the KemYam splash

/** His ten pictures. w comes from the effect that shows each one; x, y, y0 and rows are where it lands on screen. */
export const NAMES_PICS = [
  { id: 'tile', at: 0x09b8, w: 5, name: 'Background tile', x: 0, y: 0, y0: 0, rows: 40 },
  { id: 'title', at: 0x0c1c, w: 40, name: 'KEMYAM', x: 0, y: 10, y0: 3, rows: 58 },
  { id: 'group', at: 0x32e6, w: 40, name: 'Computer Group', x: 0, y: 69, y0: 0, rows: 36 },
  { id: 'logo', at: 0x4a0a, w: 14, name: 'The logo', x: 0, y: 106, y0: 0, rows: 94 },
  { id: 'box', at: 0x5ea2, w: 26, name: 'The KemYam box', x: 14, y: 100, y0: 0, rows: 95 },
  { id: 'c1', at: 0x85aa, w: 26, name: 'Yasser Mohamed Ali', x: 14, y: 100, y0: 0, rows: 95 },
  { id: 'c2', at: 0x998a, w: 26, name: 'Mohamed Asaad Fouda', x: 14, y: 100, y0: 0, rows: 95 },
  { id: 'c3', at: 0xad6a, w: 26, name: 'Khalid Zakaria Moustafa', x: 14, y: 100, y0: 0, rows: 95 },
  { id: 'c4', at: 0xc14a, w: 26, name: 'Hatem Mohamed Moustafa', x: 14, y: 100, y0: 0, rows: 95 },
  { id: 'c5', at: 0xd52a, w: 26, name: 'Ebrahem El-Syed El-Etr', x: 14, y: 100, y0: 0, rows: 95 },
] as const;
export type PicId = (typeof NAMES_PICS)[number]['id'];

/** A picture placed on the screen: the part of it the show uses, and where. */
export interface View { pic: Pic; x: number; y: number; y0: number; rows: number }

export type Op = [src: number, dst: number, n: number];
export interface Step { ops: Op[]; wait: number }

export const EFFECTS = [
  { id: 'spiral', at: '08C4', name: 'Spiral', says: 'Forty blocks, one per screen refresh, in the order of his table: a spiral that starts in the middle.' },
  { id: 'comb', at: '0904', name: 'Comb', says: 'Every other row slides in from the left, the rows between from the right, and they meet.' },
  { id: 'venetian', at: '082E', name: 'Blinds', says: 'Every other row from the top down, then the rows between from the bottom up.' },
  { id: 'columns', at: '07B7', name: 'Columns', says: 'Every other column grows down from the top while the columns between grow up from the bottom.' },
  { id: 'box', at: '0747', name: 'Box', says: 'A box opens from the middle, 16 pixels wider and 8 rows taller each step.' },
] as const;
export type FxId = (typeof EFFECTS)[number]['id'];

/** His reveal table at 051B: 40 screen offsets, read as (block row, block column) on a grid of 5 by 8. */
export function spiralOrder(bin: Uint8Array) {
  const out: [number, number][] = [];
  for (let i = 0; i < 40; i++) {
    const o = bin[0x51b - 0x100 + 2 * i] | (bin[0x51b - 0x100 + 2 * i + 1] << 8);
    out.push([Math.floor(o / 40 / 40), (o % 40) / 5]);
  }
  return out;
}

/** The five effects as lists of plane copies. With his own pictures they are exactly his code; with any other picture
 *  the same pattern runs over that picture's own rectangle. */
export function effect(fx: FxId, v: View, order: [number, number][], pitch = 40): Step[] {
  const { pic, x, y, y0, rows } = v, w = pic.w, steps: Step[] = [];
  const at = (r: number, c: number) => (y0 + r) * w + c, to = (r: number, c: number) => (y + r) * pitch + x + c;
  if (fx === 'spiral') {
    const ce = (j: number) => Math.floor((j * w) / 8), re = (k: number) => Math.floor((k * rows) / 5);
    for (const [br, bc] of order) {
      const ops: Op[] = [];
      for (let r = re(br); r < re(br + 1); r++) if (ce(bc + 1) > ce(bc)) ops.push([at(r, ce(bc)), to(r, ce(bc)), ce(bc + 1) - ce(bc)]);
      steps.push({ ops, wait: 1 });
    }
  } else if (fx === 'comb') {
    for (let n = 1; n <= w; n++) {
      const ops: Op[] = [];
      for (let r = 1; r < rows; r += 2) ops.push([at(r, w - n), to(r, 0), n]);
      for (let r = 0; r < rows; r += 2) ops.push([at(r, 0), to(r, w - n), n]);
      steps.push({ ops, wait: 1 });
    }
  } else if (fx === 'venetian') {
    let r = 0;
    for (; r < rows; r += 2) steps.push({ ops: [[at(r, 0), to(r, 0), w]], wait: 2 });
    for (r = rows % 2 ? rows - 2 : rows - 1; r >= 1; r -= 2) steps.push({ ops: [[at(r, 0), to(r, 0), w]], wait: 2 });
  } else if (fx === 'columns') {
    for (let k = 0; k < rows; k++) {
      const ops: Op[] = [], b = rows - 1 - k;
      for (let c = 0; c < w; c += 2) ops.push([at(k, c), to(k, c), 1]);
      for (let c = w % 2 ? w - 2 : w - 1; c >= 1; c -= 2) ops.push([at(b, c), to(b, c), 1]);
      steps.push({ ops, wait: 1 });
    }
  } else {
    const cx = w >> 1, cy = pic.h >> 1;
    const n = Math.max(cx, w - cx, Math.ceil(Math.max(cy - y0, y0 + rows - cy) / 4));
    for (let i = 1; i <= n; i++) {
      const c0 = Math.max(0, cx - i), c1 = Math.min(w, cx + i), ops: Op[] = [];
      for (let r = Math.max(y0, cy - 4 * i); r < Math.min(y0 + rows, cy + 4 * i); r++) ops.push([r * w + c0, (y + r - y0) * pitch + x + c0, c1 - c0]);
      steps.push({ ops, wait: 2 });
    }
  }
  return steps;
}

/** The order of the show (NAMES.COM main, 056F). pause = screen refreshes to wait after the effect. */
export const SHOW: { pic: PicId; fx: FxId; pause: number }[] = [
  { pic: 'tile', fx: 'spiral', pause: 64 }, { pic: 'title', fx: 'comb', pause: 64 }, { pic: 'group', fx: 'venetian', pause: 64 },
  { pic: 'logo', fx: 'columns', pause: 64 }, { pic: 'box', fx: 'box', pause: 64 },
  { pic: 'c1', fx: 'box', pause: 64 }, { pic: 'box', fx: 'box', pause: 0 }, { pic: 'c2', fx: 'box', pause: 64 },
  { pic: 'box', fx: 'box', pause: 0 }, { pic: 'c3', fx: 'box', pause: 64 }, { pic: 'box', fx: 'box', pause: 0 },
  { pic: 'c4', fx: 'box', pause: 64 }, { pic: 'box', fx: 'box', pause: 0 }, { pic: 'c5', fx: 'box', pause: 64 },
  { pic: 'box', fx: 'box', pause: 0 },
];

/** Everything the KemYam toys need from his file: the pictures, the background as a full-screen view, the spiral. */
export function kemyam(bin: Uint8Array) {
  const pics = Object.fromEntries(NAMES_PICS.map(p => [p.id, decodeNames(bin, p.at, p.w)])) as Record<PicId, Pic>;
  // The background: his tile stamped 40 times. As one 320 x 200 picture, every effect can use it.
  const t = pics.tile, bg: Pic = { buf: new Uint8Array(4 * 8000), w: 40, h: 200, stride: 8000, packed: t.packed };
  for (let k = 0; k < 4; k++) for (let r = 0; r < 200; r++) for (let c = 0; c < 40; c++) bg.buf[k * 8000 + r * 40 + c] = t.buf[k * t.stride + (r % 40) * 5 + (c % 5)];
  const view = (id: PicId): View => {
    const m = NAMES_PICS.find(p => p.id === id)!;
    return id === 'tile' ? { pic: bg, x: 0, y: 0, y0: 0, rows: 200 } : { pic: pics[id], x: m.x, y: m.y, y0: m.y0, rows: m.rows };
  };
  return { pics, bg, view, order: spiralOrder(bin) };
}

/** The screen after every scene of the show, from a black screen. */
export function showScreens(k: ReturnType<typeof kemyam>) {
  const s = new Screen(40, 200), out: Screen[] = [];
  for (const sc of SHOW) {
    const v = k.view(sc.pic);
    for (const st of effect(sc.fx, v, k.order)) for (const [a, b, n] of st.ops) s.blit(v.pic, a, b, n);
    out.push(new Screen(40, 200, s));
  }
  return out;
}

// ---------------------------------------------------------------- PORTSAID.EXE: the boot screen

export const PS_PICS = [
  { id: 'arabic', at: 0x0a08, name: 'بورسعيد للحاسبات', en: 'The Arabic name' },
  { id: 'english', at: 0x2f07, name: 'PORT-SAID COMPUTER SYSTEMS', en: 'The English name' },
  { id: 't1', at: 0x45c0, name: 'Logo tile 1', en: 'Logo, bottom right' },
  { id: 't2', at: 0x4fa7, name: 'Logo tile 2', en: 'Logo, bottom left' },
  { id: 't3', at: 0x598e, name: 'Logo tile 3', en: 'Logo, top right' },
  { id: 't4', at: 0x6375, name: 'Logo tile 4', en: 'Logo, top left' },
] as const;
export type PsId = (typeof PS_PICS)[number]['id'];

/** The four fly-ins (44CE): tile, start x, y, end x, y, in 100 steps. Two from the top right, two from below the bottom. */
export const FLY: [PsId, number, number, number, number][] = [
  ['t4', 576, 0, 64, 100], ['t3', 576, 0, 127, 100], ['t2', 576, 278, 64, 178], ['t1', 576, 278, 127, 178],
];
/** The Arabic name's drop and bounce (0853): from y to y, in n steps. */
export const BOUNCE: [number, number, number][] = [[0, 123, 70], [123, 110, 18], [110, 123, 15], [123, 117, 15], [117, 123, 10], [123, 119, 8], [119, 123, 7], [123, 122, 6], [122, 123, 5]];

export interface Frame { pic: PsId | null; ops: Op[]; phase: 'logo' | 'pause' | 'curtain' | 'drop' | 'english'; x?: number; y?: number; tile?: number }

/** His straight-line move (0592 / 06EC): x and y as doubles, one step added each time, then cut to whole pixels;
 *  x is cut again to a whole byte (x / 8), so the picture lands on 8-pixel columns. */
export function line(x0: number, y0: number, x1: number, y1: number, n: number) {
  const dx = (x1 - x0) / n, dy = (y1 - y0) / n, out: [number, number][] = [];
  let x = x0, y = y0;
  for (let i = 0; i <= n; i++) { out.push([Math.trunc(x), Math.trunc(y)]); x += dx; y += dy; }
  return out;
}

/** Every draw of the boot screen (main, 6CE7), in order. */
export function bootFrames(pics: Record<PsId, Pic>): Frame[] {
  const f: Frame[] = [];
  FLY.forEach(([id, x0, y0, x1, y1], tile) => {
    const p = pics[id];
    for (const [x, y] of line(x0, y0, x1, y1, 100)) {
      const dst = y * 80 + Math.trunc(x / 8), ops: Op[] = [];
      for (let r = 0; r < p.h; r++) ops.push([r * p.w, dst + r * 80, p.w]);
      f.push({ pic: id, ops, phase: 'logo', x, y, tile });
    }
  });
  for (let i = 0; i < 10; i++) f.push({ pic: null, ops: [], phase: 'pause' }); // delay(10): ten screen refreshes
  const a = pics.arabic, half = a.h >> 1;
  for (let n = 1; n <= 80; n++) { // the curtain (03D6): rows meet from both sides
    const ops: Op[] = [];
    for (let k = 0; k < half; k++) ops.push([160 * k + 160 - n, 160 * k, n]);
    for (let k = 0; k < half; k++) ops.push([160 * k, (160 * k - n) & 0xffff, n]);
    f.push({ pic: 'arabic', ops, phase: 'curtain' });
  }
  for (const [y0, y1, n] of BOUNCE) {
    for (const [, y] of line(200, y0, 200, y1, n)) {
      const ops: Op[] = [];
      for (let r = 0; r < a.h; r++) ops.push([25 + r * 80, y * 80 + 25 + r * 80, 55]);
      f.push({ pic: 'arabic', ops, phase: 'drop', y });
    }
  }
  const e = pics.english;
  for (const [x, y] of line(192, 193, 192, 193, 1)) {
    const ops: Op[] = [];
    for (let r = 0; r < e.h; r++) ops.push([r * e.w, y * 80 + (x >> 3) + r * 80, e.w]);
    f.push({ pic: 'english', ops, phase: 'english' });
  }
  return f;
}

export function portsaid(bin: Uint8Array) {
  const pics = Object.fromEntries(PS_PICS.map(p => [p.id, decodePs(bin, p.at)])) as Record<PsId, Pic>;
  return { pics, frames: bootFrames(pics) };
}

/** The boot screen after frame k (0-based), drawn from a black screen. */
export function bootScreen(ps: ReturnType<typeof portsaid>, k: number) {
  const s = new Screen(80, 350);
  for (let i = 0; i <= Math.min(k, ps.frames.length - 1); i++) {
    const fr = ps.frames[i];
    if (fr.pic) for (const [a, b, n] of fr.ops) s.blit(ps.pics[fr.pic], a, b, n);
  }
  return s;
}
