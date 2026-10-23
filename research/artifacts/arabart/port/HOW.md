# How ARABART works

Yasser Awad wrote ARABART in Port Said between 1991 and 1993, in 8086 assembly. It lets any DOS program draw joined Arabic text in color, in five fonts, with bold, italic, underline, double size and 3-D, by making one interrupt call. Everything below comes from his binary (version 4.15) and was measured by running it. The JavaScript port in `src/lib/arabart/` does the same steps and draws the same pixels: 2,511 of 2,511 test cases identical (`verify-report.md`).

## 1. The keyboard is the alphabet

In 1993 there was no Unicode. A programmer typed Arabic on a normal US keyboard, pressing the keys where the letters sit on an Arabic keyboard. `~gtk ~guvfd` is "الفن العربي" ("the Arabic art"). His string is plain ASCII, so it fits in any C or assembly source file.

A 96-byte table (at offset 0682 in his program) turns each key into a one-byte **glyph code**. Think of the byte as two fields:

| Bits | Meaning |
|---|---|
| bit 7 | the letter can reach **left**, to the next letter (Arabic runs right to left) |
| bit 6 | the letter can reach **right**, to the letter before it |
| bits 0-5 | which letter it is |

The table stores every letter with both of the hands it can ever use:

| Key | Letter | Code | Hands |
|---|---|---|---|
| `f` | ب | E8 | `11` both sides |
| `h` | ا | 6A | `01` right only (alef never joins to the next letter) |
| `x` | ء | 3A | `00` never joins |

The two bits are also the four letter forms: `00` isolated, `01` final, `10` initial, `11` medial. So the code itself is the shape. There is no table of forms to search: the code is used directly as an index into the font.

A neat detail: for the letter keys `a` to `z`, the letter number is the ASCII code minus 3Eh. `h` is 68h, and alef is 2Ah. `x` is 78h, and hamza is 3Ah. The digit keys `0` to `9` give 08h to 11h.

## 2. The joining pass, with his name

The word is ياسر (Yasser). The keys are `dhsv`. These are the real codes, recorded by the port's `trace` option and checked against the buffer his own code leaves in memory.

**Step 0, look up the keys.**

| Letter | Key | Code | Hands |
|---|---|---|---|
| ي | `d` | E6 | `11` |
| ا | `h` | 6A | `01` |
| س | `s` | F5 | `11` |
| ر | `v` | 78 | `01` |

**Step 1, the first letter lets go on its right.** Nothing comes before it. ي: E6 becomes **A6** (`10`).

**Step 2, walk the pairs.** For each letter and the next one: if this letter reaches left **and** the next letter reaches right, they stay joined. If not, this letter lets go on its left, and the next letter lets go on its right.

| Pair | Left hand of the first | Right hand of the second | Result | Codes after |
|---|---|---|---|---|
| ي and ا | 1 | 1 | join | ي A6 stays: **initial** |
| ا and س | 0 | 1 | cut | ا 6A stays: **final**; س F5 becomes B5 |
| س and ر | 1 | 1 | join | س B5 stays: **initial** |
| ر and the end of the string (00) | 0 | 0 | cut | ر 78 stays: **final** |

**Result:** A6 6A B5 78, which draws يـا سـر, joined as ياسر.

Each code now picks its glyph directly: glyph address = font table + 2 × code.

His core test is 13 instructions: 9 to decide, 4 to let go. In JavaScript it is one line:

```js
if (!(code & 0x80 && next & 0x40)) { code &= 0x7f; next &= 0xbf; }
```

For ياسر his code ran 58 instructions to look up the keys and 170 to shape them (measured).

**Styles never break a word.** The style keys `@` bold, `!` italic, `#` underline, `$` double size and `*` reset become codes C8-CB and D0. Those are the "medial" forms of the digits 0-3 and 8, and digits never join, so no letter can turn into a style code. The shaper steps over them when it looks for the next letter. So `~gt@k` (الفن with bold starting on the ن) stays joined.

**Lam-alef** (لا) has its own key, `b`, exactly like the Arabic keyboard and typewriter. `G` is لأ and `B` is لآ.

## 3. Drawing: every glyph is a list of strokes

A glyph is stored as horizontal strokes, not as a grid of pixels:

```
byte 0     advance width in pixels
byte 1     how many rows above the baseline the glyph starts
then       (skip, length) pairs: a stroke that starts `skip` pixels left of the pen and runs `length` pixels left
EF         move up one row
F0-FF      end of glyph
```

Here is ب in font 1, all 24 bytes:

```
0E 03 | 05 01 EF EF EF 00 0C EF 00 0B EF 00 01 0A 01 EF 00 02 EF 00 01 FF
```

14 pixels wide, starting 3 rows up. First the dot (skip 5, one pixel), then two empty rows, then the bottom of the bowl (12 pixels), the row above it (11), the two tips (1 pixel at the right edge, 1 pixel 10 to the left), and the rising stroke (2, then 1). Seven strokes draw the whole letter.

The drawing loop never looks at an empty pixel: it only visits strokes. To paint, it tells the VGA card the color once, then for each screen byte says "these pixels" and writes once. The card paints up to 8 pixels in all 4 color planes with that one write.

