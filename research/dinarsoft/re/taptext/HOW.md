# TapText 1.3: how it works

Source: `research/dinarsoft/downloads/` TapText 1.3 CAB (2006-02-27). Extracted with
`../hijridate/cab.py`; tools in `../hijridate/tools/`.

| File | Bytes | Role |
|---|---|---|
| TapText.exe (`0TapText.001`) | 153,088 | the program (ARM, base 0x10000; .text 67,584, .rsrc 69,632) |
| TapText.dmd (`0TapText.004`) | 7,182 | default menus ("James Watt" samples) |
| TapTextSetup.dll (`TAPTEX~1.003`, = `.999`) | 8,192 | setup DLL |
| TapTextLauncher.exe (`TAPTEX~1.002`) | 5,632 | starts TapText at boot from `HKLM\SOFTWARE\Apps\DinarSoft TapText\InstallDir` |
| `TAPTEX~1.000` | 301 | CAB setup instructions |

Resources: bitmaps 103 (960×16 strip of 60 icons, magenta transparent), 105 toolbar, 108 DiNAR logo, 180, 235;
icon 101 (pen); dialogs 101 Menu Items tree, 102 Menu Item editor, 105 License Key, 179 Custom Colors, 503 Display,
504 About; menu 106 (Import Menu, Export Menu, Exit TapText). Version string "DinarSoft(c)1.3.0.11".
Settings: `Software\DinarSoft\TapText` (ShowProcIcon, UseCustomIcon, IconDisplayX/Y, CascadingMenus, colours…).

## Typing into the front program
- Focus borrow 0x1E250: GetForegroundWindow → GetWindowLong(GWL_WNDPROC) saved → SetWindowLong to helper 0x1E204 →
  SendMessage(registered "SpecialGetFocusMessage", 0x1E1EC) → helper returns GetFocus() from inside the target's thread
  → original procedure restored.
- Typing 0x137F4 (hwnd, text, len): GetClassName; "noteeditclass" (Notes) → text on the clipboard (CF_UNICODETEXT)
  and PostMessage(WM_COMMAND, 0x1647) (Notes' Paste), Sleep 100. Otherwise WM_CHAR ' ', WM_CHAR 8, Sleep 100, then
  per character: skip '\n'; WM_CHAR ch; on '\r' also WM_KEYDOWN VK_RETURN, WM_KEYUP, WM_CHAR ' ', Sleep 100, WM_CHAR 8.
- Item driver 0x1E2EC: borrow focus; loop: scanner 0x139F4 tries wcsstr "{{DATE:", then "{{TIME:", "{{TAB",
  "{{CTRL-" and creates a C++ macro object (vtables 0x222A0, 0x22298, 0x22290, 0x22288); type the text before it;
  0x13B78 reads to "}}"; vtable[1] runs it; borrow the focus again.
- Macros: DATE 0x13C14 GetDateFormatW, TIME 0x13CBC GetTimeFormatW (editor previews on 2005-03-16 15:27:57), TAB
  0x13D64 (WM_KEYDOWN/UP VK_TAB + WM_CHAR 9), CTRL 0x13E08 (keybd_event VK_CONTROL + B/I/U, KEYEVENTF_SILENT).
  Pickers: 10 date formats, 5 time formats (strings at 0x1226C–0x124A4).

## TapText.dmd
UTF-16LE, no BOM. "DinarSoftTapText", X00001, then the root group. Group: `G`, flags (enabled, open in tree, style
0 follow / 1 one menu / 2 cascading) + X%05d icon, X%05d-length title, X%05d count. Item: `I`, flag + icon, title,
text. Separator: `S`. `dmdParts()` in `src/components/toys/ds-taptext/tt.ts` writes it back identical to the original
(3,591 characters, 7,182 bytes).

## Setup
- Install_Init: FindWindow("TapText") → WM_CLOSE; trial record (0x1018A4) written to
  `HKCR\VB.register` value "Pl"+"at"+"form" (REG_BINARY) only if it does not exist yet.
- Install_Exit: Start menu and Startup shortcuts (Startup → `"\Windows\TapTextLauncher.exe"-Q`), copies TapText.dmd.
- Uninstall: "Do you want to delete TapText's menu definition file?"

## Trial and key
- Trial record: the same 14-byte encoder as HijriDate (0x1014E0 in the setup DLL, decoder 0x17EAC). Check 0x17840:
  value missing or bad → expired (state 7); now > install + 15 or now < install → expired, and the value is replaced
  by 10 bytes of L"fslkjreii".
- Check 0x172B4 (key at 0x24A18, state at 0x24C18), key function 0x18098 (identical to HijriDate's 0x1056E0):
  per-device families with the words "TapTextII", "Registerd", "Unlock" (key(K, w) == key(key(code, w), w), the K
  buffer chained through the families); then five built-in words on a fresh copy, key(K, "TapText") ==
  key(key(WORD, "TapText"), "TapText"): YASSERMOHAMEDALI, three more names, GIVEAWAYVERSION1.
  `src/lib/dinarsoft/taptext.ts` returns key(GIVEAWAYVERSION1, "TapText") = XZTZ-CRYC-IGKN-UKFX.
