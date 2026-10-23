// HandyLauncher's data and step traces, read from HandyLauncher.exe 3.4 and HandyLauncherSetup.dll. Pure, for server and browser.

export const reduce = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export type Kind = 'app' | 'doc' | 'folder' | 'song' | 'sep';
export interface Item { name: string; target: string; kind: Kind; orient: number }

// The two menus his setup DLL writes on install (HandyLauncherSetup.dll 0x1012C4 to 0x1015BC). Type 0 = separator.
const S: Item = { name: '', target: '', kind: 'sep', orient: 0 };
const app = (name: string, target: string, kind: Kind = 'app'): Item => ({ name, target, kind, orient: 0 });
export const MENU1_NAME = 'HandyLauncher', MENU2_NAME = 'ExtraLauncher';
export const MENU1: Item[] = [
  app('My Documents', '\\My Documents', 'folder'), S,
  app('Pocket Excel', '\\Windows\\Pxl.exe'), app('Pocket Word', '\\Windows\\PWord.exe'), S,
  app('Calculator', '\\Windows\\Calc.exe'), app('File Explorer', '\\Windows\\FExplore.exe'),
  app('Internet Explorer', '\\Windows\\IExplore.exe'), app('MSN Messenger', '\\Windows\\Instmsgr.exe'),
  app('Solitaire', '\\Windows\\Solitare.exe'),
];
export const MENU2: Item[] = [
  app('My Device', '\\', 'folder'), S, app('MS Reader', '\\Windows\\Msreader.exe'),
  app('File Explorer', '\\Windows\\FExplore.exe'), S, app('Calculator', '\\Windows\\Calc.exe'), S,
  app('Games', '\\Windows\\Start Menu\\Programs\\Games', 'folder'),
];

// The Orientation box in his Shortcut Properties dialog, in his order (0x16ADC), and what sub_18F7C turns each into
export const ORIENT = ['Use Current', 'Portrait', 'Landscape (R)', 'Landscape (L)'];
export const DMDO = [-1, 0, 1, 4];            // -1: leave the screen as it is
export const DEG = { 0: 0, 1: 90, 4: 270 } as Record<number, number>;

const svg = (body: string) => `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">${body}</svg>`;
export const GLYPH: Record<Kind, string> = {
  app: svg('<rect x="1.5" y="2.5" width="13" height="11" fill="#fff" stroke="#1d4fb8"/><rect x="1.5" y="2.5" width="13" height="3" fill="#1d4fb8"/>'),
  doc: svg('<path d="M3.5 1.5h6l3 3v10h-9z" fill="#fff" stroke="#555"/><path d="M5 7h6M5 9h6M5 11h4" stroke="#1d4fb8"/>'),
  folder: svg('<path d="M1.5 4.5h5l1.5 1.5h6.5v7.5h-13z" fill="#f6c84c" stroke="#a87b12"/>'),
  song: svg('<path d="M6 12V3.5l7-1.5v8.5" fill="none" stroke="#7a2d9e" stroke-width="1.5"/><circle cx="4.5" cy="12" r="2" fill="#7a2d9e"/><circle cx="11.5" cy="10.5" r="2" fill="#7a2d9e"/>'),
  sep: '',
};

/** Guess the kind from the target, the way the visitor would think of it. sub_190D8 itself only asks: folder or not. */
export function kindOf(target: string): Kind {
  const t = target.toLowerCase();
  if (t === '\\' || !/\.[a-z0-9]{2,4}$/.test(t)) return 'folder';
  if (t.endsWith('.exe')) return 'app';
  if (/\.(mp3|wma|wav)$/.test(t)) return 'song';
  return 'doc';
}

export interface Reg { name: string; value: string; means: string; changed?: boolean }
export interface Step { a: number; c: number; say: string; regs?: Reg[]; [k: string]: unknown }

