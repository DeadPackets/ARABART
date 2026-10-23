// His drawing loop (SCREEN.COM 012E-0193) for the CodeStepper: the listing, the same loop in C, and a trace of the
// first script bytes of line 1, one step per instruction for the first stroke, then one step per command.
import { Player, X } from './player.ts';

export const ASM = [
  { off: '012E', label: 'next', code: 'mov  dl,[si]', note: 'read a byte' },
  { off: '0130', code: 'inc  si' },
  { off: '0131', code: 'cmp  dl,70h', note: 'under 70h:' },
  { off: '0134', code: 'jl   stroke', note: 'a stroke' },
  { off: '0136', code: "cmp  dl,'x'", note: 'x: one column' },
  { off: '0139', code: 'jne  013Eh' },
  { off: '013B', code: 'dec  bx', note: 'left (header)' },
  { off: '013C', code: 'jmp  next' },
  { off: '013E', code: "cmp  dl,'w'", note: 'w: the other way' },
  { off: '0143', code: 'inc  bx', note: 'right (header)' },
  { off: '0146', code: "cmp  dl,'y'", note: 'y: a new line' },
  { off: '014B', code: "cmp  dl,'{'", note: '{: picture done' },
  { off: '016F', label: 'stroke', code: 'mov  dh,0', note: 'DX = the byte' },
  { off: '0171', code: 'add  dx,di', note: 'row = top + byte' },
  { off: '0173', code: 'mov  cl,[si]', note: 'the length' },
  { off: '0175', code: 'inc  si' },
  { off: '0178', label: 'pixel', code: 'mov  ax,0C07h', note: 'gray (header)' },
  { off: '017B', code: 'xchg bx,cx', note: 'column to CX' },
  { off: '017D', code: 'int  10h', note: 'BIOS: a pixel' },
  { off: '017F', code: 'jmp  0181h', note: 'shadow on (header)' },
  { off: '0181', code: 'mov  ax,0C04h', note: 'red (header)' },
  { off: '0184', code: 'inc  cx / inc cx', note: '2 right' },
  { off: '0186', code: 'inc  dx / inc dx', note: '2 down' },
  { off: '0188', code: 'int  10h', note: 'the shadow' },
  { off: '018A', code: 'dec  cx / dec cx', note: 'back' },
  { off: '018C', code: 'dec  dx / dec dx' },
  { off: '018E', code: 'inc  dx', note: 'next row' },
  { off: '018F', code: 'xchg bx,cx', note: 'count to CX' },
  { off: '0191', code: 'loop pixel', note: 'until done' },
  { off: '0193', code: 'jmp  next' },
];

export const C = [
  { code: 'for (;;) {' },
  { code: '  op = *s++;', note: 'next byte' },
  { code: "  if (op == 'x') col--;", note: 'or ++' },
  { code: "  else if (op == 'w') col++;" },
  { code: "  else if (op == 'y') header();" },
  { code: "  else if (op == '{') frame();" },
  { code: '  else {', note: 'a stroke' },
  { code: '    row = top + op;' },
  { code: '    n = *s++;', note: 'length' },
  { code: '    while (n--) {' },
  { code: '      plot(col, row, ink);' },
  { code: '      if (shadow)' },
  { code: '        plot(col+2, row+2, shade);' },
  { code: '      row++;' },
  { code: '    }' },
  { code: '  }' },
  { code: '}' },
];

export interface Reg { name: string; value: string; means: string; changed?: boolean }
export interface LStep { a: number; c: number; say: string; regs: Reg[]; k: number; si: number; pen: [number, number]; h: [number, number] }

const h2 = (n: number) => n.toString(16).toUpperCase().padStart(2, '0') + 'h';

/** b: the script bytes from line 1's header on; n: how many body bytes to trace. k counts plots done so far. */
export function trace(b: Uint8Array, n: number) {
  const p = new Player(b, 0);
  const body = p.si, plots: [number, number, number][] = [];
  const steps: LStep[] = [];
  let dl = 0, row = 0, cx = 0, old: Record<string, string> = {}, first = true;
  const add = (a: number, c: number, say: string, h: [number, number] = [p.si - body - 1, p.si - body - 1]) => {
    const regs: Reg[] = [
      { name: 'SI', value: `byte ${p.si - body + 1}`, means: 'where it reads next' },
      { name: 'DL', value: h2(dl), means: dl === X ? 'the letter x' : 'the byte it read' },
      { name: 'BX', value: String(p.col), means: 'the pen: column' },
      { name: 'DX', value: String(row), means: 'the pen: row' },
      { name: 'CX', value: String(cx), means: 'pixels left in this stroke' },
    ];
    regs.forEach(r => (r.changed = !!old[r.name] && old[r.name] !== r.value));
    old = Object.fromEntries(regs.map(r => [r.name, r.value]));
    steps.push({ a, c, say, regs, k: plots.length, si: p.si - body, pen: [p.col, row], h });
  };
  while (p.si - body < n) {
    dl = b[p.si];
    if (dl === X) {
      p.si++; add(0, 1, `Read <b>78h</b>: the letter <b>x</b>.`); p.si--;
      p.step();
      add(6, 2, `<b>dec bx</b>: the pen moves one column left, to <b>${p.col}</b>. Arabic runs right to left, and so does his pen.`);
      continue;
    }
    const len = b[p.si + 1], col = p.col, top = p.top, { color, shadow } = p.p;
    p.step();
    row = top + dl;
    if (!first) {
      for (let i = 0; i < len; i++) plots.push([col, row + i, color], [col + 2, row + i + 2, shadow]);
      row += len; cx = 0;
      add(28, 9, `<b>${h2(dl)} ${h2(len)}</b>: a stroke from row ${top + dl}, ${len} pixels long, each pixel with its red shadow.`, [p.si - body - 2, p.si - body - 1]);
      continue;
    }
    first = false;
    p.si -= 1; add(0, 1, `Read <b>${h2(dl)}</b>, the first byte after the header.`);
    add(3, 6, `${h2(dl)} is below 70h, so it is not a command letter. It is a <b>stroke</b>.`);
    add(13, 7, `Row = line top <b>${top}</b> + <b>${dl}</b> = <b>${row}</b>. The stroke starts here.`);
    p.si += 1; cx = len;
    add(14, 8, `The next byte, <b>${h2(len)}</b>, is the length: <b>${len}</b> pixels down.`);
    for (let i = 0; i < len; i++) {
      plots.push([col, row, color]);
      add(18, 10, i === 0 ? `<b>int 10h</b>: the BIOS paints one gray pixel at column ${col}, row ${row}.` : `Pixel ${i + 1}: gray at row ${row}, then its red shadow.`);
      plots.push([col + 2, row + 2, shadow]);
      if (i === 0) add(23, 12, `Then the same pixel in red, <b>2 right and 2 down</b>. The red peeks out from under the gray: a carved, raised look.`);
      row++; cx--;
      if (i === 0) add(28, 9, `Next row down. <b>loop</b> counts CX down: ${cx} pixels to go.`);
    }
    if (steps.at(-1)!.k !== plots.length) steps.at(-1)!.k = plots.length;
    add(29, 0, 'Stroke done. Back to the top for the next byte.');
  }
  return { steps, plots, body };
}
