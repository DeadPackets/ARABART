// The journey of one key through his editor and ARABART, as five stations of plain words and pictures.
import { translate, shape, draw, toUnicode, svgMarkup, hex, bits8, FORMS, isStyle, type Bin } from '../arabart/core.ts';
import { kindOf, line, colorName, STYLE_NAME, type Ed } from './editor.ts';

const esc = (t: string) => t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]!);
const ar = (t: string) => `<span lang="ar" dir="rtl">${esc(t)}</span>`;
const glyph = (bin: Bin, code: number, font: number) => svgMarkup(draw(bin, [code], { font: Math.min(font, 4), color: 14 }), 2, 'kf-g');
const bits = (c: number) => `<span class="kf-bits" aria-label="${bits8(c)}">${[...bits8(c)].map((b, i) => `<i class="${i < 2 ? 'h' : ''}${b === '1' ? ' on' : ''}">${b}</i>`).join('')}</span>`;
const label = (key: string) => key === '\x1b' ? 'Esc' : key === '\b' ? '⌫' : key === ' ' ? 'Space' : 'QWERCV'.includes(key) ? `⇧ ${key}` : esc(key);

export interface Flow { stations: string[]; says: string[] }

export function flow(bin: Bin, before: Ed, key: string, after: Ed): Flow {
  const k = kindOf(key), code = key === '\x1b' ? 0x1b : key === '\b' ? 8 : key.charCodeAt(0);
  const stored = ['letter', 'style', 'space', 'other'].includes(k);
  const st: string[] = [], say: string[] = [];

  // 1. The key
  st.push(`<kbd class="kf-cap">${label(key)}</kbd><code class="kf-code">${hex(code)}h</code>`);
  say.push(`You press <b>${label(key)}</b>. getch() hands his loop one byte: <b>${hex(code)}h</b>.`);

  // 2. His buffer
  const cells = (keys: string, hi: number, gone = '') => {
    const from = Math.max(0, keys.length - 5);
    return `<span class="kf-buf">${[...keys.slice(from)].map((c, j) => `<span class="${from + j === hi ? 'hi' : ''}"><b>${c === ' ' ? '·' : esc(c)}</b><small>${from + j}</small></span>`).join('')}${gone ? `<span class="gone"><b>${gone === ' ' ? '·' : esc(gone)}</b></span>` : ''}<span class="i"><b>i</b></span></span>`;
  };
  if (stored) {
    st.push(cells(after.keys, after.keys.length - 1));
    say.push(`It is not a command, so it goes into his buffer exactly as typed: <b>buf[${after.keys.length - 1}] = ${esc(key === ' ' ? 'space' : key)}</b>. The editor never stores a letter, only the key.`);
  } else if (k === 'erase') {
    st.push(cells(after.keys, -1, before.keys.slice(-1)));
    say.push(before.keys ? 'Backspace clears the last byte of the buffer and steps back one.' : 'The buffer is already empty.');
  } else if (k === 'quit') {
    st.push(`<span class="kf-note">The loop is told this is its last pass.</span>`);
    say.push('Esc: nothing is stored. His loop draws the line one last time, then ends.');
  } else {
    st.push(`<span class="kf-note"><s>buf</s> Not stored. key = 0, i − 1.</span>`);
    say.push('A command key is never stored. His loop sets the key to 0 and steps i back, so the text stays exactly as it was.');
  }

  // 3. ARABART's table, or ARABART's settings
  if (stored) {
    const c = translate(bin, key)[0];
    const what = k === 'style' ? `the <b>${STYLE_NAME[key]}</b> switch` : k === 'space' ? 'a blank' : `${ar(toUnicode(key))}`;
    st.push(`<span class="kf-t">table[${esc(key)}]</span><code class="kf-code">${hex(c)}h</code>${bits(c)}`);
    const hands = c >> 6 === 3 ? 'its top two bits say it can join on both sides' : c >> 6 === 1 ? 'its top two bits say it joins only the letter before it' : 'its top two bits say it never joins';
    say.push(`Every redraw, ARABART looks the key up in its 96-byte table: <b>${hex(c)}h</b>, ${what}. ${k === 'letter' ? `The byte is the letter’s number, and ${hands}.` : k === 'style' ? 'A code no letter can ever become.' : ''}`);
  } else if (k === 'font') {
    st.push(`<span class="kf-t">INT 10h</span><code class="kf-code">AX 3603h · CX ${after.font}</code>`);
    say.push(`His loop calls ARABART: function 3, <b>font ${after.font}</b>. ARABART keeps it in its own memory.`);
  } else if (k === 'color' || k === 'shadow') {
    st.push(`<span class="kf-t">INT 10h</span><code class="kf-code">AX 3601h · CL ${after.cv} · CH ${after.sv}</code>`);
    say.push(`His loop counts the ${k === 'color' ? 'text' : 'shadow'} color one up and calls ARABART: function 1. Text <b>${colorName(after.color)}</b>, shadow <b>${colorName(after.shadow)}</b>.`);
  } else if (k === '3d') {
    st.push(`<span class="kf-t">fn</span><code class="kf-code">${before.fn === 8 ? '3608h' : '3607h'} → ${after.fn === 8 ? '3608h' : '3607h'}</code>`);
    say.push(`The | key flips which ARABART function draws the line: <b>${after.fn === 8 ? 'function 8, 3-D' : 'function 7, plain'}</b>.`);
  } else {
    st.push(`<span class="kf-note">Nothing to look up.</span>`);
    say.push(k === 'erase' ? 'Nothing to look up: the key is simply gone.' : 'Nothing to look up.');
  }

  // 4. Joining
  if (k === 'letter') {
    const a = shape(translate(bin, after.keys)), b = shape(translate(bin, before.keys)), t = translate(bin, after.keys), p = after.keys.length - 1;
    let q = p - 1;
    while (q >= 0 && isStyle(a[q])) q--;
    const prevLetter = q >= 0 && kindOf(after.keys[q]) === 'letter';
    let html = `<span class="kf-pair">`;
    if (prevLetter) html += `<span>${glyph(bin, a[q], after.font)}<small>${FORMS[a[q] >> 6]}</small></span>`;
    html += `<span class="hi">${glyph(bin, a[p], after.font)}<small>${FORMS[a[p] >> 6]}</small></span></span>`;
    st.push(html);
    const me = ar(toUnicode(key)), them = prevLetter ? ar(toUnicode(after.keys[q])) : '';
    const was = prevLetter && b[q] !== a[q] ? ` ${them} was ${FORMS[b[q] >> 6]}; now it is <b>${FORMS[a[q] >> 6]}</b>. That is the joining you watch as you type.` : '';
    const end = `The new letter is the last one, so it lets go on its left: <b>${FORMS[a[p] >> 6]}</b>, ${hex(a[p])}h.`;
    say.push(!prevLetter ? `Joining: nothing before it to hold on to. ${end}`
      : t[q] & 0x80 && t[p] & 0x40 ? `Joining: ${them} reaches left and ${me} reaches right, so they join.${was} ${end}`
      : !(t[q] & 0x80) ? `Joining: ${them} never joins the letter after it, so ${me} starts fresh. ${end}`
      : `Joining: ${me} never joins the letter before it.${was} ${end}`);
  } else if (k === 'other') {
    st.push(`<span class="kf-note">Digits and signs never join.</span>`);
    say.push('Digits and signs never join, so this one keeps its own shape.');
  } else if (k === 'style') {
    st.push(`<span class="kf-note">Skipped: the letters around it stay joined.</span>`);
    say.push(`The joining pass steps right over style keys. So <b>${STYLE_NAME[key]}</b> can switch in the middle of a word without breaking it.`);
  } else if (k === 'space') {
    st.push(`<span class="kf-note">A gap: the word before it ends.</span>`);
    say.push('A space never joins, so the last letter before it takes its end shape.');
  } else {
    st.push(`<span class="kf-note">cleardevice(): a black screen.</span>`);
    say.push('Then, as after every key, the whole screen is cleared.');
  }

  // 5. The screen
  const img = line(bin, after);
  st.push(after.keys && img.width ? `<span class="kf-scr">${svgMarkup(img, 1, 'kf-line')}</span>` : `<span class="kf-note">An empty line.</span>`);
  say.push(after.ended ? 'The last redraw. Then EDITOR.EXE ends.' : `And ARABART draws the whole line again, from the first key, at the top right of the screen.${k === 'letter' ? ' Your letter appears already joined.' : ''}`);
  return { stations: st, says: say };
}
