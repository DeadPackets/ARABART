// Feed the same keys to the real FORM_X.EXE (Unicorn DOS harness) and to the port; compare page 1 character for character.
// Rerun: node research/artifacts/programs/formx-port/verify.ts          (add --port-only to reuse emu.json)
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createProgram, evaluate, solve } from "../../../../src/lib/formx/formx.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
type Case = { id: string; group: string; keys: string; formula?: string; x0?: string; x1?: string; maxins?: number };

let seed = 19920101;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T,>(a: T[] | string): T => a[Math.floor(rand() * a.length)] as T;
const digits = (n: number) => Array.from({ length: n }, () => pick("0123456789")).join("");

function genNumber(): string {
  const r = rand();
  const int = r < 0.4 ? 1 : r < 0.6 ? 2 : r < 0.75 ? 3 : 4 + Math.floor(rand() * 4);
  let s = (int > 1 ? pick("123456789") : "") + digits(int > 1 ? int - 1 : 1);
  if (rand() < 0.45) s += "." + digits(1 + Math.floor(rand() * 8));
  return s;
}
function genExpr(depth: number): string {
  let s = rand() < 0.25 ? "-" : "";
  const terms = 1 + Math.floor(rand() * 3);
  for (let t = 0; t < terms; t++) {
    if (t) s += pick("+-*/");
    const r = rand();
    if (depth < 4 && r < 0.3) s += "(" + genExpr(depth + 1) + ")";
    else if (r < 0.65) s += rand() < 0.85 ? "x" : "X";
    else s += genNumber();
  }
  return s;
}
function genX(): string {
  const r = rand();
  const int = r < 0.5 ? 1 : r < 0.75 ? 2 : 1 + Math.floor(rand() * 7);
  let s = (rand() < 0.3 ? "-" : "") + (int > 1 ? pick("123456789") : "") + digits(int > 1 ? int - 1 : 1);
  if (rand() < 0.5) s += "." + digits(1 + Math.floor(rand() * 3));
  return s;
}

const hand: [string, string?, string?][] = [
  ["(x-3)*(x+2)/7", "-1.5", "3"], ["1/6"], ["x/0", "1", "10"], ["x*x+1", "1", "10"], ["x*x*x-2*x+1", "-5", "5"],
  ["-(1/3)"], ["-(x/3)", "0", "9"], ["-x", "-3", "3"], ["-x*2", "-3", "3"], ["(-x)*(-x)", "-4", "5"], ["-(-x)", "-2", "7"],
  ["-(-(-(x)))", "1", "2"], ["((((x))))", "-7", "2"], ["((((((((((1/0))))))))))"], ["((((((((((((((((((((1/0))))))))))))))))))))"],
  ["((((((((x+1)*2)-3)/4)+5)*6)-7)/8)", "-100", "100"], ["1234567*x", "1000000", "9999999"], ["9999999*9999999"],
  ["9999999*999999"], ["1.123456789+x", "0", "1"], ["0.000001*x", "-9999999", "9999999"], ["x/0.000001", "-9", "9"],
  ["1/0.000007"], ["x/7", "-9999999", "9999999"], ["x-x", "-5", "5"], ["x+x+x+x", "-2.5", "2.5"], ["2*3+4*5-6/7"],
  ["10-2-3"], ["100/10/2"], ["2-3*4+5"], ["x*x-x*x", "-3", "3"], ["(x+1)/(x-1)", "0", "2"], ["1/x", "-9", "9"],
  ["1/x", "0", "9"], ["1/x", "1", "1"], ["x", "9", "0"], ["x", "0", "1"], ["x", "-0.001", "0.001"],
  ["x", "-9999999.999", "9999999.999"], ["x*x", "9999999", "9999999"], ["x*x", "3162277", "3162278"], ["x/3*3", "-1", "1"],
  ["x*0.5", "-7", "7"], ["5000000*2000000"], ["4000000*1000000"], ["x*999999+x*999999+x*999999+x*999999+x*999999+x*999999", "1000000", "9999999"],
  ["-x*999999-x*999999-x*999999-x*999999-x*999999-x*999999", "1000000", "9999999"],
  ["(x*999999+x*999999)/(x*999999+x*999999)", "1000000", "9999999"], ["x*999999+x*999999", "9999990", "9999999"],
  ["2*(-x)", "-1", "1"], ["(-3)*(-3)"], ["(-0)"], ["-0"], ["0/x", "0", "0"], ["x/x", "-4.5", "4.5"], ["000123.4500*x", "1", "2"],
  ["1.5+2.25*x", "-1.25", "1.75"], ["X*X+x", "-2", "2"], ["x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x+x", "1", "9"],
  ["x/3", "-1", "1"], ["-(x/3)+(x/3)", "-1", "1"], ["1/3+1/3+1/3"], ["2/3*3"], ["x/0.001", "-9999", "9999"],
  ["x/1000000/1000000", "1", "9999999"], ["9999999.999999*9999999.999999"], ["0.999999*0.999999"], ["-(0.000001)"],
  ["-(x)*(x)", "-0.5", "0.5"], ["(x-1)*(x-2)*(x-3)*(x-4)*(x-5)", "0", "6"], ["x/(x-x)", "1", "2"], ["(1+2)*(3+4)/(5+6)-(7-8)"],
  ["-(x*x*x)/(x*x)", "-3", "3"], ["(x/7)*7-x", "-9", "9"], ["1/7/7/7/7/7/7/7"], ["7654321/1234567"], ["9999999/0.000001"],
  ["0.000001/9999999"], ["-9999999-x", "-9999999", "9999999"],
  ["0.000001*(x*999999+x*999999+x*999999+x*999999+x*999999)", "8100000", "9999999"],
  ["(x*999999+x*999999+x*999999+x*999999+x*999999)/1", "8100000", "9999999"], ["(x*999999+x*999999)/0.1", "1000000", "9999999"],
  ["x+3*x-10/x", "4", "13"], ["-(x*(x+1)-6)/4+x", "2.5", "7"], ["0.1+0.2"], ["(x)*(x)", "10", "100"],
];

