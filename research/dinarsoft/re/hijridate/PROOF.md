# HijriDate 1.5: proofs

All three run HijriPlugin.dll's own ARM code in unicorn (`tools/emu.py`); nothing runs natively.

## Unlock key
`uv run -q --with capstone --with pefile --with unicorn python -I research/dinarsoft/re/hijridate/prove_unlock.py`

Emulates the device-code routine (0x105554, KernelIoControl stubbed with a random DEVICE_ID) and the check (0x107604)
for 200 random devices, with `unlock.generate()` from `src/lib/dinarsoft/hijridate.ts`.

```
generated keys accepted: 200 of 200
wrong keys rejected (another device, one letter changed, random, lower case, empty): 1000 of 1000
unmapped imports touched: none
PASS
```

## Calendar
`uv run -q --with capstone --with pefile --with unicorn python -I research/dinarsoft/re/hijridate/prove_calendar.py`

Runs the DLL's converter (0x104B38) against the TypeScript port (`src/components/toys/ds-hijridate/hijri.ts`).

```
dates compared: 37700 (1990-2040 daily, 2000-2010 x 4 adjustments, 3,000 random 1700-2300)
identical answers: 37700 of 37700
2026-10-22: his engine says 11 Jumada I 1448
PASS
```

## Arabic strip
The strips rebuilt from `glyphs.json` for الأحد ٢، رمضان ١٤٢٧ (adjustment +1) and الأحد ٢٤، سبتمبر ٢٠٠٦ match DinarSoft's
screenshot `site/.../hijriscreen.gif` (24 Sep 2006) with 0 different pixels on both lines (125×16 at x 71, y 68;
133×16 at x 67, y 84).

## Pages
E2E: `uv run -q --with playwright python -I <scratchpad>/tthd/e2e.py` (1440, 768, 390 with touch, reduced motion,
no JS; 164 checks).
