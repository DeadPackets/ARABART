// The script editor's language: his own bytes, written as words. A stroke is two hex numbers (offset, length),
// x and w move the pen one column, y starts a new line 40 rows lower. Compiles to the exact bytes his player reads.
import { X, Wc, Y } from './player.ts';

export const HEADER = [0x4b, 0x43, 0x00, 0x07, 0x04];
export const ROW = 64, COL = 445, STEP = 40, MAXLINES = 3;

export interface Out { bytes: number[]; error: string; strokes: number; at: number }

const word = (n: number) => [n & 255, n >> 8];
const org = (row: number) => [...word(row), ...word(COL)];

/** Text -> his bytes. On a mistake: the bytes up to it, and a friendly message. at = index of the bad word. */
export function compile(text: string): Out {
  const toks = text.trim().split(/[\s,]+/).filter(Boolean);
  const bytes = [...HEADER, ...org(ROW)];
  let strokes = 0, line = 0;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i], low = t.toLowerCase();
    const fail = (error: string) => ({ bytes, error, strokes, at: i });
    if (low === 'x') { bytes.push(X); continue; }
    if (low === 'w') { bytes.push(Wc); continue; }
    if (low === 'y') {
      if (++line >= MAXLINES) return fail(`Three lines fill this little screen. Remove the last y.`);
      bytes.push(Y, ...HEADER, ...org(ROW + STEP * line));
      continue;
    }
    if (!/^[0-9a-f]{1,2}$/i.test(t)) return fail(`“${t}” is not a word his player knows. Use x, w, y, or a stroke as two hex numbers, like 20 04.`);
    const off = parseInt(t, 16);
    if (off >= 0x70) return fail(`${t.toUpperCase()} is too big for a stroke. From 70 up, the bytes are his command letters (78 is x). Use 00 to 6F.`);
    const n = toks[i + 1];
    if (n === undefined || !/^[0-9a-f]{1,2}$/i.test(n)) return fail(`The stroke ${t.toUpperCase()} needs a length after it, like ${t.toUpperCase()} 04.`);
    const len = parseInt(n, 16);
    if (len === 0) return { bytes, error: 'A stroke needs at least one pixel. Use a length from 01 to FF.', strokes, at: i + 1 };
    bytes.push(off, len);
    strokes++;
    i++;
  }
  return { bytes, error: '', strokes, at: -1 };
}

/** His bytes -> one line of text per column (the strokes in it, then x). */
export function decompile(b: Uint8Array | number[], from: number, to: number) {
  const lines: string[] = [];
  let cur: string[] = [];
  const h = (v: number) => v.toString(16).toUpperCase().padStart(2, '0');
  for (let i = from; i < to; ) {
    if (b[i] === X || b[i] === Wc) { lines.push([...cur, b[i] === X ? 'x' : 'w'].join('  ')); cur = []; i++; continue; }
    cur.push(`${h(b[i])} ${h(b[i + 1])}`); i += 2;
  }
  if (cur.length) lines.push(cur.join('  '));
  return lines.join('\n');
}

/** A 16:10 window onto his 640x350 screen that frames the drawing (box = x0, y0, x1, y1) with a margin. */
export function camera(box: number[]) {
  const [x0, y0, x1, y1] = box[2] < 0 ? [400, 80, 447, 110] : box;
  let w = Math.max(x1 - x0 + 1 + 24, (y1 - y0 + 1 + 16) * 1.6, 80);
  w = Math.min(640, Math.ceil(w / 8) * 8);
  const h = Math.min(350, Math.round(w / 1.6));
  const x = Math.max(0, Math.min(640 - w, Math.round((x0 + x1) / 2 - w / 2)));
  const y = Math.max(0, Math.min(350 - h, Math.round((y0 + y1) / 2 - h / 2)));
  return { x, y, w, h };
}
