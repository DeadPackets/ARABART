# How HandyMenu works

Source: `DinarSoftHandyMenu36.CAB` (3.6, 2006-03-06: HandyMenu.exe 95,232 bytes, linker 6.20 eVC4, plus HandyMenu.vga icons and HandyMenu.bin languages) and `DinarSoftHandyMenu.CAB` (3.7 Build 40, 2008-06-24: HandyMenu.exe 81,408 bytes, linker 8.0 VS2005). Read with 7-Zip, pefile and capstone only. Addresses are 3.7 virtual addresses unless marked 3.6. The unlock proof is `prove.py` / `PROOF.md` beside this file.

## Menu and language

- 27 items, ids 1 to 27. Item n shows icon n-1 of the 27-icon strip. Which items show: `Software\DinarSoft\HandyMenu\<n>` values `Command` and `Show`.
- Labels by number, `sub_16E98`: `if (n >= 80) return 0; t = table[n+1]; return t ? t : table[n+81];`. Slots 1..80 hold the chosen language, slots 81.. the built-in English (id/text pairs at 0x167E4). HandyMenu.bin is a UTF-16 INI with `[German] [Dutch] [Portuguese] [Spanish] [Hungarian]`, keys `IX<n>`. IX1..27 menu items, 31 Language, 34 Quick Action, 45 hard reset warning, 52..56 Settings tabs, 64 Error, 66 rotation not supported.
- Tray icon: tap opens the menu, tap-and-hold runs the Quick Action; a radio button swaps the two.

## The dispatcher, 0x151E8

After `TrackPopupMenuEx` returns the item in r6: `bl 17FC0` (read `HMLicKey` from `HKLM\Software\DinarSoft`), `bl 18044` (license check), `bl 182A8` (state). State 7 (expired): load dialog 500 (Settings, Register on its About page) via `FindResourceW`/`LoadResource`/`DialogBoxIndirectParamW`, item never runs. Else `cmp r6,r8` (r8 = 1001, extra commands), `sub r2,r6,#1; cmp r2,#26; bhi 1579C; lsl r3,r2,#1; add r3,r3,pc; ldrh r3,[r3,#4]; add pc,pc,r3`. Halfword table at 0x1527C, targets 0x15280 + entry:

`0034 0058 00CC 00FC 01F4 01FC 03C4 03CC 03D4 03DC 03E4 03EC 03F4 03FC 0404 042C 040C 0414 0438 0448 0458 0468 0478 0488 0494 04B4 04C4`

| Item | What the case does |
|---|---|
| 1 Soft Reset | `KernelIoControl(0x0101003C IOCTL_HAL_REBOOT)` |
| 2 Hard Reset | `MessageBoxW(text 45, text 2, 0x24 MB_YESNO+ICONQUESTION)`; on 6 (IDYES) `SetCleanRebootFlag` then the same reboot |
| 3 Power Off | `keybd_event(0xDF VK_OFF,0,0,0)` then `(0xDF,0,2 KEYUP,0)` |
| 4 Brightness | first that exists: `\Windows\Brightness.exe`, `frontlight.cpl`, `backlight.cpl`, `backlight.exe`, `frontlight.exe`, `fjcpl.cpl` ("fjcpl.cpl 2"), `\Windows\HandyBrightness.lnk`, else `cplmain.cpl 6` |
| Settings pages | `ctlpnl.exe` via `sub_125D4` (ShellExecuteEx): Memory `4 0`, Running Programs `4 2`, Input `8 0`, Sound `9 0`, Uninstall `10`, Start Menu `11 0`, Buttons `12 0`, Themes `13 0`, Today Plugins `13 1`, Clock `16 1`, Network `cplmain.cpl,19`, Phone `cplmain.cpl,20` |
| 21, 22, 23 | `sub_1293C(4)`, `(1)`, `(2)`: rotate left, right, flip |
| 24 Screen OFF | `sub_12ACC`: `ExtEscape(QUERYESCSUPPORT, 0x1803)`, then `ExtEscape(0x1803 SETPOWERMANAGEMENT, {12, 1, PowerState 4})`; else "Sorry, your Pocket PC does not support DisplayOff" |
| 25 Refresh | `SendNotifyMessageW(HWND_BROADCAST, 0x1A WM_WININICHANGE, 0xF2, 0)` |
| 26 IP Helper | `sub_1756C`, dialog 507 |
| 27 Screen Capture | `sub_149E8` |