// ---------- hl-hold: the tray handler, sub_125FC ----------
export function holdSteps(held: boolean, reverse: boolean, vga = false): Step[] {
  const w = vga ? 480 : 240, h = vga ? 640 : 320, scale = vga ? 2 : 1;
  const menu = held !== reverse ? 2 : 1;
  const r = (name: string, value: string, means: string, changed = false) => ({ name, value, means, changed });
  const st: Step[] = [
    { a: 0, c: 0, say: 'A message arrives from his icon in the tray. Its number is <b>0BD5h</b>, the one he gave his icon when he put it there.', regs: [r('r1', '0BD5h', 'the message', true)], v: 'msg' },
    { a: 3, c: 1, say: '<b>201h</b> means the stylus just touched the screen. Nothing has been lifted yet.', regs: [r('r5', '201h', 'stylus down', true)], v: 'down' },
    { a: 4, c: 1, say: 'And it touched icon <b>5001</b>, his own. Taps on other icons pass him by.', regs: [r('r4', '1389h', 'icon 5001', true)], v: 'down' },
    { a: 5, c: 2, say: 'He fills in a small form for Windows Mobile: <b>20 bytes</b> long, the size of the structure.', regs: [r('r3', '20', 'cbSize', true)], v: 'down' },
    { a: 6, c: 3, say: `Where was the tap? The tray sits in the bottom right corner, so he uses the screen width, minus 2: <b>${w - 2}</b>.`, regs: [r('r4', String(w - 2), 'x', true)], v: 'down' },
    { a: 7, c: 4, say: `And the height, minus 2: <b>${h - 2}</b>. That point is always on his icon.`, regs: [r('r4', String(w - 2), 'x'), r('r5', String(h - 2), 'y', true)], v: 'down' },
    { a: 8, c: 5, say: 'Which window owns that corner? He asks, because the gesture has to watch the right one.', regs: [r('r0', 'hwnd', 'the tray bar', true)], v: 'down' },
    { a: 9, c: 6, say: 'Flag <b>1</b>: just tell me what happened, do not show a menu yourself.', regs: [r('r3', '1', 'SHRG_RETURNCMD', true)], v: 'down' },
    { a: 10, c: 7, say: `His screen scale: <b>${scale}</b>. It is 2 on a VGA screen of 480 pixels, so the menu lands in the same place on every device.`, regs: [r('r0', String(scale), 'scale', true)], v: 'down' },
    { a: 11, c: 7, say: `The menu will open from the corner, its bottom edge <b>25 &times; ${scale}</b> pixels up, just above the tray bar: y = <b>${h - 25 * scale}</b>.`, regs: [r('r0', String(h - 25 * scale), 'menu y', true)], v: 'down' },
    { a: 12, c: 8, say: held ? 'Now Windows Mobile watches the stylus. It stays down, and the ring of red dots fills in.' : 'Now Windows Mobile watches the stylus. It lifts right away.', regs: [r('r0', '…', 'waiting')], v: held ? 'ring' : 'lift' },
    { a: 13, c: 8, say: held ? 'The answer is not zero: <b>tap and hold</b>.' : 'The answer is <b>0</b>: a plain <b>tap</b>.', regs: [r('r0', held ? '1000' : '0', held ? 'GN_CONTEXTMENU' : 'a tap', true)], v: held ? 'ring' : 'lift' },
    held
      ? { a: 15, c: 9, say: 'Held: he picks the second menu…', regs: [r('r1', 'menu 2', 'chosen', true)], v: 'pick' }
      : { a: 17, c: 11, say: 'A tap: he picks the first menu…', regs: [r('r1', 'menu 1', 'chosen', true)], v: 'pick' },
    held
      ? { a: 16, c: 9, say: reverse ? '…unless <b>Reverse</b> is on. It is, so the two swap: <b>menu 1</b>.' : '…unless <b>Reverse</b> is on. It is off, so <b>menu 2</b> it is.', regs: [r('r1', `menu ${menu}`, reverse ? 'swapped' : 'kept', true)], v: 'pick' }
      : { a: 18, c: 11, say: reverse ? '…unless <b>Reverse</b> is on. It is, so the two swap: <b>menu 2</b>.' : '…unless <b>Reverse</b> is on. It is off, so <b>menu 1</b> it is.', regs: [r('r1', `menu ${menu}`, reverse ? 'swapped' : 'kept', true)], v: 'pick' },
    { a: 19, c: 12, say: `Up it comes: <b>${menu === 1 ? MENU1_NAME : MENU2_NAME}</b>, the ${menu === 1 ? 'first' : 'second'} menu.`, regs: [r('r1', `menu ${menu}`, 'shown')], v: 'menu', menu },
  ];
  return st;
}

