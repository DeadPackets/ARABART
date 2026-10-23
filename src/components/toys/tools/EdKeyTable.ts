// EDITOR.EXE 0262:0135: the table Borland C++ built from his 22-case switch. Keys are BIOS codes (scan code, then
// character); "to" is the handler's address in segment 0262. Decoded from research/artifacts/programs/unpacked/EDIT_EDITOR.EXE.
export const KEYS = [
  { code: '8400', label: 'Ctrl+PgUp', to: '00EA', does: 'to the top', c: 2 },
  { code: '011B', label: 'Esc', to: '0077', does: 'nothing at all', c: 3 },
  { code: '0E08', label: 'Backspace', to: '00D5', does: 'delete to the left', c: 4 },
  { code: '0F09', label: 'Tab', to: '00FF', does: 'six spaces', c: 5 },
  { code: '1519', label: 'Ctrl+Y', to: '00E3', does: 'delete the line', c: 6 },
  { code: '1C0D', label: 'Enter', to: '00F8', does: 'a new line', c: 7 },
  { code: '2100', label: 'Alt+F', to: '0057', does: 'the File menu', c: 9 },
  { code: '2D00', label: 'Alt+X', to: '0052', does: 'back to DOS', c: 8 },
  { code: '3C00', label: 'F2', to: '0057', does: 'Save, through the menu', c: 9 },
  { code: '3D00', label: 'F3', to: '0057', does: 'Open, through the menu', c: 10 },
  { code: '4400', label: 'F10', to: '0057', does: 'the File menu', c: 10 },
  { code: '4700', label: 'Home', to: '00C7', does: 'start of the line', c: 11 },
  { code: '4800', label: 'Up', to: '00AB', does: 'up a line', c: 12 },
  { code: '4900', label: 'PgUp', to: '00B9', does: 'up a page', c: 13 },
  { code: '4B00', label: 'Left', to: '009B', does: 'left', c: 14 },
  { code: '4D00', label: 'Right', to: '00A3', does: 'right', c: 15 },
  { code: '4F00', label: 'End', to: '00CE', does: 'end of the line', c: 16 },
  { code: '5000', label: 'Down', to: '00B2', does: 'down a line', c: 17 },
  { code: '5100', label: 'PgDn', to: '00C0', does: 'down a page', c: 18 },
  { code: '5200', label: 'Ins', to: '007F', does: 'insert on or off', c: 19 },
  { code: '5300', label: 'Del', to: '00DC', does: 'delete', c: 20 },
  { code: '7600', label: 'Ctrl+PgDn', to: '00F1', does: 'to the last line', c: 21 },
];

export const ASM = [
  { off: '001C', code: 'call far bioskey', note: 'wait for a key' },
  { off: '0022', code: 'mov  [bp-2],ax', note: 'keep it' },
  { off: '0039', code: 'mov  di,[bp-2]', note: 'the key to look for' },
  { off: '003C', code: 'mov  cx,16h', note: '22 entries' },
  { off: '003F', code: 'mov  bx,0135h', note: 'the table, inside the code' },
  { off: '0042', code: 'cmp  cs:[bx],di', note: 'this entry’s key?' },
  { off: '0045', code: 'je   004E', note: 'found it' },
  { off: '0047', code: 'inc  bx', note: 'next entry,' },
  { off: '0048', code: 'inc  bx', note: '2 bytes on' },
  { off: '0049', code: 'loop 0042', note: 'at most 22 tries' },
  { off: '004B', code: 'jmp  0114', note: 'not in the table: type it' },
  { off: '004E', code: 'jmp  cs:[bx+2Ch]', note: 'its handler, 44 bytes on' },
];

export const C = [
  { code: 'int key = bioskey(0);' },
  { code: 'switch (key) {' },
  { code: '  case CTRL_PGUP: top(); break;' },
  { code: '  case ESC: break;' },
  { code: '  case BACKSPACE: back(); break;' },
  { code: '  case TAB: spaces(6); break;' },
  { code: '  case CTRL_Y: delLine(); break;' },
  { code: '  case ENTER: newLine(); break;' },
  { code: '  case ALT_X: quit();' },
  { code: '  case ALT_F: case F2:' },
  { code: '  case F3: case F10: menu(key); break;' },
  { code: '  case HOME: home(); break;' },
  { code: '  case UP: up(); break;' },
  { code: '  case PGUP: pageUp(); break;' },
  { code: '  case LEFT: left(); break;' },
  { code: '  case RIGHT: right(); break;' },
  { code: '  case END: end(); break;' },
  { code: '  case DOWN: down(); break;' },
  { code: '  case PGDN: pageDown(); break;' },
  { code: '  case INS: insMode(); break;' },
  { code: '  case DEL: del(); break;' },
  { code: '  case CTRL_PGDN: bottom(); break;' },
  { code: '  default: if ((char)key) ins(key);' },
  { code: '}' },
];

