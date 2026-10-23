// The Brave Sun's screens, rebuilt from his own code (SUN.EXE, September 1993): his 16 colors, the drawing calls he
// made with their exact coordinates, his shadow and outline helpers on ARABART, the orbit loop and the sun he drew
// in the dark. Offsets in comments are segment:offset in his unpacked program. Used by the server and the toys.
import { draw, shape, translate, type Bin } from '../../../../lib/arabart/index.ts';
import { dac } from '../ega.ts';

export const W = 640, H = 480;
export type RGB6 = [number, number, number];

/** His colors, set at the start of every page (04DA:023B), as VGA 0-63 values. */
export const PAL: RGB6[] = [[0, 0, 0], [0, 0, 42], [0, 42, 0], [15, 40, 49], [42, 0, 0], [42, 0, 42], [42, 32, 0], [48, 48, 48],
  [15, 33, 40], [0, 0, 63], [0, 63, 0], [29, 47, 54], [63, 0, 0], [63, 32, 63], [63, 63, 0], [63, 63, 63]];
export const rgb = (p: RGB6[]) => p.map(([r, g, b]) => dac(r, g, b));

/** A 640x480, 16-color VGA screen with the Borland graphics calls he used. */
export class Scr {
  px = new Uint8Array(W * H);
  pal: RGB6[] = PAL.map(c => [...c] as RGB6);
  pset(x: number, y: number, c: number) { if (x >= 0 && x < W && y >= 0 && y < H) this.px[y * W + x] = c; }
  bar(x1: number, y1: number, x2: number, y2: number, c: number) {
    for (let y = Math.max(0, y1); y <= Math.min(H - 1, y2); y++) this.px.fill(c, y * W + Math.max(0, x1), y * W + Math.min(W - 1, x2) + 1);
  }
  line(x1: number, y1: number, x2: number, y2: number, c: number) {
    const dx = Math.abs(x2 - x1), dy = -Math.abs(y2 - y1), sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
    for (let e = dx + dy; ; ) {
      this.pset(x1, y1, c);
      if (x1 === x2 && y1 === y2) break;
      const e2 = 2 * e;
      if (e2 >= dy) { e += dy; x1 += sx; }
      if (e2 <= dx) { e += dx; y1 += sy; }
    }
  }
  /** fillellipse(x, y, r, r) with color and fill the same: a solid disc. */
  disc(cx: number, cy: number, r: number, c: number) {
    for (let x = 0, y = r, d = 1 - r; x <= y; x++) {
      this.bar(cx - y, cy + x, cx + y, cy + x, c); this.bar(cx - y, cy - x, cx + y, cy - x, c);
      this.bar(cx - x, cy + y, cx + x, cy + y, c); this.bar(cx - x, cy - y, cx + x, cy - y, c);
      if (d < 0) d += 2 * x + 3; else { d += 2 * (x - y) + 5; y--; }
    }
  }
  circle(cx: number, cy: number, r: number, c: number) {
    for (let x = 0, y = r, d = 1 - r; x <= y; x++) {
      for (const [a, b] of [[x, y], [y, x], [-x, y], [-y, x], [x, -y], [y, -x], [-x, -y], [-y, -x]]) this.pset(cx + a, cy + b, c);
      if (d < 0) d += 2 * x + 3; else { d += 2 * (x - y) + 5; y--; }
    }
  }
  /** 04DA:039D raised edge, n lines: light top and left, dark bottom and right, inset (x, y) from the screen edges. */
  raised(x: number, y: number, n: number, lo = 11, hi = 8) {
    for (let i = 0; i < n; i++) { this.line(x + i, y + i, x + i, 479 - y - i, lo); this.line(x + i, y + i, 639 - x - i, y + i, lo); }
    for (let i = 0; i < n; i++) { this.line(639 - x - i, 479 - y - i, x + i, 479 - y - i, hi); this.line(639 - x - i, 479 - y - i, 639 - x - i, y + i, hi); }
  }
  /** 04DA:047B sunken edge: the same with the colors swapped. */
  sunken(x: number, y: number, n: number) { this.raised(x, y, n, 8, 11); }
  /** 04DA:0610 sunken rectangle, n + 1 lines. */
  inset(x1: number, y1: number, x2: number, y2: number, n: number, a = 8, b = 11) {
    for (let i = 0; i <= n; i++) { this.line(x1 + i, y1 + i, x1 + i, y2 - i, a); this.line(x1 + i, y1 + i, x2 - i, y1 + i, a); }
    for (let i = 0; i <= n; i++) { this.line(x2 - i, y2 - i, x1 + i, y2 - i, b); this.line(x2 - i, y2 - i, x2 - i, y1 + i, b); }
  }
  /** 04DA:0599 raised rectangle (his menu highlight). */
  outset(x1: number, y1: number, x2: number, y2: number, n: number) { this.inset(x1, y1, x2, y2, n, 11, 8); }
  /** 04DA:06C7 his card: a blue-gray panel with a raised edge and an engraved inner frame. */
  panel(x: number, y: number) {
    this.bar(x, y, 639 - x, 479 - y, 3);
    this.raised(x, y, 3); this.sunken(x + 15, y + 15, 1); this.raised(x + 16, y + 16, 1);
  }
  /** One ARAB-ART draw through his binding (04B6:00F5): x is the right edge, y the top of the line. */
  text(bin: Bin, keys: string, x: number, y: number, font: number, color: number) {
    const img = draw(bin, shape(translate(bin, keys)), { font, color, x });
    const bottom = y + lineHeight(bin, keys, font), left = x - img.x, top = bottom - img.y;
    for (let r = 0; r < img.height; r++) for (let c = 0; c < img.width; c++) {
      const v = img.data[r * img.width + c];
      if (v !== 255) this.pset(left + c, top + r, v);
    }
  }
  /** The colors as 24-bit values, for a canvas or a PNG. */
  rgb() { return rgb(this.pal); }
}

