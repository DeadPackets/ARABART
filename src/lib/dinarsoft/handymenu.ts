// HandyMenu's unlock key, made by the key engine it shares with HandySwitcher and HandyLauncher.
// Proof against the app's own check routine: research/dinarsoft/re/handymenu/ (prove.py, PROOF.md).
import { dinarKey, UNIVERSAL } from './handyswitcher.ts';

export const unlock = {
  version: '3.7',
  inputs: [] as { id: string; label: string; hint?: string }[],
  generate: (_values: Record<string, string>) => dinarKey(UNIVERSAL, 'HandyMenu'),
  note:
    'One key for every device: HandyMenu 3.7 accepts a key made from Yasser’s own name. Tap Register… on the About page and type the four groups of four letters.',
};
