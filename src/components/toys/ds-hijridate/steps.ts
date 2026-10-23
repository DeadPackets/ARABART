// The CodeSteppers of the HijriDate page: lines from HijriPlugin.dll 1.5 (research/dinarsoft/re/hijridate/), the same
// routine in C, and the steps. Numbers in the steps come from hijri.ts, ar.ts and rc4.ts, so they match the visuals.
import { monthStart } from './hijri.ts';
import { ids, strip, label } from './ar.ts';
import { trace } from './rc4.ts';

type Line = { off?: string; label?: string; code: string; note?: string };
type Step = { a: number; c: number; say: string; [k: string]: unknown };

// ---------- The Mecca rule: visible(), 0x10369C ----------
const nm = monthStart(1320); // new moon 1320: 22 September 2006
const frac = nm.frac, mecca = nm.mecca!;
const f3 = (x: number) => x.toFixed(3);

export const MECCA = {
  minutes: Math.round(mecca * 60) % 1440,
  dates: ['22 Sep 2006', '23 Sep 2006', '24 Sep 2006'] as [string, string, string],
  asm: [
    { off: '1036A8', code: 'bl   tmoonphase', note: 'new moon n: when?' },
    { off: '1036BC', code: 'str  r4,[r6]', note: 'keep it for later' },
    { off: '1036F8', code: 'mov  pc,fp', note: '__subd: drop whole days' },
    { off: '103738', code: 'mov  pc,fp', note: '__led: ≤ 0.5?' },
    { off: '103740', code: 'beq  103788', note: 'no: find the hour' },
    { off: '103764', code: 'mov  pc,fp', note: '__addd: + 1 day' },
    { off: '1037B4', code: 'mov  pc,fp', note: '__subd: − 0.5' },
    { off: '1037D0', code: 'mov  pc,fp', note: '__muld: × 24' },
    { off: '1037EC', code: 'mov  pc,fp', note: '__addd: + 3 hours' },
    { off: '103828', code: 'mov  pc,fp', note: '__gtd: after 6:00?' },
    { off: '103850', code: 'movne pc,fp', note: '__addd: + 1 day' },
    { off: '103854', code: 'pop  {r4,r5,r6,fp,pc}', note: 'return the start' },
  ] as Line[],
  c: [
    { code: 'double visible(int n, double *nm) {' },
    { code: '  double jd = tmoonphase(n, 0);', note: 'UT' },
    { code: '  *nm = jd;' },
    { code: '  float f = jd - (int)jd;', note: '0 = noon' },
    { code: '  if (f <= 0.5)' },
    { code: '    return jd + 1;' },
    { code: '  float h = (f - 0.5) * 24 + 3;' },
    { code: '  if (h > 6)', note: 'too young' },
    { code: '    return jd + 1;' },
    { code: '  return jd;', note: 'seen' },
    { code: '}' },
  ] as Line[],
  steps: [
    { a: 0, c: 1, show: 0, say: `Ask for new moon 1320. The answer is Julian day ${nm.jd.toFixed(3)}: 22 September 2006 at 11:43, London time.`, regs: [{ name: 'jd', value: nm.jd.toFixed(3), means: 'new moon 1320, in days' }] },
    { a: 1, c: 2, show: 0, say: 'It keeps the exact moment too. The settings pages use it.' },
    { a: 2, c: 3, show: 1, say: `Drop the whole days. ${f3(frac)} of a day is left. Julian days start at noon, so that is ${(frac * 24).toFixed(1)} hours after noon.`, regs: [{ name: 'frac', value: f3(frac), means: 'part of the day' }] },
    { a: 3, c: 4, show: 1, say: 'Is it 0.5 or less, between noon and midnight in London? No.' },
    { a: 4, c: 6, show: 2, say: 'So it turns it into a clock time. Mecca is 3 hours ahead of London.' },
    { a: 8, c: 6, show: 2, say: `(${f3(frac)} − 0.5) × 24 + 3 = ${mecca.toFixed(2)}: born at 14:43 in Mecca.`, regs: [{ name: 'hour', value: mecca.toFixed(2), means: '14:43 in Mecca' }] },
    { a: 9, c: 7, show: 3, say: 'Is that after 6 in the morning? Yes. A moon born that late is too thin to see at sunset the same day.' },
    { a: 10, c: 8, show: 4, say: 'So the month counts from one day later. The crescent shows on the evening of 23 September.' },
    { a: 11, c: 8, show: 5, say: 'And 24 September 2006 is day 1 of Ramadan 1427. Drag the birth time to try any moment.' },
  ] as Step[],
};

// ---------- The word strip: 0x104FD4 and 0x104E5C ----------
const LIST = ids(0, { y: 1427, m: 9, d: 2, dow: 0 }, true);
const S = strip(LIST), N = LIST.length;
const name = (id: number) => label(id).replace(/ \(.*\)/, '');

