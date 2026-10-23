// Server only: his Digi-Test files, decoded at build time (layouts from MAIN.EXE's own save and load code;
// research/artifacts/programs/digit/decode_formats.py parses all 70 files the same way).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'programs/DIGI_T');
export const file = (n: string) => new Uint8Array(readFileSync(join(DIR, n)));

class R {
  constructor(public d: Uint8Array, public o: number) {}
  u8() { return this.d[this.o++]; }
  u16() { const v = this.d[this.o] | (this.d[this.o + 1] << 8); this.o += 2; return v; }
  i16() { const v = this.u16(); return v > 0x7fff ? v - 0x10000 : v; }
  raw(n: number) { const v = this.d.slice(this.o, this.o + n); this.o += n; return v; }
  name(n = 12) { const b = this.raw(n); const z = b.indexOf(0); return String.fromCharCode(...b.slice(0, z < 0 ? n : z)); }
}

// Every file: copyright text, Ctrl-Z, the data, and its own length in the last 4 bytes
function open(n: string, hdr: number, data: number) {
  const d = file(n);
  const len = d[d.length - 4] | (d[d.length - 3] << 8) | (d[d.length - 2] << 16) | (d[d.length - 1] << 24);
  if (d[hdr] !== 0x1a || len !== d.length) throw new Error(`${n} is not a Digi-Test file`);
  return new R(d, data);
}

export function group(ext: string) {
  const r = open(`GROUP.${ext}`, 0x1f, 0x32);
  return Array.from({ length: r.u16() }, () => { const n = r.name(); r.u8(); return n; });
}

// Keypad directions: the keys he drew wires with
export const KEYPAD: Record<number, [number, number]> = { 1: [-1, 1], 2: [0, 1], 3: [1, 1], 4: [-1, 0], 6: [1, 0], 7: [-1, -1], 8: [0, -1], 9: [1, -1] };

export interface Gat { name: string; bytes: number[]; ins: number; outs: number; ctrl: number; inv: number }
export function gates(): Gat[] {
  return group('GAT').map((name, i) => {
    const d = file(`FIL${i}.GAT`);
    return { name, bytes: [...d.slice(0x32, 0x38)], ins: d[0x32], outs: d[0x33], ctrl: d[0x34], inv: d[0x35] };
  });
}

export interface Chip { part: string; file: string; pins: number[][]; type: string; gates: number; oc: number; bytes: number[] }
export function chips(): Chip[] {
  return group('IC').map((part, i) => {
    const r = open(`FIL${i}.IC`, 0x2d, 0x3c);
    const n = r.u8();
    const start = r.o;
    const pins = Array.from({ length: n }, () => [...r.raw(4)]);
    const type = r.name();
    r.u8();
    const g = r.u8(), oc = r.u8();
    return { part, file: `FIL${i}.IC`, pins, type, gates: g, oc, bytes: [...r.d.slice(start - 1, start + n * 4)] };
  });
}

type End = { k: number; i: number; p: number };
export interface Wire { from: [number, number]; to: [number, number]; path: number[]; pts: [number, number][]; res: number[]; a: End; b: End; net: number; off: number }
export interface Cir {
  ics: { x: number; y: number; part: string; inst: number }[];
  primes: { x: number; y: number; num: number; kind: number; side: number; net: number }[];
  nodes: { x: number; y: number; num: number }[];
  wires: Wire[];
  gates: { id: string; part: string; type: string; ctrl: number; inv: number; ins: number[]; inPins: number[]; out: number; outPin: number; inst: number }[];
  nets: number;
  pin: Record<string, number>;
}

export function circuit(name = 'FIL0.CIR'): Cir {
  const r = open(name, 0x34, 0x3c);
  const n = r.u16();
  const ics: Cir['ics'] = [], primes: Cir['primes'] = [], nodes: Cir['nodes'] = [], raw: Omit<Wire, 'net'>[] = [];
  for (let k = 0; k < n; k++) {
    const off = r.o, x = r.i16(), y = r.i16(), t = r.u8();
    if (t === 0) { r.u8(); const part = r.name().trim(); const inst = r.u8(); r.u8(); ics.push({ x, y, part, inst }); }
    else if (t === 3) nodes.push({ x, y, num: r.u8() });
    else if (t === 4) { const num = r.u8(), side = r.u8(), kind = r.u16(); primes.push({ x, y, num, kind, side, net: -1 }); }
    else if (t === 2) {
      const ex = r.u16(), ey = r.u16(), pa = r.u8(), pb = r.u8(), ia = r.u16(), ib = r.u16(), ka = r.u16(), kb = r.u16();
      const path = [...r.raw(r.u16())];
      let [px, py] = [ex, ey];
      const pts: [number, number][] = [[px, py]], res: number[] = [];
      for (const b of path) {
        if (!b) break;
        const jump = b >= 0x60, [dx, dy] = KEYPAD[jump ? (b & 0xf) - 4 : b];
        const m = jump ? 7 : 1;
        if (jump) res.push(pts.length - 1);
        px += dx * m; py += dy * m;
        pts.push([px, py]);
      }
      if (px !== x || py !== y) throw new Error(`wire at ${off} does not reach its start`);
      raw.push({ from: [ex, ey], to: [x, y], path, pts, res, a: { k: ka, i: ia, p: pa }, b: { k: kb, i: ib, p: pb }, off });
    }
  }
  // Which pins share a wire: union-find over the wire end points
  const key = (e: End) => (e.k === 2 ? `IC${e.i}.${e.p}` : e.k === 1 ? `N${e.i}` : `P${e.p}`);
  const up: Record<string, string> = {};
  const find = (a: string): string => { up[a] ??= a; while (up[a] !== a) a = up[a] = up[up[a]]; return a; };
  for (const w of raw) up[find(key(w.a))] = find(key(w.b));
  const roots = [...new Set(Object.keys(up).map(find))];
  const pin: Record<string, number> = {};
  for (const k of Object.keys(up)) pin[k] = roots.indexOf(find(k));
  const wires = raw.map(w => ({ ...w, net: pin[key(w.a)] }));
  for (const p of primes) p.net = pin[`P${p.num}`] ?? -1;

  const lib = chips(), gat = gates();
  const out: Cir['gates'] = [];
  for (const ic of ics) {
    const c = lib.find(l => l.part === ic.part)!;
    const by: Record<number, { ins: number[]; out: number }> = {};
    c.pins.forEach(([g, t], i) => {
      if (t === 0x20) (by[g] ??= { ins: [], out: 0 }).ins.push(i + 1);
      if (t === 0x40) (by[g] ??= { ins: [], out: 0 }).out = i + 1;
    });
    for (const [g, io] of Object.entries(by)) {
      const o = pin[`IC${ic.inst}.${io.out}`];
      if (o === undefined) continue;
      // His library has no Not.GAT; a one-input NAND is an inverter
      const ty = gat.find(x => x.name === c.type) ?? { ctrl: 1, inv: 2 };
      out.push({ id: `${ic.part}.${g}`, part: ic.part, type: c.type, ctrl: ty.ctrl, inv: ty.inv, ins: io.ins.map(p => pin[`IC${ic.inst}.${p}`]), inPins: io.ins, out: o, outPin: io.out, inst: ic.inst });
    }
  }
  return { ics, primes, nodes, wires, gates: out, nets: roots.length, pin };
}
