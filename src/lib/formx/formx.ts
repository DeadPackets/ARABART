// FORM_X.EXE, Yasser Awad's 1992 formula solver, ported from his Assembly routine by routine.
// A number is 20 bytes, one decimal digit per byte: 14 digits before the point, 6 after.
// A negative number is stored as its ten's complement, so its first digit is 5 to 9.
// Hex tags such as 0x678 are the routine addresses in his code segment.

export type Digits = Uint8Array;
export type Tok =
  | { kind: "op"; at: number; op: string }
  | { kind: "num"; at: number; digits: string; value: string };
export type Num = { digits: string; value: string };
export type Step =
  | { step: "expand"; formula: string; x: Num; tokens: Tok[]; text: string }
  | { step: "fold"; why: string; before: Tok[]; after: Tok[]; text: string; operand: Num; result: Num }
  | { step: "bracket"; why: string; depth: number; start: number; end: number; tokens: Tok[]; inside: Tok[]; text: string }
  | { step: "negate"; why: string; depth: number; before: Tok[]; after: Tok[]; text: string; operand: Num; result: Num }
  | { step: "op"; why: string; depth: number; pass: 1 | 2; op: string; at: number; left: Num; right: Num; result: Num; overflow: boolean; before: Tok[]; after: Tok[]; text: string }
  | { step: "replace"; depth: number; at: number; before: Tok[]; after: Tok[]; text: string }
  | { step: "done"; result: Num | null; text: string };

const N = 20;
const LP = 0x28, RP = 0x29, MUL = 0x2a, ADD = 0x2b, SUB = 0x2d, DOT = 0x2e, DIV = 0x2f, END = 0x24;
const CR = 13, BS = 8, ESC = 27;
const isDigit = (c: number) => c >= 0x30 && c <= 0x39;

export const ERRORS = [
  "Bad end of the formula  ",
  "Error in number of praces  ",
  "Error in praces arangement  ",
  "Too big number  ",
  "The magnitude is too big  ",
  "Error in number format  ",
  "Out of accurecy scope  ",
  "Error !!   There is no number yet  ",
];
export const OVERFLOW = "   *  OVERFLOW  *  ";
const BLANK = " ".repeat(49);
const PROMPTS = ["Enter the intial value ----->  X =", "Enter the final  value ----->  X ="];
const TITLE = "**       THE RESULT TABLE OF --- F(X)       ** ";
const HEADER = "        Value of X" + " ".repeat(30) + "Value of  F(X)\n\r  " + "-".repeat(73) + " ";
const ARROW = "-".repeat(22) + ">  ";
const NINE = Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0]);

// His working buffers in the data segment.
const A = new Uint8Array(N); // 0x57b
const B = new Uint8Array(N); // 0x58f
const T = new Uint8Array(N); // 0x5a3
const P = new Uint8Array(40); // 0x5b7 multiply accumulator
const Q = new Uint8Array(N); // 0x5df quotient
const S = new Uint8Array(0x7d0); // 0xdc3 scratch for one bracket
let ovf = false; // 0x1d4
let trace: Step[] | null = null;
let depth = 0;

// 0x4e2: one pass from the last digit up; each digit keeps n % 10 and hands n / 10 to the next.
function carry(n: Uint8Array, len = N): number {
  let c = 0;
  for (let i = len - 1; i >= 0; i--) {
    n[i] += c;
    const v = n[i];
    n[i] = v % 10;
    c = (v / 10) | 0;
  }
  return c;
}

// 0x49d: ten's complement (9 - digit, then + 1).
function negate(n: Uint8Array): number {
  if (n.every((d) => d === 0)) return 0;
  for (let i = 0; i < N; i++) n[i] = 9 - n[i];
  n[N - 1] += 1;
  return n[N - 1] > 9 ? carry(n) : 0;
}