// ---------- hl-orient: sub_18F7C with sub_18F20 ----------
export function orientSteps(setting: number, current: number): Step[] {
  const want = DMDO[setting];
  const r = (name: string, value: string, means: string, changed = false) => ({ name, value, means, changed });
  const st: Step[] = [
    { a: 0, c: 0, say: 'Before he opens the program, he checks: has he looked up the rotate call yet?', regs: [r('r0', '0', 'not yet', true)], deg: DEG[current] },
    { a: 1, c: 1, say: 'Not yet. He opens <b>coredll.dll</b>, the system library every program uses…', regs: [r('r0', 'coredll', 'loaded', true)], deg: DEG[current] },
    { a: 2, c: 1, say: '…and asks it for <b>ChangeDisplaySettingsEx</b> by name. Older Pocket PCs do not have it, so asking at run time keeps HandyLauncher running on all of them. It asks once and remembers.', regs: [r('r0', 'found', 'the call', true)], deg: DEG[current] },
    { a: 3, c: 2, say: `The shortcut says <b>${ORIENT[setting]}</b>.`, regs: [r('r6', String(setting), ORIENT[setting], true)], deg: DEG[current] },
  ];
  if (setting === 0) {
    st.push({ a: 4, c: 3, say: '<b>Use Current</b>: he leaves the screen exactly as it is and opens the program.', regs: [r('r6', '0', 'leave it')], deg: DEG[current], done: true });
    return st;
  }
  st.push(
    { a: 5, c: 4, say: 'He fills in a <b>DEVMODE</b>, the form for screen settings: <b>0C0h</b> bytes long, with one field switched on, the orientation.', regs: [r('r8', '0C0h', 'dmSize', true), r('r5', '800000h', 'orientation only', true)], deg: DEG[current] },
    { a: 7, c: 5, say: 'Flag <b>2</b>, a test: the screen does not move, it only reports where it is now.', regs: [r('r3', '2', 'CDS_TEST', true)], deg: DEG[current] },
    { a: 8, c: 5, say: `The answer comes back: the screen is at <b>${DEG[current]}&deg;</b>.`, regs: [r('cur', String(current), `${DEG[current]}°`, true)], deg: DEG[current] },
    { a: setting === 1 ? 9 : setting === 2 ? 10 : 11, c: 6, say: `His setting becomes the system's number: ${ORIENT[setting]} is <b>${want}</b>, ${DEG[want]}&deg;.`, regs: [r('r6', String(want), `${DEG[want]}°`, true)], deg: DEG[current] },
    { a: 12, c: 7, say: want === current ? 'Already there. He does nothing and saves the screen a flicker.' : 'Different, so it has to turn.', regs: [r('r6', String(want), 'wanted'), r('r3', String(current), 'now')], deg: DEG[current], done: want === current },
  );
  if (want !== current) st.push(
    { a: 13, c: 8, say: 'He writes the new orientation into the form…', regs: [r('r6', String(want), 'dmDisplayOrientation', true)], deg: DEG[current] },
    { a: 14, c: 9, say: `…and this time flag <b>0</b>: do it. The screen turns to <b>${DEG[want]}&deg;</b>, then the program opens.`, regs: [r('r3', '0', 'apply', true)], deg: DEG[want], done: true },
  );
  return st;
}