const word = (bin: Bin, a: number) => bin[a - 0x682] | (bin[a - 0x682 + 1] << 8);
/** His binding asks ARAB-ART for the font's line height (function 04) and doubles it for every $ in the text (04B6:009F). */
export function lineHeight(bin: Bin, keys: string, font: number) {
  const f = word(bin, 0x6e8 + 2 * (font - 1));
  return word(bin, f + 2) * 2 ** (keys.split('$').length - 1);
}

/** One draw call of an effect: offset and color. */
export interface Pass { dx: number; dy: number; color: number }
export type Fx = 'plain' | 'shadow' | 'outline' | 'title';
/** His helpers in 04B6: shadow_text (0163) draws in dark color 8, 6 pixels down and right, then the text. outline_text
 *  (01B4) draws four copies one pixel off on the diagonals, then the middle. His section titles use both, one after the other. */
export function passes(fx: Fx, color: number, edge = 0): Pass[] {
  const shadow = [{ dx: 6, dy: 6, color: 8 }, { dx: 0, dy: 0, color: fx === 'title' ? edge : color }];
  const outline = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy]) => ({ dx, dy, color: edge })).concat({ dx: 0, dy: 0, color });
  return fx === 'plain' ? [{ dx: 0, dy: 0, color }] : fx === 'shadow' ? shadow : fx === 'outline' ? outline : [...shadow, ...outline];
}

// The solar system page (06D2:0A35). Sizes, places and colors are his; the four years are read from his program.
export const SUN_AT = [165, 180] as const;
export const BOX = [30, 82, 300, 275] as const;
export interface Planet { id: string; name: string; R: number; r: number; x0: number; start: number; color: number; w: number }
/** In the order his loop stamps them. x = x0 + R cos(angle), y = 175 + r sin(angle), the picture's top left corner. */
export const PLANETS: Planet[] = [
  { id: 'mars', name: 'Mars', R: 80, r: 70, x0: 160, start: 22 * 1.2, color: 9, w: 11 },
  { id: 'earth', name: 'Earth', R: 60, r: 50, x0: 160, start: 0, color: 9, w: 13 },
  { id: 'venus', name: 'Venus', R: 35, r: 35, x0: 160, start: 22 * 1.5, color: 6, w: 11 },
  { id: 'mercury', name: 'Mercury', R: 20, r: 20, x0: 162, start: 0, color: 4, w: 7 },
];
export const PI = 22 / 7;

