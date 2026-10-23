// A small Borland BGI on a 640 x 480, 16-color VGA screen: only the calls his editors make, pixel for pixel.
// The 8 x 8 font comes from his own EGAVGA.BGI (programs/EDIT, offset 7A0h), passed in as base64.

// The VGA card's default 16 colors, 0 to 63 per channel
export const DAC: number[][] = [
  [0, 0, 0], [0, 0, 42], [0, 42, 0], [0, 42, 42], [42, 0, 0], [42, 0, 42], [42, 21, 0], [42, 42, 42],
  [21, 21, 21], [21, 21, 63], [21, 63, 21], [21, 63, 63], [63, 21, 21], [63, 21, 63], [63, 63, 21], [63, 63, 63],
];
// WINGRAPH.CPP 01F6:000E: the five entries he changed, in his order
export const HIS: [number, number, number, number][] = [[12, 63, 0, 0], [15, 63, 63, 63], [7, 42, 42, 42], [8, 32, 32, 32], [1, 0, 0, 48]];

export type Op =
  | ['pal', number, number, number, number] | ['fill', number] | ['color', number] | ['xor', boolean]
  | ['bar', number, number, number, number] | ['rect', number, number, number, number]
  | ['line', number, number, number, number] | ['text', number, number, string] | ['view', number, number];

export const fontFrom = (b64: string) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));

export class Screen {
  px: Uint8Array;
  dac = DAC.map(c => [...c]);
  color = 15; fill = 15; xor = false; vx = 0; vy = 0;
  font: Uint8Array; w: number; h: number;
  constructor(font: Uint8Array, w = 640, h = 480) { this.font = font; this.w = w; this.h = h; this.px = new Uint8Array(w * h); }
  put(x: number, y: number, c: number) {
    x += this.vx; y += this.vy;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = y * this.w + x;
    this.px[i] = this.xor ? this.px[i] ^ c : c;
  }
  bar(l: number, t: number, r: number, b: number) {
    const x = this.xor; this.xor = false;
    for (let y = t; y <= b; y++) for (let k = l; k <= r; k++) this.put(k, y, this.fill);
    this.xor = x;
  }
  line(x1: number, y1: number, x2: number, y2: number) {
    const dx = Math.abs(x2 - x1), dy = -Math.abs(y2 - y1), sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
    let e = dx + dy;
    for (;;) {
      this.put(x1, y1, this.color);
      if (x1 === x2 && y1 === y2) break;
      const e2 = 2 * e;
      if (e2 >= dy) { e += dy; x1 += sx; }
      if (e2 <= dx) { e += dx; y1 += sy; }
    }
  }
  // Every pixel once, so a rectangle drawn in XOR mode is a clean outline
  rect(l: number, t: number, r: number, b: number) {
    [l, r] = [Math.min(l, r), Math.max(l, r)]; [t, b] = [Math.min(t, b), Math.max(t, b)];
    for (let x = l; x <= r; x++) { this.put(x, t, this.color); if (b !== t) this.put(x, b, this.color); }
    for (let y = t + 1; y < b; y++) { this.put(l, y, this.color); if (r !== l) this.put(r, y, this.color); }
  }
  text(x: number, y: number, s: string) {
    for (let i = 0; i < s.length; i++) {
      const g = s.charCodeAt(i) & 0x7f;
      for (let row = 0; row < 8; row++) {
        const bits = this.font[g * 8 + row];
        for (let col = 0; col < 8; col++) if (bits & (0x80 >> col)) this.put(x + i * 8 + col, y + row, this.color);
      }
    }
  }
  run(op: Op) {
    switch (op[0]) {
      case 'pal': this.dac[op[1]] = [op[2], op[3], op[4]]; break;
      case 'fill': this.fill = op[1]; break;
      case 'color': this.color = op[1]; break;
      case 'xor': this.xor = op[1]; break;
      case 'view': this.vx = op[1]; this.vy = op[2]; break;
      case 'bar': this.bar(op[1], op[2], op[3], op[4]); break;
      case 'rect': this.rect(op[1], op[2], op[3], op[4]); break;
      case 'line': this.line(op[1], op[2], op[3], op[4]); break;
      case 'text': this.text(op[1], op[2], op[3]); break;
    }
  }
  rgb(i: number) { return this.dac[i].map(v => Math.round((v * 255) / 63)); }
  /** Black or white, whichever reads better on color i (relative luminance above 0.179 takes black) */
  ink(i: number) { return this.rgb(i).reduce((l, v, j) => l + [0.2126, 0.7152, 0.0722][j] * (v / 255) ** 2.2, 0) > 0.179 ? '#000' : '#fff'; }
  rgba(x0 = 0, y0 = 0, w = this.w, h = this.h) {
    const out = new Uint8ClampedArray(w * h * 4), lut = this.dac.map((_, i) => this.rgb(i));
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const c = lut[this.px[(y0 + y) * this.w + x0 + x]], o = (y * w + x) * 4;
      out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; out[o + 3] = 255;
    }
    return out;
  }
}

