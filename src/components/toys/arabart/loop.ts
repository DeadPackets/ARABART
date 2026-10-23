// His joining pass, ARABART.EXE 022F-02BB (research/artifacts/arabart/arabart.lst), and a C version line for line.
// trace() runs it on real codes and records every line executed, for the CodeStepper.
import { FORMS, hex, bits8, isStyle } from './core.ts';

export interface Line { off?: string; label?: string; code: string; note?: string }
export interface Reg { name: string; value: string; means: string; changed?: boolean }
export interface Step { a: number; c: number; say: string; regs: Reg[]; mem: number[]; di: number; si: number }

// The labels are ours: his binary has no names.
export const ASM: Line[] = [
  { off: '0234', code: 'mov  di,cs:[05EFh]', note: 'DI points at the text' },
  { off: '0239', code: 'dec  di' },
  { off: '023A', label: 'first', code: 'inc  di' },
  { off: '023B', code: 'mov  dl,[di]', note: 'DL = the first key' },
  { off: '023D', code: 'cmp  dl,0C8h', note: 'a style key? (and C9h CAh CBh D0h)' },
  { off: '0240', code: 'je   first' },
  { off: '0256', code: 'and  dl,0BFh', note: 'nothing before it: let go on the right' },
  { off: '0259', code: 'mov  [di],dl' },
  { off: '025B', label: 'this', code: 'mov  dl,[di]', note: 'DL = this letter' },
  { off: '025D', code: 'cmp  dl,0', note: 'a zero ends the text' },
  { off: '0260', code: 'je   done' },
  { off: '0262', code: 'cmp  dl,0C8h', note: 'a style key? (and C9h CAh CBh D0h)' },
  { off: '0265', code: 'je   skip' },
  { off: '027B', code: 'mov  si,di' },
  { off: '027D', label: 'ahead', code: 'inc  si' },
  { off: '027E', code: 'mov  cl,[si]', note: 'CL = the next letter' },
  { off: '0280', code: 'cmp  cl,0C8h', note: 'a style key? look further' },
  { off: '0283', code: 'je   ahead' },
  { off: '0299', code: 'mov  ch,cl' },
  { off: '029B', code: 'mov  dh,dl' },
  { off: '029D', code: 'and  dh,80h', note: 'this letter: reaches left?' },
  { off: '02A0', code: 'and  ch,40h', note: 'next letter: reaches right?' },
  { off: '02A3', code: 'cmp  dh,0' },
  { off: '02A6', code: 'je   cut' },
  { off: '02A8', code: 'cmp  ch,0' },
  { off: '02AB', code: 'je   cut' },
  { off: '02AD', code: 'jmp  skip', note: 'both reach: they stay joined' },
  { off: '02B0', label: 'cut', code: 'and  dl,7Fh', note: 'this letter lets go on its left' },
  { off: '02B3', code: 'and  cl,0BFh', note: 'the next one lets go on its right' },
  { off: '02B6', code: 'mov  [di],dl' },
  { off: '02B8', code: 'mov  [si],cl', note: 'write both back' },
  { off: '02BA', label: 'skip', code: 'inc  di', note: 'one letter on' },
  { off: '02BB', code: 'jmp  this' },
  { off: '02BD', label: 'done', code: '', note: 'every letter has its shape: draw' },
];

export const C: Line[] = [
  { code: 'char *di = text;' },
  { code: 'while (is_style(*di)) di++;' },
  { code: '*di &= 0xBF;', note: 'nothing comes before it' },
  { code: 'for (;; di++) {' },
  { code: '  char dl = *di;' },
  { code: '  if (dl == 0) break;', note: 'the end' },
  { code: '  if (is_style(dl)) continue;' },
  { code: '  char *si = di, cl;' },
  { code: '  do cl = *++si;' },
  { code: '  while (is_style(cl));' },
  { code: '  int left  = dl & 0x80;', note: 'bit 7' },
  { code: '  int right = cl & 0x40;', note: 'bit 6' },
  { code: '  if (!left || !right) {' },
  { code: '    *di = dl & 0x7F;', note: 'let go' },
  { code: '    *si = cl & 0xBF;', note: 'let go' },
  { code: '  }' },
  { code: '}' },
  { code: 'draw(text);' },
];

// Which C line each assembly line belongs to
const A2C = [0, 1, 1, 1, 1, 1, 2, 2, 4, 5, 5, 6, 6, 7, 8, 8, 9, 9, 11, 10, 10, 11, 12, 12, 12, 12, 15, 13, 14, 13, 14, 3, 3, 17];

