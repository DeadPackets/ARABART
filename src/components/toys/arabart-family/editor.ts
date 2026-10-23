// EDITOR.EXE (EDITOR_EXE.img main 1CFD-1F37) as a model: his key loop, the state it keeps, and a trace of the lines
// his loop runs for one key, for the CodeStepper. Variable names are ours; his are slots on the stack.
import { render, toUnicode, hex, type Bin } from '../arabart/core.ts';
import { NAMES } from './vga.ts';

export interface Ed { keys: string; font: number; color: number; shadow: number; cv: number; sv: number; fn: 7 | 8; ended: boolean }
// The screen his own capture shows (public/images/arabart-editor.png): E, C 13 times, |, V 3 times, then the line
export const START: Ed = { keys: '~gtk ~guvfd 51<4', font: 3, color: 14, shadow: 4, cv: 14, sv: 4, fn: 8, ended: false };
// Run it again: his variables start over, while ARABART, still in memory, keeps its font and colors
export const again = (s: Ed): Ed => ({ ...s, keys: '', cv: 1, sv: 1, fn: 7, ended: false });

export type Kind = 'letter' | 'style' | 'space' | 'other' | 'font' | 'color' | 'shadow' | '3d' | 'erase' | 'quit';
export const STYLE_NAME: Record<string, string> = { '!': 'italic', '@': 'bold', '#': 'underline', '$': 'double size', '*': 'all styles off' };

export function kindOf(key: string): Kind {
  if (key === '\x1b') return 'quit';
  if ('QWER'.includes(key) && key) return 'font';
  if (key === 'C') return 'color';
  if (key === 'V') return 'shadow';
  if (key === '|') return '3d';
  if (key === '\b') return 'erase';
  if (key in STYLE_NAME) return 'style';
  if (key === ' ') return 'space';
  return toUnicode(key) && !/\d/.test(key) ? 'letter' : 'other';
}

/** One pass of his loop. */
export function press(s: Ed, key: string): Ed {
  if (s.ended) return s;
  const n = { ...s };
  const k = kindOf(key);
  if (k === 'quit') n.ended = true;
  else if (k === 'font') n.font = 'QWER'.indexOf(key) + 1;
  else if (k === 'color') { n.cv = n.cv > 16 ? 1 : n.cv + 1; n.color = n.cv; n.shadow = n.sv; }
  else if (k === 'shadow') { n.sv = n.sv > 16 ? 1 : n.sv + 1; n.color = n.cv; n.shadow = n.sv; }
  else if (k === '3d') n.fn = n.fn === 7 ? 8 : 7;
  else if (k === 'erase') n.keys = n.keys.slice(0, -1);
  else { n.keys += key; if (n.keys.length >= 80) n.ended = true; }
  return n;
}

/** What ARABART draws for this state: the whole line, right edge at x = 639, line bottom at y = 100. */
export const line = (bin: Bin, s: Ed) =>
  render(bin, s.keys, { font: s.font, color: s.color, shadow: s.shadow, mode: s.fn === 8 ? '3d' : 'plain', x: 639 });

export const colorName = (c: number) => `${c}, ${NAMES[c & 15]}`;

