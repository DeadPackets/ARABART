// HandyMenu's own data, taken from HandyMenu.exe 3.7 (Build 40) and its HandyMenu.bin language file.
// Item ids are his: the menu returns the id, the switch at 0x15254 jumps on it, the icon strip is in id order.
import ui from './ui.json';

/** id -> his English label (the built-in string table at 0x167E4). */
export const ITEMS: [number, string][] = [
  [1, 'Soft Reset'], [2, 'Hard Reset'], [3, 'Power Off'], [4, 'Brightness'], [5, 'Memory'], [6, 'Battery Level'],
  [7, 'Today Themes'], [8, 'Today Plugins'], [9, 'Clock'], [10, 'Start Menu'], [11, 'Uninstall Programs'],
  [12, 'Sound Settings'], [13, 'Hardware Buttons'], [14, 'Running Programs'], [15, 'Input Methods'], [16, 'Today Screen'],
  [17, 'Network Connection'], [18, 'Phone Settings'], [19, 'MemMaid'], [20, 'MemMaid Cleaner'], [21, 'Rotate Screen (L)'],
  [22, 'Rotate Screen (R)'], [23, 'Flip Screen'], [24, 'Screen OFF'], [25, 'Refresh today screen'], [26, 'IP Helper'],
  [27, 'Screen Capture'],
];

/** What each id does, read from its case in the switch (HandyMenu.exe 3.7). */
export const DOES: Record<number, string> = {
  1: 'KernelIoControl(IOCTL_HAL_REBOOT): a soft reset',
  2: 'asks first, then SetCleanRebootFlag() and the same reboot call: a hard reset',
  3: 'presses the power key in software: keybd_event(VK_OFF)',
  4: 'looks for the brightness applet under every name device makers used',
  5: 'opens Settings at the Memory page: ctlpnl.exe cplmain.cpl 4 0',
  6: 'opens the battery applet',
  7: 'opens Settings at Today themes: cplmain.cpl 13 0',
  8: 'opens Settings at Today items: cplmain.cpl 13 1',
  9: 'opens Settings at Clock and alarms: cplmain.cpl 16 1',
  10: 'opens Settings at Menus: cplmain.cpl 11 0',
  11: 'opens Remove Programs: cplmain.cpl 10',
  12: 'opens Sounds and notifications: cplmain.cpl 9 0',
  13: 'opens Buttons: cplmain.cpl 12 0',
  14: 'opens the running programs list: cplmain.cpl 4 2',
  15: 'opens Input: cplmain.cpl 8 0',
  16: 'opens the Today settings',
  17: 'opens Connections: cplmain.cpl,19',
  18: 'opens Phone settings: cplmain.cpl,20',
  19: 'starts MemMaid, DinarSoft’s memory cleaner',
  20: 'starts MemMaid with -Q: a quick clean',
  21: 'turns the screen to 270 degrees, or back',
  22: 'turns the screen to 90 degrees, or back',
  23: 'turns the screen upside down, or back',
  24: 'switches the display off with ExtEscape(SETPOWERMANAGEMENT)',
  25: 'tells every program the settings changed, so the Today screen redraws',
  26: 'opens its IP Helper',
  27: 'saves the screen as a .bmp file',
};

/** The 27 halfwords at 0x1527C. Target = 0x15280 + value. */
export const TABLE = [0x34, 0x58, 0xcc, 0xfc, 0x1f4, 0x1fc, 0x3c4, 0x3cc, 0x3d4, 0x3dc, 0x3e4, 0x3ec, 0x3f4, 0x3fc, 0x404, 0x42c,
  0x40c, 0x414, 0x438, 0x448, 0x458, 0x468, 0x478, 0x488, 0x494, 0x4b4, 0x4c4];
export const target = (id: number) => 0x15280 + TABLE[id - 1];
export const hex = (n: number, w = 0) => n.toString(16).toUpperCase().padStart(w, '0');