// 0x678: b = a + b, overflow found from the signs.
function add(a: Uint8Array, b: Uint8Array) {
  if (ovf) return;
  const f = (a[0] > 4 ? 0xf0 : 0) | (b[0] > 4 ? 0x0f : 0);
  for (let i = 0; i < N; i++) b[i] += a[i];
  const c = carry(b);
  if (f === 0) ovf = c === 1 || b[0] > 4;
  else if (f === 0xff) ovf = c === 0 || b[0] < 4;
}

// 0x6f9: b = b - a (a is left negated).
function sub(a: Uint8Array, b: Uint8Array) {
  if (ovf) return;
  negate(a);
  add(a, b);
}

// 0x707: a = a * b, schoolbook, 20 x 20 digits into 40.
function mul(a: Uint8Array, b: Uint8Array) {
  if (ovf) return;
  P.fill(0);
  let neg = false;
  if (a[0] > 4) {
    neg = !neg;
    if (negate(a)) return void (ovf = true);
  }
  T.set(a); a.set(b); b.set(T);
  if (a[0] >= 4) {
    neg = !neg;
    if (negate(a)) return void (ovf = true);
  }
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) T[i] = a[i] * b[j];
    for (let i = 0; i < N; i++) P[j + i] += T[i];
    if (carry(P, 40)) return void (ovf = true);
  }
  T.set(P.subarray(13, 33));
  if (T[0] > 4) return void (ovf = true);
  for (let i = 0; i < 14; i++) if (P[i]) return void (ovf = true);
  a.set(T);
  if (a[0] > 4) return void (ovf = true);
  if (neg) negate(a);
}

// 0x9f1: shift the divisor up one digit, recurse while it is still small, then count on the way back.
function scale(a: Uint8Array, b: Uint8Array) {
  a.copyWithin(0, 1); a[N - 1] = 0;
  if (a[0] === 9 && a[1] === 9) scale(a, b);
  for (;;) {
    add(a, b);
    if (b[0] > 4) break;
    Q[N - 1]++;
    if (Q[N - 1] > 250) carry(Q);
  }
  sub(a, b);
  negate(a);
  a.copyWithin(1, 0, N - 1); a[0] = 9;
  Q.copyWithin(0, 1); Q[N - 1] = 0;
}

// 0x832: a = a / b by repeated subtraction; a digit may count to 250 before a carry pass.
function div(a: Uint8Array, b: Uint8Array) {
  if (ovf) return;
  let neg = false;
  if (a[0] > 4) {
    neg = !neg;
    if (negate(a)) return void (ovf = true);
  }
  T.set(a); a.set(b); b.set(T);
  if (a[0] > 4) {
    neg = !neg;
    if (negate(a)) return void (ovf = true);
  }
  if (a[0] !== 0 && b[0] !== 0) return void (ovf = true);
  if (a.every((d) => d === 0)) return void (ovf = true);
  Q.fill(0);
  if (negate(a)) ovf = true;
  if (a[0] === 9 && a[1] === 9) scale(a, b);
  for (;;) {
    add(a, b);
    if (b[0] > 4) break;
    Q[N - 1]++;
    if (Q[N - 1] > 250 && carry(Q)) ovf = true;
  }
  if (carry(Q)) ovf = true;
  sub(a, b);
  negate(a);
  for (let k = 0; k < 6; k++) {
    if (Q[0] !== 0) ovf = true;
    Q.copyWithin(0, 1); Q[N - 1] = 0;
    b.copyWithin(0, 1);
    for (;;) {
      add(a, b);
      if (b[0] > 4 || ovf) break;
      Q[N - 1]++;
      if (Q[N - 1] > 250) carry(Q);
    }
    carry(Q);
    sub(a, b);
    negate(a);
  }
  a.set(Q);
  if (a[0] >= 4) ovf = true;
  if (neg) negate(a);
}

