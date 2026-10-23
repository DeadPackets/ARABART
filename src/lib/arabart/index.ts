// ARABART 4.15 (Yasser Awad, Port Said, 1993), ported line by line from his 8086 code.
// Pixel-exact against the real binary: research/artifacts/arabart/port/verify-report.md

/** Bytes 0682-7421 of his ARABART.EXE: keyboard table, font table, 5 fonts. public/arabart/fonts.bin */
export type Bin = Uint8Array;

/** Indexed pixels. data holds VGA colors 0-15, 255 = empty. (x, y) is the pen start: right edge, baseline. */
export interface Bitmap { width: number; height: number; data: Uint8Array; x: number; y: number; advance: number }

export type Form = 'isolated' | 'final' | 'initial' | 'medial';

/** One shaping decision: letter i meets the next letter. code/nextCode are his table codes (bit 7 = reaches left,
 *  bit 6 = reaches right); out is letter i's final glyph code. The first letter always lets go on its right. */
export interface Step { i: number; code: number; next: number; nextCode: number; join: boolean; out: number; form: Form }

export interface Options {
  font?: number;      // 1-5
  color?: number;     // text color 0-15
  shadow?: number;    // second color for the 3d, shadow and outline modes
  mode?: 'plain' | '3d' | 'shadow' | 'outline'; // 3d = his function 8; shadow and outline = his SUN.EXE helpers
  bold?: boolean; italic?: boolean; underline?: boolean; double?: boolean; // start state; @ ! # $ toggle, * resets
  x?: number;         // pen x on his 640-pixel screen: stops at the first glyph that would cross the left edge
  trace?: Step[];     // filled with every shaping decision
}

const BASE = 0x682;
const BOLD = 0xc8, ITALIC = 0xc9, UNDER = 0xca, DOUBLE = 0xcb, RESET = 0xd0;
const isStyle = (c: number) => (c >= BOLD && c <= DOUBLE) || c === RESET;
const word = (b: Bin, a: number) => b[a - BASE] | (b[a - BASE + 1] << 8);
const FORMS: Form[] = ['isolated', 'final', 'initial', 'medial'];

export async function load(url: string): Promise<Bin> {
  return new Uint8Array(await (await fetch(url)).arrayBuffer());
}

/** Keys typed on a US keyboard -> glyph codes, through his table at 0682. Keys with no glyph draw a blank (03). */
export function translate(bin: Bin, keys: string): number[] {
  return [...keys.replace(/[^\x20-\x7f]/g, '')].map(k => bin[k.charCodeAt(0) - 0x20] || 3);
}

/** His joining pass (022F-02BB): two neighbors stay joined only if both reach. */
export function shape(codes: number[], trace?: Step[]): number[] {
  const c = [...codes];
  const nextLetter = (i: number) => { while (++i < c.length && isStyle(c[i])); return i; };
  const first = nextLetter(-1);
  if (first < c.length) c[first] &= 0xbf;
  for (let i = first; i < c.length; i = nextLetter(i)) {
    const j = nextLetter(i), join = !!(c[i] & 0x80 && (c[j] ?? 0) & 0x40);
    if (!join) { c[i] &= 0x7f; if (j < c.length) c[j] &= 0xbf; }
    trace?.push({ i, code: codes[i], next: j < c.length ? j : -1, nextCode: codes[j] ?? 0, join, out: c[i], form: FORMS[c[i] >> 6] });
  }
  return c;
}

/** His draw loop (02BD-055A) over already shaped codes, with every mode and style. */
export function draw(bin: Bin, codes: number[], o: Options = {}): Bitmap {
  const f = word(bin, 0x6e8 + 2 * (Math.min(5, Math.max(1, o.font ?? 1)) - 1));
  const s = word(bin, f + 4), h = word(bin, f + 2);
  const color = (o.color ?? 1) & 15, sh = (o.shadow ?? 14) & 15, x0 = o.x ?? 0; // defaults: his install values
  const passes = o.mode === '3d' ? [[-s, -s, sh], [0, 0, color]]
    : o.mode === 'shadow' ? [[6, 6, sh], [0, 0, color]]
    : o.mode === 'outline' ? [[-1, -1, sh], [1, -1, sh], [-1, 1, sh], [1, 1, sh], [0, 0, color]]
    : [[0, 0, color]];
  const px: number[] = [];
  let x = 0;
  for (const [dx, dy, col] of passes) {
    let bold = +!!o.bold, italic = +!!o.italic, under = +!!o.underline, dbl = +!!o.double;
    const y = dy;
    x = x0 + dx;
    for (const code of codes) {
      if (code === BOLD) bold ^= 1;
      else if (code === ITALIC) italic ^= 1;
      else if (code === UNDER) under ^= 1;
      else if (code === DOUBLE) dbl ^= 1;
      else if (code === RESET) bold = italic = under = dbl = 0;
      if (isStyle(code)) continue;
      const k = dbl + 1, g = word(bin, f + 2 * code), w = (bin[g - BASE] + bold) * k;
      if (o.x !== undefined && (x - w < 0 || x - w >= 640)) break;
      const put = (X: number, Y: number) => { px.push(X, Y, col); if (dbl) px.push(X, Y - 1, col); };
      if (under) for (let i = 0; i < w; i++) put(x - i, y);
      if (code !== 3) {
        let p = g + 1 - BASE, row = y - bin[p] * k, xr = x - italic * (bin[p] + 2);
        for (let b; (b = bin[++p]) <= 0xef;) {
          if (b === 0xef) { row -= k; xr -= italic; continue; }
          for (let i = 0, n = (bin[++p] + bold) * k, from = xr - b * k; i < n; i++) put(from - i, row);
        }
      }
      x -= w;
    }
  }
  let minX = x + 1, maxX = x0, minY = 1 - h, maxY = 0;
  for (let i = 0; i < px.length; i += 3) {
    minX = Math.min(minX, px[i]); maxX = Math.max(maxX, px[i]);
    minY = Math.min(minY, px[i + 1]); maxY = Math.max(maxY, px[i + 1]);
  }
  const width = Math.max(0, maxX - minX + 1), height = maxY - minY + 1, data = new Uint8Array(width * height).fill(255);
  for (let i = 0; i < px.length; i += 3) data[(px[i + 1] - minY) * width + px[i] - minX] = px[i + 2];
  return { width, height, data, x: x0 - minX, y: -minY, advance: x0 - x };
}