export type Lang = 'English' | 'German' | 'Dutch' | 'Portuguese' | 'Spanish' | 'Hungarian';
export const LANGS: Lang[] = ['English', 'German', 'Dutch', 'Portuguese', 'Spanish', 'Hungarian'];
const L = ui.languages as Record<string, Record<string, string>>;
/** His lookup (0x16E98): the language's IX<n> line if it has one, else the built-in English. */
export const label = (id: number, lang: Lang) => (lang !== 'English' && L[lang]?.[String(id)]) || ITEMS[id - 1][1];
export const word = (id: number, lang: Lang, english: string) => (lang !== 'English' && L[lang]?.[String(id)]) || english;

/** His 14-byte install-date record (encoder at HandyMenu 3.6 0x181D4): the date twice in disguise, salted, summed. */
export function record(y: number, m: number, d: number) {
  const shorts = [m * 2 + 3, y + 7, y + 21, d * 2 + 5, m * 2 + 1, (d + 2) * 2];
  const plain = shorts.flatMap(s => [s & 0xff, (s >> 8) & 0xff]);
  const sum = plain.reduce((a, b) => a + b, 0);
  const salted = plain.map((b, i) => (b + (i % 2)) & 0xff);
  const ck = sum % 31;
  return { shorts, plain, salted, sum, ck, bytes: [...salted, ck & 0xff, ck >> 8] };
}

/** The decoder's checks (0x18350 in 3.6): unsalt, split, and every copy must agree. */
export function check(bytes: number[]) {
  const plain = bytes.slice(0, 12).map((b, i) => (b - (i % 2)) & 0xff);
  const s = (i: number) => plain[i * 2] | (plain[i * 2 + 1] << 8);
  const sum = plain.reduce((a, b) => a + b, 0) % 31;
  const ck = bytes[12] | (bytes[13] << 8);
  const year = [s(2) - 21, s(1) - 7], month = [(s(0) - 3) >> 1, (s(4) - 1) >> 1], day = [(s(3) - 5) >> 1, (s(5) >> 1) - 2];
  return {
    year, month, day, sum, ck,
    ok: { year: year[0] === year[1], month: month[0] === month[1], day: day[0] === day[1], sum: sum === ck },
  };
}

/** A 24-bit bottom-up BMP, laid out exactly as his capture code writes it: 14-byte file header, 40-byte info, pixels. */
export function bmp(w: number, h: number, rgba: Uint8ClampedArray) {
  const size = w * h * 3;
  const buf = new ArrayBuffer(54 + size), v = new DataView(buf), u = new Uint8Array(buf);
  v.setUint16(0, 0x4d42, true); v.setUint32(2, size + 0x36, true); v.setUint32(10, 0x36, true);
  v.setUint32(14, 40, true); v.setInt32(18, w, true); v.setInt32(22, h, true); v.setUint16(26, 1, true); v.setUint16(28, 24, true);
  v.setUint32(34, size, true);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const s = ((h - 1 - y) * w + x) * 4, d = 54 + (y * w + x) * 3; // rows bottom-up, colors blue-green-red
    u[d] = rgba[s + 2]; u[d + 1] = rgba[s + 1]; u[d + 2] = rgba[s];
  }
  return u;
}

