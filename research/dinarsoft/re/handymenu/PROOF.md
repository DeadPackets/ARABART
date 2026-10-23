# HandyMenu unlock proof

Each row loads the original ARM binary from the archived installer into unicorn, writes the key into the global the app reads from the registry, and runs the app’s own check routine. Keys come from `src/lib/dinarsoft/handymenu.ts`, run by node. KernelIoControl returns a random device ID; the date is 2026-10-22. Rerun from the repo root: `uv run -q --with unicorn --with pefile python -I research/dinarsoft/re/handymenu/prove.py`.

**Result: ALL PASS**

## HandyMenu 3.6 (2006-03-06) (`DinarSoftHandyMenu36.CAB`, check routine at 0x12F84)

| Case | Key typed | App says | Expected | |
|---|---|---|---|---|
| device key, device 1 (code CBAP8BSKFTG7C8HD) | `CGTFISYZXDRPBAKU` | registered | registered | PASS |
| same key, last letter changed | `CGTFISYZXDRPBAKA` | expired | expired | PASS |
| HandySwitcher3’s key for this device | `NMUIPCAYPKKCFNAF` | expired | expired | PASS |
| device key, device 2 (code FRFEGK6F3GR9DC9F) | `FQSLUZPKQNXDGGLW` | registered | registered | PASS |
| same key, last letter changed | `FQSLUZPKQNXDGGLA` | expired | expired | PASS |
| HandySwitcher3’s key for this device | `IDRXNTMTYYPIMTNH` | expired | expired | PASS |
| device key, device 3 (code BBHFTCAEGNEM6P4S) | `BGCILRFJYXTIRMRH` | registered | registered | PASS |
| same key, last letter changed | `BGCILRFJYXTIRMRA` | expired | expired | PASS |
| HandySwitcher3’s key for this device | `MMBUFBHSQHMDMMZT` | expired | expired | PASS |
| device ID call fails, fallback code | `BFCCBHHHCAXDBBEV` | registered | registered | PASS |
| generate() from the site (universal) | `BDLEWBJDRHBAGEGX` | expired | expired | PASS |
| universal key of HandySwitcher3 | `YQMHQLUCAEVVMVEI` | expired | expired | PASS |
| 16 random letters | `VLBJHDCRLIAGDGUI` | expired | expired | PASS |
| 16 random letters | `CQWGCSGRNKVQFHDU` | expired | expired | PASS |
| 16 random letters | `MTLYJABWCJUZZXEN` | expired | expired | PASS |
| 16 random letters | `XZNFNWGAAVSULPPE` | expired | expired | PASS |
| 16 random letters | `VXZQVRQGUDWZUSNL` | expired | expired | PASS |
| no key, installed 3 days ago | `(none)` | trial (12 days left) | trial | PASS |
| no key, installed 15 days ago | `(none)` | trial (0 days left) | trial | PASS |
| no key, installed 40 days ago | `(none)` | expired | expired | PASS |
| no key, record tampered | `(none)` | expired | expired | PASS |

## HandyMenu 3.7 Build 40 (2008-06-24) (`DinarSoftHandyMenu.CAB`, check routine at 0x18044)

| Case | Key typed | App says | Expected | |
|---|---|---|---|---|
| device key, device 1 (code 7BFBRAECEGE74MAV) | `LGSMFTBHWNTPTSSM` | registered | registered | PASS |
| same key, last letter changed | `LGSMFTBHWNTPTSSA` | expired | expired | PASS |
| HandySwitcher3’s key for this device | `WMRQZZLQNYMCPZJY` | expired | expired | PASS |
| device key, device 2 (code SE8QCCJDKMNCGQDG) | `LZLGQRPIUUACFNPV` | registered | registered | PASS |
| same key, last letter changed | `LZLGQRPIUUACFNPA` | expired | expired | PASS |
| HandySwitcher3’s key for this device | `ELKJJBTRDISPJLMG` | expired | expired | PASS |
| device key, device 3 (code BJ8LJDCAEGH7M6CD) | `BYLCXYHFWNYPQGUU` | registered | registered | PASS |
| same key, last letter changed | `BYLCXYHFWNYPQGUA` | expired | expired | PASS |
| HandySwitcher3’s key for this device | `MEKNAWJNNYQCUZLF` | expired | expired | PASS |
| device ID call fails, fallback code | `BFCCBHHHCAXDBBEV` | registered | registered | PASS |
| generate() from the site (universal) | `BDLEWBJDRHBAGEGX` | registered | registered | PASS |
| universal key of HandySwitcher3 | `YQMHQLUCAEVVMVEI` | expired | expired | PASS |
| 16 random letters | `QERSQHCGAVDJZIPT` | expired | expired | PASS |
| 16 random letters | `UBUQHGEXTZWHWCCH` | expired | expired | PASS |
| 16 random letters | `YTXVPVKWESEXWFYK` | expired | expired | PASS |
| 16 random letters | `SSYZLTLMVADFYKTS` | expired | expired | PASS |
| 16 random letters | `JAPXQULWJPEMHLWV` | expired | expired | PASS |
| no key, installed 3 days ago | `(none)` | trial (12 days left) | trial | PASS |
| no key, installed 15 days ago | `(none)` | trial (0 days left) | trial | PASS |
| no key, installed 40 days ago | `(none)` | expired | expired | PASS |
| no key, record tampered | `(none)` | expired | expired | PASS |