export const STRIP = {
  asm: [
    { off: '104FFC', code: 'ldr  r3,[r0,#4]!', note: 'count the words' },
    { off: '105014', code: 'bl   operator new', note: 'a slot per word' },
    { off: '105038', code: 'ldrh r1,[r7,#-4]!', note: 'next ID, from the end' },
    { off: '105050', code: 'bl   LoadImageW', note: 'load its picture' },
    { off: '105070', code: 'bl   sub_104E5C', note: 'Paste: join them' },
    { off: '105088', code: 'bl   DeleteObject', note: 'free the pieces' },
    { off: '104EC4', code: 'bl   GetObjectW', note: 'Paste: measure each' },
    { off: '104ED4', code: 'add  sl,r3,sl', note: 'add up the widths' },
    { off: '104F10', code: 'bl   CreateBitmap', note: 'one blank strip' },
    { off: '104F4C', code: 'bl   SelectObject', note: 'pick up a word' },
    { off: '104F80', code: 'bl   BitBlt', note: 'copy it in at x' },
    { off: '104F90', code: 'add  sb,r3,sb', note: 'x += its width' },
    { off: '104FD0', code: 'pop  {r4-fp,pc}', note: 'return the strip' },
  ] as Line[],
  c: [
    { code: 'HBITMAP MakeStrip(DWORD *ids) {' },
    { code: '  for (n = 0; ids[n]; n++) ;' },
    { code: '  pic = new HBITMAP[n + 1];' },
    { code: '  for (k = 0; k < n; k++)', note: 'last first' },
    { code: '    pic[k] = LoadImage(hInst,' },
    { code: '               ids[n - 1 - k], ...);' },
    { code: '  pic[n] = 0;' },
    { code: '  strip = Paste(pic);' },
    { code: '  for (k = 0; k < n; k++)' },
    { code: '    DeleteObject(pic[k]);' },
    { code: '  return strip;' },
    { code: '}' },
    { code: 'HBITMAP Paste(HBITMAP *pic) {' },
    { code: '  for (n = w = 0; pic[n]; n++) {' },
    { code: '    GetObject(pic[n], 24, &bm[n]);' },
    { code: '    w += bm[n].bmWidth;' },
    { code: '  }' },
    { code: '  strip = CreateBitmap(w, 16, 1, 1, 0);' },
    { code: '  for (k = x = 0; k < n; k++) {' },
    { code: '    SelectObject(from, pic[k]);' },
    { code: '    BitBlt(to, x, 0, bm[k].bmWidth, 16,' },
    { code: '           from, 0, 0, SRCCOPY);' },
    { code: '    x += bm[k].bmWidth;' },
    { code: '  }' },
    { code: '  return strip;' },
    { code: '}' },
  ] as Line[],
  steps: [
    { a: 0, c: 1, phase: 'list', k: N, say: `The list for الأحد ٢، رمضان ١٤٢٧ has ${N} words in reading order: Sunday, a space, 2, a comma, a space, Ramadan, a space, then 1427 with its digits last first, 7 2 4 1. A zero ends it.` },
    { a: 1, c: 2, phase: 'list', k: N, say: `Room for ${N} pictures.` },
    { a: 3, c: 4, phase: 'load', k: 1, say: `It reads the list from its end. The last entry is the digit 1, so the first picture loaded is the 1 of 1427.` },
    { a: 3, c: 4, phase: 'load', k: 2, say: 'Then the 4. Each picture comes out of the DLL’s own resources.' },
    { a: 3, c: 4, phase: 'load', k: N, say: `…and last of all ${name(LIST[0])}, Sunday, the first word an Arabic reader sees.` },
    { a: 6, c: 14, phase: 'measure', k: N, say: 'Paste measures every picture.' },
    { a: 7, c: 15, phase: 'measure', k: N, say: `The widths add up to ${S.width} pixels.` },
    { a: 8, c: 17, phase: 'measure', k: N, say: `One blank strip, ${S.width} × 16, one bit a pixel.` },
    { a: 10, c: 20, phase: 'paste', k: 1, say: 'The 1 goes in at x = 0, the far left.' },
    { a: 11, c: 22, phase: 'paste', k: 2, say: `x moves right by its width, ${S.placed[0].w} pixels, and the 4 goes in next.` },
    { a: 10, c: 20, phase: 'paste', k: N, say: `Sunday goes in last, at x = ${S.placed[N - 1].x}: the far right, where Arabic starts. 1427 reads left to right, the words right to left.` },
    { a: 12, c: 24, phase: 'done', k: N, say: 'One picture holds the whole date, ready to draw in any color.' },
  ] as Step[],
};