/** His four planet pictures, drawn once with Borland calls and saved with getimage: 13 rows, black edge included. */
export function sprites() {
  const s = new Scr();
  s.disc(215, 180, 4, 9);                                                    // Earth, blue, with green land
  for (const [a, b, c, d] of [[215, 181, 218, 181], [214, 182, 217, 182], [214, 180, 217, 180], [214, 183, 216, 183], [211, 180, 214, 180], [211, 179, 212, 178], [211, 178, 213, 177]]) s.line(a, b, c, d, 2);
  const grab = (x1: number, x2: number) => { const w = x2 - x1 + 1, out = new Uint8Array(w * 13); for (let y = 0; y < 13; y++) out.set(s.px.subarray((174 + y) * W + x1, (174 + y) * W + x2 + 1), y * w); return out; };
  const earth = grab(209, 221);
  s.bar(180, 170, 230, 190, 0); s.disc(195, 180, 2, 4); const mercury = grab(192, 198);
  s.bar(180, 170, 230, 190, 0); s.disc(195, 180, 4, 6); const venus = grab(190, 200);
  s.bar(180, 170, 230, 190, 0); s.disc(195, 180, 2, 9); const mars = grab(190, 200);
  return { mars, earth, venus, mercury } as Record<string, Uint8Array>;
}

/** Every angle after n frames, turned exactly as his loop turns them (06D2:1023): back by pi/80 x 88 / year, and when
 *  an angle reaches 0 it starts again at pi x 2. years = his four numbers in his order: Venus, Mercury, Earth, Mars. */
export function orbitClock(years: number[]) {
  const [venus, mercury, earth, mars] = years;
  const steps = [...[mars, earth, venus].map(y => PI / 80 / y * mercury), PI / 80];
  let at = 0, a = PLANETS.map(p => p.start);
  return {
    steps,
    /** angles at frame n, and the laps done so far (frames move forward from the last call, so play is cheap) */
    at(n: number) {
      if (n < at) { at = 0; a = PLANETS.map(p => p.start); }
      for (; at < n; at++) a = a.map((v, i) => { v -= steps[i]; return v <= 0 ? PI * 2 : v; });
      return { angles: [...a], laps: steps.map(s => Math.floor((n * s) / (2 * PI))) };
    },
  };
}

/** Top left corner of each planet's picture for these angles, in his loop's order (Mars, Earth, Venus, Mercury). */
export const spots = (angles: number[]) => PLANETS.map((p, i) => [Math.trunc(Math.cos(angles[i]) * p.R + p.x0), Math.trunc(Math.sin(angles[i]) * p.r + 175)]);

/** The solar system page before the loop: his card, the black window with its sunken edge, and the sun. */
export function orbitBase() {
  const s = new Scr();
  s.panel(0, 50);
  s.bar(30, 82, 300, 275, 0); s.inset(30, 82, 300, 275, 2);
  s.disc(165, 180, 7, 14);
  return s;
}
/** putimage(x, y, picture, COPY_PUT) of planet k: the whole picture, black edge included, so it wipes its last spot. */
export function stamp(s: Scr, pics: Record<string, Uint8Array>, angles: number[], k: number) {
  const p = PLANETS[k], pic = pics[p.id], [x, y] = spots(angles)[k];
  for (let r = 0; r < 13; r++) for (let c = 0; c < p.w; c++) s.pset(x + c, y + r, pic[r * p.w + c]);
}
/** The window with the planets at these angles; `upto` stamps only the first k of this frame over the last frame. */
export function orbitScreen(pics: Record<string, Uint8Array>, angles: number[], upto = 4, prev?: number[]) {
  const s = orbitBase();
  if (prev) for (let k = 0; k < 4; k++) stamp(s, pics, prev, k);
  for (let k = 0; k < upto; k++) stamp(s, pics, angles, k);
  return s;
}
/** The part of the screen a toy shows. */
export function crop(s: Scr, x: number, y: number, w: number, h: number) {
  const out = new Uint8Array(w * h);
  for (let r = 0; r < h; r++) out.set(s.px.subarray((y + r) * W + x, (y + r) * W + x + w), r * w);
  return out;
}

