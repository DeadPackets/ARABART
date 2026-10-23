# How Yasser's formula solver works

For the site writers. In 1992 Yasser Awad took a paid challenge: do exact decimal math on a PC using nothing but Assembly. No math chip, no library. His answer was FORM_X. You type a formula in x, give a first and a last value, and it prints a 10-row table of results with 6 decimals. The whole program is 3,546 bytes on disk.

Every fact and number here comes from his binary and from running it. The port in `src/lib/formx/formx.ts` follows his code routine by routine. It printed the same screen as the real program in 349 of 349 tests (`verify-report.md` in this folder).

## The short version

1. While you type, he blocks every key that cannot come next.
2. Every number becomes 20 decimal digits, one digit per byte.
3. He solves the innermost brackets first. Inside a bracket he does every `*` and `/` from left to right, then every `+` and `-` from left to right.
4. Each result is written back into the formula, so the formula gets shorter at each step until one number is left.
5. He does this for 10 values of x and prints the table.

## 1. The keyboard filter

One byte in memory says what may come next. Each bit stands for one kind of key. It is the same idea as a form that grays out the buttons you cannot press yet, but it costs one byte.

| Bit value | Key it allows |
|---:|---|
| 1 | `)` |
| 2 | `(` |
| 4 | a digit |
| 8 | `x` |
| 16 | `*` `/` `+` |
| 32 | `-` |
| 64 | `.` |
| 128 | a note to himself: this number already has a point |

Each accepted key sets a new mask:

| After you type | Mask | What may come next |
|---|---|---|
| nothing yet, or `(` | 2Eh | `(`, a digit, `x`, `-` |
| a digit | 75h | a digit, `.`, `)`, `*` `/` `+` `-` |
| `.` | 84h | a digit |
| `x` or `)` | 31h | `)`, `*` `/` `+` `-` |
| `*` `/` `+` or `-` | 0Eh | `(`, a digit, `x` |

- A digit keeps bit 128, so a second point in the same number stays blocked. An operator clears it for the next number.
- A minus sign can start the formula or follow `(`. So `-x*2` and `2*(-x)` both work.
- Every accepted key also saves the mask from before it. Backspace takes the last one back, so undo is always exact.
- The formula holds up to 69 characters. Capital `X` works too.
- On Enter he checks three more things: the last key is a digit, `x` or `)`; brackets never close before they open and they balance at the end; no number has more than 7 digits before the point. If something is wrong, a message appears on the second line and waits for any key.

## 2. How he stores the formula and the numbers

He keeps the formula as typed, inside one more pair of brackets that he adds himself, with a `$` at the end (the end mark DOS uses for text). `x*x+1` is stored as `(x*x+1)$`.

To solve it, he copies it into a work buffer. Every number and every x becomes exactly 20 bytes, and each byte holds one decimal digit from 0 to 9. The first 14 digits are before the point and the last 6 are after it. It is fixed point, like storing money as whole cents, but in millionths.

| Value | His 20 bytes |
|---:|---|
| 2.5 | `00000000000002500000` |
| 13.5 | `00000000000013500000` |
| -1.5 | `99999999999998500000` |
| -0.321428 | `99999999999999678572` |

Negative numbers use ten's complement. Think of a car's odometer: roll it back one mile from 000000 and it shows 999999. A first digit from 5 to 9 means the number is negative. The gift of this choice: subtraction is just addition of a flipped number, so he needs one adding routine for both.

A minus right after `(` in front of a number is folded in during the copy: `(-2)` becomes one negative number.

Because every number has the same width, `left op right` is always 41 bytes: 20, then 1, then 20. He never has to search for where a number starts or ends.

## 3. How he solves a formula

He walks the buffer from left to right. Each `(` starts one level deeper (the routine calls itself). The first `)` he meets closes the deepest open level, so that bracket has no brackets left inside. For that bracket:

1. He copies the inside to a scratch area.
2. If it starts with `-`, he flips the sign of its first number.
3. Pass 1: he finds the leftmost `*` or `/`, takes the 20 digits on its left and the 20 on its right, computes, and puts the 20-digit result where those 41 bytes were. Then he starts again from the left, until no `*` or `/` is left.
4. Pass 2: the same for `+` and `-`.
5. One number is left. He writes it over the whole bracket, from `(` to `)`, and closes the gap.

