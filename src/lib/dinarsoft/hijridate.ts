// HijriDate 1.5's unlock key: his RC4-style key engine (shared with the Handy apps), keyed with the word "Hijri".
// Proof against the plug-in's own check routine: research/dinarsoft/re/hijridate/ (prove_unlock.py, PROOF.md).
import { dinarKey, groups } from './handyswitcher.ts';

export const unlock = {
  version: '1.5',
  inputs: [
    {
      id: 'code',
      label: 'Your Pocket PC Code',
      hint: 'The 16 letters and digits on HijriDate’s License Key screen, like 8C4A - 3B7D - …',
    },
  ],
  generate(values: Record<string, string>): string {
    const code = (values.code ?? '').toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (code.length !== 16) return '';
    return groups(dinarKey(code, 'Hijri'));
  },
  note:
    'Each Pocket PC gets its own key. On the Today screen, tap the clock icon beside the date, open About and tap Register…. Copy the Pocket PC Code into the box here. Then type the key, four groups of four letters, into the four boxes.',
};
