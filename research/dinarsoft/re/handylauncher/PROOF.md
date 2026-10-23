# HandyLauncher unlock proof

Each row loads the original ARM binary from the archived installer into unicorn, writes the key into the global the app reads from the registry, and runs the app’s own check routine. Keys come from `src/lib/dinarsoft/handylauncher.ts`, run by node. KernelIoControl returns a random device ID; the date is 2026-10-22. Rerun from the repo root: `uv run -q --with unicorn --with pefile python -I research/dinarsoft/re/handylauncher/prove.py`.

**Result: ALL PASS**

## HandyLauncher 3.4 (2006-03-20) (`DinarSoftHandyLauncher34.CAB`, check routine at 0x11F3C)

| Case | Key typed | App says | Expected | |
|---|---|---|---|---|
| device key, device 1 (code CBAP8BSKFTG7C8HD) | `VILZBTPNZQMFTHWC` | registered | registered | PASS |
| same key, last letter changed | `VILZBTPNZQMFTHWA` | expired | expired | PASS |
| HandyMenu’s key for this device | `CGTFISYZXDRPBAKU` | expired | expired | PASS |
| device key, device 2 (code FRFEGK6F3GR9DC9F) | `QZMLBJRKNYRHNRIA` | registered | registered | PASS |
| same key, last letter changed | `QZMLBJRKNYRHNRIB` | expired | expired | PASS |
| HandyMenu’s key for this device | `FQSLUZPKQNXDGGLW` | expired | expired | PASS |
| device key, device 3 (code BBHFTCAEGNEM6P4S) | `UICPHSDLAPKCDGFW` | registered | registered | PASS |
| same key, last letter changed | `UICPHSDLAPKCDGFA` | expired | expired | PASS |
| HandyMenu’s key for this device | `BGCILRFJYXTIRMRH` | expired | expired | PASS |
| device ID call fails, fallback code | `UHYFUPFFETRRTGZB` | registered | registered | PASS |
| generate() from the site (universal) | `FJAAZCHSTETUNPAQ` | registered | registered | PASS |
| universal key of HandyMenu | `BDLEWBJDRHBAGEGX` | expired | expired | PASS |
| 16 random letters | `VLBJHDCRLIAGDGUI` | expired | expired | PASS |
| 16 random letters | `CQWGCSGRNKVQFHDU` | expired | expired | PASS |
| 16 random letters | `MTLYJABWCJUZZXEN` | expired | expired | PASS |
| 16 random letters | `XZNFNWGAAVSULPPE` | expired | expired | PASS |
| 16 random letters | `VXZQVRQGUDWZUSNL` | expired | expired | PASS |
| no key, installed 3 days ago | `(none)` | trial (12 days left) | trial | PASS |
| no key, installed 15 days ago | `(none)` | trial (0 days left) | trial | PASS |
| no key, installed 40 days ago | `(none)` | expired | expired | PASS |
| no key, record tampered | `(none)` | expired | expired | PASS |