/** Keys -> shaped -> drawn. keys is what a 1993 programmer typed: ASCII on a US keyboard in the Arabic layout. */
export function render(bin: Bin, keys: string, o: Options = {}): Bitmap {
  return draw(bin, shape(translate(bin, keys), o.trace), o);
}

export const PALETTE = [0x000000, 0x0000aa, 0x00aa00, 0x00aaaa, 0xaa0000, 0xaa00aa, 0xaa5500, 0xaaaaaa,
  0x555555, 0x5555ff, 0x55ff55, 0x55ffff, 0xff5555, 0xff55ff, 0xffff55, 0xffffff];

/** Paints a Bitmap with whole device pixels per ARABART pixel, so it stays sharp at any devicePixelRatio. */
export function paint(canvas: HTMLCanvasElement, img: Bitmap, scale = 1, background?: number) {
  const dpr = globalThis.devicePixelRatio || 1, n = Math.max(1, Math.round(scale * dpr));
  const W = img.width * n, H = img.height * n;
  canvas.width = W; canvas.height = H;
  canvas.style.width = `${W / dpr}px`; canvas.style.height = `${H / dpr}px`;
  canvas.style.imageRendering = 'pixelated';
  if (!W || !H) return;
  const ctx = canvas.getContext('2d')!, out = ctx.createImageData(W, H), d = new Uint32Array(out.data.buffer);
  const abgr = (rgb: number) => 0xff000000 | ((rgb & 0xff) << 16) | (rgb & 0xff00) | (rgb >> 16);
  const bg = background === undefined ? 0 : abgr(PALETTE[background]);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const v = img.data[((y / n) | 0) * img.width + ((x / n) | 0)];
    d[y * W + x] = v === 255 ? bg : abgr(PALETTE[v]);
  }
  ctx.putImageData(out, 0, 0);
}

// Input. ARABART reads ASCII from a US keyboard, so the Arabic layout lives in the keys, not in Unicode.
const PUNCT: Record<string, string> = { Backquote: '`~', Minus: '-_', Equal: '=+', BracketLeft: '[{', BracketRight: ']}',
  Backslash: '\\|', Semicolon: ';:', Quote: `'"`, Comma: ',<', Period: '.>', Slash: '/?', Space: '  ' };
const DIGITS = '0)1!2@3#4$5%6^7&8*9(';

/** A keydown on any physical keyboard -> the ASCII key a 1993 US keyboard sent from that spot ('' = not a typing key). */
export function fromKey(e: { code: string; shiftKey: boolean; ctrlKey?: boolean; altKey?: boolean; metaKey?: boolean }): string {
  if (e.ctrlKey || e.altKey || e.metaKey) return '';
  const { code } = e, sh = +e.shiftKey;
  if (/^Key[A-Z]$/.test(code)) return sh ? code[3] : code[3].toLowerCase();
  if (/^Digit\d$/.test(code)) return DIGITS[DIGITS.indexOf(code[5]) + sh];
  if (/^Numpad\d$/.test(code)) return code[6];
  return PUNCT[code]?.[sh] ?? '';
}

const KEYS = "hfje[po]`v.sawq'/uytr;glki,dnmxzcHNJK?ILO<>{}+-= ?";
const CHARS = 'ابتثجحخدذرزسشصضطظعغفقكلمنهويىةءئؤأآـ،؟÷/×,.<>+-= ?';
const LAMALEF: Record<string, string> = { b: 'ا', G: 'أ', B: 'آ' };
const NUMS = '0123456789٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹';
// No bidi in ARABART: number runs are stored reversed, as in his demo ('51<4' shows ٤,١٥)
const flipNumbers = (s: string) => s.replace(/\d[\d<>]*\d|\d/g, r => [...r].reverse().join(''));

/** Unicode Arabic (keyboard, phone, paste) -> ARABART keys. Lam + alef becomes the lam-alef key. Undrawable text is skipped. */
export function fromUnicode(text: string): string {
  const t = text.normalize('NFKC').replace(/ل([اأآ])/g, (_, a) => '\0' + 'bGB'['اأآ'.indexOf(a)]);
  let out = '';
  for (let i = 0; i < t.length; i++) {
    const ch = t[i], n = NUMS.indexOf(ch), k = CHARS.indexOf(ch);
    if (ch === '\0') out += t[++i];
    else if (n >= 0) out += n % 10;
    else if (k >= 0) out += KEYS[k];
    else if (ch === '٫') out += '<';
    else if ('@!#$*\n'.includes(ch)) out += ch;
  }
  return flipNumbers(out);
}

/** ARABART keys -> Unicode Arabic in logical order, for screen readers and copy. Style keys are dropped. */
export function toUnicode(keys: string): string {
  return [...flipNumbers(keys)].map(k => LAMALEF[k] ? 'ل' + LAMALEF[k] : k === '~' ? 'ا' : /\d/.test(k) ? NUMS[+k + 10]
    : k === '\n' ? k : CHARS[KEYS.indexOf(k)] ?? '').join('');
}