// 0x79: the key filter. The mask holds what may come next:
// 1 ")"  2 "("  4 digit  8 x  10h * / +  20h -  40h .  80h "a point is already in this number".
export function filterKey(mask: number, key: number): number {
  switch (key) {
    case LP: return mask & 2 ? 0x2e : -1;
    case RP: return mask & 1 ? 0x31 : -1;
    case 0x58: case 0x78: return mask & 8 ? 0x31 : -1;
    case DIV: case MUL: case ADD: return mask & 0x10 ? 0x0e : -1;
    case DOT: return (mask & 0xc0) === 0x40 ? 0x84 : -1;
    case SUB: return mask & 0x20 ? 0x0e : -1;
  }
  return isDigit(key) && mask & 4 ? (mask & 0x80) | 0x75 : -1;
}

export const START_MASK = 0x2e;
export const allowedKeys = (mask: number) =>
  [..."0123456789.xX()+-*/"].filter((c) => filterKey(mask, c.charCodeAt(0)) >= 0).join("");

// 0x191: checks on Enter. F holds "(" + typed text; si is the next free slot.
function enterCheck(F: Uint8Array, si: number): number {
  F[si] = END; F[si + 1] = END;
  const last = F[si - 1];
  if (!(last === RP || last === 0x78 || last === 0x58 || isDigit(last))) return 1;
  let open = 0, close = 1;
  for (let i = 0; ; i++) {
    const c = F[i];
    if (c === END) {
      F[i] = RP;
      return open === close ? 0 : 2;
    }
    if (c === LP) open++;
    else if (c === RP && ++close > open) return 3;
  }
}

// 0x288: copy the formula into E, every number and every x as 20 digits; 4 means a number is too big.
function expand(F: Uint8Array, x: Digits, E: Uint8Array): { err: number; usedX: boolean } {
  let si = 0, di = 0, usedX = false;
  for (;;) {
    const al = F[si++];
    if (isDigit(al)) {
      const first = --si;
      E.fill(0x30, di, di + N);
      di += N - 7;
      while (isDigit(F[si])) si++;
      const count = si - first;
      if (count >= 8) return { err: 4, usedX };
      E.set(F.subarray(first, si), di - count + 1);
      const units = di;
      if (F[si] === DOT) {
        si++; di++;
        while (isDigit(F[si])) E[di++] = F[si++];
      }
      di = units + 7;
    } else if (al === 0x58 || al === 0x78) {
      E.set(x, di);
      di += N;
      usedX = true;
    } else {
      E[di++] = al;
      if (al === END) break;
    }
  }
  for (let i = 0; E[i] !== END; i++) if (E[i] >= 0x30) E[i] -= 0x30; // 0x312
  if (trace) {
    const t = tokens(E);
    trace.push({ step: "expand", formula: String.fromCharCode(...F.subarray(1, F.indexOf(END) - 1)), x: num(x), tokens: t, text: text(t) });
  }
  // 0x327: "(-number" becomes one negative number now; "(-(" waits for its bracket.
  for (let i = 0; E[i] !== END; ) {
    if (E[i] === LP && E[i + 1] === SUB && E[i + 2] !== LP) {
      const before = trace && tokens(E), m = i + 1;
      A.set(E.subarray(m + 1, m + 1 + N));
      const operand = trace && num(A);
      negate(A);
      E.set(A, m);
      let d = m + N;
      do E[d] = E[d + 1]; while (E[d++] !== END);
      if (trace && before && operand) {
        const after = tokens(E);
        trace.push({ step: "fold", why: "A minus right after an opening bracket: the number is stored negative.", before, after, text: text(after), operand, result: num(A) });
      }
      i = 0;
    } else i++;
  }
  return { err: 0, usedX };
}

