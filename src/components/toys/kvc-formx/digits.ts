// His digit-by-digit arithmetic (FORM_X.EXE 0x4e2 carry, 0x49d negate, 0x678 add, 0x707 multiply), replayed with every
// intermediate row kept, for the long-arithmetic toy. The final digits match src/lib/formx/formx.ts exactly.

export type Op = '*' | '+' | '-';
export interface Row { label: string; cells: (number | null)[]; tone: 'a' | 'b' | 'p' | 't' | 'r' }
export interface DStep { say: string; rows: Row[]; kind?: 'carry'; before?: (number | null)[]; hl?: number[]; keep?: [number, number]; result?: string }
export interface Trace { cols: number; point: number; steps: DStep[]; value: string; digits: string }

const N = 20;
export const VALID = /^\d{1,6}(\.\d{1,6})?$/;

// "12.5" into 20 digits: 14 before the point, 6 after
export function toDigits(s: string): number[] {
  const [int, frac = ''] = s.split('.');
  const d = new Array(N).fill(0);
  [...int].forEach((c, i) => (d[14 - int.length + i] = +c));
  [...frac].forEach((c, i) => (d[14 + i] = +c));
  return d;
}
// One pass from the right: each digit keeps n % 10 and hands n / 10 to its left neighbor
function carry(n: number[]) {
  let c = 0;
  for (let i = n.length - 1; i >= 0; i--) { const v = n[i] + c; n[i] = v % 10; c = (v / 10) | 0; }
  return c;
}
export function read(d: number[]): string {
  const neg = d[0] > 4, a = [...d];
  if (neg) { for (let i = 0; i < N; i++) a[i] = 9 - a[i]; a[N - 1]++; carry(a); }
  const int = a.slice(0, 14).join('').replace(/^0+(?=\d)/, ''), frac = a.slice(14).join('').replace(/0+$/, '');
  return (neg ? '-' : '') + int + (frac ? '.' + frac : '');
}
const fmt = (s: string) => s.replace('-', '−');

export function trace(op: Op, x: string, y: string): Trace {
  const A = toDigits(x), B = toDigits(y), steps: DStep[] = [];
  const row = (label: string, cells: (number | null)[], tone: Row['tone']): Row => ({ label, cells: [...cells], tone });

  if (op === '*') {
    // Columns k = 13..last: k holds the weight 10^(26-k); a digit i of a number sits at k = i + 13
    const P = new Array(40).fill(0);
    const rows: Row[] = [];
    const parts: { j: number; cells: number[] }[] = [];
    for (let j = 0; j < N; j++) {
      if (!A[j]) continue; // a zero digit adds nothing to the total
      const cells = new Array(40).fill(null);
      for (let i = 0; i < N; i++) if (B[i]) cells[i + j] = B[i] * A[j];
      parts.push({ j, cells });
    }
    let last = 32;
    parts.forEach(p => p.cells.forEach((v, k) => { if (v !== null) last = Math.max(last, k); }));
    const lo = 13, cols = last - lo + 1;
    const cut = (a: (number | null)[]) => a.slice(lo, last + 1);
    const at13 = (d: number[]) => { const c = new Array(40).fill(null); d.forEach((v, i) => (c[i + 13] = v)); return c; };
    rows.push(row(fmt(x), cut(at13(A)), 'a'), row('× ' + fmt(y), cut(at13(B)), 'b'));
    steps.push({ say: `Two numbers, 20 digits each: 14 before the point and 6 after. Every digit has its own byte.`, rows: [...rows] });
    for (const p of parts) {
      const d = A[p.j];
      p.cells.forEach((v, k) => { if (v !== null) P[k] += v; });
      const raw = [...P];
      rows.push(row(`${fmt(y)} × ${d}`, cut(p.cells), 'p'));
      steps.push({ say: `The digit <b>${d}</b> of the first number times every digit of the second, each product in its own column. It goes straight into the total. A column can hold more than 9 for now.`, rows: [...rows, row('total', cut(raw), 't')], hl: p.cells.map((v, k) => (v === null ? -1 : k - lo)).filter(k => k >= 0) });
      carry(P);
      steps.push({ say: 'A carry pass, right to left: each column keeps its last digit and hands the rest to the column on its left. One divide by 10 gives him both.', rows: [...rows, row('total', cut(P), 't')], kind: 'carry', before: cut(raw) });
    }
    const R = P.slice(13, 33);
    const value = read(R);
    steps.push({
      say: `He keeps the 20 digits in the middle: 14 before the point and 6 after. ${last > 32 ? 'Digits past the sixth decimal are cut. ' : ''}<b>${fmt(x)} × ${fmt(y)} = ${fmt(value)}</b>`,
      rows: [...rows, row('total', cut(P), 't'), row('answer', cut([...new Array(13).fill(null), ...R, ...new Array(7).fill(null)]), 'r')], keep: [0, 19], result: value,
    });
    return { cols, point: 26 - lo, steps, value, digits: R.join('') };
  }

  // + and -: the 20 digits, point after digit 14
  const rows: Row[] = [row(fmt(x), A, 'a'), row((op === '+' ? '+ ' : '− ') + fmt(y), B, 'b')];
  steps.push({ say: 'Two numbers, 20 digits each: 14 before the point and 6 after. Every digit has its own byte.', rows: [...rows] });
  let Y = [...B];
  if (op === '-') {
    if (B.every(v => !v)) {
      steps.push({ say: 'Subtracting zero changes nothing. He checks for an all-zero number first.', rows: [...rows] });
    } else {
      Y = B.map(v => 9 - v);
      rows.push(row('9 − each', Y, 'p'));
      steps.push({ say: `To subtract, he adds the opposite. First every digit of ${fmt(y)} becomes 9 minus itself.`, rows: [...rows] });
      const raw = [...Y];
      raw[N - 1] += 1;
      Y = [...raw];
      carry(Y);
      rows.push(row(`−${fmt(y)}`, Y, 'p'));
      steps.push({ say: `Then 1 more on the last digit, with a carry pass. This is <b>−${fmt(y)}</b> the way he stores it: like a car’s odometer rolled back below zero, 0000 becomes 9999.`, rows: [...rows], kind: 'carry', before: raw });
    }
  }
  const raw = A.map((v, i) => v + Y[i]);
  steps.push({ say: 'Add each column. A column can reach 18: that is fine for now.', rows: [...rows, row('sum', raw, 't')], hl: raw.map((v, i) => (v > 9 ? i : -1)).filter(i => i >= 0) });
  const S = [...raw], out = carry(S);
  steps.push({
    say: `A carry pass, right to left: each column keeps its last digit and hands the rest to its left neighbor.${op === '-' && out ? ' The 1 that falls off the left end is simply dropped. That is the whole trick.' : ''}`,
    rows: [...rows, row('sum', S, 't')], kind: 'carry', before: raw,
  });
  const value = read(S);
  steps.push({
    say: `${S[0] > 4 ? 'A first digit from 5 to 9 means the number is negative. Read it by flipping it back. ' : ''}<b>${fmt(x)} ${op === '+' ? '+' : '−'} ${fmt(y)} = ${fmt(value)}</b>`,
    rows: [...rows, row('sum', S, 't'), row('answer', S, 'r')], result: value,
  });
  return { cols: N, point: 13, steps, value, digits: S.join('') };
}