// ---------- Ink in the theme's color: 0x105160 and 0x105384 ----------
export const INK = {
  asm: [
    { off: '105180', code: 'cmp  r3,sl', note: 'same color as before?' },
    { off: '105190', code: 'beq  105378', note: 'yes: copy is ready' },
    { off: '10520C', code: 'bl   CreateBitmap', note: 'a color picture' },
    { off: '10527C', code: 'bl   CreateSolidBrush', note: 'ink-color brush' },
    { off: '105298', code: 'bl   FillRect', note: 'all ink color' },
    { off: '1052BC', code: 'bl   FillRect', note: 'another, all white' },
    { off: '1052F8', code: 'bl   BitBlt', note: 'SRCINVERT: XOR' },
    { off: '10532C', code: 'bl   BitBlt', note: 'SRCAND: AND' },
    { off: '1053A0', code: 'bl   GetTextColor', note: 'the theme’s color' },
    { off: '1053AC', code: 'bl   sub_105160', note: 'make the copy' },
    { off: '105460', code: 'bl   BitBlt', note: 'SRCAND: screen AND' },
    { off: '1054AC', code: 'bl   BitBlt', note: 'SRCPAINT: screen OR' },
  ] as Line[],
  c: [
    { code: 'BOOL Colorize(Word *w, COLORREF ink) {' },
    { code: '  if (ink == w->ink && !w->dirty)' },
    { code: '    return TRUE;', note: 'ready' },
    { code: '  w->color = CreateBitmap(cx,cy,1,24,0);' },
    { code: '  tmp = CreateBitmap(cx, cy, 1, 24, 0);' },
    { code: '  b = CreateSolidBrush(ink);' },
    { code: '  FillRect(w->color, &r, b);' },
    { code: '  b = CreateSolidBrush(0xFFFFFF);', note: 'white' },
    { code: '  FillRect(tmp, &r, b);' },
    { code: '  BitBlt(tmp, 0, 0, cx, cy,' },
    { code: '         w->word, 0, 0, SRCINVERT);' },
    { code: '  BitBlt(w->color, 0, 0, cx, cy,' },
    { code: '         tmp, 0, 0, SRCAND);' },
    { code: '  w->ink = ink;' },
    { code: '  return TRUE;' },
    { code: '}' },
    { code: 'void Draw(Word *w, HDC dc, int x, int y) {' },
    { code: '  Colorize(w, GetTextColor(dc));' },
    { code: '  BitBlt(dc, x, y, cx, cy,' },
    { code: '         w->word, 0, 0, SRCAND);' },
    { code: '  BitBlt(dc, x, y, cx, cy,' },
    { code: '         w->color, 0, 0, SRCPAINT);' },
    { code: '}' },
  ] as Line[],
  steps: [
    { a: 8, c: 17, phase: 0, say: 'The Today screen hands HijriDate its text color: white on the blue theme, black on a light one.' },
    { a: 0, c: 1, phase: 0, say: 'Is there a copy of the word in that color already? Not the first time.' },
    { a: 2, c: 3, phase: 0, say: 'So it makes a full-color picture the size of the word…' },
    { a: 4, c: 6, phase: 0, say: '…and fills it with the ink color.' },
    { a: 5, c: 8, phase: 0, say: 'A second picture, all white.' },
    { a: 6, c: 9, phase: 0, say: 'White XOR the word. Black ink XOR white is white; white paper XOR white is black. Ink and paper swap.' },
    { a: 7, c: 11, phase: 1, say: 'The color AND that. On the white ink the color comes through; on the black paper nothing does. Picture 2: colored ink on black.' },
    { a: 10, c: 18, phase: 2, say: 'Now the screen itself. Screen AND word: white paper leaves the wallpaper as it was, black ink punches a black hole.' },
    { a: 11, c: 20, phase: 3, say: 'Screen OR the colored copy. Black adds nothing, so only the holes fill, with color. The word sits on the wallpaper in the theme’s own color.' },
    { a: 1, c: 2, phase: 3, say: 'The next time, with the same color, it skips straight to the two screen steps.' },
  ] as Step[],
};

// ---------- The key: 0x1056E0 (the same routine sits at 0x18098 in TapText.exe) ----------
export const KEY_CODE = '8PGQ3T7QDT8TCL7N'; // pocketPcCode() of a made-up device ID
const grp = (k: string) => k.match(/.{1,4}/g)!.join(' - ');
const hex = (n: number) => n.toString(16).toUpperCase();

