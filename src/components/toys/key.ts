// The equipment key of US 7,603,377: one 32-bit number, 10/5/5/5/7 bits for node, shelf, slot, card and port.
export const FIELDS = [['node', 10], ['shelf', 5], ['slot', 5], ['card', 5], ['port', 7]] as const;
export const pack = (v: number[]) => v.reduce((k, x, i) => k * 2 ** FIELDS[i][1] + x, 0);
const n = (x: number) => x.toLocaleString('en-US');

/** The range that holds everything inside the container at this level (1 = node ... 4 = card). */
export function range(v: number[], level: number) {
  const key = pack(v), free = FIELDS.slice(level).reduce((s, f) => s + f[1], 0);
  const lo = Math.floor(key / 2 ** free) * 2 ** free;
  return { key, free, lo, hi: lo + 2 ** free };
}

/** A small, stable sample of a real index: records just before, inside and just after the chosen container.
 *  A container's own record has zeros below its level, so it sorts first inside its own range. */
export function rows(v: number[], level: number) {
  const out: number[][] = [];
  const rec = (p: number[]) => out.push([...p, ...Array(5 - p.length).fill(0)]);
  const child = (p: number[], seed: number) => {
    const r = [...p];
    for (let j = p.length; j < 5; j++) r.push(1 + ((seed * 7 + j * 13 + v[j]) % Math.min(9, 2 ** FIELDS[j][1] - 1)));
    return r;
  };
  const p = v.slice(0, level), at = level - 1, max = 2 ** FIELDS[at][1] - 1;
  if (p[at] > 1) { const q = [...p]; q[at]--; rec(q); out.push(child(q, 3)); }
  rec(p);
  if (level < 4) rec(v.slice(0, level + 1));
  out.push(child(p, 1), [...v], child(p, 5));
  if (p[at] < max) { const q = [...p]; q[at]++; rec(q); out.push(child(q, 2)); }
  const seen = new Set<number>();
  return out.map(r => ({ r, k: pack(r) })).filter(x => !seen.has(x.k) && seen.add(x.k)).sort((a, b) => a.k - b.k);
}

/** The index rows as HTML, shared by the server render and the live toy. */
export function rowsHTML(v: number[], level: number) {
  const { key, lo, hi } = range(v, level);
  const kind = (r: number[]) => (r.includes(0) ? FIELDS[r.indexOf(0) - 1][0] : 'port');
  return '<li class="band" aria-hidden="true"></li><li class="mark" aria-hidden="true"><span>lo</span></li><li class="mark" aria-hidden="true"><span>hi</span></li>' +
    rows(v, level).map(({ r, k }) => `<li data-k="${k}" class="${k >= lo && k < hi ? 'in' : ''}${k === key ? ' me' : ''}"><span><i>${kind(r)}</i>${r.join('.')}</span><span>${n(k)}</span></li>`).join('');
}

export function sayHTML(v: number[], level: number, count: number) {
  const { free, lo, hi } = range(v, level);
  return `Everything in ${FIELDS[level - 1][0]} <b>${v[level - 1]}</b> starts with the same <b>${32 - free} bits</b>, so it sorts into one unbroken run: <b>${count} rows</b> here. Jump to ${n(lo)} once, then read forward until ${n(hi)}. No joins, no second table.`;
}
