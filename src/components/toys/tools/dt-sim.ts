// Digi-Test's logic, shared by the server render and the toys. Values use his codes: 1 = 0, 2 = 1, 15 = X (not known
// yet), 6 = D (1 if the chip works, 0 if it is broken) and 9 = D-bar (the opposite).
export const Z = 1, O = 2, D = 6, DB = 9, X = 15;
export const NAME: Record<number, string> = { 1: '0', 2: '1', 6: 'D', 9: 'D̄', 15: 'X' };
export const NOT = (v: number) => (v === Z ? O : v === O ? Z : v === D ? DB : v === DB ? D : X);

export interface Step { a: number; c: number; say: string; regs: { name: string; value: string; means: string; changed?: boolean }[]; vis: { i: number; n: number[]; out: number; done: boolean; hit?: string } }

/** His gate evaluator (MAIN.EXE 0EFF:0120): count the inputs by kind and decide. Returns the output and every step. */
export function evaluate(ctrl: number, inv: number, ins: number[]) {
  const other = NOT(ctrl), steps: Step[] = [];
  let decided = false, agree = 0, nD = 0, nDb = 0, nX = 0, i = 0, out = X;
  const cnt = () => [agree, nD, nDb, nX];
  const regs = (ch: string[] = []) => [
    { name: 'ctl', value: NAME[ctrl], means: `the value that decides it alone (${ctrl === Z ? 'AND family' : 'OR family'})`, changed: ch.includes('ctl') },
    { name: 'i', value: String(Math.min(i, ins.length - 1)), means: 'which input', changed: ch.includes('i') },
    { name: 'agr', value: String(agree), means: `inputs at ${NAME[other]}, the value that decides nothing`, changed: ch.includes('agr') },
    { name: 'D', value: `${nD}, ${nDb}`, means: 'inputs at D, at D̄', changed: ch.includes('D') },
    { name: 'X', value: String(nX), means: 'inputs not known yet', changed: ch.includes('X') },
    { name: 'out', value: out === X ? '?' : NAME[out], means: 'the output', changed: ch.includes('out') },
  ];
  const push = (a: number, c: number, say: string, ch: string[] = [], hit?: string) =>
    steps.push({ a, c, say, regs: regs(ch), vis: { i, n: cnt(), out, done: false, hit } });

  push(0, 0, `Read the gate’s <b>controlling value</b> from its file: <b>${NAME[ctrl]}</b>. One input at ${NAME[ctrl]} decides ${ctrl === Z ? 'an AND' : 'an OR'} on its own, like <code>${ctrl === Z ? 'false &&' : 'true ||'}</code> in JavaScript.`, ['ctl']);
  push(2, 1, `Flip it: <b>${NAME[other]}</b> is the value that decides nothing. If every input is ${NAME[other]}, the output is ${NAME[other]}.`);
  do {
    const v = ins[i];
    push(3, 4, `Input ${i + 1} is <b>${NAME[v]}</b>.`, ['i'], 'read');
    if (v === ctrl) { decided = true; push(5, 5, `That is the controlling value. The output is decided: stop reading.`, [], 'ctl'); }
    else if (v === other) { agree++; push(7, 6, `That value decides nothing. Count it: ${agree}.`, ['agr'], 'agr'); }
    else if (v === D) { nD++; push(10, 7, `A <b>D</b>: 1 if the chip works, 0 if it is broken. Count it.`, ['D'], 'D'); }
    else if (v === DB) { nDb++; push(11, 8, `A <b>D̄</b>: 0 if the chip works, 1 if it is broken. Count it.`, ['D'], 'D'); }
    else { nX++; push(12, 9, `Not known yet: an <b>X</b>. Count it.`, ['X'], 'X'); }
    if (nD && nDb && !decided) { decided = true; push(14, 10, `A D and a D̄ together act like the controlling value: whichever way the chip goes, one of them is ${NAME[ctrl]}.`, [], 'ctl'); }
    i++;
    if (i < ins.length && !decided) push(16, 3, `More inputs: go round again.`);
  } while (i < ins.length && !decided);
  i = ins.length - 1;
  if (decided) { out = ctrl; push(17, 12, `Decided: the output is the controlling value, <b>${NAME[out]}</b>.`, ['out']); }
  else if (agree === ins.length) { out = other; push(18, 13, `Every input was ${NAME[other]}, so the output is <b>${NAME[out]}</b>.`, ['out']); }
  else if (!nX) { out = nD ? D : DB; push(19, 14, `Only the fault is left, so it goes through: the output is <b>${NAME[out]}</b>. The broken pin now shows one gate further on.`, ['out']); }
  else { push(20, 15, `An X still hides the answer. The gate is marked as a place to try next, and the output stays X.`); return { out: X, steps: fin(steps) }; }
  if (inv === O) { out = NOT(out); push(21, 16, `This gate inverts, so flip the answer: <b>${NAME[out]}</b>. That is how one routine also makes NAND and NOR.`, ['out']); }
  else push(21, 16, `This gate does not invert: the output stays <b>${NAME[out]}</b>.`);
  return { out, steps: fin(steps) };
}
const fin = (s: Step[]) => { s[s.length - 1].vis.done = true; return s; };

export interface SimGate { ctrl: number; inv: number; ins: number[]; out: number }
/** Every wire of a circuit in five values. inputs: net -> value. fault: one wire stuck at 0 or 1. */
export function simulate(gates: SimGate[], nets: number, fixed: Record<number, number>, fault?: { net: number; stuck: 0 | 1 }) {
  const v = new Array(nets).fill(X);
  const hurt = (n: number, good: number) => {
    if (!fault || fault.net !== n) return good;
    return fault.stuck === 0 ? (good === O ? D : good) : (good === Z ? DB : good);
  };
  for (const [n, val] of Object.entries(fixed)) v[+n] = hurt(+n, val);
  for (let pass = 0, again = true; again && pass < 50; pass++) {
    again = false;
    for (const g of gates) {
      const o = hurt(g.out, evaluate(g.ctrl, g.inv, g.ins.map(n => v[n])).out);
      if (o !== v[g.out]) { v[g.out] = o; again = true; }
    }
  }
  return v;
}
/** What a probe on this wire reads in the working circuit and in the broken one */
export const good = (v: number) => (v === D ? O : v === DB ? Z : v);
export const bad = (v: number) => (v === D ? Z : v === DB ? O : v);
