// TapText 1.3's unlock key. Besides a key per device, TapText accepts five keys that fit every device, made from
// five 16-letter words built into it; one of them is GIVEAWAYVERSION1, DinarSoft's own giveaway key.
// Proof against the app's own check routine: research/dinarsoft/re/taptext/ (prove_unlock.py, PROOF.md).
import { dinarKey, groups } from './handyswitcher.ts';

export const unlock = {
  version: '1.3',
  inputs: [] as { id: string; label: string; hint?: string }[],
  generate: (_values: Record<string, string>) => groups(dinarKey('GIVEAWAYVERSION1', 'TapText')),
  note:
    'One key for every device: the giveaway key built into TapText itself. Tap TapText’s icon at the top of the screen, tap Opt, open About, tap Register… and type the four groups of four letters.',
};
