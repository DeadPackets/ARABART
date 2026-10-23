// His 1991 script player, ported instruction for instruction: SCREEN.COM 0100-019B (156 bytes) and the TAHER.COM
// version (also the engine of ARABIC/DEMO.COM). A script is bytes: a 5-byte header that he writes into his own code,
// a 2-word origin, then strokes (offset, length), x and w (one column), y (new header), and the frame or end commands.
export const W = 640, H = 350;
export type Kind = 'screen' | 'taher';
export const X = 0x78, Wc = 0x77, Y = 0x79, FRAME = 0x7b, END = 0x7a, NEXT = 0x88;
export const DEC = 0x4b, INC = 0x43, SHADOW = 0x00, NOSHADOW = 0x0d;

/** The 5 header bytes as they sit in his code: opcode for x, opcode for w, the shadow jump, stroke color, shadow color. */
export interface Patch { x: number; w: number; jmp: number; color: number; shadow: number }
export interface Ev { t: 'header' | 'stroke' | 'move' | 'frame' | 'next' | 'end'; at: number; len?: number; col: number; row: number }

export class Player {
  pix = new Uint8Array(W * H);
  p: Patch = { x: DEC, w: INC, jmp: SHADOW, color: 3, shadow: 14 };
  si: number; top = 0; col = 0; done = false; plots = 0;
  strokes = 0; moves = 0;
  frameAt = -1;          // SCREEN: '{' jumps back here (0A9B in his file: the origin of line 3)
  onPlot?: (x: number, y: number, c: number) => void;

  b: Uint8Array; kind: Kind;
  constructor(b: Uint8Array, start: number, kind: Kind = 'screen') {
    this.b = b; this.kind = kind; this.si = start;
    this.header();
  }

  /** INT 10h AH=0Ch: one pixel. Off-screen pixels are dropped. */
  plot(x: number, y: number, c: number) {
    this.plots++;
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    this.pix[y * W + x] = c & 15;
    this.onPlot?.(x, y, c & 15);
  }

  /** 0108: five header bytes into his code, then the origin row (DI) and column (BX). */
  header() {
    const b = this.b;
    this.p = { x: b[this.si], w: b[this.si + 1], jmp: b[this.si + 2], color: b[this.si + 3], shadow: b[this.si + 4] };
    this.si += 5;
    this.frameAt = this.si;
    this.origin();
  }
  origin() {
    const b = this.b;
    this.top = b[this.si] | (b[this.si + 1] << 8);
    this.col = b[this.si + 2] | (b[this.si + 3] << 8);
    this.si += 4;
  }
  /** dec bx / inc bx, whichever opcode the header wrote there. */
  private go(op: number) { this.col += op === DEC ? -1 : op === INC ? 1 : 0; this.moves++; }

  /** One script command. Returns what it did, or null at the end. */
  step(): Ev | null {
    if (this.done || this.si >= this.b.length) { this.done = true; return null; }
    const at = this.si, dl = this.b[this.si++];
    const ev = (t: Ev['t'], len?: number): Ev => ({ t, at, len, col: this.col, row: this.top });
    if (dl === X) { this.go(this.p.x); return ev('move'); }
    if (dl === Wc) { this.go(this.p.w); return ev('move'); }
    if (dl === Y) { this.header(); return ev('header'); }
    if (this.kind === 'screen' && dl === FRAME) {
      // 0150: no key yet, so the next color (2 to 15) and line 3 again from its origin
      this.p.color = this.p.color + 1 === 16 ? 2 : this.p.color + 1;
      this.si = this.frameAt;
      this.origin();
      return ev('frame');
    }
    if (this.kind === 'taher' && dl === END) { this.done = true; return ev('end'); }
    if (this.kind === 'taher' && dl === NEXT) { this.pix.fill(0); this.header(); return ev('next'); }
    // 016F: a stroke. Row = origin + offset, then length pixels down, each with its shadow 2 right and 2 down
    let row = this.top + dl, n = this.b[this.si++] || 65536;
    const len = n;
    while (n--) {
      this.plot(this.col, row, this.p.color);
      if (this.p.jmp === SHADOW) this.plot(this.col + 2, row + 2, this.p.shadow);
      row++;
    }
    this.strokes++;
    return { t: 'stroke', at, len, col: this.col, row: this.top + dl };
  }

  /** Runs until the next frame or end command (or n commands). */
  run(n = Infinity, until: Ev['t'][] = ['frame', 'end']) {
    let e: Ev | null = null;
    while (n-- > 0 && (e = this.step())) if (until.includes(e.t)) break;
    return e;
  }
}

/** Where his scripts start in the unpacked files (memory address - 100h). */
export const SCRIPT = { screen: 0x19c - 0x100, taher: 0x1ec - 0x100 };