export const reduce = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** What the case at each target starts with (HandyMenu.exe 3.7), for the last line of the switch listing. */
export const CASE: Record<number, [string, string]> = {
  1: ['ldr  r0,=0101003Ch / bl KernelIoControl', 'IOCTL_HAL_REBOOT'],
  2: ['bl   MessageBoxW / bl SetCleanRebootFlag', 'ask, then wipe and reboot'],
  3: ['mov  r0,#223 / bl keybd_event', 'VK_OFF, the power key'],
  4: ['ldr  r0,="\\Windows\\Brightness.exe"', 'find the brightness applet'],
  24: ['bl   12ACC', 'ExtEscape: display off'],
  25: ['mov  r0,#65535 / bl SendNotifyMessageW', 'everyone: settings changed'],
  26: ['bl   1756C', 'the IP Helper dialog'],
  27: ['bl   149E8', 'the screen capture'],
};
for (const id of [5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18]) CASE[id] = ['ldr  r2,="cplmain.cpl …" / b 15698', 'open a Settings page'];
CASE[6] = ['bl   12674 / CreateProcessW', 'the battery applet'];
CASE[16] = ['bl   126DC', 'the Today settings'];
CASE[19] = ['bl   12890', 'start MemMaid'];
CASE[20] = ['ldr  r1,="-Q" / bl 12890', 'MemMaid, quick clean'];
CASE[21] = ['mov  r0,#4 / bl 1293C', 'rotate to 270 degrees'];
CASE[22] = ['mov  r0,#1 / bl 1293C', 'rotate to 90 degrees'];
CASE[23] = ['mov  r0,#2 / bl 1293C', 'rotate to 180 degrees'];

type Reg = { name: string; value: string; means: string; changed?: boolean };
export interface SwStep { a: number; c: number; say: string; regs: Reg[]; row: number; jump: boolean }

/** The switch at 0x151E8, traced for menu id n. Line numbers match HmSwitch's listing. */
export function switchSteps(n: number, expired: boolean): SwStep[] {
  const nm = ITEMS[n - 1][1], t = target(n), r2 = n - 1, r3a = r2 * 2, r3b = 0x15278 + r3a;
  const R = (r6: string, rest: Reg[] = []) => [{ name: 'r6', value: r6, means: 'what the menu returned' }, ...rest];
  const s: SwStep[] = [
    { a: 0, c: 0, row: -1, jump: false, say: `You picked <b>${nm}</b>. The menu hands back its number, <b>${n}</b>. First, HandyMenu reads the stored key, <b>HMLicKey</b>, from the registry again.`, regs: R(String(n)) },
    { a: 1, c: 1, row: -1, jump: false, say: 'Then it checks the license. Not once at startup: on <b>every</b> tap.', regs: R(String(n)) },
    { a: 3, c: 2, row: -1, jump: false, say: expired ? 'The state is <b>7</b>: the 15 days are over.' : 'The state is <b>13</b>: registered. (0 would mean the trial is still running.)', regs: R(String(n), [{ name: 'r0', value: expired ? '7' : '13', means: expired ? 'trial over' : 'registered', changed: true }]) },
  ];
  if (expired) {
    s.push({ a: 7, c: 3, row: -1, jump: false, say: 'So instead of acting, it opens its Settings sheet, dialog <b>500</b>, where the <b>Register…</b> button waits. The item never runs.', regs: R(String(n), [{ name: 'r1', value: '500', means: 'the dialog to show', changed: true }]) });
    return s;
  }
  s.push(
    { a: 4, c: 2, row: -1, jump: false, say: 'Not 7, so it carries on to the item.', regs: R(String(n), [{ name: 'r0', value: '13', means: 'registered' }]) },
    { a: 8, c: 5, row: -1, jump: false, say: 'Numbers from 1001 up are its own extra commands. This one is smaller.', regs: R(String(n), [{ name: 'r8', value: '1001', means: 'first extra command' }]) },
    { a: 9, c: 6, row: -1, jump: false, say: `Count from zero: <b>${n} − 1 = ${r2}</b>.`, regs: R(String(n), [{ name: 'r2', value: String(r2), means: 'row number', changed: true }]) },
    { a: 11, c: 6, row: -1, jump: false, say: 'One compare guards the table: anything above 26 is ignored.', regs: R(String(n), [{ name: 'r2', value: String(r2), means: 'row number, 0 to 26' }]) },
    { a: 12, c: 6, row: r2, jump: false, say: `Each row is two bytes, so the row starts <b>${r3a}</b> bytes in.`, regs: R(String(n), [{ name: 'r2', value: String(r2), means: 'row number' }, { name: 'r3', value: String(r3a), means: 'bytes into the table', changed: true }]) },
    { a: 13, c: 6, row: r2, jump: false, say: 'Add the address of this very instruction. On ARM, <code>pc</code> reads 8 bytes ahead: <b>15278</b>.', regs: R(String(n), [{ name: 'r3', value: hex(r3b), means: '15278 + ' + r3a, changed: true }]) },
    { a: 14, c: 6, row: r2, jump: false, say: `Read the row: <b>${hex(TABLE[r2], 4)}</b>. The table sits right after the jump, 4 bytes on.`, regs: R(String(n), [{ name: 'r3', value: hex(TABLE[r2], 4), means: 'distance to the case', changed: true }]) },
    { a: 15, c: 6, row: r2, jump: true, say: `Jump: <b>15280 + ${hex(TABLE[r2], 4)} = ${hex(t)}</b>. One addition, and the CPU is inside the right case. No list of 27 compares.`, regs: R(String(n), [{ name: 'pc', value: hex(t), means: nm, changed: true }]) },
    { a: 17, c: 7, row: r2, jump: true, say: `<b>${nm}</b>: HandyMenu ${DOES[n]}.`, regs: R(String(n), [{ name: 'pc', value: hex(t), means: CASE[n][1] }]) },
  );
  return s;
}