const cases: Case[] = [];
for (const [i, [f, x0, x1]] of hand.entries())
  cases.push({ id: `hand-${i + 1}`, group: "hand-picked formulas", keys: `${f}\r${x0 ?? ""}${x0 ? "\r" : ""}${x1 ?? ""}${x1 ? "\r" : ""}`, formula: f, x0, x1 });
for (let i = 0; cases.length < hand.length + 160; i++) {
  const f = genExpr(0);
  if (f.length > 69) continue;
  const x0 = genX(), x1 = genX();
  cases.push({ id: `rand-${i + 1}`, group: "random formulas", keys: `${f}\r${x0}\r${x1}\r`, formula: f, x0, x1 });
}
const errorKeys = [
  "x+\r", "(x\r", "x)\r", "12345678\r", "x\r\r", "x\r.", "x\r12345678", "x\r1.2345", "x\r-\r", "x\r1.\r", "\r", "1/(2*(3\r",
  "x\r5\r\r", "x\r5\r9.9999", "(((x))))\r", "x\r12\b3\r4\r", "x\r\x1b+1\r2\r3\r", "x\r1\r\x1b5\r6\r", "x\r-\b7\r8\r",
  "x+(\b1\r1\r2\r", "x**1\r1\r2\r", "x1\r1\r2\r", "1..5*x\r1\r2\r", "(-(-1))\r", "(-x)\r1\r", "x/y\r2\r3\r", "\x1b", "x*-1\r2\r3\r", "x--1\r2\r3\r", "2x+1\r",
];
for (const [i, k] of errorKeys.entries()) cases.push({ id: `keys-${i + 1}`, group: "error messages and editing", keys: k });
const long = "x+".repeat(34) + "x";
cases.push({ id: "keys-limit-1", group: "error messages and editing", keys: long + "+(\r1\r2\r" });
cases.push({ id: "keys-limit-2", group: "error messages and editing", keys: long + "+\b\b-1\r1\r2\r" });
cases.push({ id: "keys-limit-3", group: "error messages and editing", keys: long + "*\b\r3\r4\r" });
const alphabet = "0123456789000111xxxxX()()((+-*/+-*/...\r\b\b a=^";
for (let i = 0; i < 70; i++) {
  let k = "";
  const n = 10 + Math.floor(rand() * 60);
  for (let j = 0; j < n; j++) k += pick(alphabet);
  if (rand() < 0.1) k += "\x1b";
  cases.push({ id: `fuzz-${i + 1}`, group: "random keystrokes", keys: k + `\r${genX()}\r${genX()}\r` });
}

// The port also decides where to stop feeding keys: when the table is up or the program has quit.
function runPort(keys: string) {
  const p = createProgram();
  let used = 0;
  for (const ch of keys) {
    if (p.state.phase === "table" || p.state.phase === "done") break;
    p.key(ch);
    used++;
  }
  return { used, p };
}
for (const c of cases) c.keys = c.keys.slice(0, runPort(c.keys).used);

const casesPath = join(HERE, "cases.json"), emuPath = join(HERE, "emu.json");
writeFileSync(casesPath, JSON.stringify(cases, null, 1));
if (!process.argv.includes("--port-only"))
  execFileSync("uv", ["run", "-q", "--with", "unicorn", "python", "-I", join(HERE, "emu_batch.py"), casesPath, emuPath], { stdio: "inherit" });
const emu: { id: string; waiting: boolean; finished: boolean; screen: string }[] = JSON.parse(readFileSync(emuPath, "utf8"));
const byId = new Map(emu.map((e) => [e.id, e]));