// 0xb9d and the four writers at 0xbb2, 0xbd8, 0xc0f, 0xc35. i is the index just after the operator.
function operate(op: number, i: number) {
  const before = trace && tokens(S);
  let r: Uint8Array;
  if (op === SUB) {
    A.set(S.subarray(i, i + N)); B.set(S.subarray(i - 21, i - 1));
  } else {
    B.set(S.subarray(i, i + N)); A.set(S.subarray(i - 21, i - 1));
  }
  const left = trace && num(op === SUB ? B : A), right = trace && num(op === SUB ? A : B);
  if (op === ADD) { add(A, B); r = B; }
  else if (op === SUB) { sub(A, B); r = B; }
  else if (op === MUL) { mul(A, B); r = A; }
  else { div(A, B); r = A; }
  const di = i - 21;
  S.set(r, di);
  S.copyWithin(di + N, di + N + 21, S.length - 1);
  if (trace && before && left && right) {
    const after = tokens(S), pass = op === MUL || op === DIV ? 1 : 2;
    trace.push({
      step: "op", depth, pass, op: String.fromCharCode(op), at: before.findIndex((t) => t.at === i - 1),
      why: pass === 1 ? "The leftmost * or / in this bracket." : "No * or / is left, so the leftmost + or -.",
      left, right, result: num(r), overflow: ovf, before, after, text: text(after),
    });
  }
}

// 0xaa4: solve one bracket with no brackets inside, then write the result over it in E.
function reduce(E: Uint8Array, open: number, close: number): number {
  if (ovf) return open;
  S.set(E.subarray(open + 1, close));
  S[close - open - 1] = END;
  if (trace) {
    const all = tokens(E);
    trace.push({
      step: "bracket", depth, why: "The scan reached a closing bracket, so nothing inside this pair has brackets left.",
      start: all.findIndex((t) => t.at === open), end: all.findIndex((t) => t.at === close), tokens: all, inside: tokens(S), text: text(all),
    });
  }
  if (S[0] === SUB) {
    const before = trace && tokens(S);
    A.set(S.subarray(1, 1 + N));
    const operand = trace && num(A);
    negate(A);
    S.set(A);
    let d = N - 1;
    for (;;) {
      const al = S[d + 1];
      S[d++] = al;
      if (al === END) break;
    }
    if (trace && before && operand) {
      const after = tokens(S);
      trace.push({ step: "negate", depth, why: "The bracket starts with a minus: its first number changes sign.", before, after, text: text(after), operand, result: num(S.subarray(0, N)) });
    }
  }
  for (const [x, y] of [[DIV, MUL], [SUB, ADD]]) {
    for (let i = 0; ; ) {
      const c = S[i++];
      if (c === END) break;
      if (c === x || c === y) {
        operate(c, i);
        if (ovf) return open; // the row now prints * OVERFLOW *, nothing after this can change that
        i = 0;
      }
    }
  }
  const before = trace && tokens(E);
  let di = open;
  for (let k = 0; S[k] !== END; k++) E[di++] = S[k];
  for (let si = close + 1; ; ) {
    const al = E[si++];
    E[di++] = al;
    if (al === END) break;
  }
  if (trace && before) {
    const after = tokens(E);
    trace.push({ step: "replace", depth, at: after.findIndex((t) => t.at === open), before, after, text: text(after) });
  }
  return open;
}

// 0xa58: walk right from "("; a "(" goes one level deeper, a ")" closes this level.
function scan(E: Uint8Array, open: number): number {
  let si = open;
  for (;;) {
    if (ovf) return open;
    const c = E[++si];
    if (c === RP) break;
    if (c === LP) {
      depth++;
      si = scan(E, si);
      depth--;
    }
  }
  return reduce(E, open, si);
}

// 0x434: a typed x value ("-12.5") into 20 digits.
export function toNumber(typed: string): Digits {
  if (!/^-?\d{1,7}(\.\d{1,3})?$/.test(typed)) throw new Error(ERRORS[5]);
  const neg = typed[0] === "-";
  const [int, frac = ""] = typed.slice(neg ? 1 : 0).split(".");
  const n = new Uint8Array(N);
  n.set([...int].map(Number), 14 - int.length);
  n.set([...frac].map(Number), 14);
  if (neg) {
    negate(n);
    carry(n);
  }
  return n;
}