// The menu screen (04DA:0E06 and 04DA:1080): a night sky and his sun, both drawn in the dark, then his five choices.
/** 04DA:0E5B: 14 stars in a row, nine rows, each row 30 pixels down and 7 to the right. [x, y, kind] */
export function stars() {
  const row: [number, number, number][] = [[0x28, 0x69, 4], [0x50, 0x87, 2], [0x5a, 0x73, 1], [0x76, 0x6c, 4], [0x80, 0x76, 1], [0x8c, 0x8c, 3], [0xa0, 0x70, 4], [0xaf, 0x6c, 1], [0xbe, 0x69, 4], [0xd2, 0x6d, 2], [0xe1, 0x7d, 3]];
  const tail: [number, number, number][] = [[0xea, 0x91, 2], [0x104, 0x6d, 4], [0x122, 0x73, 3]];
  const out: [number, number, number][] = [];
  for (let si = 0, di = 0; di <= 0xff; si += 7, di += 30) {
    for (const [x, y, k] of row) out.push([si + x, di + y, k]);
    if (si > 0x14) si = 0;
    for (const [x, y, k] of tail) out.push([si + x, di + y, k]);
  }
  return out;
}
/** 04DA:141D one star. Bigger kinds fall through to the smaller ones: a blue ring, a blue diamond, a gray cross, a white dot. */
export function star(s: Scr, x: number, y: number, kind: number) {
  if (kind >= 4) s.circle(x, y, 3, 1);
  if (kind >= 3) { s.line(x - 1, y, x, y + 1, 9); s.line(x, y + 1, x + 1, y, 9); s.line(x + 1, y, x, y - 1, 9); s.line(x, y - 1, x - 1, y, 9); }
  if (kind >= 2) { s.line(x - 1, y, x + 1, y, 7); s.line(x, y - 1, x, y + 1, 7); }
  s.pset(x, y, 15);
}

/** draw_sun (04DA:0038): six palette slots go black, six discs are drawn, each a little smaller, then the slots get
 *  six shades of gold, center first. */
export const SUN_SLOTS = [10, 2, 4, 5, 13, 14];
export const SUN_SHADES: RGB6[] = [[63, 38, 0], [63, 42, 0], [63, 45, 0], [63, 47, 0], [63, 49, 0], [63, 50, 0]];
export const SUN_CUTS = [0, 40, 30, 20, 10, 5];
export function sunRadii(r: number) { return SUN_CUTS.map((d, i) => (i === 0 ? r : (r -= Math.trunc(r / d)))); }
export const STAR_SLOTS = [1, 9, 7, 15];

/** The menu screen, operation by operation, so a toy can stop anywhere. */
export function menuOps(): { say: string; run(s: Scr): void }[] {
  const radii = sunRadii(100);
  const ops = [
    { say: 'panel', run: (s: Scr) => { s.bar(0, 60, 639, 419, 3); s.raised(0, 60, 3); s.sunken(15, 75, 1); s.raised(16, 76, 1); s.bar(30, 90, 330, 390, 0); s.inset(30, 90, 330, 390, 2); } },
    { say: 'hide-stars', run: (s: Scr) => { for (const k of STAR_SLOTS) s.pal[k] = [0, 0, 0]; } },
    { say: 'stars', run: (s: Scr) => { for (const [x, y, k] of stars()) star(s, x, y, k); } },
    { say: 'hide-sun', run: (s: Scr) => { for (const k of SUN_SLOTS) s.pal[k] = [0, 0, 0]; } },
    ...SUN_SLOTS.map((slot, i) => ({ say: `disc-${i}`, run: (s: Scr) => s.disc(180, 240, radii[i], slot) })),
    ...[5, 4, 3, 2, 1, 0].map(i => ({ say: `shade-${i}`, run: (s: Scr) => { s.pal[SUN_SLOTS[i]] = [...SUN_SHADES[i]] as RGB6; } })),
    { say: 'show-stars', run: (s: Scr) => { s.pal[1] = [0, 0, 42]; s.pal[9] = [0, 0, 63]; s.pal[7] = [42, 42, 42]; s.pal[15] = [63, 63, 63]; } },
  ];
  return ops;
}

/** His five choices (DS:0C5C), the title in font 5 (the font made for this program), and the selected one in red. */
export const MENU = ["hgals , hgJ'fduJm", '],vm hgJpJJJJJJJJJJJJJdJJhm', 'hgals td hgrJvNk', 'lJsJJJJJJJJJJJJJJJJJJJJJJJhuJJ]m', 'hkJiJhx hgfJJJJvkJhlJJJJJ['];
export function menuText(s: Scr, bin: Bin, sel: number) {
  s.pal[12] = [63, 0, 0];
  for (const p of passes('outline', 15, 0)) s.text(bin, '#hgals', 540 + p.dx, 85 + p.dy, 5, p.color);
  MENU.forEach((k, i) => s.text(bin, k, 590, 158 + 48 * i, 4, 1));
  s.bar(365, 157 + 48 * sel, 603, 198 + 48 * sel, 3);
  s.outset(365, 157 + 48 * sel, 603, 198 + 48 * sel, 0);
  s.text(bin, MENU[sel], 590, 158 + 48 * sel, 4, 12);
}

