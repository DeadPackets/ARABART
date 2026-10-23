# MemMaid: how it works, from its own binaries

Sources: the CAB installers in `research/dinarsoft/downloads/` (see `INVENTORY.md`), extracted with 7z into a scratch
folder, never run. Builds read: 1.5a (CHIP 2006 disc), 1.72, 1.73, 2.3 Build 230 (English and multilingual).
All addresses below are virtual addresses in `MemMaid.exe` 2.3 unless a build is named.

## Tools in this folder

| Script | Does |
|---|---|
| `cabhdr.py <dir>` | Reads the Windows CE CAB header (`*.000`): files, folders, registry entries. |
| `pedump.py <coredll_ordinals.txt> <pe...>` | Sections, imports with coredll ordinal names, resource tree. |
| `coredll_ordinals.txt` | 2,090 coredll ordinals, merged from WINCE600 `coredll.def` and wcecl `Exports.def`. |
| `armre.py <ords> <pe> xref/dis/callers/funcs` | Capstone ARM disassembly, string xrefs, callers, `.pdata` functions. |
| `resdump.py <pe> <out.json> [bmpdir]` | Dialogs, menus, strings, bitmaps. |
| `strings.py <v23 dir> <out.json>` | The 709 UI strings in 8 languages (emulates 4EFDC and each `mm_xxx.dll` entry point). |
| `uistrings.py <strings.json> <ui.json>` | The subset the page uses, by string index. |
| `assets.py <res> <out>` | Cuts the PNG sprites the page uses. |
| `keymodel.py [code]` | Python model of the key engine, the Pocket PC code fold and the salts. |
| `emulate.py <ords> <extract dir>` | The proof: runs MemMaid's own check routine in unicorn. Writes `emulate-report.json`. |

Rerun the proof (from this folder; the extract dir holds `v15a v172 v173 v23en`, each with `named/MemMaid.exe`):

```
uv run -q --with unicorn --with pefile python -I emulate.py coredll_ordinals.txt <extract dir>
```

## What it is made of (2.3 multilingual CAB)

| File | Bytes | Notes |
|---|---|---|
| MemMaid.exe | 629,760 | ARM PE, C++ (operator new/delete), linker 8.0 (Visual Studio 2005). .text 394,752 bytes, 41 dialogs, 348 imports from 8 DLLs (321 from coredll). |
| MemMaidVGARes.dll | 245,248 | Bitmaps only (492 bytes of code). Loaded when sub_6B094 reports a VGA screen. |
| mm_fra/ger/ita/sky/csy/rus/chs.dll | 51,200 to 26,112 | Export `GetLangName`, `GetString`; fill a 709-entry pointer table at DLL entry. |
| MemMaid.htm / MemMaid.bmp | 53,148 / 29,134 | Help. |
| MemMaidLauncher.exe | 12,800 | Reads `HKLM\SOFTWARE\Apps\DinarSoft MemMaid` InstallDir; `-Tweaks`, `-reset`, `-noop` (returns at once, 11028). |
| MemMaidSetup.dll | 9,216 | Install_Init/Exit, Uninstall_Init/Exit, PerformInst. Writes the trial record. |

1.x builds: linker 6.20. 1.5a 327,680 bytes (.text 181,432, 20 dialogs, 249 imports); 1.72 357,888 (203,696, 21, 258);
1.73 358,400 (204,684, 21, 259). The English-only 2.3 CAB has no language DLLs. Bitmap 108 in 1.5a and 1.72 is the old
DINAR globe logo; 1.73 and 2.3 carry the DinarSoft logo.

## Strings and languages

`6A2E4 getString(i)`: `i >= 709` returns 0; if a language DLL is loaded, call its `GetString(i)` (pointer at
`[0x884E4+0x18]`, found at 6A7B0); a null answer falls back to the English table at `[0x884E4+0x10]` (built by 4EFDC).

## Reclaim RAM (1.72 and later): 2E6B0

1. `FreeRAM()` (46658): `GlobalMemoryStatus`, returns `dwAvailPhys`.
2. Box 1 (`[r4+0x880]`): 466FC closes every top window except MemMaid.exe and ActiveSync's repllog.exe
   (posts WM_CANCELMODE, then WM_COMMAND 0x10000001).
3. Box 2 (`[r4+0x87C]`): `EnumWindows(4678C)`; the callback posts `0x3FF` (WM_HIBERNATE) to each window.
4. Box 3 (`[r4+0x884]`): 467B4 runs the heap compactor on every process.
5. `Sleep(1000)`, `FreeRAM()` again, report "MemMaid has reclaimed" after minus before.

## The heap compactor: 63628

`GetProcAddress` on coredll for `SetProcPermissions`, `HeapCompact`, `PerformCallBack4`, `SetKMode`; `LoadLibrary`
MemMaidSetup.dll, `GetProcAddress("PerformInst")`. Own process: call PerformInst directly. Other process:
`SetKMode(1)`, `SetProcPermissions(0xFFFFFFFF)`, `OpenProcess`, then three `PerformCallBack4` calls with
`MapPtrToProcess`ed pointers: `LoadLibraryW(path)`, `PerformInst()`, `FreeLibrary(handle)`; permissions and mode
restored. PerformInst (MemMaidSetup.dll 10001980): `CoFreeUnusedLibraries()`, then `HeapCompact(GetProcessHeap(), 0)`
through `GetProcAddress`. 639E0 also resolves `CompactAllHeaps`.