// 0xce0: skip = first digit slot shown, frac = digits after the point, pad = leading zeros as spaces.
export function format(src: Digits, skip = 0, frac = 6, pad = true): string {
  const a = Uint8Array.from(src);
  if (a[0] === 0x23) return OVERFLOW;
  let sign = " ", s = "", i = skip;
  if (a[0] > 4) {
    negate(a);
    sign = "-";
  }
  for (; i < 13 && a[i] === 0; i++) if (pad) s += " ";
  s += sign;
  for (; i < 14; i++) s += String.fromCharCode(a[i] + 0x30);
  s += ".";
  for (let k = 0; k < frac; k++) s += String.fromCharCode(a[14 + k] + 0x30);
  return s;
}

const num = (d: Uint8Array): Num => ({ digits: d.join(""), value: format(d, 0, 6, false).trim() });
const short = (v: string) => v.replace(/\.?0+$/, "");

export function tokens(buf: Uint8Array): Tok[] {
  const out: Tok[] = [];
  for (let i = 0; buf[i] !== END && i < buf.length; ) {
    const c = buf[i];
    if (c === LP || c === RP || c === MUL || c === ADD || c === SUB || c === DIV) out.push({ kind: "op", at: i++, op: String.fromCharCode(c) });
    else {
      const d = buf.subarray(i, i + N);
      out.push({ kind: "num", at: i, digits: d.join(""), value: num(d).value });
      i += N;
    }
  }
  return out;
}
export const text = (t: Tok[]) => t.map((k) => (k.kind === "op" ? k.op : short(k.value))).join("");

function formulaBuffer(formula: string): Uint8Array {
  const F = new Uint8Array(80).fill(0x20);
  F[0] = LP;
  let mask = START_MASK;
  [...formula].forEach((ch, i) => {
    mask = filterKey(mask, ch.charCodeAt(0));
    if (mask < 0) throw new Error(`He refuses "${ch}" at position ${i + 1}.`);
  });
  if (formula.length > 69) throw new Error("A formula holds at most 69 characters.");
  F.set([...formula].map((c) => c.charCodeAt(0)), 1);
  const err = enterCheck(F, formula.length + 1);
  if (err) throw new Error(ERRORS[err - 1]);
  return F;
}

// 0xd67: step = (final - initial) / 9, the x column by adding the step nine times, then one evaluation per row.
function table(F: Uint8Array, x0: Digits, x1: Digits, usedX: boolean) {
  ovf = false;
  A.set(x0); B.set(x1);
  sub(A, B);
  A.set(B); B.set(NINE);
  div(A, B);
  const step = A.slice(), xs: Digits[] = [], fx: Digits[] = [], E = new Uint8Array(0x7d0);
  B.set(x0);
  for (let i = 0; i < 10; i++) {
    xs.push(B.slice());
    add(A, B);
  }
  for (let i = 0; i < 10; i++) {
    ovf = false;
    expand(F, xs[i], E);
    scan(E, 0);
    fx.push(ovf ? new Uint8Array(N).fill(0x23) : E.slice(0, N));
    if (!usedX) break;
  }
  return { step, xs, fx };
}

// Text page 1 of the 80 x 25 screen, written the way DOS prints one character at a time.
class Screen {
  cells: string[] = Array(2000).fill(" ");
  x = 0;
  y = 0;
  at(row: number, col: number) { this.y = row; this.x = col; }
  print(s: string) { for (const ch of s) this.putc(ch.charCodeAt(0)); }
  putc(c: number) {
    if (c === 13) this.x = 0;
    else if (c === 10) this.y++;
    else if (c === 8) this.x = Math.max(0, this.x - 1);
    else if (c !== 7) {
      const i = this.y * 80 + this.x;
      if (i < 2000) this.cells[i] = String.fromCharCode(c);
      if (++this.x >= 80) { this.x = 0; this.y++; }
    }
    if (this.y >= 25) {
      this.cells.splice(0, 80);
      this.cells.push(...Array(80).fill(" "));
      this.y = 24;
    }
  }
  clear() { this.cells.fill(" "); }
  lines() { return Array.from({ length: 25 }, (_, r) => this.cells.slice(r * 80, r * 80 + 80).join("")); }
}

