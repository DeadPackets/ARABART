// "Which ports are inside this shelf?" asked two ways, as strips of index rows (one bar per row).
// The usual way walks down one level at a time: 1 jump for the shelf's slots, 1 per slot for its cards, 1 per card for
// its ports. His key needs 1 jump into the port table, then reads forward. Shared by the server render and the toy.
export interface Group { start: number; len: number; j: number }
export interface Strip { id: string; label: string; total: number; groups: Group[] }

const spread = (n: number, len: number, total: number, seed: number): number[] => {
  const gap = total / n, room = Math.max(0, Math.floor((gap - len) / 2) - 1);
  return Array.from({ length: n }, (_, i) => {
    const jit = room ? ((i * 37 + seed) % (2 * room + 1)) - room : 0;
    return Math.max(0, Math.min(total - len, Math.round((i + 0.5) * gap - len / 2) + jit));
  });
};

export function layout(s: number, c: number, p: number) {
  const sc = s * c;
  const a: Strip[] = [
    { id: 'slots', label: 'Slot table, sorted by parent', total: 48, groups: [{ start: 18, len: s, j: 1 }] },
    { id: 'cards', label: 'Card table, sorted by parent', total: 96, groups: spread(s, c, 96, 3).map((st, g) => ({ start: st, len: c, j: 2 + g })) },
    { id: 'ports', label: 'Port table, sorted by parent', total: 240, groups: spread(sc, p, 240, 5).map((st, g) => ({ start: st, len: p, j: 2 + s + g })) },
  ];
  const len = sc * p;
  const b: Strip[] = [{ id: 'keyed', label: 'Port table, sorted by his key', total: 240, groups: [{ start: Math.round((240 - len) / 2), len, j: 1 }] }];
  return { a, b, jumps: 1 + s + sc, ports: len, n: 2 + s + sc };
}

/** One strip as SVG rects: data-j marks the rows of the group found on jump j. */
export function stripSVG(st: Strip) {
  const owner = new Map<number, number>();
  st.groups.forEach(g => { for (let k = 0; k < g.len; k++) owner.set(g.start + k, g.j); });
  let out = '';
  for (let x = 0; x < st.total; x++) {
    const j = owner.get(x);
    out += j ? `<rect x="${x}" width="0.78" height="10" class="tg on" data-j="${j}"/>` : `<rect x="${x}" width="0.78" height="10" class="fill"/>`;
  }
  return out;
}

/** What happened on step i (0 = not asked yet). */
export function say(i: number, s: number, c: number, p: number) {
  const L = layout(s, c, p), ports = L.ports;
  if (i === 0) return 'The question: which ports are inside shelf 2? Press <b>Run</b> to ask it both ways at once.';
  const b = `His key: <b>1 jump</b> to the shelf's first number, then read forward. All ${ports} ports, done.`;
  if (i >= L.n - 1) return `Done. The usual way took <b>${L.jumps} jumps</b>. His key took <b>1</b>. Both found the same ${ports} ports.`;
  if (i === 1) return `Jump 1: find the slots whose parent is shelf 2. They sit together, ${s} in a row. ${b}`;
  if (i <= 1 + s) return `Jump ${i}: find the cards whose parent is slot ${i - 1}. Every slot needs its own jump.`;
  const k = i - 1 - s;
  return `Jump ${i}: find the ports of card ${((k - 1) % c) + 1} in slot ${Math.floor((k - 1) / c) + 1}. One jump for every card in the shelf.`;
}
