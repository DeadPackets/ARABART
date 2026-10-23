// His key function, step by step, for the KeyMachine visual: an RC4-style shuffle of the numbers 0 to 119, keyed by
// a word ("Hijri", "TapTextII", ...), then one letter per character of the code. Same math as dinarKey() in
// src/lib/dinarsoft/handyswitcher.ts, with every intermediate value kept.
const N = 120;

export function ksa(pass: string) {
  const S = Array.from({ length: N }, (_, i) => i);
  for (let i = 0, j = 0; i < N; i++) {
    j = (S[i] + (pass.length ? pass.charCodeAt(i % pass.length) : 0) + j) % N;
    [S[i], S[j]] = [S[j], S[i]];
  }
  return S;
}

export interface Letter { ch: string; i: number; j: number; si: number; sj: number; ti: number; t: number; x: number; m: number; out: string }

/** Every letter of the key, with the numbers behind it. states[k] is the table before letter k. */
export function trace(text: string, pass: string) {
  const S = ksa(pass), start = [...S], states: number[][] = [];
  const letters: Letter[] = [];
  let i = 0, j = 0;
  for (const ch of text) {
    states.push([...S]);
    i = (i + 1) % N;
    j = (j + S[i]) % N;
    [S[i], S[j]] = [S[j], S[i]];
    const ti = (S[i] + S[j]) % N, t = S[ti], x = ch.charCodeAt(0) ^ t, m = x % 25;
    const c = 65 + m;
    letters.push({ ch, i, j, si: S[i], sj: S[j], ti, t, x, m, out: String.fromCharCode(c >= 79 ? c + 1 : c) });
  }
  states.push([...S]);
  return { start, states, letters, key: letters.map(l => l.out).join('') };
}
