// Renders verify.py's corpus (JSON on stdin) with the port: one JSON line per case.
import { readFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { render, shape, translate } from '../../../../src/lib/arabart/index.ts';

const bin = new Uint8Array(readFileSync(new URL('../../../../public/arabart/fonts.bin', import.meta.url)));
const out = JSON.parse(readFileSync(0, 'utf8')).map((c: { keys: string; opts: object }) => {
  const b = render(bin, c.keys, c.opts);
  return JSON.stringify({ w: b.width, h: b.height, x: b.x, y: b.y, d: deflateSync(b.data).toString('base64'), shaped: shape(translate(bin, c.keys)) });
});
process.stdout.write(out.join('\n') + '\n');
