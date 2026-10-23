// MemMaid's unlock key. Rebuilt from MemMaid.exe's own check (2.3: 2DC88, 1.72/1.73: 1FFD4, 1.5a: 1F218) and proven by
// running that ARM code in unicorn: research/dinarsoft/re/memmaid/ (emulate.py, emulate-report.json, NOTES.md).

/** His key engine: an RC4-style shuffle of 120 numbers keyed by a word, run over 16 letters, squeezed into A to Z without O. */
export function scramble(text: string, salt: string): string {
  const S = Array.from({ length: 120 }, (_, i) => i);
  for (let i = 0, j = 0; i < 120; i++) {
    j = (S[i] + salt.charCodeAt(i % salt.length) + j) % 120;
    [S[i], S[j]] = [S[j], S[i]];
  }
  let i = 0, j = 0, out = '';
  for (const ch of text) {
    i = (i + 1) % 120;
    const t = S[i];
    j = (j + t) % 120;
    [S[i], S[j]] = [S[j], S[i]];
    const c = 65 + ((ch.charCodeAt(0) ^ S[(S[i] + t) % 120]) % 25);
    out += String.fromCharCode(c >= 79 ? c + 1 : c);
  }
  return out;
}

/** "Your Pocket PC Code": the device ID in hex, folded from 32 characters to 16. */
export function pocketCode(idHex: string): string {
  const h = idHex.toUpperCase();
  let out = '';
  for (let k = 0; k < 16; k++) {
    const d = h.charCodeAt(k + 16) || 48;
    let c = h.charCodeAt(k) + d - (d >= 65 ? 55 : 48) + 1;
    if (c > 57 && c < 65) c += 7;
    if (c >= 79) c += 1;
    out += String.fromCharCode(c);
  }
  return out;
}

/** The word each build mixes in: one for a device's own key, one for the five keys built into every copy. */
export const SALTS = {
  '2.3': { device: 'MemMaid2', builtin: 'MemMaid2' },
  '1.72': { device: 'MemMaidI', builtin: 'MemMaid' },
  '1.73': { device: 'MemMaidI', builtin: 'MemMaid' },
  '1.5a': { device: 'MemMaidII', builtin: 'MemMaid' },
} as const;

const groups = (k: string) => k.match(/.{1,4}/g)!.join(' - ');
const HIS_NAME = 'YASSERMOHAMEDALI';

export const unlock = {
  version: '2.3',
  inputs: [] as { id: string; label: string; hint?: string }[],
  generate: (_values: Record<string, string>) => groups(scramble(HIS_NAME, SALTS['2.3'].builtin)),
  note:
    `One key for every device: MemMaid accepts a key made from Yasser’s own name. Open Tools, About, tap Register, and type the four groups of four letters. For MemMaid 1.5a, 1.72 and 1.73 his name makes this key: ${groups(scramble(HIS_NAME, 'MemMaid'))}.`,
};
