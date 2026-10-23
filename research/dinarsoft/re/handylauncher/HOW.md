# HandyLauncher 3.4: how it works

Source: `research/dinarsoft/downloads/DinarSoftHandyLauncher34.CAB` (same CAB inside both desktop installers).
CAB manifest: `HandyLauncher.exe` (file 1, 83,456 bytes, PE timestamp 2006-03-21, eVC 4 linker 6.20, ARM, base 0x10000)
and `HandyLauncherSetup.dll` (file 2, 10,752 bytes; also the CAB's `.999` setup DLL) into `%CE1%\HandyLauncher`.
CE range 3.0 to 5.0. Imports by coredll ordinal, resolved with the public `coredll.def` (`../handyswitcher/ref/`).
Addresses below are virtual addresses in HandyLauncher.exe unless marked setup.

## Parts

| Piece | What |
|---|---|
| Tray icon | `Shell_NotifyIcon`, icon id 5001 (0x1389), callback message 0x0BD5 |
| Tray handler | `sub_125FC`: message 0xBD5 + lParam WM_LBUTTONDOWN (0x201) + wParam 5001 → SHRGINFO (cbSize 20) at (HORZRES-2, VERTRES-2), `WindowFromPoint`, `dwFlags = SHRG_RETURNCMD`; menu x = width, y = height - 25*scale (`0x1C808`, `0x1C80C`); `SHRecognizeGesture` nonzero → menu 2 (`0x1D238`), zero → menu 1 (`0x1D458`); Reverse at `[0x1C2B8+0x218]` swaps; `sub_123B0` shows it |
| Scale | `sub_19078`: 2 when `GetDeviceCaps` HORZRES or VERTRES is 480, else 1 (cached at `0x1DCF8`) |
| Rotate call | `sub_18F20`: once, `LoadLibraryW("coredll.dll")` + `GetProcAddressW("ChangeDisplaySettingsEx")`, cached at `0x1D8E4` |
| Rotate | `sub_18F7C(setting)`: setting 0 returns; DEVMODE dmSize 0xC0, dmFields DM_DISPLAYORIENTATION 0x800000; CDS_TEST (2) query; 1→DMDO_0, 2→DMDO_90 (1), 3→DMDO_270 (4); applies only when different from `dmDisplayOrientation` |
| Orientation box | Shortcut Properties combo filled at `0x16ADC`: Use Current, Portrait, Landscape (R), Landscape (L) (indexes 0 to 3) |
| Open | `sub_190D8`: `FindFirstFileW`; FILE_ATTRIBUTE_DIRECTORY (0x10) → target becomes the argument and `fexplore.exe` the file; target `"\"` → `fexplore.exe` too; SHELLEXECUTEINFO cbSize 0x3C, nShow 1, `ShellExecuteEx` |
| Menus | owner-drawn (`DrawIconEx`, theme colors from `Software\Microsoft\Color` in `sub_15D58`), icons from `SHGetFileInfo` into an ImageList (`sub_13F68`) |
| Settings | registry `Software\DinarSoft\HandyLauncher`; menu items `Item%d` with `Type` (1 shortcut, 0 separator), `Name`, `Command`, `CommandLine`, `IconPath`, `Orient`, `Enabled`, `Edit`, `Delete` |
| Command line | `-X` / `-X%d` (open the menu from the top, with an offset), `-L2` (the second menu; the setup's "HandyLauncher - Extra" shortcut) |

Setup (`HandyLauncherSetup.dll`, `Install_Exit` path from 0x1011F4) writes the two starting menus:
menu 1 "HandyLauncher": My Documents (`\My Documents`), separator, Pocket Excel, Pocket Word, separator, Calculator,
File Explorer, Internet Explorer, MSN Messenger, Solitaire; menu 2 "ExtraLauncher": My Device (`\`), separator, MS Reader,
File Explorer, separator, Calculator, separator, Games (`\Windows\Start Menu\Programs\Games`). It also writes the trial file
`\Windows\mcterthr.dat`.

## Trial and key (`sub_11F3C`, state at `0x1D89C`: 0xD registered, 0 trial, 7 expired; days left `0x1C8D8`)

1. Stored key (`LicKey`, read into `0x1D690`). Device code: `sub_1553C` (KernelIoControl IOCTL_HAL_GET_DEVICEID 0x01010054,
   hex of preset + platform ID, folded to 16 characters, fallback `730007B6BFA373D1380000050BFE45CE5`), `sub_158AC` strips
   spaces and dashes, `sub_156C8` = the shared key engine with `"HandyLauncher3"`; `lstrcmpW` → registered.
2. Else five built-in names (`0x1C810` on): YASSERMOHAMEDALI, GIVEAWAYVERSION1 and three family names (not published on the
   site). Each: `wcscpy`, key engine with `"HandyLauncher3"`, length check, then an inline loop from the last letter
   (`0x11FD8`); r0 = 7 on a full match, 5 on a difference (`0x12088`); `rsb r3,r0,#0x19` / `cmp r3,#0x12` → registered.
3. Else the trial file `\Windows\mcterthr.dat`: 14 bytes decoded by the shared `sub_15B48`; day number
   (year*12 + month)*31 + day; within the window → state 0, days left = install - today + 15; otherwise 7.

Proof: `prove.py` / `PROOF.md` (unicorn runs `sub_11F3C` with generated and wrong keys; all pass).
Freeware key (`src/lib/dinarsoft/handylauncher.ts`): `FJAA-ZCHS-TETU-NPAQ` = key engine(YASSERMOHAMEDALI, HandyLauncher3).

## Shared engine

`shared.py` / `SHARED.md`: 24 distinct function bodies (4,508 bytes) identical in HandySwitcher 2.7, HandyLauncher 3.4
and HandyMenu 3.6 after address normalization; pairwise 27 / 31 / 27. The License Key (105) and Custom Colors
(186 / 179 / 505) dialogs carry the same controls and words in all three.

## Resources used on the site

`src/components/toys/ds-handylauncher/ui.json` (dialogs 103, 104, 105, 179, 502 to 505), icons 101, 175, 177, bitmap 108
(the DINAR globe logo, before November 2006), all from `../handyswitcher/extract_ui.py`.
