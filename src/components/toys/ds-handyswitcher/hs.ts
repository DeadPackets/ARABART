// Logic for the HandySwitcher page toys. Every step list here follows his ARM code (offsets in the listings come from
// HandySwitcher 2.7, HHTask.exe 2.7 and the shared key engine); the key itself is src/lib/dinarsoft/handyswitcher.ts.
import { dinarKey } from '../../../lib/dinarsoft/handyswitcher.ts';

export const reduce = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

type Reg = { name: string; value: string; means: string; changed?: boolean };
export interface Step { a: number; c: number; say: string; regs?: Reg[]; [k: string]: unknown }

/* ---------- the key engine ---------- */

export interface KeyStep extends Step { S: number[]; i: number; j: number; t: number; k: number; key: string; phase: 'fill' | 'mix' | 'pick' | 'swap' | 'out' }

const N = 120;
const ch = (c: number) => String.fromCharCode(c);

/** Steps through his key function for one code and one product name. The last step's key equals dinarKey(). */
export function keySteps(code: string, product: string): KeyStep[] {
  const out: KeyStep[] = [];
  const S = Array.from({ length: N }, (_, i) => i);
  const base = { i: -1, j: -1, t: -1, k: -1, key: '' };
  out.push({ ...base, a: 0, c: 1, phase: 'fill', S: [...S], say: 'He starts with the numbers 0 to 119, in order. Think of a deck of 120 cards.', regs: [{ name: 'S', value: '0..119', means: 'the deck, in order' }] });
  for (let i = 0, j = 0; i < N; i++) {
    j = (S[i] + product.charCodeAt(i % product.length) + j) % N;
    [S[i], S[j]] = [S[j], S[i]];
  }
  out.push({ ...base, a: 3, c: 4, phase: 'mix', S: [...S],
    say: `Then he shuffles the deck 120 times, steered by the product name <b>${product}</b>. Every product gets its own order, so a key for one app never opens another.`,
    regs: [{ name: 'name', value: product, means: 'the shuffle is keyed by it', changed: true }] });
  let i = 0, j = 0, key = '';
  for (let k = 0; k < code.length; k++) {
    i = (i + 1) % N;
    j = (j + S[i]) % N;
    out.push({ i, j, t: -1, k, key, a: 6, c: 8, phase: 'pick', S: [...S],
      say: `Letter ${k + 1}: <b>i</b> steps on to ${i}, and <b>j</b> jumps by the card at i, to ${j}.`,
      regs: [{ name: 'i', value: String(i), means: 'moves one card each letter', changed: true }, { name: 'j', value: String(j), means: 'jumps by S[i]', changed: true }] });
    [S[i], S[j]] = [S[j], S[i]];
    const t = (S[i] + S[j]) % N;
    out.push({ i, j, t, k, key, a: 9, c: 10, phase: 'swap', S: [...S],
      say: `Swap the two cards, add them up, and the sum (mod 120) points at card <b>t = ${t}</b>, which is <b>${S[t]}</b>.`,
      regs: [{ name: 'S[i]', value: String(S[i]), means: 'after the swap', changed: true }, { name: 'S[j]', value: String(S[j]), means: 'after the swap', changed: true }, { name: 't', value: String(t), means: '(S[i] + S[j]) mod 120', changed: true }] });
    const x = code.charCodeAt(k) ^ S[t];
    let c = 65 + (x % 25);
    const skip = c >= 79;
    if (skip) c++;
    key += ch(c);
    out.push({ i, j, t, k, key, a: skip ? 15 : 12, c: skip ? 12 : 11, phase: 'out', S: [...S],
      say: `${ch(code.charCodeAt(k))} (${code.charCodeAt(k)}) XOR ${S[t]} = ${x}. Mod 25 gives ${x % 25}, plus A gives <b>${ch(65 + (x % 25))}</b>${skip ? `, and because it is O or later he moves it up one: <b>${ch(c)}</b>. There is no O in his keys, so nobody mixes it up with zero` : ''}.`,
      regs: [{ name: 'code', value: ch(code.charCodeAt(k)), means: `letter ${k + 1} of your code` }, { name: 'out', value: ch(c), means: 'letter of the key', changed: true }] });
  }
  if (key !== dinarKey(code, product)) throw new Error('keySteps drifted from dinarKey');
  return out;
}