export type Phase = "formula" | "error" | "initial" | "final" | "table" | "done";
export type ProgramState = {
  phase: Phase;
  mask: number; // key filter mask while typing the formula
  formula: string;
  typed: string; // x value being typed
  error: string;
  table: { step: Digits; xs: Digits[]; fx: Digits[] } | null;
};

// The whole program, one key at a time: each `yield` is one wait for a key (INT 21h, AH=7).
function* program(scr: Screen, st: ProgramState): Generator<void, void, number> {
  const F = new Uint8Array(80).fill(0x20); // 0x1e2, his "(" is already in front
  const hist = new Uint8Array(80); // 0x232, the mask before each typed character, for Backspace
  const X = new Uint8Array(N), X0 = new Uint8Array(N), X1 = new Uint8Array(N), E = new Uint8Array(0x7d0);
  F[0] = LP;
  hist[0] = START_MASK;
  let mask = START_MASK, si = 1, di = 5;

  function* showError(code: number): Generator<void, void, number> { // 0x232
    const x = scr.x, y = scr.y, back = st.phase;
    scr.at(1, 5); scr.print(ERRORS[code - 1]);
    st.phase = "error"; st.error = ERRORS[code - 1];
    yield;
    st.phase = back; st.error = "";
    scr.at(1, 5); scr.print(BLANK);
    scr.at(y, x);
  }

  function* readNumber(which: 0 | 1): Generator<void, string | null, number> { // 0x4fc
    const row = which ? 10 : 8, phase = which ? "final" : "initial";
    restart: for (;;) {
      let count = 0, typed = "", k: number;
      scr.at(row, 0); scr.print(BLANK); scr.at(row, 0); scr.print(PROMPTS[which]); scr.at(row, 35);
      for (;;) {
        st.phase = phase; st.typed = typed;
        k = yield;
        if (k === CR) { yield* showError(8); continue; }
        if (k === ESC) { scr.at(row, 0); scr.print(BLANK); scr.at(row, 0); return null; }
        if (k === SUB) {
          typed = "-"; scr.putc(k); st.typed = typed;
          k = yield;
          break;
        }
        if (k > 0x39) continue;
        if (k >= 0x30) break;
        if (k === DOT) yield* showError(6);
      }
      for (;;) {
        if (k === CR || k === DOT) {
          if (count === 0) yield* showError(6);
          else if (k === CR) return typed;
          else { typed += "."; scr.putc(DOT); break; }
        } else if (k === BS || k === ESC) continue restart;
        else if (isDigit(k)) {
          if (count === 7) yield* showError(5);
          else { count++; typed += String.fromCharCode(k); scr.putc(k); }
        }
        st.phase = phase; st.typed = typed;
        k = yield;
      }
      count = 0;
      for (;;) {
        st.phase = phase; st.typed = typed;
        k = yield;
        if (k === CR) {
          if (count) return typed;
          yield* showError(6);
        } else if (k === ESC || k === BS) continue restart;
        else if (isDigit(k)) {
          if (count > 2) yield* showError(7);
          else { count++; typed += String.fromCharCode(k); scr.putc(k); }
        }
      }
    }
  }

  scr.at(5, 0); scr.print("F(x)=");
  formula: for (;;) {
    st.phase = "formula"; st.mask = mask; st.formula = String.fromCharCode(...F.subarray(1, si));
    const k = yield;
    if (k === BS) {
      if (si > 1) {
        scr.at(5, di - 1); mask = hist[si - 1]; scr.putc(0x20); scr.at(5, di - 1);
        si--; di--;
      }
      continue;
    }
    if (k === ESC) return void (st.phase = "done");
    if (k !== CR) {
      const next = filterKey(mask, k);
      if (next < 0) continue;
      const before = mask;
      mask = next; // he updates the mask before the length check
      if (si === 70) continue;
      hist[si] = before; F[si] = k; scr.putc(k);
      si++; di++;
      continue;
    }
    let err = enterCheck(F, si), usedX = false;
    if (!err) ({ err, usedX } = expand(F, X, E));
    if (err) {
      yield* showError(err);
      scr.at(5, di);
      continue;
    }
    if (usedX) {
      for (;;) {
        const a = yield* readNumber(0);
        if (a === null) {
          scr.at(5, di);
          continue formula;
        }
        X0.set(toNumber(a));
        const b = yield* readNumber(1);
        if (b === null) continue;
        X1.set(toNumber(b));
        break;
      }
    }
    const t = (st.table = table(F, X0, X1, usedX));
    scr.clear();
    scr.at(2, 16); scr.print(TITLE);
    scr.at(5, 0); scr.print("F(x)=" + String.fromCharCode(...F.subarray(0, F.indexOf(END))));
    if (usedX) {
      scr.at(8, 0); scr.print(HEADER);
      for (let i = 0; i < 10; i++) {
        scr.at(11 + i, 6); scr.print(format(t.xs[i], 6, 3));
        scr.at(11 + i, 21); scr.print(ARROW);
        scr.at(11 + i, 45); scr.print(format(t.fx[i], 0, 6));
      }
    } else {
      scr.at(8, 0); scr.print("F(x)=");
      scr.at(8, 5); scr.print(format(t.fx[0], 0, 6, false));
    }
    st.phase = "table";
    yield;
    return void (st.phase = "done"); // he then shows his credit and exits
  }
}