// WINGRAPH.CPP 01F6:008A, the window, then 027A:005E, the INS status. Each step is one or more of his calls, as written.
export const WINDOW: { call: string; say: string; ops: Op[] }[] = [
  { call: 'getpalette(&pal);\nsetrgbpalette(pal.colors[LIGHTRED], 63, 0, 0);\nsetrgbpalette(pal.colors[WHITE], 63, 63, 63);\nsetrgbpalette(pal.colors[LIGHTGRAY], 42, 42, 42);\nsetrgbpalette(pal.colors[DARKGRAY], 32, 32, 32);\nsetrgbpalette(pal.colors[BLUE], 0, 0, 48);', say: 'Five palette changes come first: pure red for the cursor, a true white, Windows’ light and dark grays, and a deeper blue.', ops: HIS.map(([i, r, g, b]) => ['pal', i, r, g, b] as Op) },
  { call: 'setfillstyle(SOLID_FILL, WHITE);\nbar(0, 0, 639, 479);', say: 'The whole screen becomes white paper.', ops: [['fill', 15], ['bar', 0, 0, 639, 479]] },
  { call: 'setfillstyle(SOLID_FILL, BLUE);\nbar(0, 0, 639, 25);', say: 'The title bar: 26 rows of blue across the top.', ops: [['fill', 1], ['bar', 0, 0, 639, 25]] },
  { call: 'setcolor(WHITE);\nouttextxy(280, 10, "TEST-EDITOR");', say: 'The title, in white, in Borland’s 8 × 8 font.', ops: [['color', 15], ['text', 280, 10, 'TEST-EDITOR']] },
  { call: 'setcolor(DARKGRAY);\nrectangle(1, 1, 638, 478);\nrectangle(2, 2, 637, 477);', say: 'Two dark gray rectangles inside the edge: the thick window frame of Windows 3.', ops: [['color', 8], ['rect', 1, 1, 638, 478], ['rect', 2, 2, 637, 477]] },
  { call: 'setcolor(BLACK);\nrectangle(3, 3, 636, 476);', say: 'A thin black line inside the frame.', ops: [['color', 0], ['rect', 3, 3, 636, 476]] },
  { call: 'line(615, 0, 615, 3);\nline(615, 476, 615, 479);\nline(25, 476, 25, 479);', say: 'Three tiny notches in the frame, where Windows 3 marks its resize corners.', ops: [['line', 615, 0, 615, 3], ['line', 615, 476, 615, 479], ['line', 25, 476, 25, 479]] },
  { call: 'line(0, 25, 639, 25);\nrectangle(0, 0, 639, 479);', say: 'A black line under the title bar, and the outer edge of the window.', ops: [['line', 0, 25, 639, 25], ['rect', 0, 0, 639, 479]] },
  { call: 'setfillstyle(SOLID_FILL, LIGHTGRAY);\nbar(4, 4, 25, 25);\nrectangle(0, 0, 25, 25);', say: 'The system menu box in the top left corner, gray with a black outline.', ops: [['fill', 7], ['bar', 4, 4, 25, 25], ['rect', 0, 0, 25, 25]] },
  { call: 'setfillstyle(SOLID_FILL, WHITE);\nbar(11, 14, 17, 15);\nrectangle(10, 13, 18, 16);', say: 'Its little white bar, the same mark Windows 3 puts there.', ops: [['fill', 15], ['bar', 11, 14, 17, 15], ['rect', 10, 13, 18, 16]] },
  { call: 'line(4, 48, 636, 48);', say: 'The line under the menu bar.', ops: [['line', 4, 48, 636, 48]] },
  { call: 'outtextxy(18, 33, "File");\nline(16, 41, 24, 41);', say: '“File”, and one short line under the F: the keyboard shortcut mark of Windows 3, drawn by hand.', ops: [['text', 18, 33, 'File'], ['line', 16, 41, 24, 41]] },
  { call: 'rectangle(0, 454, 639, 479);\nline(540, 455, 540, 476);', say: 'The status bar along the bottom, split at x = 540.', ops: [['rect', 0, 454, 639, 479], ['line', 540, 455, 540, 476]] },
  { call: 'bar(550, 462, 630, 475);\nouttextxy(560, 462, "INS  ON");', say: 'The insert mode, at the right of the status bar. Press Ins in his editor and only this corner is drawn again.', ops: [['fill', 15], ['bar', 550, 462, 630, 475], ['color', 0], ['text', 560, 462, 'INS  ON']] },
];

// FUNCTION.CPP 027A:01CF: the cursor is three 2-pixel rectangles drawn in XOR mode with color 3, at a text row and column
export const cursorOps = (row: number, col: number): Op[] => {
  const x = col * 8, t = row * 12 - 3, b = row * 12 + 12;
  return [['xor', true], ['color', 3], ['rect', x, t, x + 1, b], ['rect', x + 2, t, x + 3, b], ['rect', x + 4, t, x + 5, b], ['xor', false]];
};
