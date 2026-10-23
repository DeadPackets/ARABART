// The 16 colors of his EGA and VGA screens, and a canvas that shows indexed pixels sharply. Shared by the graphics pages.
export const EGA = [0x000000, 0x0000aa, 0x00aa00, 0x00aaaa, 0xaa0000, 0xaa00aa, 0xaa5500, 0xaaaaaa,
  0x555555, 0x5555ff, 0x55ff55, 0x55ffff, 0xff5555, 0xff55ff, 0xffff55, 0xffffff];

export const css = (rgb: number) => `#${rgb.toString(16).padStart(6, '0')}`;

/** VGA's 6-bit color values (0 to 63 per channel, what setrgbpalette takes) as one 24-bit color. */
export const dac = (r: number, g: number, b: number) =>
  (Math.round((r * 255) / 63) << 16) | (Math.round((g * 255) / 63) << 8) | Math.round((b * 255) / 63);

/** Paints indexed pixels (0-15) at their own resolution; CSS scales the canvas with image-rendering: pixelated. */
export function blit(canvas: HTMLCanvasElement, data: Uint8Array, w: number, h: number, pal: number[] = EGA) {
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
  const ctx = canvas.getContext('2d')!, img = ctx.createImageData(w, h), d = new Uint32Array(img.data.buffer);
  const abgr = pal.map(c => (0xff000000 | ((c & 0xff) << 16) | (c & 0xff00) | (c >> 16)) >>> 0);
  for (let i = 0; i < w * h; i++) d[i] = abgr[data[i] & 15];
  ctx.putImageData(img, 0, 0);
}

let cache: Record<string, Promise<Uint8Array>> = {};
/** One of his unpacked programs, exactly as it sits in memory (public/bytes/files/<name>.mem), fetched once. */
export const mem = (name: string) =>
  (cache[name] ??= fetch(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/bytes/files/${name}.mem`).then(r => r.arrayBuffer()).then(b => new Uint8Array(b)));
