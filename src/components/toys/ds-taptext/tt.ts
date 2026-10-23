// TapText 1.3's data and rules, read back from TapText.exe and its default menu file TapText.dmd
// (research/dinarsoft/re/taptext/). menu.json is TapText.dmd parsed; toDmd() writes it back byte for byte.
import menu from './menu.json' with { type: 'json' };

export interface Group { type: 'group'; flags: string; icon: number; title: string; children: Node[]; version?: number }
export interface Item { type: 'text'; flags: string; icon: number; title: string; text: string }
export interface Sep { type: 'separator' }
export type Node = Group | Item | Sep;
export const MENU = menu as unknown as Group;

// ---------- TapText.dmd, his menu file: UTF-16 text, every string prefixed with X and a 5-digit length ----------
const X = (n: number) => 'X' + String(n).padStart(5, '0');
const str = (s: string) => X(s.length) + s + '\r\n';
/** The file as segments, each tagged with the path of the menu entry it belongs to ('' for the header). */
export function dmdParts(root: Group = MENU) {
  const out: { path: string; s: string }[] = [{ path: '', s: 'DinarSoftTapText\r\n' + X(root.version ?? 1) + '\r\n' }];
  const walk = (n: Node, path: string, top = false) => {
    if (n.type === 'separator') { out.push({ path, s: 'S\r\n' }); return; }
    if (n.type === 'text') { out.push({ path, s: 'I\r\n' + n.flags + X(n.icon) + '\r\n' + str(n.title) + str(n.text) }); return; }
    out.push({ path, s: (top ? '' : 'G\r\n') + n.flags + X(n.icon) + '\r\n' + str(n.title) + X(n.children.length) + '\r\n' });
    n.children.forEach((c, i) => walk(c, path ? `${path}.${i}` : String(i)));
  };
  walk(root, '', true);
  return out;
}
export const toDmd = (root: Group = MENU) => dmdParts(root).map(p => p.s).join('');

// ---------- Date and time pictures, as Windows GetDateFormat / GetTimeFormat read them (English) ----------
export const DATE_FORMATS = ['dddd, MMMM d, yyyy', 'MMMM d, yyyy', 'ddd, MMM d, yyyy', 'MMMM', 'dddd', 'MMMM d', 'dd/MM/yy', 'MM/dd/yy', 'dd/MM/yyyy', 'MM/dd/yyyy'];
export const TIME_FORMATS = ['HH:mm', 'h:mm', 'h:mmt', 'h:mm tt', 'h:mm:ss tt'];
export const SAMPLE = new Date(2005, 2, 16, 15, 27, 57); // the date his format pickers preview with
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const p2 = (n: number) => String(n).padStart(2, '0');

export function picture(fmt: string, t: Date) {
  const h12 = t.getHours() % 12 || 12, am = t.getHours() < 12;
  const sub: Record<string, string> = {
    dddd: DAYS[t.getDay()], ddd: DAYS[t.getDay()].slice(0, 3), dd: p2(t.getDate()), d: String(t.getDate()),
    MMMM: MONTHS[t.getMonth()], MMM: MONTHS[t.getMonth()].slice(0, 3), MM: p2(t.getMonth() + 1), M: String(t.getMonth() + 1),
    yyyy: String(t.getFullYear()), yy: p2(t.getFullYear() % 100), y: String(t.getFullYear() % 100),
    HH: p2(t.getHours()), H: String(t.getHours()), hh: p2(h12), h: String(h12),
    mm: p2(t.getMinutes()), m: String(t.getMinutes()), ss: p2(t.getSeconds()), s: String(t.getSeconds()),
    tt: am ? 'AM' : 'PM', t: am ? 'A' : 'P',
  };
  return fmt.replace(/dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|y|HH|H|hh|h|mm|m|ss|s|tt|t/g, k => sub[k]);
}

// ---------- His macro scanner (0x139F4): look for {{DATE: first, then {{TIME:, {{TAB, {{CTRL- ----------
export type Part = { kind: 'text'; s: string } | { kind: 'date' | 'time'; arg: string; s: string } | { kind: 'tab' } | { kind: 'ctrl'; key: string };
const TAGS: [string, Part['kind']][] = [['{{DATE:', 'date'], ['{{TIME:', 'time'], ['{{TAB', 'tab'], ['{{CTRL-', 'ctrl']];

/** The text as TapText types it: plain runs and macros, in the order his driver (0x1E2EC) runs them. */
export function parts(text: string, now: Date): Part[] {
  const out: Part[] = [];
  let rest = text;
  while (rest) {
    let hit: { at: number; kind: Part['kind']; tag: string } | null = null;
    for (const [tag, kind] of TAGS) { const at = rest.indexOf(tag); if (at >= 0) { hit = { at, kind, tag }; break; } }
    if (!hit) { out.push({ kind: 'text', s: rest }); break; }
    if (hit.at) out.push({ kind: 'text', s: rest.slice(0, hit.at) });
    const end = rest.indexOf('}}', hit.at);
    const arg = rest.slice(hit.at + hit.tag.length, end < 0 ? rest.length : end);
    if (hit.kind === 'date' || hit.kind === 'time') out.push({ kind: hit.kind, arg, s: picture(arg, now) });
    else if (hit.kind === 'tab') out.push({ kind: 'tab' });
    else out.push({ kind: 'ctrl', key: arg });
    rest = end < 0 ? '' : rest.slice(end + 2);
  }
  return out;
}

/** The plain text a reader sees once every macro has run (TAB becomes a tab, Ctrl keys change style). */
export const typed = (text: string, now: Date) =>
  parts(text, now).map(p => (p.kind === 'text' || p.kind === 'date' || p.kind === 'time' ? p.s : p.kind === 'tab' ? '\t' : '')).join('');