## Cleaners

29 in 2.3 (`src/components/toys/ds-memmaid/data.ts` CLEANERS, in MemMaid's order). Paths come from the registry where
the system keeps them (IE cache, cookies, history via `Explorer\Shell Folders`; mail attachments via MAPI
`AttachPath`). Opera's cache comes from `\Application Data\Opera\Opera.ini`, `[User Prefs] Cache Directory4`, read by
MemMaid's own INI reader 2A688 (CreateFile, ReadFile, MultiByteToWideChar, `[` section match, `=` key match): Windows CE
has no GetPrivateProfileString.

## Startup items

- Order (1.3 and later): 4D7CC. Creates `\Windows\MEMMAID.TEMP` (62050), empties it (624CC), copies every StartUp
  shortcut in, deletes them from StartUp, copies them back in the list's order, empties and removes the folder (62098).
- Switch off: 4EB40. Copies the shortcut to `<StartUp>.Disabled\`, then opens the original and overwrites it with
  `36#"\Windows\MemMaidLauncher.exe" -noop` (string at 76060); deletes it if it cannot be opened.

## DLL Optimizer (1.4 and later) and memory division

- 57964 adds a folder to `HKLM\Loader` `SystemPath` (REG_MULTI_SZ): query size, read, walk entries with `_wcsicmp`,
  append folder plus a closing zero if missing, `RegDeleteValue`, `RegSetValueEx` type 7, `RegFlushKey`. With no value
  it writes `\Windows\` plus the folder. DLLs move to `<card>\DLL Store\`; soft reset by `KernelIoControl(0x0101003C)`.
- Information screen (dialog 509, trackbar 0x470): 56C54 calls `GetSystemMemoryDivision` (by name, coredll),
  `GetStoreInformation`, `GlobalMemoryStatus`; TBM_SETRANGE 0..total pages, TBM_SETPOS store pages, TBM_SETSEL from used
  store pages to store + free program pages, ticks every total/9. On release 569B0 reads TBM_GETPOS and calls
  `SetSystemMemoryDivision` (by name), then a 1,000 ms timer reads it back.

## Trial

The record is 14 bytes, REG_BINARY, in HKEY_CLASSES_ROOT, written by MemMaidSetup.dll (sub_10001000) at install if
missing: words `[2m+3, y+7, y+21, 2d+5, 2m+1, 2d+4]`, every odd byte of the 12 plus one, then
`sum(original bytes) % 31` as a word. The decoder (2.3 6AD14) checks the checksum and both copies. Day index
`(y*12+m)*31+d`; 15 days; `now < install` or `now > install+15` ends the trial and writes junk over the record.

| Build | Key | Value | Junk on expiry |
|---|---|---|---|
| 2.3 | TapHelp | Ready2 | "321344" |
| 1.72, 1.73 | Windows.2 | OSDB | "fslkjreii" |
| 1.5a | AppHelper | Platform | "fslkjreii" |

## Unlock

- Pocket PC code: `KernelIoControl(IOCTL_HAL_GET_DEVICEID 0x01010054)`, preset ID then platform ID as `%02X`
  (fallback `730007B6BFA373D1380000050BFE45CE5`), folded to 16: `c[i] += hexval(c[i+16]) + 1`, `:`..`@` +7, `>= O` +1.
- Key engine (6AB44): RC4-style KSA over 120 numbers keyed by a word, then per character
  `(S[(S[i]+t)%120] ^ ch) % 25 + 'A'`, +1 at or past `O`. Same engine as HandySwitcher's.
- Check (2.3 2DC88; 1.72/1.73 1FFD4; 1.5a 1F218) sets a verdict: 13 registered, 0 trial running, 7 over.
  2.3: device key = T(code, "MemMaid2"); built-in: T(key) == T(T(entry)), so key = T(entry), word "MemMaid2".
  1.72/1.73: device words "MemMaidI" then "Registerd2", "Unlock2" (cumulative); 1.5a: "MemMaidII", "Registerd",
  "Unlock"; built-in word "MemMaid" for all 1.x.
- Built-in entries: YASSERMOHAMEDALI, GIVEAWAYVERSION1 and three made from family names (not published on the site).
- Keys: 2.3 `TZMP-KZND-REVA-WUHZ`; 1.5a to 1.73 `CDHG-ACZW-NMGJ-QWEC`. Key typed in dialog 105 (four boxes), saved as
  `HKLM\Software\DinarSoft\MemMaid LicKey`.

## Proof result (emulate-report.json)

Per build: keys for 7 devices and the fallback code, the give-away key, his-name key (all must pass); 16 one-letter
changes of the give-away key, keys for 7 other devices, other versions' keys, 20 random keys, the empty key and the
plain word (all must fail); trial records with no key (verdict 0 or 7, plus one tampered byte in 1.5a).

1.5a 62/62, 1.72 60/60, 1.73 60/60, 2.3 63/63. 40 right keys accepted, 196 wrong keys rejected, 9 trial cases as
expected, 0 failures.