// ---- His loop, for the CodeStepper ----
type L = { off?: string; label?: string; code: string; note?: string };
export const ASM: (L & { k: string })[] = [
  { k: 'get', off: '1D8F', label: 'loop', code: 'call getch', note: 'wait for a key' },
  { k: 'key', off: '1D94', code: 'mov  [key],al' },
  { k: 'esc', off: '1D97', code: 'cmp  [key],1Bh', note: 'Esc?' },
  { k: 'esc2', off: '1DA1', code: 'mov  [i],50h', note: 'end after this' },
  { k: 'q', off: '1DA6', code: "cmp  [key],'Q'", note: 'Shift+Q?' },
  { k: 'q1', off: '1DAD', code: 'mov  ax,3603h', note: 'pick a font' },
  { k: 'q2', off: '1DB1', code: 'mov  cx,1', note: 'font 1' },
  { k: 'q3', off: '1DB6', code: 'int  10h', note: 'call ARABART' },
  { k: 'q4', off: '1DBC', code: 'mov  [key],0', note: 'not a letter' },
  { k: 'q5', off: '1DC0', code: 'dec  [i]', note: 'not stored' },
  { k: 'w', off: '1DC3', code: "cmp  [key],'W'", note: 'same, font 2' },
  { k: 'e', off: '1DE0', code: "cmp  [key],'E'", note: 'same, font 3' },
  { k: 'r', off: '1DFD', code: "cmp  [key],'R'", note: 'same, font 4' },
  { k: 'c', off: '1E1A', code: "cmp  [key],'C'", note: 'Shift+C?' },
  { k: 'c1', off: '1E20', code: 'cmp  [color],10h', note: 'past 16?' },
  { k: 'c2', off: '1E26', code: 'inc  [color]', note: 'next color' },
  { k: 'c3', off: '1E30', code: 'mov  ax,3601h', note: 'set colors' },
  { k: 'c4', off: '1E34', code: 'mov  cl,[color]' },
  { k: 'c5', off: '1E37', code: 'mov  ch,[shadow]' },
  { k: 'c6', off: '1E3C', code: 'int  10h', note: 'call ARABART' },
  { k: 'c7', off: '1E42', code: 'mov  [key],0', note: 'not stored' },
  { k: 'v', off: '1E49', code: "cmp  [key],'V'", note: 'same, shadow' },
  { k: 'bar', off: '1E78', code: "cmp  [key],'|'", note: '| key?' },
  { k: 'bar1', off: '1E85', code: 'mov  [fn],3608h', note: '3-D' },
  { k: 'bar2', off: '1E8C', code: 'mov  [fn],3607h', note: 'plain' },
  { k: 'zero', off: '1E98', code: 'cmp  [key],0', note: 'a command?' },
  { k: 'zero2', off: '1E9C', code: 'je   1EFAh', note: 'just redraw' },
  { k: 'bs', off: '1E9E', code: 'cmp  [key],8', note: 'Backspace?' },
  { k: 'store', off: '1EAD', code: 'mov  es:[bx],al', note: 'buf[i] = key' },
  { k: 'bs1', off: '1EB8', code: 'mov  byte es:[bx],0', note: 'erase' },
  { k: 'bs2', off: '1EC2', code: 'dec  [i]', note: 'one back' },
  { k: 'copy', off: '1EDF', code: 'mov  al,es:[bx]', note: 'copy 85 bytes' },
  { k: 'copy2', off: '1EEE', code: 'mov  es:[bx],al', note: 'to the draw copy' },
  { k: 'cls', off: '1EFA', code: 'call cleardevice', note: 'a black screen' },
  { k: 'd1', off: '1F08', code: 'lds  dx,[out]', note: 'the text' },
  { k: 'd2', off: '1F0B', code: 'mov  cx,27Fh', note: 'x = 639' },
  { k: 'd3', off: '1F0E', code: 'mov  bx,64h', note: 'y = 100' },
  { k: 'd4', off: '1F11', code: 'mov  ax,[fn]', note: '3607h or 3608h' },
  { k: 'd5', off: '1F14', code: 'int  10h', note: 'draw the line' },
  { k: 'inc', off: '1F1F', code: 'inc  [i]' },
  { k: 'cmp80', off: '1F22', code: 'cmp  [i],50h', note: '80 keys yet?' },
  { k: 'back', off: '1F28', code: 'jmp  loop', note: 'next key' },
  { k: 'end', off: '1F2B', code: 'call closegraph', note: 'the end' },
];
export const C: (L & { k: string })[] = [
  { k: 'for', code: 'for (i = 0; i < 80; i++) {' },
  { k: 'get', code: '  key = getch();' },
  { k: 'esc', code: '  if (key == 27) key = 0, i = 80;', note: 'Esc' },
  { k: 'q', code: "  if (key == 'Q') font(1), key = 0, i--;" },
  { k: 'w', code: "  if (key == 'W') font(2), key = 0, i--;" },
  { k: 'e', code: "  if (key == 'E') font(3), key = 0, i--;" },
  { k: 'r', code: "  if (key == 'R') font(4), key = 0, i--;" },
  { k: 'c', code: "  if (key == 'C') {" },
  { k: 'c1', code: '    color = color > 16 ? 1 : color + 1;' },
  { k: 'c2', code: '    colors(color, shadow); key = 0; i--;' },
  { k: 'c3', code: '  }' },
  { k: 'v', code: "  if (key == 'V') { /* same, shadow */ }" },
  { k: 'bar', code: "  if (key == '|') {" },
  { k: 'bar1', code: '    fn = fn == 0x3607 ? 0x3608 : 0x3607;' },
  { k: 'bar2', code: '    key = 0; i--;' },
  { k: 'bar3', code: '  }' },
  { k: 'zero', code: '  if (key != 0) {' },
  { k: 'store', code: '    if (key != 8) buf[i] = key;' },
  { k: 'bs', code: '    else { buf[i] = 0; i--;' },
  { k: 'bs2', code: '           buf[i] = 0; i--; }' },
  { k: 'copy', code: '    memcpy(out, buf, 85);' },
  { k: 'zero2', code: '  }' },
  { k: 'cls', code: '  cleardevice();' },
  { k: 'draw', code: '  arabart(fn, 639, 100, out);', note: 'draw' },
  { k: 'close', code: '}' },
  { k: 'end', code: 'closegraph();' },
];