export type PowerCase = 'soft' | 'hard' | 'off';
export interface PwStep { a: number; c: number; say: string; regs: Reg[]; dev: 'today' | 'ask' | 'boot' | 'fresh' | 'off' }

/** Soft Reset, Hard Reset and Power Off, traced. Hard Reset stops at the question until you answer it. */
export function powerSteps(c: PowerCase, answer?: 'yes' | 'no'): PwStep[] {
  const io = { name: 'r0', value: '0101003C', means: 'IOCTL_HAL_REBOOT: restart' };
  if (c === 'soft') return [
    { a: 0, c: 1, dev: 'today', say: 'Soft Reset loads one number, <b>0101003C</b>: the code that means “restart”.', regs: [{ ...io, changed: true }] },
    { a: 1, c: 1, dev: 'boot', say: '<b>KernelIoControl</b> hands it to the lowest layer of the system, the code that talks to the chips. The Pocket PC restarts at once, like rebooting a phone. Your files stay.', regs: [io] },
    { a: 1, c: 1, dev: 'today', say: 'A few seconds later, the Today screen is back. Two instructions did all of that.', regs: [io] },
  ];
  if (c === 'off') return [
    { a: 10, c: 11, dev: 'today', say: 'Power Off loads <b>223</b>, VK_OFF: the key code of the power button.', regs: [{ name: 'r0', value: '223', means: 'VK_OFF', changed: true }] },
    { a: 11, c: 11, dev: 'today', say: '<b>keybd_event</b> presses that key in software, as if a finger did.', regs: [{ name: 'r0', value: '223', means: 'VK_OFF' }, { name: 'r2', value: '0', means: 'key down' }] },
    { a: 12, c: 12, dev: 'today', say: 'Then <b>2</b>, KEYEVENTF_KEYUP: let go.', regs: [{ name: 'r0', value: '223', means: 'VK_OFF' }, { name: 'r2', value: '2', means: 'key up', changed: true }] },
    { a: 13, c: 12, dev: 'off', say: 'The system sees a whole press of the power button and goes to sleep, exactly as if you pressed it. Tap the screen to wake it.', regs: [{ name: 'r0', value: '223', means: 'VK_OFF' }, { name: 'r2', value: '2', means: 'key up' }] },
  ];
  const s: PwStep[] = [
    { a: 2, c: 3, dev: 'today', say: 'Hard Reset erases everything, so it asks first. The title is string <b>2</b>, “Hard Reset”, in your language.', regs: [{ name: 'r1', value: '2', means: 'string 2: the title', changed: true }] },
    { a: 3, c: 4, dev: 'today', say: 'The warning is string <b>45</b>. HandyMenu.bin carries it in five more languages.', regs: [{ name: 'r1', value: '45', means: 'string 45: the warning', changed: true }] },
    { a: 4, c: 5, dev: 'ask', say: answer ? 'MessageBox shows the question and waits.' : 'MessageBox shows the question and waits. <b>Answer it on the screen.</b>', regs: [{ name: 'r3', value: '36', means: 'MB_YESNO | MB_ICONQUESTION' }] },
  ];
  if (answer === 'no') s.push(
    { a: 5, c: 5, dev: 'today', say: 'No comes back as <b>7</b>, not 6.', regs: [{ name: 'r0', value: '7', means: 'IDNO', changed: true }] },
    { a: 6, c: 9, dev: 'today', say: 'So it jumps past everything. Nothing is touched.', regs: [{ name: 'r0', value: '7', means: 'IDNO' }] },
  );
  if (answer === 'yes') s.push(
    { a: 5, c: 5, dev: 'today', say: 'Yes comes back as <b>6</b>.', regs: [{ name: 'r0', value: '6', means: 'IDYES', changed: true }] },
    { a: 7, c: 6, dev: 'today', say: '<b>SetCleanRebootFlag</b> leaves a note for the next start: begin from factory fresh. It is called through a pointer, straight from the import table.', regs: [{ name: 'r0', value: '6', means: 'IDYES' }] },
    { a: 9, c: 7, dev: 'boot', say: 'The same restart call as Soft Reset. On the way up, the system reads the note and wipes the memory.', regs: [{ ...io, changed: true }] },
    { a: 9, c: 7, dev: 'fresh', say: 'The Pocket PC starts like the day it left the box.', regs: [io] },
  );
  return s;
}

