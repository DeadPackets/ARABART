# HijriDate 1.5: how it works

Source: `research/dinarsoft/downloads/` HijriDate 1.5 CAB (files dated 2005-02-04). `cab.py` extracts with 7z into a
temp dir. `HIJRIP~1.001` = `HijriPlugin.dll` (95,232 bytes, ARM, image base 0x100000); `HIJRIP~1.999` is the same file,
used by the installer as its setup DLL. Disassembly: `tools/ana.py` (capstone, coredll imports by ordinal from
`tools/ordinals/*.def`, mingw-w64 libce). Emulation: `tools/emu.py` (unicorn; soft-float helpers run as exact Python
floats).

## Parts
| Part | Bytes | Notes |
|---|---|---|
| .text | 32,768 | all code |
| .rsrc | 52,224 | 44 word bitmaps (6,528), 2 logos (33,428: 157 Arabic دينار + globe, 162 DiNAR + globe, the pre-Nov-2006 DinarSoft logos BRAND.md lists as lost), 3 icons, 7 dialogs (102 Gregorian, 105 License Key, 113, 500 sheet, 501 Hijri, 502 Main, 503 About), version |
| .rdata + .data | 5,632 | tables, strings, settings |
| .pdata, .edata, .reloc, header | 4,608 | exports: ordinal 240 InitializeCustomItem, 241 CustomItemOptionsDlgProc, Install_Init, Install_Exit, Uninstall_Init |

Registry: `Software\Microsoft\today\items\Hijri Date` (LicKey, Options, Adjust, GregFirst, Use Babylion, HijriFormat,
HijriType, HijriAlign, GregFormat, GregType, GregAlign).

## Calendar (ported line for line in `src/components/toys/ds-hijridate/hijri.ts`)
- `julianday` 0x101D00: Julian day at 00:00 UT, Gregorian switch when `day*0.0001 + month*0.01 + year >= 1582.1015`.
- `tmoonphase` 0x1020A8 (5,620 bytes, prints "tmoonphase: illegal phase number"): mean new moon
  `2415020.75933 + 29.53058868 k`, 13 sine corrections (0.1734 − 0.000393T sin M, −0.4068 sin M′, …), minus ΔT
  `(0.41 + 1.2053T + 0.4992T²)` minutes. k counts new moons from January 1900.
- `visible` 0x10369C: frac = float(jd − int(jd)). frac ≤ 0.5 → start = jd + 1. Otherwise hour = (frac − 0.5)·24 + 3
  (Mecca, UT+3); hour > 6 → jd + 1, else jd. In words: born before 06:00 Mecca time, day 1 is the next day; later, the
  day after that.
- `G2H` 0x103860: guess k = trunc((trunc(m − 0.5)/12 + d/365 + y − 1900)·12.3685 + 0.6); step k down until
  start(k) ≤ jd; month index = k − 1048 (new moon 1048 = 1 Muharram 1405); day = trunc(jd − start + 1).
- Adjustment (±2) 0x103B88 moves the Gregorian date first, with a month-length table (year % 4 leap).
- Wrapper 0x104B38 (this, SYSTEMTIME in, SYSTEMTIME out, adjust).

## Arabic
- 44 word bitmaps, 16 px tall, 1 bpp: days 115–120 and 160, Hijri months 145–155 and 132, Gregorian months 133–144,
  digits 122–131, space 121, comma 104, dash 107. Exported to `glyphs.json`.
- 0x104274 builds the list of word IDs in reading order for 8 formats; digits of each number go in last first.
- 0x104FD4 loads the bitmaps from the end of the list (LoadImageW); 0x104E5C sums widths (GetObjectW), makes one
  1-bpp strip (CreateBitmap) and pastes left to right (BitBlt SRCCOPY). Result: the Arabic reads right to left, the
  digits left to right.
- Colour: 0x105160 caches a 24-bpp copy per text colour: FillRect(colour), FillRect(white),
  BitBlt SRCINVERT (0x660046), BitBlt SRCAND (0x8800C6). 0x105384 draws with GetTextColor: SRCAND with the word, then
  SRCPAINT (0xEE0086) with the coloured copy; flags 1 centre, 2 right, 4/8 vertical.
- The rebuilt strips match DinarSoft's own September 2006 screenshot with 0 different pixels on both lines.

## Today screen
- 0x10802C window proc. WM_TODAYCUSTOM_QUERYREFRESHCACHE (polled every 2 s by the shell): 0x103EBC returns 1 only when
  wYear, wMonth or wDay differ from the drawn date, or settings changed.
- Install_Exit 0x1078F8: SendNotifyMessage(HWND_BROADCAST, WM_WININICHANGE, 0xF2, 0) so the Today screen reloads its
  items at once.

## Trial and key
- Pocket PC Code 0x105554: KernelIoControl(IOCTL_HAL_GET_DEVICEID 0x01010054) → hex with %02X (preset string
  "730007B6BFA373D1380000050BFE45CE5" when the call fails), folded to 16 characters (hex value + 1, skip ':'..'@', skip O),
  shown by 0x105920 as `XXXX - XXXX - XXXX - XXXX`.
- Key 0x1056E0: RC4-style KSA over S[0..119] keyed by "Hijri", then per character
  `c = 'A' + ((ch ^ S[(S[i]+S[j]) % 120]) % 25)`, +1 if ≥ 'O'. Check 0x107604: lstrcmpW(key(code, "Hijri"), LicKey).
  `src/lib/dinarsoft/hijridate.ts` uses the shared `dinarKey()`.
- Trial: `\Windows\inter.dat`, 14 bytes (0x1059E4 / 0x105B60): shorts [2m+3, y+7, y+21, 2d+5, 2m+1, 2(d+2)], each
  byte + (i % 2), then sum % 31. The decoder checks both copies of each field and the checksum. Day number
  (y·12 + m)·31 + d; trial while 0 ≤ now − install ≤ 15. Same record as the Handy apps.
