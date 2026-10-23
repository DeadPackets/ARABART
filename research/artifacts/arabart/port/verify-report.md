# ARABART port: pixel-exact verification

**2511 of 2511 identical.** Each case is drawn on a 640x480 screen by the real ARABART.EXE 4.15 and by the JavaScript port, then the two frames are compared pixel by pixel (every pixel, every color).

| What | Detail |
|---|---|
| Real binary | `research/artifacts/programs/unpacked/ARABART_ARABART.EXE` (sha256 `a7b2834b5019d403…`), installed as a TSR in Unicorn, called through INT 10h AH=36h exactly as DEMO.EXE and SUN.EXE call it |
| Port | `src/lib/arabart/index.ts`, run by `node` through `render.ts` |
| Font data | `public/arabart/fonts.bin` = bytes 0682-7421 of the same binary (checked byte for byte at start) |
| Time | port 0.3 s for all cases, real binary 2.0 s |
| Lit pixels compared | 2,011,066 |
| Shaped codes | 2481 of 2481 identical: the glyph codes his code leaves in its buffer at 060C after shaping, against the port's `shape()` |

| Category | Identical | Cases |
|---|---|---|
| letter forms | 980 | 980 |
| ligatures and pairs | 380 | 380 |
| digits and punctuation | 40 | 40 |
| real words | 140 | 140 |
| styles at the start | 85 | 85 |
| styles mid-word | 120 | 120 |
| style options | 30 | 30 |
| modes | 75 | 75 |
| keys with no glyph | 25 | 25 |
| his SUN.EXE strings | 564 | 564 |
| colors | 32 | 32 |
| demo string | 5 | 5 |
| long strings | 5 | 5 |
| left-edge stop | 30 | 30 |

Distinct strings: 611. Fonts: 1-5. Modes: plain, 3d (his function 8), shadow and outline (his SUN.EXE helpers). Styles: bold, italic, underline, double size, alone, combined, as options and as inline keys, switched mid-word.

Sensitivity check (run by hand on 2026-10-22): three one-line changes to the port (italic start offset D+1 instead of D+2, skipping the first-letter rule, drawing the double-size twin row below instead of above) made 95, 344 and 140 cases fail. The harness sees one-pixel errors.

`sample.png`: one case per category, real binary on the left, port on the right.

## Rerun

```sh
uv run -q --with unicorn --with numpy python -I research/artifacts/arabart/port/verify.py
```