export interface CapStep { a: number; c: number; say: string; regs: Reg[]; kfrom: number; written: number; shot: 'menu' | 'taken' | 'clean' | 'save' }
/** The capture at 0x149E8, traced for a 240 x 320 screen. kfrom: first header byte known (54 = none); written: bytes written. */
export function captureSteps(w = 240, h = 320): CapStep[] {
  const px = w * h * 3, n = (x: number) => x.toLocaleString('en-US');
  return [
    { a: 0, c: 0, kfrom: 54, written: 0, shot: 'menu', say: 'You tap Screen Capture. First, a beep, so you know it heard you.', regs: [] },
    { a: 1, c: 1, kfrom: 54, written: 0, shot: 'menu', say: 'Then it waits: the delay you set, times 500 milliseconds. Time to open the screen you want.', regs: [{ name: 'r0', value: 'delay×500', means: 'milliseconds', changed: true }] },
    { a: 2, c: 2, kfrom: 54, written: 0, shot: 'clean', say: '<b>GetDC(NULL)</b>: NULL means the whole screen, not one window.', regs: [{ name: 'r0', value: '0', means: 'the whole screen' }] },
    { a: 3, c: 3, kfrom: 54, written: 0, shot: 'clean', say: `A blank picture the size of the screen: <b>${w} × ${h}</b>, asked from the system with GetSystemMetrics.`, regs: [{ name: 'r1', value: String(w), means: 'width', changed: true }, { name: 'r2', value: String(h), means: 'height', changed: true }] },
    { a: 4, c: 4, kfrom: 54, written: 0, shot: 'taken', say: '<b>BitBlt</b> copies every pixel into it. The picture is taken <b>now</b>, before anything else can appear.', regs: [{ name: 'sb', value: 'CC0020', means: 'SRCCOPY: copy as is' }] },
    { a: 5, c: 5, kfrom: 54, written: 0, shot: 'taken', say: 'Then it asks the screen to repaint itself.', regs: [] },
    { a: 6, c: 6, kfrom: 54, written: 0, shot: 'save', say: 'Only now does it ask where to save. The Save dialog covers the screen, and it is not in your picture: the shot was already taken.', regs: [] },
    { a: 7, c: 7, kfrom: 54, written: 0, shot: 'save', say: `How many bytes of pixels? Width times height: <b>${n(w * h)}</b>.`, regs: [{ name: 'r3', value: n(w * h), means: 'pixels', changed: true }] },
    { a: 8, c: 8, kfrom: 54, written: 0, shot: 'save', say: `Times 3, one byte each for blue, green and red: <b>${n(px)}</b>. It writes x × 3 as x + x × 2, one instruction.`, regs: [{ name: 'r3', value: n(px), means: 'bytes of pixels', changed: true }] },
    { a: 9, c: 7, kfrom: 14, written: 0, shot: 'save', say: 'The picture header starts with its own size: <b>40</b> bytes.', regs: [{ name: 'r2', value: '40', means: 'biSize', changed: true }] },
    { a: 10, c: 7, kfrom: 14, written: 0, shot: 'save', say: '<b>24</b> bits a pixel: true color, no palette.', regs: [{ name: 'lr', value: '24', means: 'biBitCount', changed: true }] },
    { a: 11, c: 9, kfrom: 14, written: 0, shot: 'save', say: '<b>CreateDIBSection</b> gives it the pixels as a plain array it can write straight to a file.', regs: [] },
    { a: 12, c: 10, kfrom: 14, written: 0, shot: 'save', say: 'Copy the picture into that array.', regs: [] },
    { a: 13, c: 11, kfrom: 0, written: 0, shot: 'save', say: `The file header: total size = pixels + 54 = <b>${n(px + 54)}</b>.`, regs: [{ name: 'r5', value: n(px + 54), means: 'bfSize', changed: true }] },
    { a: 14, c: 11, kfrom: 0, written: 0, shot: 'save', say: 'Where the pixels start: byte <b>54</b> (36h), right after the two headers.', regs: [{ name: 'sb', value: '54', means: 'bfOffBits', changed: true }] },
    { a: 15, c: 11, kfrom: 0, written: 0, shot: 'save', say: '<b>4D42h</b>, stored low byte first: the letters <b>B</b> and <b>M</b>, the tag every BMP file starts with.', regs: [{ name: 'r4', value: '4D42', means: '"BM"', changed: true }] },
    { a: 16, c: 12, kfrom: 0, written: 14, shot: 'save', say: 'Write 14 bytes: the file header.', regs: [{ name: 'r2', value: '14', means: 'bytes to write' }] },
    { a: 17, c: 13, kfrom: 0, written: 54, shot: 'save', say: 'Write 40 bytes: the picture header.', regs: [{ name: 'r2', value: '40', means: 'bytes to write' }] },
    { a: 18, c: 14, kfrom: 0, written: px + 54, shot: 'save', say: `Write the ${n(px)} bytes of pixels. Done: a real .bmp that any computer opens, then and now.`, regs: [{ name: 'r2', value: n(px), means: 'bytes to write' }] },
  ];
}