Then he goes back up one level and keeps walking. The whole formula sits inside his own outer brackets, so the last bracket he solves is the formula itself, and its value is the answer.

This gives the order every math teacher wants: brackets first, then `*` and `/` from left to right, then `+` and `-` from left to right. So `10-2-3` is 5 and `100/10/2` is 5.

For a modern developer: it is a find-and-replace loop on a string. Find the innermost `( )`, replace it with its value, repeat. He did it on raw bytes, with no regex engine and no parser library.

## 4. His arithmetic, digit by digit

There is no math chip, no library, and not even the CPU's own decimal helper instructions (`AAA`, `DAA` and `AAM` are used zero times). Every step is his.

- **Add.** Add the 20 pairs of digits, then one carry pass from right to left. Each digit keeps its value mod 10 and hands the rest, value / 10, to its left neighbor. One divide instruction gives him both.
- **Subtract.** Flip the sign of the right number (9 minus each digit, then add 1), then add.
- **Too big.** If two positive numbers add up to a negative-looking number, the answer did not fit. The same goes for two negatives. That row prints `* OVERFLOW *`.
- **Multiply.** Schoolbook multiplication, as on paper. Every digit of one number times every digit of the other goes into a 40-digit row, with a carry pass after each line. He keeps the 20 digits in the middle: 14 before the point, 6 after. Digits past the sixth decimal are cut, not rounded.
- **Divide.** Long division by counting. He slides the divisor left, one digit at a time, until it fills the top of its 20 digits. Then he subtracts it again and again and counts how many times it fits. Then he slides it back one place and counts the next digit. After the units digit he does six more rounds, one for each decimal. A count can climb as high as 250 in one byte before he tidies the carries, which saves work. Dividing by zero prints `* OVERFLOW *`. `1/6` gives `0.166666`.

## 5. The results table

- He asks for the first and last value of x: up to 7 digits before the point, up to 3 after, with an optional minus.
- step = (last - first) / 9, with his own division.
- The x column starts at the first value and adds the step 9 times: 10 rows. It shows 3 decimals.
- The F(x) column shows up to 14 digits before the point and 6 after. Leading zeros become spaces and the sign sits right before the first digit, so the column stays in line.
- A formula without x skips the questions and prints one line, for example `F(x)= 0.300000`.

The real program's screen for `(x-3)*(x+2)/7` from -1.5 to 3. (The museum screenshot, `(x)*(x)` from 10 to 100, also comes out character for character the same from the port.)

```


                **       THE RESULT TABLE OF --- F(X)       **


F(x)=((x-3)*(x+2)/7)


        Value of X                              Value of  F(X)
  -------------------------------------------------------------------------

             -1.500  ---------------------->              -0.321428
             -1.000  ---------------------->              -0.571428
             -0.500  ---------------------->              -0.750000
              0.000  ---------------------->              -0.857142
              0.500  ---------------------->              -0.892857
              1.000  ---------------------->              -0.857142
              1.500  ---------------------->              -0.750000
              2.000  ---------------------->              -0.571428
              2.500  ---------------------->              -0.321428
              3.000  ---------------------->               0.000000
```

## Three worked traces for the live demo

Each table below is the port's `trace` output, and the first row of each table on the real program's screen matches it. In the "Text" column, a "finds" or "writes back" step shows the whole formula. A sign or pass step shows the scratch area: the inside of the bracket he is solving right now. The 20-digit column is exactly what he stores.

These three show different things:

1. `(x-3)*(x+2)/7` at x = -1.5: two brackets solved one after the other, then `*` before `/`.
2. `x+3*x-10/x` at x = 4: no brackets of your own. Pass 1 does `3*4` and `10/4` before pass 2 touches `+` or `-`.
3. `-(x*(x+1)-6)/4+x` at x = 2.5: brackets two levels deep, and a minus in front of a bracket, which he handles once the bracket inside has become a number.

### (x-3)*(x+2)/7 at x = -1.5

