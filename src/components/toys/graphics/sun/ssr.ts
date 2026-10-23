// Server only: numbers read straight from his program file, so the toys run on exactly what he typed.
import { memSync } from '../ssr.ts';

const ds = (off: number) => {
  const f = memSync('SUN_SUN.EXE'), hdr = (f[8] | (f[9] << 8)) * 16;
  return { f, at: hdr + 0x11ad0 + off };
};
/** The four years at DS:19C1, in his order: Venus, Mercury, Earth, Mars. */
export function years() {
  const { f, at } = ds(0x19c1), v = new DataView(f.buffer, f.byteOffset);
  return [0, 4, 8, 12].map(o => v.getFloat32(at + o, true));
}