/** The 15 fields of the two headers, in file order: [name, size in bytes, what it means]. */
export const BMP_FIELDS: [string, number, string][] = [
  ['bfType', 2, 'the tag “BM”'], ['bfSize', 4, 'file size'], ['bfReserved', 4, 'always 0'], ['bfOffBits', 4, 'pixels start here'],
  ['biSize', 4, 'this header: 40'], ['biWidth', 4, 'width'], ['biHeight', 4, 'height'], ['biPlanes', 2, '1'], ['biBitCount', 2, '24 bits a pixel'],
  ['biCompression', 4, 'none'], ['biSizeImage', 4, 'bytes of pixels'], ['biXPelsPerMeter', 4, '0'], ['biYPelsPerMeter', 4, '0'], ['biClrUsed', 4, '0'], ['biClrImportant', 4, '0'],
];

export const DEG: Record<number, number> = { 0: 0, 1: 90, 2: 180, 4: 270 };
export interface RotStep { a: number; c: number; say: string; regs: Reg[]; angle: number }
/** sub_1293C traced: ask for angle `want` (4, 1 or 2) when the screen is at `now`; `first` = nothing cached yet. */
export function rotateSteps(want: number, now: number, first: boolean): RotStep[] {
  const to = now !== 0 ? 0 : want;
  const dm = (v: string, changed = false): Reg => ({ name: 'dm', value: v, means: 'dmDisplayOrientation', changed });
  const s: RotStep[] = [
    { a: 1, c: 1, angle: now, say: first ? 'Is the function already loaded? Not yet: this is the first rotation since HandyMenu started.' : 'Is the function already loaded? Yes, from last time. Skip the search.', regs: [{ name: 'r3', value: first ? '0' : 'handle', means: 'saved library' }] },
  ];
  if (first) s.push(
    { a: 3, c: 2, angle: now, say: '<b>LoadLibrary</b> opens coredll.dll, the system’s main library, while the program runs.', regs: [{ name: 'r0', value: 'coredll', means: 'library handle', changed: true }] },
    { a: 4, c: 3, angle: now, say: '<b>GetProcAddress</b> looks the function up by name. Older Pocket PCs do not have it, and that is fine: HandyMenu still starts on them, because nothing links to the name ahead of time.', regs: [{ name: 'r0', value: 'ChangeDisplay…', means: 'function address', changed: true }] },
    { a: 5, c: 3, angle: now, say: 'It keeps the address in a global, so every later tap skips the lookup.', regs: [{ name: 'r5', value: '1CDD8', means: 'where it is kept' }] },
  );
  else s.push({ a: 2, c: 1, angle: now, say: 'Straight to the saved address.', regs: [{ name: 'r5', value: '1CDD8', means: 'where it is kept' }] });
  s.push(
    { a: 6, c: 6, angle: now, say: 'Found. (If it were missing, string 66 would say the device does not support rotation, in your language.)', regs: [{ name: 'r0', value: 'address', means: 'not 0: found' }] },
    { a: 8, c: 7, angle: now, say: 'A DEVMODE, the settings form for the display: its size, <b>192</b> bytes…', regs: [{ name: 'r7', value: '192', means: 'dmSize', changed: true }] },
    { a: 9, c: 8, angle: now, say: '…and one field marked as in use: the orientation.', regs: [{ name: 'r8', value: '800000', means: 'DM_DISPLAYORIENTATION', changed: true }] },
    { a: 10, c: 9, angle: now, say: '<b>CDS_TEST</b> means: change nothing, just fill in the form.', regs: [{ name: 'r3', value: '2', means: 'CDS_TEST', changed: true }] },
    { a: 11, c: 9, angle: now, say: `The system answers: the screen is at <b>${DEG[now]}°</b>.`, regs: [dm(String(now), true)] },
    { a: 12, c: 10, angle: now, say: now ? 'Not 0: the screen is already turned.' : 'It is 0: upright.', regs: [dm(String(now))] },
  );
  if (now !== 0) s.push({ a: 13, c: 11, angle: now, say: 'So this tap turns it <b>back</b>. One menu item is both “turn” and “undo”.', regs: [{ name: 'r6', value: '0', means: 'the new angle', changed: true }] });
  s.push(
    { a: 14, c: 12, angle: now, say: `Put the new angle in the form: <b>${to}</b>, which means ${DEG[to]}°.`, regs: [dm(String(to), true)] },
    { a: 15, c: 13, angle: to, say: `Call it again, for real this time. The screen turns to <b>${DEG[to]}°</b>, and every program redraws to fit.`, regs: [dm(String(to))] },
  );
  return s;
}

