// Server only: his font bytes for render-time images.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

let b: Uint8Array | null = null;
export const ssrBin = () => (b ??= new Uint8Array(readFileSync(join(process.cwd(), 'public/arabart/fonts.bin'))));