/** The key routine stepped over one code. base: its address in the program; words: how the word is named. */
export function keyStepper(code: string, pass: string, base: number, app: string, end: string) {
  const T = trace(code, pass), L0 = T.letters[0], L1 = T.letters[1];
  const at = (hd: number) => hex(hd - 0x1056e0 + base);
  return {
    key: T.key,
    asm: [
      { off: at(0x1056F0), code: 'bl   wcslen', note: 'length of the code' },
      { off: at(0x105738), code: 'strh r3,[r1]', note: 'S[i] = i' },
      { off: at(0x105774), code: 'strh r3,[r1]', note: 'K: the word, repeated' },
      { off: at(0x1057A4), code: 'add  r1,r3,r1', note: 'j += S[i] + K[i]' },
      { off: at(0x1057B4), code: 'mov  pc,r3', note: '__rt_udiv: mod 120' },
      { off: at(0x1057CC), code: 'strh r7,[r0]', note: 'swap S[i], S[j]' },
      { off: at(0x1057EC), label: 'next', code: 'add  r1,r7,#1', note: 'i += 1' },
      { off: at(0x10581C), code: 'add  r1,r8,r5', note: 'j += S[i]' },
      { off: at(0x105840), code: 'strh r5,[r0]', note: 'swap them' },
      { off: at(0x10584C), code: 'add  r1,r3,r2,lsr #16', note: 't = S[i] + S[j]' },
      { off: at(0x105874), code: 'eor  r1,r2,r3', note: 'char XOR S[t]' },
      { off: at(0x105884), code: 'mov  pc,r3', note: '__rt_udiv: mod 25' },
      { off: at(0x105890), code: 'add  r0,r3,#0x41', note: "+ 'A'" },
      { off: at(0x1058A0), code: 'cmp  r3,#0x4f', note: "skip 'O'" },
      { off: at(0x1058B8), code: 'bhi  next', note: 'next character' },
    ] as Line[],
    c: [
      { code: 'void Key(WCHAR *code, WCHAR *word) {' },
      { code: '  WORD S[120], K[120]; n = wcslen(code);' },
      { code: '  for (i = 0; i < 120; i++) S[i] = i;' },
      { code: '  for (i = 0; i < 120; i++)' },
      { code: '    K[i] = word[i % wcslen(word)];' },
      { code: '  for (i = j = 0; i < 120; i++) {' },
      { code: '    j = (j + S[i] + K[i]) % 120;' },
      { code: '    swap(&S[i], &S[j]);' },
      { code: '  }' },
      { code: '  for (i = j = 0; n--; code++) {' },
      { code: '    i = (i + 1) % 120;' },
      { code: '    j = (j + S[i]) % 120;' },
      { code: '    swap(&S[i], &S[j]);' },
      { code: '    t = (S[i] + S[j]) % 120;' },
      { code: "    c = 'A' + (*code ^ S[t]) % 25;" },
      { code: "    *code = c >= 'O' ? c + 1 : c;" },
      { code: '  }' },
      { code: '}' },
    ] as Line[],
    steps: [
      { a: 1, c: 2, k: 0, sub: 'fill', say: '120 numbers in a row, 0 to 119.' },
      { a: 2, c: 4, k: 0, sub: 'fill', say: `Beside them, the word ${app} signs with: ${pass}, ${pass}, ${pass}, over and over. Every DinarSoft app has its own word.` },
      { a: 5, c: 7, k: 0, sub: 'ksa', say: 'One pass down the row, swapping each number with one the word picks. Now the order depends on the word and nothing else.' },
      { a: 6, c: 10, k: 0, sub: 'i', say: `The first character of the code is “${L0.ch}”. i steps to ${L0.i}.` },
      { a: 7, c: 11, k: 0, sub: 'j', say: `j jumps by the number at ${L0.i}, ${L0.sj}, and lands on ${L0.j}.` },
      { a: 8, c: 12, k: 0, sub: 'swap', say: 'Those two numbers swap places. The table keeps changing as it goes.' },
      { a: 9, c: 13, k: 0, sub: 't', say: `Add them: ${L0.si} + ${L0.sj} = ${L0.si + L0.sj}, and ${L0.ti} after going round 120. The number at ${L0.ti} is ${L0.t}.` },
      { a: 12, c: 14, k: 0, sub: 'c', say: `“${L0.ch}” is ${L0.ch.charCodeAt(0)}. ${L0.ch.charCodeAt(0)} XOR ${L0.t} = ${L0.x}, and ${L0.x} mod 25 = ${L0.m}. A + ${L0.m} = ${L0.out}.` },
      { a: 14, c: 9, k: 1, sub: 'c', say: `The next character, “${L1.ch}”, comes out as ${L1.out}.` },
      { a: 14, c: 17, k: 16, sub: 'done', say: `All 16: ${grp(T.key)}. ${end}` },
    ] as Step[],
  };
}

export const KEY = keyStepper(KEY_CODE, 'Hijri', 0x1056e0, 'HijriDate', 'On that one Pocket PC, this key unlocks HijriDate.');