## 4. Why the styles are almost free

Every style is a small change to a stroke, so one loop draws them all:

| Style | What changes | Extra code in the loop |
|---|---|---|
| Bold | every stroke is 1 pixel longer, and the letter is 1 pixel wider | 1 instruction per stroke, 3 per letter |
| Italic | each row starts 1 pixel further left than the row below. The slant starts at the baseline, so joined letters still touch. | none: the row step always subtracts the italic flag, which is 0 or 1 |
| Underline | one more stroke along the baseline, as wide as the letter | one short block per letter |
| Double size | skips and lengths doubled, rows stepped by 2, every byte written twice | a shift for each number, and a second write |
| 3-D | the same loop runs twice: first in the shadow color, 1-3 pixels up and left, then in the text color | the text is shaped only once |

Measured on his binary, drawing الفن العربي ٤,١٥ (16 keys) in font 3:

| Style | Instructions (whole call) | Lit pixels | Instructions per pixel |
|---|---|---|---|
| Plain | 25,193 | 1,357 | 18.6 |
| Bold | 27,438 (+8.9%) | 1,645 | 16.7 |
| Italic | 25,766 (+2.3%) | 1,357 | 19.0 |
| Underline | 27,013 (+7.2%) | 1,574 | 17.2 |
| Double size | 35,713 (+41.8%) | 5,428 (4×) | 6.6 |

Double size draws 4 times the pixels for 42% more work.

## 5. Small, in numbers

| Part | Size |
|---|---|
| Resident code for all 11 functions | 1,448 bytes, 527 instructions, one interrupt (INT 10h, AH=36h) |
| Key table | 96 bytes |
| Key lookup loop | 18 instructions |
| Joining pass | 58 instructions, including the 13-instruction core test. The rest steps over style keys. |
| Drawing loop, all styles included | 211 instructions |
| Port writes to the VGA card for the 16-key line above | 424, for 1,357 pixels |
| CPU | 8086 instructions only, so it runs on the processor of the first IBM PC |

**Fonts:** 27,932 bytes for 5 hand-drawn fonts. Each font starts with a 256-entry table of glyph addresses. Slots 0-2 can never be a glyph code, so they hold the font's metrics: slot 1 is the line height and slot 2 is the 3-D shadow offset. Fonts share glyphs by pointing to the same address.

| Font | Line height | 3-D offset | Bytes | Own glyphs |
|---|---|---|---|---|
| 1 | 18 | 1 | 3,442 | 95 |
| 2 | 27 | 1 | 5,676 | 103 |
| 3 | 34 | 2 | 10,838 | 141 |
| 4 | 38 | 2 | 6,937 | 87 |
| 5 | 50 | 3 | 1,039 | 6: the letters of الشمس ("the sun"), for the title of his 1993 program *The Brave Sun*. Its other slots point into font 1. |

## 6. The port

| File | What |
|---|---|
| `src/lib/arabart/index.ts` | the engine: 3,969 bytes minified, 2,286 gzip; `render` and `load` alone are 1,063 gzip |
| `public/arabart/fonts.bin` | his bytes 0682-7421, unchanged: key table, font table, 5 fonts. 28,064 bytes, 7,843 gzip |

```ts
import { load, render, paint, fromKey, fromUnicode, toUnicode, type Step } from '@/lib/arabart';

const bin = await load(`${import.meta.env.BASE_URL}/arabart/fonts.bin`);
const keys = fromUnicode('ياسر');                 // 'dhsv'. Or build keys with fromKey(keydownEvent).
const trace: Step[] = [];                          // one entry per joining decision, for animation
const img = render(bin, keys, { font: 3, color: 14, mode: '3d', shadow: 4, trace });
paint(canvas, img, 2);                             // 2 CSS px per pixel, whole device pixels, no blur
canvas.setAttribute('aria-label', toUnicode(keys));
```

- `render` options: `font` 1-5, `color` and `shadow` 0-15 (VGA palette), `mode` `plain`, `3d` (his function 8), `shadow` and `outline` (the helpers his SUN.EXE builds on top: a copy 6 pixels down and right, or four copies 1 pixel around), `bold`, `italic`, `underline`, `double` (starting state; the keys `@ ! # $ *` still switch them mid-text), and `x` (the pen position on his 640-pixel screen; drawing stops at the first letter that would cross the left edge, as his did).
- The result is `{ width, height, data, x, y, advance }`: `data` holds colors 0-15 with 255 for empty, and `(x, y)` is where the pen started (the right edge on the baseline).
- `fromKey` maps the physical key position (`KeyboardEvent.code`), so a visitor on any keyboard layout types exactly like a 1993 user on a US keyboard.
- `fromUnicode` takes text from an Arabic keyboard, a phone or a paste. It turns ل followed by ا, أ or آ into the lam-alef key, stores number runs reversed the way his programs stored them (so ١٩٩٣ reads right), keeps the style keys, and skips anything ARABART has no glyph for (Latin letters, vowel marks, إ).
- `shape(codes, trace)` and `translate(bin, keys)` are exported on their own for the animation; `draw(bin, codes, opts)` draws codes you have already shaped, such as a single medial letter.
