// How HijriDate writes a date: his eight formats, built from the 44 word pictures in HijriPlugin.dll (glyphs.json).
// ids() follows sub_104274 (the list of pictures in reading order, digits stored last-first), strip() follows
// sub_104fd4 + sub_104e5c (the list is read from its end and pasted left to right), english() follows sub_104bac.
import glyphs from './glyphs.json' with { type: 'json' };
import { HIJRI_EN, GREG_EN, BABYLONIAN_EN, DAYS_EN } from './hijri.ts';

type G = { w: number; rows: string[] };
const GLYPHS = glyphs as Record<string, G>;

export const DAY = [115, 116, 117, 118, 119, 120, 160]; // Sunday to Saturday
export const HMONTH = [145, 146, 147, 148, 149, 150, 151, 154, 155, 152, 153, 132];
export const GMONTH = [133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144];
export const DIGIT = [122, 123, 124, 125, 126, 127, 128, 129, 130, 131];
export const SP = 121, COMMA = 104, DASH = 107;

/** The eight formats, as his options list names them. */
export const FORMATS = ['dddd dd, MMMM yyyy', 'dd, MMMM yyyy', 'dddd, MMMM dd, yyyy', 'MMMM dd, yyyy', 'dddd dd-MM-yy', 'dd-MM-yy', 'dddd MM-dd-yy', 'MM-dd-yy'];
const PRINTF = ['%s %d, %s %d', '%d, %s %d', '%s, %s %d, %d', '%s %d, %d', '%s %d-%d-%d', '%d-%d-%d', '%s %d-%d-%d', '%d-%d-%d'];

export interface D { y: number; m: number; d: number; dow: number }

/** Every digit of n, last digit first, as his loop stores them (n % 10, then n / 10, until n is 0). */
const digits = (n: number) => { const out: number[] = []; for (; n > 0; n = Math.trunc(n / 10)) out.push(DIGIT[n % 10]); return out; };
const day2 = (n: number) => (n > 9 ? [DIGIT[n % 10], DIGIT[Math.trunc(n / 10)]] : [DIGIT[n % 10]]);
const two = (n: number) => [DIGIT[n % 10], DIGIT[Math.trunc(n / 10) % 10]];

/** The word pictures for one date, in reading order (right to left), each number already last-digit-first. */
export function ids(fmt: number, t: D, hijri: boolean): number[] {
  const mon = (hijri ? HMONTH : GMONTH)[t.m - 1], dn = DAY[t.dow];
  switch (fmt) {
    case 0: return [dn, SP, ...day2(t.d), COMMA, SP, mon, SP, ...digits(t.y)];
    case 1: return [...day2(t.d), COMMA, SP, mon, SP, ...digits(t.y)];
    case 2: return [dn, COMMA, SP, mon, SP, ...day2(t.d), COMMA, SP, ...digits(t.y)];
    case 3: return [mon, SP, ...day2(t.d), COMMA, SP, ...digits(t.y)];
    case 4: return [dn, SP, ...two(t.d), DASH, ...two(t.m), DASH, ...digits(t.y % 100)];
    case 5: return [...two(t.d), DASH, ...two(t.m), DASH, ...digits(t.y % 100)];
    case 6: return [dn, SP, ...two(t.m), DASH, ...two(t.d), DASH, ...digits(t.y % 100)];
    default: return [...two(t.m), DASH, ...two(t.d), DASH, ...digits(t.y % 100)];
  }
}

/** sub_104fd4 + sub_104e5c: walk the list from its end and paste each picture left to right. x is where it lands. */
export function strip(list: number[]) {
  let x = 0;
  const placed = [...list].reverse().map(id => { const g = GLYPHS[id]; const p = { id, x, w: g.w }; x += g.w; return p; });
  return { width: x, placed };
}

/** 1 where the picture has ink. */
const cache = new Map<number, boolean[][]>();
export function ink(id: number): boolean[][] {
  let rows = cache.get(id);
  if (!rows) {
    const g = GLYPHS[id];
    rows = g.rows.map(r => [...BigInt('0x' + r).toString(2).padStart(g.w, '0')].map(b => b === '1'));
    cache.set(id, rows);
  }
  return rows;
}

export const width = (id: number) => GLYPHS[id].w;

/** Draw a list onto a canvas context at (x, y) in a color, scale s. Returns the width drawn. */
export function paint(ctx: CanvasRenderingContext2D, list: number[], x: number, y: number, color: string, s = 1) {
  const { width, placed } = strip(list);
  ctx.fillStyle = color;
  for (const p of placed) {
    ink(p.id).forEach((row, ry) => row.forEach((on, rx) => { if (on) ctx.fillRect(x + (p.x + rx) * s, y + ry * s, s, s); }));
  }
  return width * s;
}

/** An SVG path for a list (for no-JS pages): one 1x1 square per inked pixel. */
export function svgPath(list: number[]) {
  const { width, placed } = strip(list);
  let d = '';
  for (const p of placed) ink(p.id).forEach((row, ry) => row.forEach((on, rx) => { if (on) d += `M${p.x + rx} ${ry}h1v1h-1z`; }));
  return { width, d };
}

/** The English line, from his printf formats and name tables. */
export function english(fmt: number, t: D, hijri: boolean, babylonian = false) {
  const mon = (hijri ? HIJRI_EN : babylonian ? BABYLONIAN_EN : GREG_EN)[t.m - 1], dn = DAYS_EN[t.dow];
  const yy = t.y % 100;
  const args: (string | number)[][] = [
    [dn, t.d, mon, t.y], [t.d, mon, t.y], [dn, mon, t.d, t.y], [mon, t.d, t.y],
    [dn, t.d, t.m, yy], [t.d, t.m, yy], [dn, t.m, t.d, yy], [t.m, t.d, yy],
  ];
  const a = [...args[fmt]];
  return PRINTF[fmt].replace(/%[sd]/g, () => String(a.shift()));
}

/** Plain-language names for each picture, for screen readers and labels. */
export function label(id: number): string {
  if (id === SP) return 'space';
  if (id === COMMA) return 'comma ،';
  if (id === DASH) return 'dash';
  const di = DIGIT.indexOf(id); if (di >= 0) return `digit ${'٠١٢٣٤٥٦٧٨٩'[di]} (${di})`;
  const da = DAY.indexOf(id); if (da >= 0) return ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][da] + ` (${DAYS_EN[da]})`;
  const hm = HMONTH.indexOf(id); if (hm >= 0) return HIJRI_AR[hm] + ` (${HIJRI_EN[hm]})`;
  const gm = GMONTH.indexOf(id); if (gm >= 0) return GREG_AR[gm] + ` (${GREG_EN[gm]})`;
  return String(id);
}

export const HIJRI_AR = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
export const GREG_AR = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

/** The same line as Unicode text in reading order (number runs put back first-digit-first), for screen readers. */
export function arText(list: number[]): string {
  const word = (id: number) => {
    if (id === SP) return ' ';
    if (id === COMMA) return '،';
    if (id === DASH) return '-';
    const di = DIGIT.indexOf(id); if (di >= 0) return '٠١٢٣٤٥٦٧٨٩'[di];
    const da = DAY.indexOf(id); if (da >= 0) return ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][da];
    const hm = HMONTH.indexOf(id); if (hm >= 0) return HIJRI_AR[hm];
    return GREG_AR[GMONTH.indexOf(id)] ?? '';
  };
  let out = '', run = '';
  for (const id of list) {
    if (DIGIT.includes(id)) { run = word(id) + run; continue; }
    out += run + word(id); run = '';
  }
  return out + run;
}
