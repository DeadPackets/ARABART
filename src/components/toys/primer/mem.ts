// The first megabyte of a DOS PC, for the primer's memory and segment toys. Widths (w) are for reading, not to scale.
export interface Region { id: string; a: number; b: number; w: number; name: string; short: string; say: string; who?: string; lens: 'table' | 'bios' | 'bytes' | 'screen' | 'text' }

export const REGIONS: Region[] = [
  { id: 'ivt', a: 0x00000, b: 0x00400, w: 9, lens: 'table', name: 'Interrupt table', short: 'Table',
    say: 'The first 1 KB: 256 addresses, one for each service and event. The PC looks here to decide whose code runs.',
    who: 'KVC rewrites one entry here to cut the Koko virus off from DOS.' },
  { id: 'bda', a: 0x00400, b: 0x00500, w: 5, lens: 'bios', name: 'BIOS notes', short: 'BIOS',
    say: 'The PC’s own notes, 256 bytes: the keys waiting to be read, the screen mode, and a clock that ticks 18.2 times a second.' },
  { id: 'dos', a: 0x00500, b: 0x10000, w: 10, lens: 'bytes', name: 'DOS and its drivers', short: 'DOS',
    say: 'The operating system, in the same array as your program. How much room it takes depends on the PC; on this map it ends at 64 KB.' },
  { id: 'app', a: 0x10000, b: 0xa0000, w: 27, lens: 'bytes', name: 'Your program', short: 'Your program',
    say: 'Everything your program has: its code, its data, its stack and its free memory. One program at a time.',
    who: 'His programs, once DIET has unpacked them, run here.' },
  { id: 'vga', a: 0xa0000, b: 0xb0000, w: 15, lens: 'screen', name: 'The graphics screen', short: 'Screen',
    say: 'Not RAM at all: the graphics card answers here. Write a byte and pixels change on the monitor, at once.',
    who: 'ARABART, PESM, The Brave Sun and both editors draw here.' },
  { id: 'mono', a: 0xb0000, b: 0xb8000, w: 5, lens: 'text', name: 'Mono text screen', short: 'Mono',
    say: 'The text screen of a one-color card: two bytes for every letter on the screen.' },
  { id: 'text', a: 0xb8000, b: 0xc0000, w: 9, lens: 'text', name: 'Color text screen', short: 'Text',
    say: 'The color text screen, 80 letters by 25 lines. Two bytes per letter: the letter, then its colors.',
    who: 'KVC and FORM_X write their screens here.' },
  { id: 'vbios', a: 0xc0000, b: 0xc8000, w: 6, lens: 'bytes', name: 'Video BIOS', short: 'ROM',
    say: 'The graphics card’s built-in code, on a chip. It answers INT 10h, the video service. You can read it; a write changes nothing.' },
  { id: 'rom', a: 0xc8000, b: 0xf0000, w: 6, lens: 'bytes', name: 'Other chips', short: 'ROM',
    say: 'Room for the built-in code of other cards, such as disk or network cards.' },
  { id: 'bios', a: 0xf0000, b: 0x100000, w: 8, lens: 'bytes', name: 'System BIOS', short: 'BIOS',
    say: 'The PC’s own built-in code, on a chip. At power-on the processor runs its very first instruction here, at FFFF0h.' },
];

// Interrupt table entries his programs and this page talk about
export const VECTORS: Record<number, string> = {
  0x08: 'the clock tick', 0x09: 'a key press', 0x10: 'the video service', 0x13: 'the disk service', 0x16: 'the keyboard service',
  0x1a: 'the clock service', 0x21: 'DOS', 0x27: 'stay resident',
};

export const MB = 0x100000;
export const hex = (n: number, w = 5) => n.toString(16).toUpperCase().padStart(w, '0');
export const regionOf = (a: number) => REGIONS.find(r => a >= r.a && a < r.b) ?? REGIONS[REGIONS.length - 1];

// The strip is drawn region by region with the widths above; these turn a strip position (0 to 1) into an address and back
const total = REGIONS.reduce((s, r) => s + r.w, 0);
const starts = REGIONS.reduce<number[]>((acc, r, i) => (acc.push(i ? acc[i - 1] + REGIONS[i - 1].w / total : 0), acc), []);
export const posOf = (a: number) => {
  const i = REGIONS.indexOf(regionOf(a)), r = REGIONS[i];
  return starts[i] + ((a - r.a) / (r.b - r.a)) * (r.w / total);
};
export const addrOf = (p: number) => {
  p = Math.min(Math.max(p, 0), 0.999999);
  let i = REGIONS.length - 1;
  while (i > 0 && starts[i] > p) i--;
  const r = REGIONS[i];
  return Math.min(r.b - 1, Math.floor(r.a + ((p - starts[i]) / (r.w / total)) * (r.b - r.a)));
};
export const pct = (r: Region) => (r.w / total) * 100;

/** What one address means, in words: the lens line under the readout */
export function detail(a: number) {
  const r = regionOf(a), off = a - r.a;
  if (r.id === 'ivt') {
    const n = off >> 2;
    return { n, line: `Entry ${hex(n, 2)}h${VECTORS[n] ? `, ${VECTORS[n]}` : ''}: ${off & 2 ? 'the segment half of its address' : 'the offset half of its address'}.` };
  }
  if (r.id === 'bda') {
    if (a >= 0x41e && a < 0x43e) return { line: 'The keyboard buffer: the last 16 keys, waiting for a program to read them.' };
    if (a === 0x449) return { line: 'The current screen mode.' };
    if (a >= 0x46c && a < 0x470) return { line: 'The tick counter: plus one, 18.2 times a second.' };
    return { line: 'One of the BIOS’s notes about the PC.' };
  }
  if (r.id === 'vga') {
    const y = Math.floor(off / 80), x = (off % 80) * 8;
    return y < 480
      ? { x, y, line: `In the 640 × 480 mode: pixels ${x} to ${x + 7} of row ${y}.` }
      : { line: 'Below the bottom edge of the 640 × 480 screen: room the card keeps for other modes.' };
  }
  if (r.id === 'text' || r.id === 'mono') {
    const cell = (off % 4096) >> 1, page = off >> 12;
    if ((off % 4096) >= 4000) return { line: `Spare bytes after screen page ${page + 1}.` };
    return { row: Math.floor(cell / 80), col: cell % 80, page,
      line: `${page ? `Screen page ${page + 1}, hidden until a program shows it. ` : ''}Line ${Math.floor(cell / 80) + 1}, column ${(cell % 80) + 1}: ${off & 1 ? 'its colors' : 'the letter'}.` };
  }
  return { line: '' };
}
