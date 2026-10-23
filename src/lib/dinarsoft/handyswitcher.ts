// HandySwitcher's unlock key, and the key engine all three Handy apps share (HandyMenu and HandyLauncher import it).
// Proof against the app's own check routine: research/dinarsoft/re/handyswitcher/ (prove.py, PROOF.md).

const N = 120;

/** His key function: an RC4-style shuffle of 120 numbers, keyed by the product name, run over the 16-letter code. */
export function dinarKey(code: string, product: string): string {
  const S = Array.from({ length: N }, (_, i) => i);
  for (let i = 0, j = 0; i < N; i++) {
    j = (S[i] + product.charCodeAt(i % product.length) + j) % N;
    [S[i], S[j]] = [S[j], S[i]];
  }
  let i = 0, j = 0, out = '';
  for (const ch of code) {
    i = (i + 1) % N;
    j = (j + S[i]) % N;
    [S[i], S[j]] = [S[j], S[i]];
    const c = 65 + ((ch.charCodeAt(0) ^ S[(S[i] + S[j]) % N]) % 25);
    out += String.fromCharCode(c >= 79 ? c + 1 : c); // 25 letters: O is skipped, so it never looks like zero
  }
  return out;
}

/** "Your Pocket PC Code": the device ID as hex, folded from 32 characters to 16, with no O. */
export function pocketPcCode(idHex: string): string {
  const h = idHex.toUpperCase().padEnd(32, '0');
  let out = '';
  for (let k = 0; k < 16; k++) {
    const d = h.charCodeAt(k + 16);
    let c = h.charCodeAt(k) + d - (d >= 65 ? 55 : 48) + 1;
    if (c > 57 && c < 65) c += 7;
    if (c >= 79) c += 1;
    out += String.fromCharCode(c);
  }
  return out;
}

/** The 16 letters as the app shows them: four groups of four. */
export const groups = (k: string) => k.match(/.{1,4}/g)!.join(' - ');

/** Every 3.x build also accepts a key made from his own name, so one key fits every device. */
export const UNIVERSAL = 'YASSERMOHAMEDALI';

export const unlock = {
  version: '3.1',
  inputs: [] as { id: string; label: string; hint?: string }[],
  generate: (_values: Record<string, string>) => dinarKey(UNIVERSAL, 'HandySwitcher3'),
  note:
    'One key for every device: HandySwitcher 3.1 accepts a key made from Yasser’s own name. Tap Register… on the About page and type the four groups of four letters.',
};