/* ---------- closing a program ---------- */

export type AppKind = 'polite' | 'player' | 'slow' | 'frozen';
export interface CloseStep extends Step { ms: number; state: 'open' | 'asked' | 'waiting' | 'ask-you' | 'gone' | 'ended'; cursor?: boolean; keys?: boolean }

/** His close routine (HandySwitcher 2.7, 0x17D4C) for four kinds of program. */
export function closeSteps(kind: AppKind): CloseStep[] {
  const s: CloseStep[] = [];
  let checks = 0;
  const add = (a: number, c: number, ms: number, state: CloseStep['state'], say: string, extra: Partial<CloseStep> = {}) => {
    if (a === 8) checks++;
    const regs = [{ name: 'ms', value: String(ms), means: 'milliseconds since the tap' }, { name: 'win', value: state === 'gone' || state === 'ended' ? '0' : 'alive', means: 'IsWindow(w): is it still there?', changed: state === 'gone' || state === 'ended' }];
    if (checks) regs.push({ name: 'n', value: String(11 - checks), means: 'checks left' });
    s.push({ a, c, ms, state, say, regs, ...extra });
  };
  add(0, 0, 0, 'open', 'First he brings the program to the front, so you can see what happens to it.');
  add(1, 1, 0, 'open', 'He reads the window’s class name: the name its programmer registered, like a tag on the window.');
  if (kind === 'player') {
    add(2, 2, 0, 'open', 'It starts with <b>WMP</b>: this is Windows Media Player. Media Player ignores a plain close request and keeps playing in the background.');
    add(3, 3, 100, 'open', 'So he presses its own Quit keys for it: <b>Ctrl+Q</b>, typed by the program as if you had a keyboard.', { keys: true });
  }
  add(4, 5, kind === 'player' ? 100 : 0, 'asked', 'He posts <b>WM_CLOSE</b>: the same polite “please close” a desktop window gets when you click its X.');
  add(5, 6, (kind === 'player' ? 100 : 0) + 500, 'asked', 'He gives it half a second.');
  if (kind === 'polite' || kind === 'player') {
    add(6, 7, (kind === 'player' ? 100 : 0) + 500, 'gone', 'The window is gone. The program saved its work and ended, all on its own terms.');
    return s;
  }
  add(6, 7, 500, 'waiting', 'Still there. Some programs take a moment to save their work.');
  add(7, 8, 500, 'waiting', 'He shows the wait cursor, so you know HandySwitcher is on it.', { cursor: true });
  const busy = kind === 'slow' ? 4 : 11;
  for (let n = 1; n <= busy; n++)
    add(8, 9, 500 + n * 500, n === busy && kind === 'slow' ? 'gone' : 'waiting',
      kind === 'slow' && n === busy ? `Gone after ${(500 + n * 500) / 1000} seconds. Patience was enough.` : `Check ${n} of 11: still there.`, { cursor: !(kind === 'slow' && n === busy) });
  if (kind === 'slow') return s;
  add(9, 12, 6000, 'ask-you', 'After 6 seconds it is still there. He asks you, in his own words: “Bubble Breaker is not responding because it is busy, waiting for a response from you, or has stopped running. Do you want HandySwitcher to terminate the program anyway?”');
  add(10, 14, 6000, 'ask-you', 'You tap Yes. He looks up the process that owns the window, the way a task manager finds a PID.');
  add(11, 17, 6000, 'ended', '<b>TerminateProcess</b> ends it at once, and Windows gives back its memory. This is the X that really closes.');
  return s;
}

/* ---------- the top-bar hook ---------- */

export type Zone = 'switcher' | 'menu' | 'launcher' | 'close' | 'start';
export interface HookStep extends Step { hooked: boolean; zone: Zone | null; to: string | null }