## Screen capture, 0x149E8

`MessageBeep` 14A04; `Sleep(delay*500)` 14A14; `GetDC(NULL)` 14A20; `CreateCompatibleBitmap` at `GetSystemMetrics(0/1)` size 14A50; `BitBlt SRCCOPY` 14AA4 (the shot is taken here); `InvalidateRect(NULL)` 14AB4; `GetSaveFileName` wrapper `sub_1497C` 14B04 ("Bitmap Files (*.bmp)"). Header: `w*h` 14B54, `*3` as `r3 + r3<<1` 14B5C, biSize 40 14B74, biBitCount 24 14B84, `CreateDIBSection` 14BAC, `BitBlt` 14BE4. File header: bfSize = size + 54 14C40, bfOffBits 54 14C64, bfType `0x4D00|0x42` = "BM" 14C50/14C70. `WriteFile` 14 bytes 14C78, 40 bytes 14C90, pixels 14CA8. 240x320 gives a 230,454-byte file.

## Rotation, 0x1293C

Library handle cached at 0x1CDD4, function at 0x1CDD8. First call: `LoadLibraryW("coredll.dll")` 1296C, `GetProcAddressW("ChangeDisplaySettingsEx")` 1297C, stored 12980. Missing: `MessageBoxW(text 66, text 64)` 129C4. DEVMODE dmSize 192 12A0C, dmFields 0x800000 12A10, `CDS_TEST` 12A18, call 12A2C. If the current orientation (sp+0xC0) is not 0, the target becomes 0 (12A4C): every rotate item also undoes a rotation. Apply with flags 0 at 12A98.

## IP Helper, dialog 507

Combo of adapters (`GetInterfaceInfo` `sub_175F8`, size call then data call), `sub_177C4` walks the `GetAdaptersInfo` list (same two calls) for the adapter whose Index (+0x19C) matches. Renew `sub_17734` = `IpRenewAddress`, Release `sub_1775C` = `IpReleaseAddress`. Fields 1057..1061: address, gateway, DHCP server, WINS, secondary WINS.

## Trial and key

- Install date in `\Windows\xintra.dat`, 14 bytes. Encoder 3.6 `sub_181D4` (same code as HandySwitcher 2.7 0x127A4, HandyLauncher 3.4 0x159CC): shorts `[m*2+3, y+7, y+21, d*2+5, m*2+1, (d+2)*2]`, sum of the 12 bytes, `byte[i] += i%2`, `sum % 31` in bytes 12..13. Decoder 3.6 `sub_18350` checks the two copies of each field and the checksum. Day number `(y*12+m)*31+d`; trial while today is within 15 days.
- 3.7: check `sub_18044`, state global 0x1D000 (0xD registered, 0 trial, 7 expired), key buffer 0x1D008, written by `sub_17F24` as `HMLicKey`.
- Key: the shared engine (120-number shuffle keyed by "HandyMenu", 25 letters without O). 3.7 also accepts keys made from built-in codes in place of the device code (`YASSERMOHAMEDALI`, `GIVEAWAYVERSION1`, and family names); 3.6 does not. `prove.py` runs both check routines in unicorn: ALL PASS.
- 24 functions, 4,508 bytes, are identical in HandySwitcher 2.7, HandyLauncher 3.4 and HandyMenu 3.6 (`../handylauncher/SHARED.md`).
