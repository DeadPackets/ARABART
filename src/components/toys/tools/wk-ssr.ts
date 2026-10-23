// Server only: MENU2.DAT from the archive, and screens as tiny palette PNGs for the no-JS state.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync, crc32 } from 'node:zlib';
import { EGA, type FB } from './wk.ts';

let dat: Uint8Array | null = null;
export const menu2 = () => (dat ??= new Uint8Array(readFileSync(join(process.cwd(), 'programs/WINKEY/MENU2.DAT'))));
export const b64 = (u: Uint8Array) => Buffer.from(u).toString('base64');

/** A region of the frame buffer as a data: URL PNG (8-bit palette, the 16 EGA colors). */
export function png(f: FB, x0 = 0, y0 = 0, w = f.w, h = f.h): string {
  const chunk = (type: string, data: Buffer) => {
    const t = Buffer.concat([Buffer.from(type, 'ascii'), data]), out = Buffer.alloc(t.length + 8);
    out.writeUInt32BE(data.length, 0); t.copy(out, 4); out.writeUInt32BE(crc32(t), t.length + 4);
    return out;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 3;
  const raw = Buffer.alloc((w + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) raw[y * (w + 1) + 1 + x] = f.px[(y + y0) * f.w + x + x0];
  const plte = Buffer.from(EGA.flatMap(c => [1, 3, 5].map(k => parseInt(c.slice(k, k + 2), 16))));
  const file = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('PLTE', plte),
    chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
  return `data:image/png;base64,${file.toString('base64')}`;
}
