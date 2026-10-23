// HandyLauncher's unlock key, made by the key engine it shares with HandySwitcher and HandyMenu.
// Proof against the app's own check routine: research/dinarsoft/re/handylauncher/ (prove.py, PROOF.md).
import { dinarKey, UNIVERSAL } from './handyswitcher.ts';

export const unlock = {
  version: '3.4',
  inputs: [] as { id: string; label: string; hint?: string }[],
  generate: (_values: Record<string, string>) => dinarKey(UNIVERSAL, 'HandyLauncher3'),
  note:
    'One key for every device: HandyLauncher 3.4 accepts a key made from Yasser’s own name. Tap Register… on the About page and type the four groups of four letters.',
};
