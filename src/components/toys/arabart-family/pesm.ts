// PESM.EXE (1991): its 16 calls (image offsets 0007-00F6), read from the binary. Drawn with font 1 of ARABART 4.15
// the result is pixel-identical to PESM's own screen (25,200 of 25,200 lit pixels), because the engines are the same.
import { render, type Bin } from '../arabart/core.ts';

export const BASMALA = 'fsl hggi hgvplk hgvpdl';
const PRE = ['', '@', '@#', '@', '@#!', '@', '@#', '@', '*$', '@', '@#', '@', '@#!', '@', '@#', '@'];
const COLOR = [15, 9, 10, 11, 12, 14, 15, 8, 15, 9, 10, 11, 12, 14, 14, 8];
const Y = [60, 120, 180, 240, 300, 360, 420, 479];
const TEXT = [0xfc, 0x113, 0x12b, 0x144, 0x15c, 0x176, 0x18e, 0x1a7, 0x1bf, 0x1d8, 0x1f0, 0x209, 0x221, 0x23b, 0x253, 0x26c];

export interface PesmCall { k: number; off: number; text: number; keys: string; pre: string; color: number; x: number; y: number; state: number; before: number }

/** The switches carry over from call to call in PESM, so state is a 4-bit number: double, italic, underline, bold. */
export const CALLS: PesmCall[] = [];
let st = 0;
PRE.forEach((pre, k) => {
  const before = st;
  for (const c of pre) st = c === '*' ? 0 : st ^ ({ '@': 1, '#': 2, '!': 4, '$': 8 }[c] ?? 0);
  CALLS.push({ k, off: 7 + 15 * k, text: TEXT[k], keys: pre + BASMALA, pre, color: COLOR[k], x: k < 8 ? 600 : 400, y: Y[k % 8], state: st, before });
});

export const draw = (bin: Bin, c: PesmCall) =>
  render(bin, c.keys, { font: 1, color: c.color, x: c.x, bold: !!(c.before & 1), underline: !!(c.before & 2), italic: !!(c.before & 4), double: !!(c.before & 8) });

// The blocks PESM shares with ARABART 4.15, byte for byte (image offsets; both files add a 30h-byte header)
export const TWINS = [
  { name: 'The joining code', pesm: 0x2c4, arabart: 0x238, n: 136 },
  { name: 'Letter shapes', pesm: 0xc70, arabart: 0x900, n: 660 },
  { name: 'Letter shapes', pesm: 0xf9e, arabart: 0xc2a, n: 1040 },
  { name: 'Letter shapes', pesm: 0x13ae, arabart: 0x1054, n: 1058 },
];