/** Runs his pass over glyph codes (with the 0 that ends the text) and records each line. letters[i] names code i. */
export function trace(codes: number[], letters: string[]): Step[] {
  const mem = [...codes, 0];
  const name = (i: number) => (i >= codes.length ? 'the end of the text' : isStyle(mem[i]) ? 'a style key' : letters[i] || 'a space');
  const steps: Step[] = [];
  let dl = 0, cl = 0, dh = 0, ch = 0, di = 0, si = 0;
  let prev: Record<string, string> = {};
  const push = (a: number, say: string) => {
    const v = (n: number) => `${hex(n)}h`;
    const regs: Reg[] = [
      { name: 'DI', value: String(di + 1), means: `points at ${di >= codes.length ? 'the zero at the end' : `letter ${di + 1}, ${name(di)}`}` },
      { name: 'DL', value: v(dl), means: `this letter, ${bits8(dl)}` },
      { name: 'SI', value: String(si + 1), means: `points at ${name(si)}` },
      { name: 'CL', value: v(cl), means: `the next letter, ${bits8(cl)}` },
      { name: 'DH', value: v(dh), means: dh ? 'yes, this letter reaches left' : 'this letter’s left hand' },
      { name: 'CH', value: v(ch), means: ch ? 'yes, the next one reaches right' : 'the next letter’s right hand' },
    ];
    for (const r of regs) { r.changed = prev[r.name] !== undefined && prev[r.name] !== r.value; }
    prev = Object.fromEntries(regs.map(r => [r.name, r.value]));
    steps.push({ a, c: A2C[a], say, regs, mem: [...mem], di, si });
  };
  const form = (c: number) => FORMS[c >> 6];

  // The first letter
  di = 0; push(0, 'DI now points at the first key of the text. A pointer, like an index into an array.');
  di = -1; push(1, 'Step back one, so the loop below can step forward onto it.');
  for (;;) {
    di++; push(2, 'Move to the next key.');
    dl = mem[di]; push(3, `Load it into DL: ${name(di)}, ${hex(dl)}h.`);
    push(4, isStyle(dl) ? 'It is a style key (bold, italic, underline, size). Those never join.' : 'Is it a style key? No, it is a letter.');
    push(5, isStyle(dl) ? 'So jump back and look at the key after it.' : 'No jump. This is the first letter.');
    if (!isStyle(dl) || di >= codes.length) break;
  }
  dl &= 0xbf; push(6, `Nothing comes before the first letter, so it lets go on its right: bit 6 off. ${hex(dl)}h.`);
  if (di < codes.length) mem[di] = dl;
  push(7, dl & 0x80 ? `Write it back. ${name(di)} will be initial if the next letter reaches back, isolated if not.` : `Write it back. ${name(di)} never reaches left, so it is isolated.`);

  // The pass
  for (;;) {
    dl = mem[di]; push(8, `DL = ${name(di)}, ${hex(dl)}h.`);
    push(9, dl ? 'Is it the zero that ends the text? No.' : 'It is the zero that ends the text.');
    if (!dl) { push(10, 'Jump to done.'); break; }
    push(10, 'No jump: there is a letter to shape.');
    push(11, isStyle(dl) ? 'It is a style key. Style keys never join.' : 'Is it a style key? No.');
    if (isStyle(dl)) { push(12, 'Skip it: a style change never breaks a word.'); di++; push(31, 'Move one key on.'); push(32, 'Back to the top of the loop.'); continue; }
    push(12, 'No jump.');
    si = di; push(13, 'SI starts at this letter. It will look ahead.');
    for (;;) {
      si++; push(14, 'Look one key further.');
      cl = mem[si]; push(15, `CL = ${name(si)}, ${hex(cl)}h.`);
      push(16, isStyle(cl) ? 'A style key: look past it.' : 'Is it a style key? No.');
      if (!isStyle(cl)) { push(17, 'No jump. CL is the next letter.'); break; }
      push(17, 'Jump back and look one key further.');
    }
    ch = cl; push(18, 'Copy the next letter into CH, so it can be tested without losing it.');
    dh = dl; push(19, 'Copy this letter into DH, for the same reason.');
    dh &= 0x80; push(20, `Keep only bit 7 of this letter, its left hand. 80h is 1000 0000. ${dh ? 'It is there.' : 'It is not: this letter never joins the one after it.'}`);
    ch &= 0x40; push(21, `Keep only bit 6 of the next letter, its right hand. 40h is 0100 0000. ${ch ? 'It is there.' : 'It is not there.'}`);
    push(22, 'Is this letter’s left hand empty?');
    let cut = !dh;
    push(23, cut ? 'Yes. Jump to cut.' : 'No. Go on.');
    if (!cut) {
      push(24, 'Is the next letter’s right hand empty?');
      cut = !ch;
      push(25, cut ? 'Yes. Jump to cut.' : 'No. Go on.');
    }
    if (!cut) push(26, `Both hands reach, so ${name(di)} and ${name(si)} stay joined. Skip the cut.`);
    else {
      dl &= 0x7f; push(27, `Cut. ${name(di)} lets go on its left: 7Fh clears bit 7. ${hex(dl)}h.`);
      cl &= 0xbf; push(28, `And ${name(si)} lets go on its right: BFh clears bit 6. ${hex(cl)}h.`);
      mem[di] = dl; push(29, `Write this letter back. ${name(di)} is now ${form(dl)}.`);
      if (si < codes.length) mem[si] = cl;
      push(30, 'Write the next letter back too.');
    }
    di++; push(31, `Move one letter on. ${name(di - 1)} is done: ${form(mem[di - 1])}.`);
    push(32, 'Back to the top of the loop.');
  }
  push(33, `Done. Every letter has its shape: ${codes.map((c, i) => (isStyle(c) || c === 3 ? '' : `${letters[i]} ${form(mem[i])}`)).filter(Boolean).join(', ')}.`);
  return steps;
}
