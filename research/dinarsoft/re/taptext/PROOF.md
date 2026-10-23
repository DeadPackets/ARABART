# TapText 1.3: proofs

`uv run -q --with capstone --with pefile --with unicorn python -I research/dinarsoft/re/taptext/prove_unlock.py`

Runs TapText.exe's own device-code routine (0x17A84) and key check (0x172B4) in unicorn, with
`unlock.generate()` from `src/lib/dinarsoft/taptext.ts`.

```
unlock.generate() = XZTZ - CRYC - IGKN - UKFX: accepted on 100 of 100 devices
per-device keys (code scrambled with "TapTextII"): 100 of 100
built-in word #1..#5 keys: accepted on 20 of 20 devices each
wrong keys rejected (one letter changed, random, another device, HijriDate key, 15 letters, empty): 600 of 600
unmapped imports touched: none
PASS
```

Menu file: `dmdParts()`/`toDmd()` in `src/components/toys/ds-taptext/tt.ts` reproduce `0TapText.004` exactly
(3,591 UTF-16 characters, 7,182 bytes); the macro expansion of every default item leaves no raw `{{` text.

E2E: `uv run -q --with playwright python -I <scratchpad>/tthd/e2e.py` (164 checks).