// The fifteen verse cards of "The sun in the Quran" (030C:11CA on). x, y: the card's inset from the screen edges.
export interface Card { name: string; ref: string; ar: string; x: number; y: number; rx: number; right: number; keys: string; lines: string[] }
export const BISMILLAH = 'fsl hggi hgvplk hgvpdl', SADAQ = 'wJJJJ]r hggi hgu/dJJJl';
export const CARDS: Card[] = [
  { name: "Al-An’am", ref: "6:96", ar: "الأنعام", x: 0, y: 110, rx: 215, right: 598, keys: "s,vm hGkuhl - hBdi vrl @69", lines: ["thgr hbwfhp  ,[ug hggdg s;kh ,#hgals", ",hgrlv psfhkh `g; jrJ]dv hguJ.d. hgugdJl"] },
  { name: "Al-A’raf", ref: "7:54", ar: "الأعراف", x: 0, y: 42, rx: 215, right: 609, keys: "s,vm hGuvht - hBdi vrl @45", lines: ["hk vf;l hggi hg`d ogr hgslh,hj ,hGvq", "td sjm hdhl el hsj,n ugd hguJva dyad", "hggdJJg hgkiJhv d'gfi pedeh ,#hgalJs# ,hgrlJv", ",hgk[JJ,l lsoJvhj fHlJJvi Hb gi hgoJgJJr", ",hGlv jfhv; hggi vf hguhgldk"] },
  { name: "Yunus", ref: "10:5", ar: "يونس", x: 35, y: 65, rx: 215, right: 609, keys: "s,vm d,kJs - hBdi vrl @5", lines: ["iJ, hgJ`n [ug #hgals# qdJhx ,hgrlJv", "k,vh ,r]vi lkh.g gjugl,h u]] hgskdk", ",hgpshf lh ogJr hggi `g; hb fhgpr", "dtwg hBdhj gr,l dugl,k"] },
  { name: "Ar-Ra’d", ref: "13:2", ar: "الرعد", x: 0, y: 65, rx: 215, right: 615, keys: "s,vm hgvuJ] - hBdi vrl @2", lines: ["hggi hgJ`n vtu hgJslJh,hj fydJv ulJ] jv,kih", "eJl hsjJ,n uJgn hguJJva ,sJoJv #hgaJlJs#", ",hgrlv ;g d[vd G[g lsln d]fv hGlv", "dtwg hBdhj gugJ;l fgrJhx vf;l j,rJkJ,k"] },
  { name: "Ibrahim", ref: "14:33", ar: "إبراهيم", x: 65, y: 110, rx: 215, right: 609, keys: "s,vm hfvhidl - hBdi vrl 33", lines: [",sov g;l #hgals# ,hgrlv ]hzfdk", ",sJoJJv g;l hgJgJJdg ,hgJkJiJJJhv"] },
  { name: "An-Nahl", ref: "16:12", ar: "النحل", x: 63, y: 88, rx: 215, right: 609, keys: "s,vm hgkpg - hBdi vrl @21", lines: [",sov g;l hggdg ,hgkihv ,#hgals#", ",hgrlv ,hgk[J,l lsoJvhj fHlJvi", "hk tJd `gJ; NdJhj grJ,l durgJ,k"] },
  { name: "Al-Isra", ref: "17:78", ar: "الإسراء", x: 5, y: 110, rx: 215, right: 609, keys: "s,vm hbsvhx - hBdi vrl @87", lines: ["Hrl hgwbm g]g,; #hgalJs# hgd ysr hggdJg", ",rvNk hgt[v hk rvNk hgt[v ;hk lai,]h"] },
  { name: "Al-Anbiya", ref: "21:33", ar: "الأنبياء", x: 40, y: 110, rx: 215, right: 609, keys: "s,vm hGkfdhx - hBdi vrl 33", lines: [",i, hg`d ogr hggdg ,hgkihv ,#hgals#", ",hgrJlJJv ;g tJJd tJg; dsJfJpJ,k"] },
  { name: "Al-Hajj", ref: "22:18", ar: "الحج", x: 12, y: 43, rx: 215, right: 609, keys: "s,vm hgp[ - hBdi vrl @81", lines: ["hgl jv Hk hggi ds[J] gi lk td hgslJh,hj", ",lk td hGvq ,#hgals# ,hgrlv ,hgk[,l", ",hg[fJhg ,hgaJ[Jv ,hgJ],hf ,;edJv lk", "hgkhs ,;edv pr ugdi hgu`hf ,lk dik", "hggi tlJh gi lk l;vl hk hggi dtug lh daJhx"] },
  { name: "Al-Furqan", ref: "25:45", ar: "الفرقان", x: 10, y: 110, rx: 215, right: 609, keys: "s,vm hgtvrhk - hBdi vrl @54", lines: ["Hgl jv hgd vf; ;dt l] hg/g ,g, ahx", "g[ugi sh;kh el [ugkh #hgals# ugdi ]gdb"] },
  { name: "Al-Ankabut", ref: "29:61", ar: "العنكبوت", x: 77, y: 88, rx: 225, right: 609, keys: "s,vm hguk;f,j - hBdi vrl @16", lines: [",gzk sHgjil lk ogr hgslh,hj", ",hGvq ,soJv #hgals# ,hgrlJv", "gdJrJ,gJk hggi tJHkJd  dJctJ;J,k"] },
  { name: "Luqman", ref: "31:29", ar: "لقمان", x: 47, y: 65, rx: 215, right: 609, keys: "s,vm grlhk - hBdi vrl @92", lines: ["HgJl@ @jv@ @Hk@ @hggi@ @d,g[ hggdJg td hgkihv", ",d,g[ hgkihv td hggdg ,sov #hgals#", ",hgrlv ;g d[Jvd hgd H[g lsld", ",Hk@  @hggi@  @flJh  jJuJlJgJJ,k  oJfJdJJv"] },
  { name: "Fatir", ref: "35:13", ar: "فاطر", x: 2, y: 65, rx: 215, right: 609, keys: "s,vm tJh'Jv - hBdi vrl 31", lines: ["d,g[@ @hggdg td@ @hgkihv ,d,g[@ @hgkihv@ @td@ @hggdg", ",soJv #hgalJs# ,hgrlv ;g d[Jvd G[g", "lslJd `g;l hggi vf;l gJi hglJg; ,hgJ`dk", "jJ]u,k lJk ],ki lJh dlg;J,k lJk r'ldJv"] },
  { name: "Ya-Sin", ref: "36:38", ar: "يس", x: 110, y: 110, rx: 215, right: 609, keys: "s,vm dJJJs - hBdi vrl 83", lines: [",#hgals# j[vd glsjrv gih", "`g; jrJ]dv hguJ.d. hgugdJl"] },
  { name: "Ya-Sin", ref: "36:40", ar: "يس", x: 10, y: 110, rx: 215, right: 609, keys: "s,vm dJJJs - hBdi vrl 04", lines: ["b #hgalJs#@ @dkfyn giJh Hk jJ]v; hgrlJv ,b", "hggdg shfr hgkihv ,;g td tg; dsfp,k"] },
];
/** 030C:000A and one card: the panel, the opening and closing lines in font 1, the reference, then each verse line
 *  in font 3, yellow with a black outline, 45 pixels apart. */
export function cardScreen(bin: Bin, c: Card, upto = Infinity) {
  const s = new Scr();
  s.panel(c.x, c.y);
  s.text(bin, BISMILLAH, 395, c.y + 30, 1, 1);
  s.text(bin, SADAQ, 393, 385 - c.y, 1, 1);
  s.inset(c.x + 30, 420 - c.y, 609 - c.x, 421 - c.y, 0);
  s.text(bin, c.keys, c.x + c.rx, 432 - c.y, 1, 0);
  c.lines.forEach((k, i) => { if (i < upto) for (const p of passes('outline', 14, 0)) s.text(bin, k, c.right - c.x + p.dx, c.y + 70 + 45 * i + p.dy, 3, p.color); });
  return s;
}