const groups = new Map<string, { n: number; ok: number }>();
const mismatches: string[] = [];
let apiChecks = 0, apiOk = 0, tables = 0, rows = 0, overflowRows = 0;
const show = (k: string) => JSON.stringify(k).slice(1, -1).replace(/\|/g, "\\|");
for (const c of cases) {
  const { p } = runPort(c.keys);
  const mine = p.screen().map((l) => l.trimEnd()).join("\n");
  const real = byId.get(c.id);
  const g = groups.get(c.group) ?? { n: 0, ok: 0 };
  g.n++;
  groups.set(c.group, g);
  const same = !!real && real.finished && real.screen === mine && real.waiting === (p.state.phase !== "done");
  if (same) g.ok++;
  else {
    const a = (real?.screen ?? "").split("\n"), b = mine.split("\n");
    const diff = a.flatMap((l, i) => (l === b[i] ? [] : [`  row ${i}: real ${JSON.stringify(l)}`, `  row ${i}: port ${JSON.stringify(b[i])}`]));
    mismatches.push(`### ${c.id}\nKeys: \`${show(c.keys)}\` (real finished: ${real?.finished}, waiting: ${real?.waiting})\n\n\`\`\`\n${diff.join("\n")}\n\`\`\``);
  }
  const t = p.state.table;
  if (p.state.phase === "table" && t) {
    tables++;
    rows += t.fx.length;
    overflowRows += t.fx.filter((f) => f[0] === 0x23).length;
  }
  // The public API must agree with the program: solve() on the whole table, evaluate() with trace on the first row.
  if (c.formula && p.state.phase === "table") {
    apiChecks++;
    const printed = p.screen().slice(11, 21).map((l) => l.slice(45).trimEnd());
    try {
      const s = solve(c.formula, c.x0, c.x1);
      const e = evaluate(c.formula, c.x0 ?? "0", true);
      const okSolve = s.usedX ? s.rows.every((r, i) => r.fxText.trimEnd() === printed[i]) : p.screen()[8].slice(5).trimEnd() === s.rows[0].fxText.trimEnd();
      const okEval = e.printed.trim() === s.rows[0].fxText.trim();
      if (okSolve && okEval) apiOk++;
      else mismatches.push(`### ${c.id} (API)\nsolve ok: ${okSolve}, evaluate ok: ${okEval}`);
    } catch (err) {
      mismatches.push(`### ${c.id} (API)\n${err}`);
    }
  }
}

const total = cases.length, ok = [...groups.values()].reduce((s, g) => s + g.ok, 0);
const sample = cases.filter((c) => c.formula).slice(0, 12);
const report = `# FORM_X port: verification report

**${ok} of ${total} screens identical.** Each case feeds the same keystrokes to the real \`FORM_X.EXE\` (running in the Unicorn DOS harness \`research/artifacts/programs/dosemu.py\`) and to the port \`src/lib/formx/formx.ts\`, then compares the whole 80 x 25 text screen character for character (trailing spaces trimmed), plus whether the program is still waiting for a key.

Rerun (under a minute):

\`\`\`
node research/artifacts/programs/formx-port/verify.ts
\`\`\`

Generated ${new Date().toISOString().slice(0, 10)}. Inputs: \`cases.json\`. Real program's screens: \`emu.json\`.

| Group | Cases | Identical |
|---|---:|---:|
${[...groups].map(([k, g]) => `| ${k} | ${g.n} | ${g.ok} |`).join("\n")}
| **All** | **${total}** | **${ok}** |

- ${tables} cases end on the results table: ${rows} result rows, ${overflowRows} of them \`* OVERFLOW *\`.
- The other cases end mid-typing, on an error message, inside the x prompts, or after Esc.
- API cross-check: \`solve()\` (whole table) and \`evaluate()\` with trace on (first row) agree with the program in ${apiOk} of ${apiChecks} table cases.
- Coverage: brackets nested up to 20 deep, unary minus before numbers, x and brackets, numbers with 7 integer digits and up to 9 fraction digits, division by zero and by tiny numbers, every mix of \`* / + -\`, x ranges that run backwards, have a zero step, or span the full 7-digit range, and every one of the 8 error messages.

## Mismatches

${mismatches.length ? mismatches.join("\n\n") : "None."}

## First ${sample.length} hand-picked cases

| Formula | Initial x | Final x |
|---|---|---|
${sample.map((c) => `| \`${show(c.formula!)}\` | ${c.x0 ?? "(no x)"} | ${c.x1 ?? ""} |`).join("\n")}
`;
writeFileSync(join(HERE, "verify-report.md"), report);
console.log(`${ok} of ${total} identical; API ${apiOk} of ${apiChecks}; ${mismatches.length} mismatches`);
