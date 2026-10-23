// DinarSoft's 14-byte trial record, the same in HijriDate (\Windows\inter.dat, 0x1059E4 / 0x105B60) and TapText
// (a registry value, written by TapTextSetup.dll 0x1014E0): the install date twice in two disguises, every odd byte
// nudged by one, then a checksum.
export const WORDS = ['month × 2 + 3', 'year + 7', 'year + 21', 'day × 2 + 5', 'month × 2 + 1', '(day + 2) × 2', 'checksum'];

export function encode(y: number, m: number, d: number) {
  const w = [m * 2 + 3, y + 7, y + 21, d * 2 + 5, m * 2 + 1, (d + 2) * 2];
  const b = w.flatMap(v => [v & 255, (v >> 8) & 255]);
  const sum = b.reduce((a, v) => a + v, 0) % 31;
  return [...b.map((v, k) => (v + (k % 2)) & 255), sum & 255, sum >> 8];
}

export function decode(b: number[]) {
  if (b.length !== 14) return { y: 0, m: 0, d: 0, ok: { year: false, month: false, day: false, sum: false }, good: false };
  const raw = b.slice(0, 12).map((v, k) => (v - (k % 2)) & 255);
  const w = (k: number) => raw[k * 2] | (raw[k * 2 + 1] << 8);
  const sum = raw.reduce((a, v) => a + v, 0) % 31;
  const m1 = (w(0) - 3) >> 1, y1 = w(1) - 7, y2 = w(2) - 21, d1 = (w(3) - 5) >> 1, m2 = (w(4) - 1) >> 1, d2 = (w(5) - 4) >> 1;
  const ok = { year: y1 === y2, month: m1 === m2, day: d1 === d2, sum: sum === (b[12] | (b[13] << 8)) };
  return { y: y2, m: m1, d: d1, ok, good: ok.year && ok.month && ok.day && ok.sum };
}

/** His day count: (year × 12 + month) × 31 + day. The trial runs while today is 0 to 15 days past the install. */
export const dayNo = (y: number, m: number, d: number) => (y * 12 + m) * 31 + d;
export const hex = (b: number[]) => b.map(v => v.toString(16).toUpperCase().padStart(2, '0')).join(' ');
