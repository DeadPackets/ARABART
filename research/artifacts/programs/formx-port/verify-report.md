# FORM_X port: verification report

**349 of 349 screens identical.** Each case feeds the same keystrokes to the real `FORM_X.EXE` (running in the Unicorn DOS harness `research/artifacts/programs/dosemu.py`) and to the port `src/lib/formx/formx.ts`, then compares the whole 80 x 25 text screen character for character (trailing spaces trimmed), plus whether the program is still waiting for a key.

Rerun (under a minute):

```
node research/artifacts/programs/formx-port/verify.ts
```

Generated 2026-10-22. Inputs: `cases.json`. Real program's screens: `emu.json`.

| Group | Cases | Identical |
|---|---:|---:|
| hand-picked formulas | 86 | 86 |
| random formulas | 160 | 160 |
| error messages and editing | 33 | 33 |
| random keystrokes | 70 | 70 |
| **All** | **349** | **349** |

- 285 cases end on the results table: 2085 result rows, 99 of them `* OVERFLOW *`.
- The other cases end mid-typing, on an error message, inside the x prompts, or after Esc.
- API cross-check: `solve()` (whole table) and `evaluate()` with trace on (first row) agree with the program in 246 of 246 table cases.
- Coverage: brackets nested up to 20 deep, unary minus before numbers, x and brackets, numbers with 7 integer digits and up to 9 fraction digits, division by zero and by tiny numbers, every mix of `* / + -`, x ranges that run backwards, have a zero step, or span the full 7-digit range, and every one of the 8 error messages.

## Mismatches

None.

## First 12 hand-picked cases

| Formula | Initial x | Final x |
|---|---|---|
| `(x-3)*(x+2)/7` | -1.5 | 3 |
| `1/6` | (no x) |  |
| `x/0` | 1 | 10 |
| `x*x+1` | 1 | 10 |
| `x*x*x-2*x+1` | -5 | 5 |
| `-(1/3)` | (no x) |  |
| `-(x/3)` | 0 | 9 |
| `-x` | -3 | 3 |
| `-x*2` | -3 | 3 |
| `(-x)*(-x)` | -4 | 5 |
| `-(-x)` | -2 | 7 |
| `-(-(-(x)))` | 1 | 2 |
