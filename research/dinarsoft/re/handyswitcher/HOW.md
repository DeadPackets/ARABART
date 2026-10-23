# How HandySwitcher works

Source: the archived DinarSoft installers in `research/dinarsoft/downloads/` (git-ignored). Read with 7-Zip, `upx -d` (CHIP setup), pefile and capstone only; nothing was run natively. Addresses are virtual addresses in each file. Imports by ordinal were named from the cegcc `coredll.def` list (`ref/`).

## Builds that survive

| Build | From | Files (bytes) | Linker |
|---|---|---|---|
| 2.7, 2006-07-15 | `DinarSoftHandySwitcher27_20061223.exe` (CAB inside) | HandySwitcher.exe 77,824; HHTask.exe 28,672 (to `\Windows`); Setup.dll 9,216 | 6.20 (eVC4) |
| 3.1 first build, 2008-04-15 | `CHIP-2008-06_DinarSoftHandySwitcher_Setup.exe` (UPX) | HandySwitcher.exe 10,752; HandySwitcher.dll 142,336; HandySwitcherLauncher.exe 4,608 | 8.0 (VS2005) |
| 3.1 Build 78, 2008-07-20 | `DinarSoftHandySwitcher_Demo.CAB` | HandySwitcher.exe 10,752; HandySwitcher.dll 143,360 (base 0x10000000); HandySwitcherLauncher.exe 4,608; HandySwitcher.vga (320x32 action icons); HandySwitcher.htm + HS1-3.bmp (help) | 8.0 |

Version strings: `DinarSoft(c)2.7.0.41`, `DinarSoft(c) HandySwitcher3.1.0.78`.

## 2.7: two programs

- **HHTask.exe** is the top-bar host for all three Handy apps. `sub_11BB4` checks `FindWindowW("HHTaskHook")` (one copy only), registers `DinarSoft::HH::EnableHook`, `TabMessage`, `Shortcuts`, then `FindWindowW("HHTaskBar")` and `SetWindowLongW(bar, GWL_WNDPROC=-4, 0x12628)` at 0x11C98..0x11CB8; the old procedure is kept at 0x14738.
- **Hook procedure 0x12628**: on `WM_LBUTTONDOWN` (0x201) it tests `PtInRect` for the HandySwitcher icon (0x12748, then `FindWindowW("HandySwitcher Class")` + `PostMessageW`), the HandyMenu icon (0x127E4, `SHRecognizeGesture`, starts HandyMenu from `\SOFTWARE\Apps\DinarSoft HandyMenu\InstallDir` at 0x12408 if not running, posts 0xBD7), the HandyLauncher icon (0x12844, same pattern at 0x12518), and the system (X) (0x128A8). Anything else goes to `CallWindowProcW(old, ...)` at 0x1294C. EnableHook wParam: 0 unhook, 1 hook, 3 reload icons, 4 quit.
- Bitmap tint 0x11164: mode 0 scales RGB by a percent, mode 1 greys `(r+g+b)*pct/300`, skipping the transparent color.
- **Close routine 0x17D4C** (HandySwitcher.exe): `SetForegroundWindow`; `GetClassNameW`; class `WMP ` gets `Sleep 100` and `keybd_event` Ctrl (0x11) + Q (0x51) down/up; class `Dialog` has its own path (0x199F8); else `PostMessageW(WM_ACTIVATE)` then `WM_CLOSE`; `Sleep 500`; `IsWindow`; `IDC_WAIT` cursor; up to 11 x `Sleep 500`; if still there and the confirm option is on, `MessageBoxW` "<title> is not responding because it is busy, waiting for a response from you, or has stopped running.\n\nDo you want HandySwitcher to terminate the program anyway?" (title "Warning...", MB_YESNO|ICONWARNING|TOPMOST); `GetWindowThreadProcessId` -> `OpenProcess(0x1F0FFF)` -> `TerminateProcess(h, 1)`.
- EnumWindows callback 0x17A08 skips windows owned by `device.exe`, `rnaapp.exe` and other system processes.

## 3.1: a service

