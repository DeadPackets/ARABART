// DEMO.EXE's main loop (DEMO_EXE.img 2163-2315) as data: every ar_text call it makes, on his two strings or on any line.
import { render, metrics, translate, type Bin, type Bitmap } from '../arabart/core.ts';

// His strings at DS:0092 and DS:00AE, byte for byte. J is the kashida key: it stretches a join.
export const S1 = ' #~gtk ~guvfd 51<4#        ';
export const S2 = ' #~gtJJJk ~guJJJvfd 51<4#        ';

/** His pass-2 patch (22D3-22EF): byte 0 becomes ! (italic on) and the closing # moves two keys on. */
export function patch(s: string) {
  const a = [...s];
  a[0] = '!';
  const k = s.lastIndexOf('#');
  if (k > 1 && a[k + 1] === ' ' && a[k + 2] === ' ') { a[k] = ' '; a[k + 2] = '#'; }
  return a.join('');
}

/** A line from the typewriter, made into his two strings: a leading space, 8 trailing ones, and for screen 2 a
 *  kashida stretch in each word, at the join nearest its middle (his own line puts them there too). */
export function strings(bin: Bin, line: string): [string, string] {
  const words = line.split(' ').map(w => {
    const at = [...w].map((k, i) => ('@!#$*'.includes(k) ? -1 : i)).filter(i => i >= 0), c = translate(bin, w);
    const mid = (at.length + 1) / 2;
    let best = -1;
    for (let j = 1; j < at.length; j++) {
      if (c[at[j - 1]] & 0x80 && c[at[j]] & 0x40 && (best < 0 || Math.abs(j - mid) <= Math.abs(best - mid))) best = j;
    }
    return at.length >= 3 && best > 0 ? w.slice(0, at[best]) + 'JJJ' + w.slice(at[best]) : w;
  });
  return [` ${line}        `, ` ${words.join(' ')}        `];
}

export interface Call { font: number; color: number; x: number; y: number; h: number; row: number; col: number; keys: string; img: Bitmap; width?: number }
export interface Screen { title: string; keys: string; calls: Call[] }

/** ar_height: the font's line height, doubled for every $ in the text (his binding, 20D6). */
export const height = (bin: Bin, font: number, s: string) => metrics(bin, font).h * 2 ** (s.split('$').length - 1);

function column(bin: Bin, s: string, fonts: number[]): Call[] {
  const out: Call[] = [];
  let x = 630;
  fonts.forEach((font, col) => {
    let y = 0;
    for (let c = 1; c < 13; c++) {
      const h = height(bin, font, s);
      out.push({ font, color: c + 3, x, y, h, row: c, col, keys: s, img: render(bin, s, { font, color: c + 3, x }) });
      y += h;
    }
    const width = render(bin, s, { font }).advance;
    out[out.length - 1].width = width;
    x -= width;
  });
  return out;
}

/** The four screens, one key press apart. */
export function screens(bin: Bin, s1 = S1, s2 = S2): Screen[] {
  const p1 = patch(s1), p2 = patch(s2);
  return [
    { title: 'Fonts 1 to 3', keys: s1, calls: column(bin, s1, [1, 2, 3]) },
    { title: 'Fonts 3 and 4, stretched', keys: s2, calls: column(bin, s2, [3, 4]) },
    { title: 'Italic', keys: p1, calls: column(bin, p1, [1, 2, 3]) },
    { title: 'Italic, stretched', keys: p2, calls: column(bin, p2, [3, 4]) },
  ];
}
