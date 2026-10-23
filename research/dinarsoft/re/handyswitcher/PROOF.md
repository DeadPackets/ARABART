# HandySwitcher unlock proof

Each row loads the original ARM binary from the archived installer into unicorn, writes the key into the global the app reads from the registry, and runs the app’s own check routine. Keys come from `src/lib/dinarsoft/handyswitcher.ts`, run by node. KernelIoControl returns a random device ID; the date is 2026-10-22. Rerun from the repo root: `uv run -q --with unicorn --with pefile python -I research/dinarsoft/re/handyswitcher/prove.py`.

**Result: ALL PASS**

## HandySwitcher 2.7 (2006-07-15) (`DinarSoftHandySwitcher27_20061223.exe`, check routine at 0x12C4C)

| Case | Key typed | App says | Expected | |
|---|---|---|---|---|
| device key, device 1 (code CBAP8BSKFTG7C8HD) | `PZXIABYCXZDSHFME` | registered | registered | PASS |
| same key, last letter changed | `PZXIABYCXZDSHFMA` | expired | expired | PASS |
| HandyMenu’s key for this device | `CGTFISYZXDRPBAKU` | expired | expired | PASS |
| device key, device 2 (code FRFEGK6F3GR9DC9F) | `SQAWCIUXZJXGATAC` | registered | registered | PASS |
| same key, last letter changed | `SQAWCIUXZJXGATAA` | expired | expired | PASS |
| HandyMenu’s key for this device | `FQSLUZPKQNXDGGLW` | expired | expired | PASS |
| device key, device 3 (code BBHFTCAEGNEM6P4S) | `NZQXUARWYTBHPBMI` | registered | registered | PASS |
| same key, last letter changed | `NZQXUARWYTBHPBMA` | expired | expired | PASS |
| HandyMenu’s key for this device | `BGCILRFJYXTIRMRH` | expired | expired | PASS |
| device ID call fails, fallback code | `NAKNJGPUUEXAHEXD` | registered | registered | PASS |
| generate() from the site (universal) | `YQMHQLUCAEVVMVEI` | expired | expired | PASS |
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

## HandySwitcher 3.1 first build (2008-04-15) (`CHIP-2008-06_DinarSoftHandySwitcher_Setup.exe`, check routine at 0x100045A0)

| Case | Key typed | App says | Expected | |
|---|---|---|---|---|
| device key, device 1 (code 7BFBRAECEGE74MAV) | `WMRQZZLQNYMCPZJY` | registered | registered | PASS |
| same key, last letter changed | `WMRQZZLQNYMCPZJA` | expired | expired | PASS |
| HandyMenu’s key for this device | `LGSMFTBHWNTPTSSM` | expired | expired | PASS |
| device key, device 2 (code SE8QCCJDKMNCGQDG) | `ELKJJBTRDISPJLMG` | registered | registered | PASS |
| same key, last letter changed | `ELKJJBTRDISPJLMA` | expired | expired | PASS |
| HandyMenu’s key for this device | `LZLGQRPIUUACFNPV` | expired | expired | PASS |
| device key, device 3 (code BJ8LJDCAEGH7M6CD) | `MEKNAWJNNYQCUZLF` | registered | registered | PASS |
| same key, last letter changed | `MEKNAWJNNYQCUZLA` | expired | expired | PASS |
| HandyMenu’s key for this device | `BYLCXYHFWNYPQGUU` | expired | expired | PASS |
| device ID call fails, fallback code | `MNDRYFJQLLPQFMBG` | registered | registered | PASS |
| generate() from the site (universal) | `YQMHQLUCAEVVMVEI` | registered | registered | PASS |
| universal key of HandyMenu | `BDLEWBJDRHBAGEGX` | expired | expired | PASS |
| 16 random letters | `QERSQHCGAVDJZIPT` | expired | expired | PASS |
| 16 random letters | `UBUQHGEXTZWHWCCH` | expired | expired | PASS |
| 16 random letters | `YTXVPVKWESEXWFYK` | expired | expired | PASS |
| 16 random letters | `SSYZLTLMVADFYKTS` | expired | expired | PASS |
| 16 random letters | `JAPXQULWJPEMHLWV` | expired | expired | PASS |
| no key, installed 3 days ago | `(none)` | trial (12 days left) | trial | PASS |
| no key, installed 15 days ago | `(none)` | trial (0 days left) | trial | PASS |
| no key, installed 40 days ago | `(none)` | expired, record now b'f\x00s\x00j\x00r\x00i\x00' | expired | PASS |
| no key, record tampered | `(none)` | expired | expired | PASS |

## HandySwitcher 3.1 Build 78 (2008-07-20) (`DinarSoftHandySwitcher_Demo.CAB`, check routine at 0x100045C8)

| Case | Key typed | App says | Expected | |
|---|---|---|---|---|
| device key, device 1 (code F5JGEDMEUE7FD5PF) | `IYDVQWUSEAMUMAZH` | registered | registered | PASS |
| same key, last letter changed | `IYDVQWUSEAMUMAZA` | expired | expired | PASS |
| HandyMenu’s key for this device | `FEEJWYJJFLEZGFCW` | expired | expired | PASS |
| device key, device 2 (code FK6MF74EUBFFSCAB) | `IFAPMKKSEDJUPTJD` | registered | registered | PASS |
| same key, last letter changed | `IFAPMKKSEDJUPTJA` | expired | expired | PASS |
| HandyMenu’s key for this device | `FXBDTAMJFKSZSGSS` | expired | expired | PASS |
| device key, device 3 (code BBUP5FEHFMATBGFB) | `MMGICYLVPIIMGPPD` | registered | registered | PASS |
| same key, last letter changed | `MMGICYLVPIIMGPPA` | expired | expired | PASS |
| HandyMenu’s key for this device | `BGFFFWBWXUPKACRS` | expired | expired | PASS |
| device ID call fails, fallback code | `MNDRYFJQLLPQFMBG` | registered | registered | PASS |
| generate() from the site (universal) | `YQMHQLUCAEVVMVEI` | registered | registered | PASS |
| universal key of HandyMenu | `BDLEWBJDRHBAGEGX` | expired | expired | PASS |
| 16 random letters | `EQYUQZWDHMDAXDUR` | expired | expired | PASS |
| 16 random letters | `UTFPZJBRJLWHNEAG` | expired | expired | PASS |
| 16 random letters | `NUCTMLHXEVCWBGVB` | expired | expired | PASS |
| 16 random letters | `GIYAWUIHTADXCHKC` | expired | expired | PASS |
| 16 random letters | `ZHHMMFTPTYSXMCMF` | expired | expired | PASS |
| no key, installed 3 days ago | `(none)` | trial (12 days left) | trial | PASS |
| no key, installed 15 days ago | `(none)` | trial (0 days left) | trial | PASS |
| no key, installed 40 days ago | `(none)` | expired, record now b'f\x00s\x00j\x00r\x00i\x00' | expired | PASS |
| no key, record tampered | `(none)` | expired | expired | PASS |
