// Plain words for one key of an ARABART string, and where each key's glyph sits in the drawn line.
import { draw, translate, shape, toUnicode, hex, FORMS, type Bin } from '../arabart/core.ts';

/** sp[k] = how far the pen has moved left after the first k keys, so key k spans sp[k] to sp[k + 1]. */
export function spans(bin: Bin, keys: string, font: number) {
  const codes = shape(translate(bin, keys));
  return Array.from({ length: codes.length + 1 }, (_, k) => (k ? draw(bin, codes.slice(0, k), { font }).advance : 0));
}

const STYLE: Record<string, string> = { '@': 'bold', '!': 'italic', '#': 'underline', '$': 'double size' };
const PUNCT: Record<string, string> = { '<': 'a comma, ,', '>': 'a full stop, .', K: 'an Arabic comma, ،', '?': 'a question mark, ؟' };
const ar = (s: string) => `<span lang="ar" dir="rtl">${s}</span>`;

export function explain(bin: Bin, keys: string, i: number, shaped = shape(translate(bin, keys))) {
  const k = keys[i], code = translate(bin, k)[0], out = shaped[i];
  const n = `Key ${i + 1}, <b>${k === ' ' ? 'space' : k.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</b>`;
  if (k in STYLE) return `${n}: turns <b>${STYLE[k]}</b> on or off from here. It sits in the text like a tag in HTML, takes no space, and the letters around it stay joined.`;
  if (k === '*') return `${n}: turns <b>every style off</b> from here.`;
  if (k === ' ') return `${n}: an empty gap. The word before it ends here.`;
  if (k === 'J') return `${n}: the <b>kashida</b> key, ${ar('ـ')}. A joining stroke that stretches the word. ${out >> 6 === 3 ? 'It joins on both sides, so it is drawn medial.' : ''}`;
  if (/\d/.test(k)) return `${n}: the digit ${ar(toUnicode(k))}. Digits never join, so its code stays ${hex(code)}h.`;
  if (PUNCT[k]) return `${n}: ${PUNCT[k]}.`;
  const hands = code >> 6 === 3 ? 'it can join on both sides' : code >> 6 === 1 ? 'it joins only the letter before it' : 'it never joins';
  const form = FORMS[out >> 6];
  return `${n}: his table turns it into <b>${hex(code)}h</b>, the letter ${ar(toUnicode(k))}, and ${hands}. ` +
    (out === code ? `Here it keeps that shape: <b>${form}</b>.` : `Next to its neighbors it becomes <b>${form}</b>, ${hex(out)}h.`);
}