const hx = (n: number) => n.toString(16).toUpperCase().padStart(4, '0');

/** The search for one key, as CodeStepper steps. i = table index, or -1 for a letter (a, 1E61h). */
export function trace(i: number) {
  const k = i < 0 ? { code: '1E61', label: 'a', to: '0114', does: 'type it', c: 22 } : KEYS[i];
  const di = { name: 'DI', value: `${k.code}h`, means: `the key: ${k.label}` };
  const reg = (b: number, cx: number, changed = false) => [di, { name: 'BX', value: `${hx(0x135 + 2 * b)}h`, means: `entry ${b}`, changed }, { name: 'CX', value: String(cx), means: 'tries left' }];
  const steps: Record<string, unknown>[] = [
    { a: 0, c: 0, say: `<code>bioskey(0)</code> waits for a key. You press <b>${k.label}</b>: the BIOS hands back <code>${k.code}h</code>, the key’s scan code and its character in one number.`, regs: [{ name: 'AX', value: `${k.code}h`, means: `the key: ${k.label}`, changed: true }] },
    { a: 2, c: 1, say: 'The switch begins. DI holds the key to look for.', regs: [di] },
    { a: 3, c: 1, say: 'CX = 22, the number of cases.', regs: [di, { name: 'CX', value: '22', means: 'tries left', changed: true }] },
    { a: 4, c: 1, say: 'BX points at the table: 22 keys, then 22 addresses, stored inside the program’s code.', regs: reg(0, 22, true), look: 0 },
  ];
  const n = i < 0 ? 22 : i + 1;
  for (let e = 0; e < n; e++) {
    const hit = e === i;
    steps.push({ a: 5, c: 1, look: e, regs: reg(e, 22 - e, e > 0), say: hit ? `Entry ${e}: <code>${KEYS[e].code}h</code>. That is the key.` : `Entry ${e}: <code>${KEYS[e].code}h</code>, ${KEYS[e].label}? No.` });
    if (e === 0 && !hit) steps.push({ a: 9, c: 1, look: 0, regs: reg(0, 22), say: 'Not this one: BX moves on 2 bytes, CX counts down, and <code>loop</code> goes round again.' });
  }
  if (i < 0) {
    steps.push({ a: 10, c: k.c, regs: reg(21, 1), say: 'None of the 22 matched. Jump to 0114: if the key carries a letter, type it into the line.' });
  } else {
    steps.push({ a: 6, c: 1, hit: i, regs: reg(i, 22 - i), say: 'Found: <code>je</code> jumps out of the search.' });
    steps.push({ a: 11, c: k.c, hit: i, regs: reg(i, 22 - i), say: `44 bytes past this entry sits its handler’s address, <code>${k.to}h</code>. Jump there: ${k.does}.` });
  }
  return steps;
}

const CODES: Record<string, number> = {
  ArrowUp: 12, ArrowDown: 17, ArrowLeft: 14, ArrowRight: 15, Home: 11, End: 16, PageUp: 13, PageDown: 18,
  Backspace: 2, Delete: 20, Insert: 19, Escape: 1, F2: 8, F3: 9, F10: 10,
};
/** A real key to its table index, -1 for a letter, or null to leave it alone (Tab, Enter and Space press buttons) */
export function fromEvent(e: KeyboardEvent): number | null {
  if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') return null;
  if (e.ctrlKey && e.key === 'PageUp') return 0;
  if (e.ctrlKey && e.key === 'PageDown') return 21;
  if (e.ctrlKey && e.key.toLowerCase() === 'y') return 4;
  if (e.altKey && e.code === 'KeyF') return 6;
  if (e.altKey && e.code === 'KeyX') return 7;
  if (e.key in CODES) return CODES[e.key];
  if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) return -1;
  return null;
}