export function hookSteps(zone: Zone): HookStep[] {
  const s: HookStep[] = [];
  const X: Record<Zone, string> = { start: '40,13', switcher: '170,13', menu: '186,13', launcher: '202,13', close: '228,13' };
  const add = (a: number, c: number, hooked: boolean, z: Zone | null, to: string | null, say: string) => {
    const regs = !hooked ? [{ name: 'r0', value: 'HHTaskBar', means: 'the class name it looks for' }]
      : !z ? [{ name: 'r1', value: '-4', means: 'GWL_WNDPROC: the message handler' }, { name: 'r2', value: '12628h', means: 'his function', changed: true }]
      : [{ name: 'msg', value: '513', means: 'WM_LBUTTONDOWN: a tap' }, { name: 'pt', value: X[z], means: 'where you touched, in pixels' }, ...(to ? [{ name: 'to', value: to, means: 'who handles it', changed: true }] : [])];
    s.push({ a, c, hooked, zone: z, to, say, regs });
  };
  add(1, 0, false, null, null, 'HHTask.exe starts with the system and finds the top bar by its class name, <b>HHTaskBar</b>.');
  add(4, 1, true, null, null, 'Every window has one function that handles its messages. He swaps in <b>his own</b> function for the bar’s, and gets the old one back.');
  add(5, 1, true, null, null, 'He keeps the old function. Anything that is not for him will go straight to it, so the bar works exactly as before.');
  add(6, 4, true, zone, null, 'You tap the bar. The tap arrives as a message, <b>WM_LBUTTONDOWN</b>, with the point you touched, and his function sees it first.');
  if (zone === 'switcher') {
    add(7, 5, true, zone, null, 'Is the point inside the HandySwitcher icon? Yes.');
    add(8, 6, true, zone, 'HandySwitcher', 'He posts a message to HandySwitcher, and the menu of running programs drops down. The system never saw the tap.');
    return s;
  }
  add(7, 5, true, zone, null, 'Inside the HandySwitcher icon? No.');
  if (zone === 'menu') {
    add(9, 7, true, zone, null, 'Inside the HandyMenu icon? Yes.');
    add(11, 8, true, zone, null, 'He asks Windows Mobile whether you tapped or tapped and held, so one icon can do two things.');
    add(8, 8, true, zone, 'HandyMenu', 'If HandyMenu is not running he starts it, then posts it the gesture. Its menu opens.');
    return s;
  }
  add(9, 7, true, zone, null, 'Inside the HandyMenu icon? No.');
  if (zone === 'launcher') {
    add(10, 9, true, zone, null, 'Inside the HandyLauncher icon? Yes.');
    add(11, 10, true, zone, null, 'Tap, or tap and hold? HandyLauncher has two menus, one for each.');
    add(8, 10, true, zone, 'HandyLauncher', 'He posts the gesture to HandyLauncher, and the right menu opens.');
    return s;
  }
  add(10, 9, true, zone, null, 'Inside the HandyLauncher icon? No.');
  if (zone === 'close') {
    add(12, 11, true, zone, null, 'On the system’s (X) button? Yes. On Windows Mobile that button only hid a program.');
    add(11, 12, true, zone, null, 'Tap or hold? You choose in his settings which one closes and which one minimizes.');
    add(8, 12, true, zone, 'HandySwitcher', 'He hands it to HandySwitcher, which closes the program for real.');
    return s;
  }
  add(12, 11, true, zone, null, 'On the (X) button? No. This tap is not for him.');
  add(13, 14, true, zone, 'system', 'He passes it, untouched, to the old function. The Start menu opens as always.');
  return s;
}

/* ---------- the running programs on the demo device ---------- */

export interface Prog { id: string; name: string; kind: AppKind; glyph: string; hue: number }
export const PROGS: Prog[] = [
  { id: 'notes', name: 'Notes', kind: 'polite', glyph: 'N', hue: 85 },
  { id: 'calendar', name: 'Calendar', kind: 'polite', glyph: '31', hue: 25 },
  { id: 'player', name: 'Windows Media', kind: 'player', glyph: '▶', hue: 255 },
  { id: 'word', name: 'Pocket Word', kind: 'slow', glyph: 'W', hue: 240 },
  { id: 'explorer', name: 'File Explorer', kind: 'polite', glyph: '▤', hue: 60 },
  { id: 'game', name: 'Bubble Breaker', kind: 'frozen', glyph: '●', hue: 320 },
];