export interface DateStep { a: number; c: number; say: string; regs: Reg[]; slots: number[]; phase: 0 | 1 | 2 | 3; upto: number }
const SLOT_NAMES = ['month × 2 + 3', 'year + 7', 'year + 21', 'day × 2 + 5', 'month × 2 + 1', '(day + 2) × 2'];
export { SLOT_NAMES };
/** The encoder (HandyMenu 3.6, 0x181D4) traced for one install date. phase: 0 slots, 1 bytes, 2 salted, 3 checksum. */
export function dateSteps(y: number, m: number, d: number): DateStep[] {
  const r = record(y, m, d), v = r.shorts;
  const S = (slots: number[], phase: DateStep['phase'] = 0, upto = 0) => ({ slots, phase, upto });
  return [
    { a: 0, c: 1, ...S([]), say: `The install date comes in as a SYSTEMTIME, the standard date form. First the year: <b>${y}</b>.`, regs: [{ name: 'r1', value: String(y), means: 'year', changed: true }] },
    { a: 1, c: 3, ...S([2]), say: `Copy one of the year: <b>${y} + 21 = ${v[2]}</b>.`, regs: [{ name: 'r3', value: String(v[2]), means: 'slot 2', changed: true }] },
    { a: 2, c: 1, ...S([2]), say: `The month: <b>${m}</b>.`, regs: [{ name: 'r3', value: String(m), means: 'month', changed: true }] },
    { a: 3, c: 2, ...S([2]), say: `The day: <b>${d}</b>.`, regs: [{ name: 'r0', value: String(d), means: 'day', changed: true }] },
    { a: 4, c: 3, ...S([2, 0]), say: `Copy one of the month: <b>${m} × 2 + 3 = ${v[0]}</b>.`, regs: [{ name: 'r3', value: String(v[0]), means: 'slot 0', changed: true }] },
    { a: 5, c: 4, ...S([2, 0, 3]), say: `Copy one of the day: <b>${d} × 2 + 5 = ${v[3]}</b>.`, regs: [{ name: 'r3', value: String(v[3]), means: 'slot 3', changed: true }] },
    { a: 6, c: 3, ...S([2, 0, 3, 1]), say: `Copy two of the year, a different disguise: <b>${y} + 7 = ${v[1]}</b>.`, regs: [{ name: 'r3', value: String(v[1]), means: 'slot 1', changed: true }] },
    { a: 7, c: 4, ...S([2, 0, 3, 1, 4]), say: `Copy two of the month: <b>${m} × 2 + 1 = ${v[4]}</b>.`, regs: [{ name: 'r3', value: String(v[4]), means: 'slot 4', changed: true }] },
    { a: 8, c: 4, ...S([0, 1, 2, 3, 4, 5]), say: `Copy two of the day: <b>(${d} + 2) × 2 = ${v[5]}</b>. Every part of the date is now in the record twice, each time dressed differently.`, regs: [{ name: 'r3', value: String(v[5]), means: 'slot 5', changed: true }] },
    { a: 9, c: 5, ...S([0, 1, 2, 3, 4, 5], 1, 0), say: 'The six numbers become 12 bytes, low byte first. Now the loop walks them one by one.', regs: [{ name: 'r5', value: '0', means: 'byte number', changed: true }] },
    { a: 10, c: 8, ...S([0, 1, 2, 3, 4, 5], 1, 12), say: `It adds every byte to a running sum: <b>${r.sum}</b>.`, regs: [{ name: 'r7', value: String(r.sum), means: 'sum', changed: true }] },
    { a: 11, c: 9, ...S([0, 1, 2, 3, 4, 5], 2, 12), say: 'And it salts them: every odd-numbered byte goes up by 1. Now no number in the file matches the date it hides.', regs: [{ name: 'r1', value: 'i % 2', means: 'the salt' }] },
    { a: 13, c: 11, ...S([0, 1, 2, 3, 4, 5], 2, 12), say: `The sum, divided by 31, leaves <b>${r.ck}</b>.`, regs: [{ name: 'r1', value: String(r.ck), means: 'sum mod 31', changed: true }] },
    { a: 14, c: 11, ...S([0, 1, 2, 3, 4, 5], 3, 14), say: 'That remainder fills bytes 12 and 13: the checksum. Fourteen bytes, and the date is in there twice, salted and sealed.', regs: [{ name: 'r1', value: String(r.ck), means: 'checksum' }] },
  ];
}

/** His day count: (year × 12 + month) × 31 + day. The trial runs while today is within 15 of the install day. */
export const dayNo = (y: number, m: number, d: number) => (y * 12 + m) * 31 + d;