// Keys: characters, or 13 Enter, 8 Backspace, 27 Esc (also "\r", "\b", "\x1b").
export function createProgram() {
  const scr = new Screen();
  const state: ProgramState = { phase: "formula", mask: START_MASK, formula: "", typed: "", error: "", table: null };
  const run = program(scr, state);
  run.next();
  return {
    state,
    key(k: string | number) {
      if (state.phase !== "done") run.next(typeof k === "number" ? k : k.charCodeAt(0));
    },
    screen: () => scr.lines(),
  };
}

// The full table for a formula, as the program builds and prints it.
export function solve(formula: string, x0 = "0", x1 = "0") {
  const F = formulaBuffer(formula), zero = new Uint8Array(N);
  const { err, usedX } = expand(F, zero, new Uint8Array(0x7d0));
  if (err) throw new Error(ERRORS[err - 1]);
  const t = table(F, usedX ? toNumber(x0) : zero, usedX ? toNumber(x1) : zero, usedX);
  return {
    usedX,
    step: t.step,
    rows: t.fx.map((fx, i) => ({ x: t.xs[i], fx, xText: format(t.xs[i], 6, 3), fxText: format(fx, 0, 6, usedX) })),
  };
}

// One value of the formula at one typed x, with every step for animation when asked.
export function evaluate(formula: string, x = "0", withTrace = false) {
  const F = formulaBuffer(formula), E = new Uint8Array(0x7d0), steps: Step[] = [];
  trace = withTrace ? steps : null;
  depth = 0;
  ovf = false;
  try {
    const { err } = expand(F, toNumber(x), E);
    if (err) throw new Error(ERRORS[err - 1]);
    scan(E, 0);
  } finally {
    trace = null;
  }
  const result = ovf ? null : num(E.subarray(0, N));
  if (withTrace) steps.push({ step: "done", result, text: result ? short(result.value) : OVERFLOW.trim() });
  return { result, printed: ovf ? OVERFLOW : format(E, 0, 6), overflow: ovf, steps };
}