| # | What he does | Text after the step | Stored as (20 digits) |
|---:|---|---|---|
| 1 | Copies the formula into his work buffer, puts it inside one more pair of brackets, and writes x as 20 digits. | `((-1.5-3)*(-1.5+2)/7)` | `x = 99999999999998500000` |
| 2 | Finds the first closing bracket. Its pair is (-1.5-3), 1 level inside his outer brackets. He copies the inside, -1.5-3, to a scratch area. | `((-1.5-3)*(-1.5+2)/7)` |  |
| 3 | Pass 2 (+ and -): the leftmost + or - is -. -1.5 - 3 = -4.5. The 20-digit result takes the place of the two numbers and the operator. | `-4.5` | `99999999999995500000` |
| 4 | Writes the single number back over the whole bracket and closes the gap. | `(-4.5*(-1.5+2)/7)` |  |
| 5 | Finds the first closing bracket. Its pair is (-1.5+2), 1 level inside his outer brackets. He copies the inside, -1.5+2, to a scratch area. | `(-4.5*(-1.5+2)/7)` |  |
| 6 | Pass 2 (+ and -): the leftmost + or - is +. -1.5 + 2 = 0.5. The 20-digit result takes the place of the two numbers and the operator. | `0.5` | `00000000000000500000` |
| 7 | Writes the single number back over the whole bracket and closes the gap. | `(-4.5*0.5/7)` |  |
| 8 | Only his outer brackets are left: the whole formula is now one flat bracket. He copies the inside, -4.5*0.5/7, to a scratch area. | `(-4.5*0.5/7)` |  |
| 9 | Pass 1 (* and /): the leftmost * or / is *. -4.5 * 0.5 = -2.25. The 20-digit result takes the place of the two numbers and the operator. | `-2.25/7` | `99999999999997750000` |
| 10 | Pass 1 (* and /): the leftmost * or / is /. -2.25 / 7 = -0.321428. The 20-digit result takes the place of the two numbers and the operator. | `-0.321428` | `99999999999999678572` |
| 11 | Writes the single number back over the whole bracket and closes the gap. | `-0.321428` |  |
| 12 | One number is left. It is the answer. | `-0.321428` | `99999999999999678572` |

Printed on his table: `             -0.321428`

### x+3*x-10/x at x = 4

| # | What he does | Text after the step | Stored as (20 digits) |
|---:|---|---|---|
| 1 | Copies the formula into his work buffer, puts it inside one more pair of brackets, and writes x as 20 digits. | `(4+3*4-10/4)` | `x = 00000000000004000000` |
| 2 | Only his outer brackets are left: the whole formula is now one flat bracket. He copies the inside, 4+3*4-10/4, to a scratch area. | `(4+3*4-10/4)` |  |
| 3 | Pass 1 (* and /): the leftmost * or / is *. 3 * 4 = 12. The 20-digit result takes the place of the two numbers and the operator. | `4+12-10/4` | `00000000000012000000` |
| 4 | Pass 1 (* and /): the leftmost * or / is /. 10 / 4 = 2.5. The 20-digit result takes the place of the two numbers and the operator. | `4+12-2.5` | `00000000000002500000` |
| 5 | Pass 2 (+ and -): the leftmost + or - is +. 4 + 12 = 16. The 20-digit result takes the place of the two numbers and the operator. | `16-2.5` | `00000000000016000000` |
| 6 | Pass 2 (+ and -): the leftmost + or - is -. 16 - 2.5 = 13.5. The 20-digit result takes the place of the two numbers and the operator. | `13.5` | `00000000000013500000` |
| 7 | Writes the single number back over the whole bracket and closes the gap. | `13.5` |  |
| 8 | One number is left. It is the answer. | `13.5` | `00000000000013500000` |

Printed on his table: `             13.500000`

### -(x*(x+1)-6)/4+x at x = 2.5

