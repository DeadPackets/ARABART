# One engine, three apps

Functions found in all three 2006 builds with the same instructions once addresses, branch targets and data pointers are set aside (strings, imported calls and constants still have to match). Function bounds come from each file’s `.pdata` table. Rerun: `uv run -q --with capstone --with pefile --with unicorn python -I research/dinarsoft/re/handylauncher/shared.py`.

**24 functions, 4,508 bytes of code, identical in HandySwitcher 2.7, HandyLauncher 3.4 and HandyMenu 3.6.**

| Pair | Identical functions | Bytes |
|---|---|---|
| HandySwitcher 2.7 and HandyLauncher 3.4 | 27 | 5,080 |
| HandySwitcher 2.7 and HandyMenu 3.6 | 31 | 4,984 |
| HandyLauncher 3.4 and HandyMenu 3.6 | 27 | 4,888 |

| HandySwitcher 2.7 | HandyLauncher 3.4 | HandyMenu 3.6 | Bytes | What it does |
|---|---|---|---|---|
| 0x16280 | 0x11000 | 0x17510 | 16 |  |
| 0x12B0C | 0x117C4 | 0x1853C | 36 |  |
| 0x162B4 | 0x117E8 | 0x13120 | 16 |  |
| 0x1631C | 0x11940 | 0x12990 | 440 | Turns a bitmap into an icon with a see-through background |
| 0x12EC8 | 0x128D0 | 0x1506C | 16 |  |
| 0x13240 | 0x12BBC | 0x1539C | 288 | Sets a dialog in Tahoma at the right size for the screen |
| 0x13680 | 0x134EC | 0x15C80 | 224 | Opens the color picker for one menu color |
| 0x135A4 | 0x135CC | 0x15D60 | 220 | Lays out the controls of a settings page |
| 0x122EC | 0x154EC | 0x17D1C | 40 |  |
| 0x12314 | 0x1553C | 0x17D44 | 396 | Your Pocket PC Code: reads the device ID and folds it to 16 characters |
| 0x124A0 | 0x156C8 | 0x17ED0 | 484 | The key engine: a 120-number shuffle keyed by the product name |
| 0x12684 | 0x158AC | 0x180B4 | 92 | Takes the spaces and dashes out of a code |
| 0x126E0 | 0x15908 | 0x18110 | 196 | Writes a code as four groups of four |
| 0x127A4 | 0x159CC | 0x181D4 | 380 | Disguises the install date as 14 bytes |
| 0x12920 | 0x15B48 | 0x18350 | 492 | Reads the 14-byte date back and checks it |
| 0x187F8 | 0x15D58 | 0x120A0 | 416 | Reads the phone theme colors from the registry |
| 0x17244 | 0x15EF8 | 0x141A4 | 400 | Makes the menu font, scaled for the screen |
| 0x11F44 | 0x18DAC | 0x18694 | 4 |  |
| 0x1AEEC | 0x1A8C8 | 0x19068 | 52 |  |
| 0x1AF20 | 0x1A8FC | 0x1909C | 168 | Grows a block of memory when a list gets longer |
| 0x1AFC8 | 0x1A9A4 | 0x19144 | 24 |  |
| 0x1AFE0 | 0x1A9BC | 0x1915C | 48 |  |
| 0x1B010 | 0x1A9EC | 0x1918C | 48 |  |
| 0x1B040 | 0x1AA1C | 0x191BC | 12 |  |

Totals per file: HandySwitcher 2.7 117 functions, 39,352 bytes, HandyLauncher 3.4 161 functions, 37,912 bytes, HandyMenu 3.6 121 functions, 31,708 bytes

| Dialog | HandySwitcher 2.7 | HandyLauncher 3.4 | HandyMenu 3.6 | Controls | Same controls with the same words |
|---|---|---|---|---|---|
| License Key | 105 | 105 | 105 | 9 | yes |
| Custom Colors | 186 | 179 | 505 | 18 | yes |