// ---------- hl-open: sub_190D8 ----------
export interface Target { label: string; path: string; folder: boolean }
export const TARGETS: Target[] = [
  { label: 'Pocket Word', path: '\\Windows\\PWord.exe', folder: false },
  { label: 'A document', path: '\\My Documents\\Letter.psw', folder: false },
  { label: 'A song', path: '\\My Documents\\My Music\\Song.mp3', folder: false },
  { label: 'My Documents', path: '\\My Documents', folder: true },
  { label: 'My Device', path: '\\', folder: true },
];
export function openSteps(t: Target): Step[] {
  const r = (name: string, value: string, means: string, changed = false) => ({ name, value, means, changed });
  const root = t.path === '\\';
  const file = t.folder || root ? 'fexplore.exe' : t.path;
  const st: Step[] = [
    { a: 0, c: 0, say: `He looks at the target on the card: <b>${t.path}</b>.`, regs: [r('r4', t.path, 'target', true)], to: 'look' },
  ];
  if (!root) st.push({ a: 2, c: 2, say: t.folder ? 'Its attributes have bit <b>10h</b> set: it is a <b>folder</b>.' : 'Bit <b>10h</b> is clear: a file, not a folder.', regs: [r('r3', t.folder ? '10h' : '0', t.folder ? 'folder' : 'file', true)], to: 'look' });
  if (t.folder && !root) st.push({ a: 4, c: 2, say: 'So the folder becomes the argument, and <b>File Explorer</b> becomes the program.', regs: [r('r5', t.path, 'argument', true), r('r4', 'fexplore.exe', 'program', true)], to: 'look' });
  st.push({ a: 5, c: 3, say: root ? 'The target is <b>\\</b>, the top of the whole device: that goes to File Explorer too.' : 'Is it <b>\\</b>, the top of the device? No.', regs: [r('r0', root ? '0' : '≠0', root ? 'the root' : 'not the root', true)], to: 'look' });
  if (root) st.push({ a: 6, c: 4, say: 'File Explorer, opened at the root.', regs: [r('r4', 'fexplore.exe', 'program', true), r('r5', '\\', 'argument', true)], to: 'look' });
  st.push(
    { a: 7, c: 5, say: 'He fills a <b>SHELLEXECUTEINFO</b>, 60 bytes: what to open, and with what.', regs: [r('lpFile', file, 'open this', true)], to: 'look' },
    { a: 10, c: 6, say: t.folder || root ? 'Windows starts File Explorer at that folder.' : t.path.endsWith('.exe') ? 'Windows starts the program.' : 'He does not need to know which program opens it. Windows looks up the file type and picks one, like a double-click.', regs: [r('r0', '1', 'opened', true)], to: t.folder || root ? 'fexplore.exe' : t.path.endsWith('.exe') ? 'app' : t.path.endsWith('.mp3') ? 'wmplayer.exe' : 'pword.exe', done: true },
  );
  return st;
}

// ---------- hl-key: the five built-in names, sub_11F3C ----------
export function compareSteps(typed: string, made: string, name: string): Step[] {
  const r = (n: string, value: string, means: string, changed = false) => ({ name: n, value, means, changed });
  const st: Step[] = [
    { a: 0, c: 0, say: 'First, the usual check: the key for this device. It does not match, so he tries his built-in names.', regs: [r('r0', '≠0', 'no match', true)], k: -1 },
    { a: 1, c: 1, say: `He copies the name <b>${name}</b>…`, regs: [r('r1', name, 'the name', true)], k: -1 },
    { a: 2, c: 2, say: '…and runs it through the same key engine, with the product name <b>HandyLauncher3</b>. Out comes a key.', regs: [r('key', made, 'made from the name', true)], k: -1 },
    { a: 3, c: 3, say: 'Same length as the key you typed? Both are 16 letters.', regs: [r('r4', String(typed.length), 'typed'), r('r0', String(made.length), 'made', true)], k: -1 },
  ];
  let k = Math.min(typed.length, made.length);
  for (; k > 0; k--) {
    const ok = typed[k - 1] === made[k - 1];
    st.push({ a: 5, c: 5, say: `Letter <b>${k}</b>, counting from the end: <b>${typed[k - 1]}</b> and <b>${made[k - 1]}</b>. ${ok ? 'Same.' : 'Different!'}`, regs: [r('r0', String(k), 'letter', true), r('r2', made[k - 1], 'made'), r('r3', typed[k - 1] ?? '', 'typed')], k: k - 1, ok });
    if (!ok) break;
  }
  const all = k === 0;
  st.push({ a: all ? 7 : 6, c: all ? 7 : 6, say: all ? 'Every letter matched, so he sets <b>7</b>.' : 'One letter differs, so he sets <b>5</b>.', regs: [r('r0', all ? '7' : '5', all ? 'all matched' : 'not this one', true)], k: -2, all });
  st.push({ a: 8, c: 8, say: all
    ? '25 minus 7 is <b>18</b>: registered. A cracker looking for a “compare” call finds none here, only arithmetic.'
    : '25 minus 5 is 20, not 18. On to the next built-in name.', regs: [r('r3', all ? '18' : '20', all ? 'registered' : 'next name', true)], k: -2, all, done: true });
  return st;
}