| # | What he does | Text after the step | Stored as (20 digits) |
|---:|---|---|---|
| 1 | Copies the formula into his work buffer, puts it inside one more pair of brackets, and writes x as 20 digits. | `(-(2.5*(2.5+1)-6)/4+2.5)` | `x = 00000000000002500000` |
| 2 | Finds the first closing bracket. Its pair is (2.5+1), 2 levels inside his outer brackets. He copies the inside, 2.5+1, to a scratch area. | `(-(2.5*(2.5+1)-6)/4+2.5)` |  |
| 3 | Pass 2 (+ and -): the leftmost + or - is +. 2.5 + 1 = 3.5. The 20-digit result takes the place of the two numbers and the operator. | `3.5` | `00000000000003500000` |
| 4 | Writes the single number back over the whole bracket and closes the gap. | `(-(2.5*3.5-6)/4+2.5)` |  |
| 5 | Finds the first closing bracket. Its pair is (2.5*3.5-6), 1 level inside his outer brackets. He copies the inside, 2.5*3.5-6, to a scratch area. | `(-(2.5*3.5-6)/4+2.5)` |  |
| 6 | Pass 1 (* and /): the leftmost * or / is *. 2.5 * 3.5 = 8.75. The 20-digit result takes the place of the two numbers and the operator. | `8.75-6` | `00000000000008750000` |
| 7 | Pass 2 (+ and -): the leftmost + or - is -. 8.75 - 6 = 2.75. The 20-digit result takes the place of the two numbers and the operator. | `2.75` | `00000000000002750000` |
| 8 | Writes the single number back over the whole bracket and closes the gap. | `(-2.75/4+2.5)` |  |
| 9 | Only his outer brackets are left: the whole formula is now one flat bracket. He copies the inside, -2.75/4+2.5, to a scratch area. | `(-2.75/4+2.5)` |  |
| 10 | The bracket starts with a minus, so he flips the sign of its first number: 2.75 becomes -2.75. | `-2.75/4+2.5` | `99999999999997250000` |
| 11 | Pass 1 (* and /): the leftmost * or / is /. -2.75 / 4 = -0.6875. The 20-digit result takes the place of the two numbers and the operator. | `-0.6875+2.5` | `99999999999999312500` |
| 12 | Pass 2 (+ and -): the leftmost + or - is +. -0.6875 + 2.5 = 1.8125. The 20-digit result takes the place of the two numbers and the operator. | `1.8125` | `00000000000001812500` |
| 13 | Writes the single number back over the whole bracket and closes the gap. | `1.8125` |  |
| 14 | One number is left. It is the answer. | `1.8125` | `00000000000001812500` |

Printed on his table: `              1.812500`

## What makes it impressive

- **Small.** 3,546 bytes on disk, and 3,904 bytes of machine code once loaded. The faithful JavaScript port in this repo is about six times larger as source text.
- **Nothing borrowed.** No runtime library: no `printf`, no `scanf`, no math library, no floating-point chip. Keyboard handling, screen layout, reading numbers, printing numbers, the four operations and the bracket solver are all his.
- **Exact decimals.** 20 digits per number, all decimal. In JavaScript, `0.1 + 0.2` gives `0.30000000000000004`. His program prints `0.300000`.
- **Safe by design.** Wrong keys never reach the formula, so the solver never sees a broken formula.
- **One clever layout.** Every number has the same width, so the solver needs no tokenizer: the numbers around an operator are always 20 bytes to the left and 20 bytes to the right.
- **Signed work.** It was paid work, so he hid his name in the code. It is decoded only while the program runs, and a checksum guards it.

## Using the port on the site

```ts
import { evaluate, solve, createProgram, allowedKeys } from "@/lib/formx/formx.ts";

// One value, with every step for animation.
const r = evaluate("(x-3)*(x+2)/7", "-1.5", true);
r.printed; // "             -0.321428", as his table prints it
r.steps;   // expand, fold, bracket, negate, op, replace, done (see the Step type)

// The whole table, built the way he builds it.
solve("(x-3)*(x+2)/7", "-1.5", "3").rows; // [{ x, fx, xText, fxText }, ...] 10 rows

// The real program, one key at a time, with its 80 x 25 text screen.
const p = createProgram();
for (const k of "x*x+1\r1\r10\r") p.key(k); // "\r" Enter, "\b" Backspace, "\x1b" Esc
p.screen();      // 25 strings of 80 characters
p.state.phase;   // "formula" | "error" | "initial" | "final" | "table" | "done"
allowedKeys(p.state.mask); // keys he accepts next while the formula is typed, for on-screen keys
```

Each step carries `before` and `after` as tokens (`{ kind: "num", digits, value }` or `{ kind: "op", op }`) and `text`, a short readable form. Op steps add `left`, `right`, `result` (each with his 20 digits), `pass` and the token index `at` of the operator. Bracket steps add `start`, `end` and `depth`.
