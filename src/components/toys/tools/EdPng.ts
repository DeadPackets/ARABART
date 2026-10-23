// Server only: his EGAVGA.BGI font, and a screen as a PNG data URL for the no-JS view of the canvas toys.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';
import type { Screen } from './EdBgi';

let f: Buffer | null = null;
const bgi = () => (f ??= readFileSync(join(process.cwd(), 'programs/EDIT/EGAVGA.BGI')));
// Glyphs 40h to 7Fh come from the driver's table at 7A0h. Space, digits and punctuation (20h to 3Fh) come from the
// PC's own 8 x 8 font: these 256 bytes were read off his running editor's screen, pixel for pixel.
const LOW = '000000000000000030787830300030006c6c6c00000000006c6cfe6cfe6c6c00307cc0780cf8300000c6cc183066c600386c3876dccc76006060c000000000001830606060301800603018181830600000663cff3c660000003030fc303000000000000000303060000000fc000000000000000000303000060c183060c080007cc6c6c6c6c67c00307030303030fc0078cc0c3860ccfc0078cc0c380ccc78001c3c6cccfe0c1e00fcc0f80c0ccc78003860c0f8cccc7800fccc0c183030300078cccc78cccc780078cccc7c0c18700000303000003030000030300000303060183060c0603018000000fc0000fc00006030180c1830600078cc0c1830003000';
const font = () => {
  const f = Buffer.from(bgi().subarray(0x7a0, 0x7a0 + 1024));
  Buffer.from(LOW, 'hex').copy(f, 0x20 * 8);
  return f;
};
export const fontB64 = () => font().toString('base64');
export const fontBytes = () => new Uint8Array(font());

const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b: Buffer) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type: string, data: Buffer) => {
  const t = Buffer.concat([Buffer.from(type, 'ascii'), data]), len = Buffer.alloc(4), c = Buffer.alloc(4);
  len.writeUInt32BE(data.length); c.writeUInt32BE(crc(t));
  return Buffer.concat([len, t, c]);
};
// Indexed PNG of a region of the screen, in the screen's current palette
export function png(s: Screen, x0 = 0, y0 = 0, w = s.w, h = s.h) {
  const head = Buffer.alloc(13);
  head.writeUInt32BE(w, 0); head.writeUInt32BE(h, 4); head[8] = 8; head[9] = 3;
  const raw = Buffer.alloc((w + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) raw[y * (w + 1) + 1 + x] = s.px[(y0 + y) * s.w + x0 + x];
  const plte = Buffer.from(s.dac.flatMap((_, i) => s.rgb(i)));
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return 'data:image/png;base64,' + Buffer.concat([sig, chunk('IHDR', head), chunk('PLTE', plte), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]).toString('base64');
}
