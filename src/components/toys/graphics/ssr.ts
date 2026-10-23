// Server only: his unpacked programs and a tiny PNG writer, for the images every toy shows before (or without) JS.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync, crc32 } from 'node:zlib';
import { EGA } from './ega.ts';

const files: Record<string, Uint8Array> = {};
/** One of his unpacked programs as it sits in memory: public/bytes/files/<name>.mem */
export const memSync = (name: string) =>
  (files[name] ??= new Uint8Array(readFileSync(join(process.cwd(), 'public/bytes/files', `${name}.mem`))));

/** Indexed pixels (0-15) as a palette PNG data URL. */
export function png(data: Uint8Array, w: number, h: number, pal: number[] = EGA) {
  const chunk = (type: string, body: Uint8Array) => {
    const out = Buffer.alloc(12 + body.length), t = Buffer.from(type, 'latin1');
    out.writeUInt32BE(body.length, 0); t.copy(out, 4); Buffer.from(body).copy(out, 8);
    out.writeUInt32BE(crc32(Buffer.concat([t, body])) >>> 0, 8 + body.length);
    return out;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 3;
  const plte = Buffer.from(pal.flatMap(c => [c >> 16, (c >> 8) & 255, c & 255]));
  const raw = Buffer.alloc((w + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) raw[y * (w + 1) + 1 + x] = data[y * w + x] & 15;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const file = Buffer.concat([sig, chunk('IHDR', ihdr), chunk('PLTE', plte), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', new Uint8Array())]);
  return `data:image/png;base64,${file.toString('base64')}`;
}