- HandySwitcher.dll exports `HSW_Init/Deinit/Open/Close/Read/Write/Seek/IOControl`, `SetupServiceRegistry`, `DeleteServiceRegistry`, `AutoX`, `IAction`, `UAction`. Registry `HKLM\Services\HandySwitcher`: `Dll`, `Prefix`=HSW, `Index`, `Order`, `Keep`, `Flags`, `DisplayName`="DinarSoft Task Manager Service". It runs in `services.exe` as `HSW0:`.
- The DLL subclasses the top bar itself (`FindWindowW("HHTaskBar")`, `GetWindowLongW/SetWindowLongW(-4)` around 0x10005CD0).
- HandySwitcher.exe is a starter: `GetServiceHandle("HSW0:")`, sets Flags, `ActivateService`, waits for HHTaskBar, posts `DinarSoft::HS::IconAction`. Switches: `-close -closeall -minimize -closebkgnd -minimizeall -cycleapp -register -unregister -install`; help through `peghelp.exe file:HandySwitcher.htm#hs_na`.
- Setup creates `\HandySwitcher Actions\HandySwitcher [action].lnk` shortcuts for hardware buttons.
- Features seen in strings: per-program CPU (`Thread32First/Next`, `GetThreadTimes`) and memory (`Heap32*`) use; Automation ("Close ActiveSync on Disconnect" via `System\State\Hardware\Cradled`, "ReclaimRAM on Close Program", "Compact Memory on Close All"); a built-in ignore list (`desktopexplorerwindow`, `hhtaskbar`, `ms_sipbutton`, `menu_worker`, `cursorwindow`, `tooltips_class32`, ...); color modes No / Custom / Theme / Reverse Theme (theme from `Software\Microsoft\Color`).

## Device code and key

- **Pocket PC Code** (2.7 0x12314; 3.1 b78 0x1000EF58; 3.1 first 0x1000EC84): `KernelIoControl(IOCTL_HAL_GET_DEVICEID 0x01010054)`, preset + platform ID bytes as `%02X`; if the call fails, the fixed string `730007B6BFA373D1380000050BFE45CE5`. Fold to 16: `c[i] += hexval(c[i+16]) + 1`, +7 between '9' and 'A', +1 at 'O' or later. Fallback code: `BC11-18CC-CSRB-C9RG`.
- **Key engine** (2.7 0x124A0, 484 bytes; 3.1 b78 0x1000F0EC): 120-entry permutation keyed by the product name (KSA), then a PRGA over the 16 code letters; letter = `(code ^ S[(S[i]+S[j]) % 120]) % 25 + 'A'`, +1 at 'O' or later. Product names: `HandySwitcher` (2.7), `HandySwitcher3` (3.1). Strip spaces/dashes 0x12684; groups of four 0x126E0. Port: `src/lib/dinarsoft/handyswitcher.ts`.
- The License Key dialog (105) has four ES_UPPERCASE edit boxes, joined into `LicKey` under `Software\DinarSoft\HandySwitcher`.
- **Check routines**: 2.7 0x12C4C (LicKey 0x1EE88, state 0x1F088: 0xD registered, 0 trial, 7 expired; days 0x1DB4C); 3.1 b78 0x100045C8 (state 0x1001DE40, LicKey 0x1001DE48, days 0x1001CA50); 3.1 first 0x100045A0 (state 0x1001CE18, LicKey 0x1001CE20, days 0x1001BA2C).
- **Built-in codes** (3.1 only): the check also accepts the engine's output for a short list of 16-letter codes. It compares `F(LicKey)` with `F(F(code))`, so no key appears in the file. The list starts with `YASSERMOHAMEDALI` and holds `GIVEAWAYVERSION1`; the others (four in the first build, five in Build 78) are names of his family and are not published. 2.7 has no such list.

## Trial

- 2.7: `\Windows\tonter.bin`. 3.1: `HKEY_CLASSES_ROOT\RppHelp` value `Tedy`, both names built at run time (`"Rp"+"p"+"Help"`, `"Te"+"dy"`).
- Record (encoder 2.7 0x127A4, decoder 0x12920; 3.1 decoder 0x1000F2BC): 14 bytes, shorts `[month*2+3, year+7, year+21, day*2+5, month*2+1, (day+2)*2]`, byte `i` += `i%2`, then a sum%31 checksum; the decoder cross-checks both date copies. Day number `(year*12+month)*31+day`; trial is 15 days.
- 3.1 on expiry deletes `Tedy` and writes `fsjri` (REG_BINARY, 10 bytes), which never decodes. Setup (`HandySwitcherSetup.dll` 0x101804) writes the record only when the value is absent, so a reinstall does not restart the trial.

## Shared with HandyMenu and HandyLauncher

See `../handylauncher/SHARED.md`: 24 functions, 4,508 bytes identical in all three 2006 builds (device code, key engine, date record, theme colors, font, icon-from-bitmap, color picker, dialog layout). The License Key dialog (105), Custom Colors dialog and About page are the same templates. HHTask.exe draws all three icons.

## Not published

- Family names in the built-in code list.
- The old DINAR globe logo (bitmap 108, 116x53) sits in all three 2006 builds; it is extracted to `src/components/toys/ds-handyswitcher/logo-2006.png`.

## Proof

`prove.py` runs each build's own check routine in unicorn with keys from the TypeScript port. Result in `PROOF.md`: all cases pass for 2.7, 3.1 first build and 3.1 Build 78.