// The boxes of the loop picture, in order
export const NODES = ['getch()', 'Esc?', 'Shift+Q, W, E, R?', 'Shift+C or V?', '| key?', 'A command?', 'Store or erase', 'Copy the buffer', 'cleardevice()', 'INT 10h: draw', 'Next key'];

const ai = (k: string) => ASM.findIndex(l => l.k === k), ci = (k: string) => C.findIndex(l => l.k === k);
export interface Step { a: number; c: number; say: string; regs: { name: string; value: string; means: string; changed?: boolean }[]; node: number }

/** The lines his loop runs for one key, from the state before it. */
export function loopTrace(s: Ed, key: string): Step[] {
  const k = kindOf(key), n = press(s, key), steps: Step[] = [];
  const shown = key === '\x1b' ? 'Esc' : key === '\b' ? 'Backspace' : key === ' ' ? 'space' : 'QWERCV'.includes(key) && key ? `Shift+${key}` : key;
  const code = key === '\x1b' ? 0x1b : key === '\b' ? 8 : key.charCodeAt(0);
  let i = s.keys.length, kv = code, color = s.cv, fnv = s.fn, prev: Record<string, string> = {};
  const push = (a: string, c: string, say: string, node: number) => {
    const regs = [
      { name: 'key', value: kv ? `${hex(kv)}h` : '0', means: kv ? `“${shown}”` : 'cleared: nothing to store' },
      { name: 'i', value: String(i), means: 'keys typed so far' },
      { name: 'clr', value: String(color), means: NAMES[color & 15] },
      { name: 'fn', value: `360${fnv}h`, means: fnv === 8 ? 'draw in 3-D' : 'draw plain' },
    ];
    for (const r of regs) (r as { changed?: boolean }).changed = prev[r.name] !== undefined && prev[r.name] !== r.value;
    prev = Object.fromEntries(regs.map(r => [r.name, r.value]));
    steps.push({ a: ai(a), c: ci(c), say, regs, node });
  };
  push('get', 'get', `His loop waits here until you press a key. You press <b>${shown}</b>.`, 0);
  push('key', 'get', `getch() hands back its code: <b>${hex(code)}h</b>.`, 0);
  push('esc', 'esc', k === 'quit' ? 'Is it Esc? <b>Yes.</b>' : 'Is it Esc? No.', 1);
  if (k === 'quit') { kv = 0; i = 80; push('esc2', 'esc', 'Then this is the last pass: key = 0 and i = 80. The line is drawn once more, and the loop ends.', 1); }
  push('q', 'q', k === 'font' && key === 'Q' ? 'Is it Shift+Q? <b>Yes.</b>' : 'Is it Shift+Q? No.', 2);
  if (k === 'font') {
    if (key !== 'Q') {
      kv = 0; i--;
      push(key.toLowerCase(), key.toLowerCase(), `Is it Shift+${key}? <b>Yes.</b> Its block is the same five lines as Q’s, with CX = ${n.font}: ARABART switches to font ${n.font}, then key = 0 and i goes back one.`, 2);
    } else {
      push('q1', 'q', 'AX = 3603h: ARABART, pick a font.', 2); push('q2', 'q', 'CX = 1: font 1.', 2); push('q3', 'q', 'Call ARABART. The font changes inside ARABART itself.', 2);
      kv = 0; push('q4', 'q', 'key = 0: a command is never stored in the text.', 2);
      i--; push('q5', 'q', 'i goes back one, so the loop’s own i++ evens it out.', 2);
    }
  } else push('r', 'r', 'Shift+W, E or R? No.', 2);
  push('c', 'c', k === 'color' ? 'Is it Shift+C? <b>Yes.</b>' : 'Is it Shift+C? No.', 3);
  if (k === 'color') {
    push('c1', 'c1', `Is the color past 16? ${s.cv > 16 ? 'Yes: start again at 1.' : 'No.'}`, 3);
    color = n.cv; push('c2', 'c1', `Next color: <b>${colorName(n.cv)}</b>.`, 3);
    push('c3', 'c2', 'AX = 3601h: ARABART, set the colors.', 3);
    push('c6', 'c2', `CL = ${n.cv}, CH = ${n.sv}. ARABART keeps both colors for every draw that follows.`, 3);
    kv = 0; i--; push('c7', 'c2', 'key = 0 and i goes back one: not stored.', 3);
  }
  push('v', 'v', k === 'shadow' ? `Is it Shift+V? <b>Yes.</b> The same block, for the shadow: <b>${colorName(n.sv)}</b>.` : 'Is it Shift+V? No.', 3);
  if (k === 'shadow') { kv = 0; i--; }
  push('bar', 'bar', k === '3d' ? 'Is it the | key? <b>Yes.</b>' : 'Is it the | key? No.', 4);
  if (k === '3d') {
    fnv = n.fn;
    push(n.fn === 8 ? 'bar1' : 'bar2', 'bar1', n.fn === 8 ? 'The draw call becomes function 8: <b>3-D</b>.' : 'The draw call goes back to function 7: <b>plain</b>.', 4);
    kv = 0; i--; push(n.fn === 8 ? 'bar1' : 'bar2', 'bar2', 'key = 0, i back one.', 4);
  }
  push('zero', 'zero', kv ? 'Is key 0 now? No: there is something to store.' : 'Is key 0 now? <b>Yes</b>: it was a command.', 5);
  if (!kv) push('zero2', 'zero', 'So skip the buffer and go straight to the redraw.', 5);
  else {
    push('bs', 'store', k === 'erase' ? 'Is it Backspace? <b>Yes.</b>' : 'Is it Backspace? No.', 6);
    if (k === 'erase') {
      push('bs1', 'bs', `Clear buf[${i}], then step back and clear the last key.`, 6);
      i = Math.max(0, i - 2); push('bs2', 'bs2', 'i steps back two, and the loop’s i++ makes it one.', 6);
    } else {
      push('store', 'store', `buf[${i}] = <b>${shown}</b>. The key goes into the buffer exactly as typed.`, 6);
    }
    push('copy', 'copy', 'Copy all 85 bytes of the buffer to the copy ARABART will read.', 7);
  }
  push('cls', 'cls', 'cleardevice(): the whole screen goes black.', 8);
  push('d1', 'draw', 'DS:DX = the text.', 9);
  push('d2', 'draw', 'CX = 639: the right edge of the screen.', 9);
  push('d3', 'draw', 'BX = 100: the bottom of the line.', 9);
  push('d4', 'draw', `AX = ${n.fn === 8 ? '3608h, 3-D text' : '3607h, plain text'}.`, 9);
  push('d5', 'draw', `Call ARABART. It joins every letter again and draws the whole line${n.keys ? `: <span lang="ar" dir="rtl">${toUnicode(n.keys)}</span>` : ', which is empty'}.`, 9);
  i++; push('inc', 'for', `i = ${i}.`, 10);
  if (n.ended) { push('cmp80', 'for', 'i has reached 80: the loop is over.', 10); push('end', 'end', 'closegraph(): back to the DOS prompt. That is the whole program.', 10); }
  else { push('cmp80', 'for', 'Fewer than 80 keys, so go on.', 10); push('back', 'for', 'Back to the top, to wait for the next key.', 10); }
  return steps;
}
