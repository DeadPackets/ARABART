# ARABART: technical analysis

ARABART (shown on screen as "ARABIC-ART"), version 4.15, © 1993 Yasser Mohamed Ali, Port Said. MS-DOS, x86 real mode, written in assembly.
This is the first technical analysis of the binaries. Every claim is marked by confidence in the table at the end.

---

## TL;DR

- **ARABART is a 30 KB resident driver (TSR).** It hooks the BIOS video interrupt INT 10h and adds a private function group, `AH=36h`. Any program that can call an interrupt (the known clients are C and assembly) writes Arabic on an EGA/VGA 16-colour graphics screen with one interrupt call. It works next to Borland BGI graphics.
- **The core idea is that the keyboard is the encoding.** A programmer types Arabic on a US keyboard as if it were an Arabic keyboard (`~gtk ~guvfd` = "الفن العربي"). Each key maps to a glyph code whose two top bits mean "can join right" and "can join left". Auto-shaping is then one short pass that clears bits. Inline keys `@ ! # $ *` switch bold, italic, underline, double size and reset.
- **The code is small and original, with real weak spots.** It has 1,448 bytes of handler code, uses only 8086 instructions, writes to the VGA hardware directly, and carries 5 hand-drawn fonts in 27,932 bytes. It also has no subroutines, a few latent bugs and inconsistent error reporting. We ran the real unpacked code in an emulator. It reproduced the demo screenshot (93.9 % lit-pixel overlap after rescaling).

## For everyone

- **What it is:** a small program you start once. After that, other programs can write Arabic in colour, in several fonts and sizes, on the graphics screen.
- **How a programmer wrote Arabic:** on a normal English keyboard, pressing the keys where the Arabic letters sit on an Arabic keyboard. The library turns those keys into Arabic letters.
- **Letter shapes are automatic:** Arabic letters change shape when they connect. ARABART picks the right shape for each letter by itself.
- **Styles by typing symbols:** `@` bold, `!` italic, `#` underline, `$` double size, `*` back to normal. It also has a one-call "3-D" effect (a coloured shadow).
- **Five fonts, drawn pixel by pixel.** The largest font contains only the letters of "الشمس" ("The Sun"). It was most likely made for the title of *The Brave Sun*, his 1993 competition entry.
- **Proof:** we unpacked his original program, ran it in an emulator, and it drew the same screen as the demo screenshot.

---

## Deep dive

### Method and unpacking

| Item | Finding |
|---|---|
| Packer (all 5 EXEs) | **DIET** by Teddy Matsumoto, EXE mode. The entry stub matches the Detect It Easy rule `fc061e0e8cc80106....ba....03c28bd8…ea`. The byte at EP+55 is `FF`, not `64` ("d" of the later `dlz` mark), so the rule reports **DIET 1.00**. This explains why the `LZ91`-style mark is missing. |
| Packer (all 4 COMs) | **DIET 1.00/1.00d**, COM mode. The stub `BF xx xx 3B FC 72 04 B4 4C CD 21 BE … FD F3 A5 FC` matches the DIE rule. |
| How it was unpacked | Unicorn emulation of the stub until its final `JMP FAR`. The relocation table was rebuilt by walking DIET's appended table with the same decode logic as the stub. DIET also stores the **original 62-byte MZ header** at the end of the data. It was used to restore the exact original image size (ARABART `0x759E` bytes) and `minalloc`. |
| Sanity checks | The strings decode ("ARABIC-ART Ver 4.15 Copyright (c)1993 YASSER MOHAMED ALI."). The entry code is plausible. The emulated install and API calls draw correct Arabic (see §5). |
| Original linker | The stored original headers carry `01 00 FB 30` at offset 1Ch: the **Borland TLINK** mark with version byte `30h` (3.0). This is true for ARABART and for the C programs. |

Offsets below are **offsets in the unpacked load image** (CS:offset). In `ARABART_EXE.unp.exe`, add `0x20` to get the file offset.

Unpacked files (folder `/private/tmp/claude-501/-Users-deadpackets-workspace-DOSArchive/bb845a97-0c40-416d-bb30-299debf3ecff/scratchpad/re/arabart/`):

| File | What |
|---|---|
| `/private/tmp/claude-501/-Users-deadpackets-workspace-DOSArchive/bb845a97-0c40-416d-bb30-299debf3ecff/scratchpad/re/arabart/ARABART_EXE.unp.exe` | ARABART 4.15, runnable MZ, image 30,110 bytes, 1 relocation |
| `/private/tmp/claude-501/-Users-deadpackets-workspace-DOSArchive/bb845a97-0c40-416d-bb30-299debf3ecff/scratchpad/re/arabart/SUN_ARAB-ART_EXE.unp.exe` | ARAB-ART 7.15 (SUN variant), loads `ARAB-ART.FNT` |
| `/private/tmp/claude-501/-Users-deadpackets-workspace-DOSArchive/bb845a97-0c40-416d-bb30-299debf3ecff/scratchpad/re/arabart/DEMO_EXE.unp.exe` | DEMO.EXE, 184 relocations |
| `/private/tmp/claude-501/-Users-deadpackets-workspace-DOSArchive/bb845a97-0c40-416d-bb30-299debf3ecff/scratchpad/re/arabart/EDITOR_EXE.unp.exe` | EDITOR.EXE, 158 relocations |
| `/private/tmp/claude-501/-Users-deadpackets-workspace-DOSArchive/bb845a97-0c40-416d-bb30-299debf3ecff/scratchpad/re/arabart/SUN_EXE.unp.exe` | SUN.EXE, 1,746 relocations |
| `/private/tmp/claude-501/-Users-deadpackets-workspace-DOSArchive/bb845a97-0c40-416d-bb30-299debf3ecff/scratchpad/re/arabart/ARABIC_DEMO.unp.com` | commercial DEMO.COM, 25,899 bytes (`com_dec.img` = same with the copyright decrypted) |
| `arabart.lst`, `arabart715.lst` | recursive-descent disassembly listings |
| `emu_arabart.py` | E2E harness: runs the real TSR and calls its API (modes: default, `styles`, `hibit`, `xclip`, `perf`) |
| `emu_demo_screen1.png`, `emu_compare.png` | the output of the real code and a side-by-side with the screenshot |

### 1. Residency

**Install sequence** (`ARABART.EXE` 0000–003B, then 74D4–74FD):

```
0000  B8 10 35      mov  ax,3510h        ; get current INT 10h vector -> ES:BX
0003  CD 21         int  21h
0005  8B FB         mov  di,bx
0007  BE 3C 00      mov  si,003Ch        ; start of our own handler
000C  B9 0C 00      mov  cx,12
0010  F3 A6         repe cmpsb           ; first 12 bytes equal? -> already loaded
0012  75 13         jne  0027h
001C  B4 09 ..      int  21h             ; "This utility is already active in your RAM."
0023  B4 4C CD 21   exit
0027  8C 06 51 00   mov  [0051h],es      ; patch the far-JMP operand at 004Eh
002B  89 1E 4F 00   mov  [004Fh],bx      ;   = old INT 10h (chain)
002F  B8 10 25 ..   int  21h             ; INT 10h -> CS:003Ch
0039  E9 98 74      jmp  74D4h           ; banner, ~1.6 s wait, INT 27h
74F9  BA 9E 75      mov  dx,759Eh ; CD 27  int 27h   ; terminate and stay resident
```

| Question | Answer |
|---|---|
| Install method | **INT 27h** with `DX=759Eh` (the whole image size). |
| Vectors hooked | **INT 10h only**. The emulator logs a single `INT 21h/25h` (INT 10h → 1010:003C). There is no INT 2Fh, 16h or private vector. |
| Resident size | MS-DOS 2.0 source (`PROC.ASM`, `Stay_resident`) shows that INT 27h counts DX from the **current PSP**, not from CS. So 30,110 bytes stay resident (0x75A paragraphs), including the 256-byte PSP. The code computed DX from CS, so the last 256 image bytes are released. These bytes are only install code and messages, so the result is harmless. The environment block is not freed (there is no `INT 21h/49h`). |
| Double-load protection | It compares the first 12 bytes at the current INT 10h target with its own entry (`EB 0A 90 "DALYASSER"`). The emulated second run printed "already active" and exited with 4Ch. **Fragile:** if another TSR hooks INT 10h after ARABART, the check fails and a second 30 KB copy loads. |
| Banner | It re-sets the current video mode (this clears the screen), prints the copyright, then waits 112 vertical retraces (port 3DAh bit 3). That is about 1.6 s at 70 Hz. |
| Unload | **None.** There is no uninstall function and no vector restore. |

**Handler entry** (003C):

```
003C  EB 0A 90            jmp  short 0048h  ; skip the 9-byte ID
003F  44 41 4C 59 41 53 53 45 52            ; "DALYASSER"
0048  FB                  sti
0049  80 FC 36            cmp  ah,36h
004C  74 05               je   0053h        ; ARABART function, AL = number
004E  EA 00 00 00 00      jmp  far old_int10 ; operand written at install time
```

For every other `AH` value, the cost is 3 instructions and a far jump. **Note:** writing the old vector into the `JMP FAR` operand is the only self-modifying code in ARABART. It is a common TSR idiom.

### 2. API

There is one entry point, **INT 10h with AH=36h**, and AL selects the function. The table is in the "API table" section below.

How the clients call it (all verified in the unpacked binaries):

- **DEMO.EXE and SUN.EXE** share one small **C binding** compiled with Borland C++. It uses far functions with Borland stack checking, `enter`/`push imm` (80186 code) and register save/restore around `int 10h`. DEMO: `DEMO_EXE.img` 206B–2162. SUN: 4B6B–4CC3. The names below are invented because there are no symbols:

  ```c
  int  ar_present(void);                     /* AX=3600h; returns AX-5943h, 1 = loaded */
  void ar_color(int c);                      /* AX=3601h, CX=c (CL text, CH shadow)    */
  void ar_font(int f);                       /* AX=3603h, CX=f                          */
  int  ar_width(char far *s);                /* AX=3605h -> CX                          */
  int  ar_height(char far *s);               /* AX=3604h -> DX, doubled for every '$'   */
  void ar_text(int x, int y, char far *s);   /* y += ar_height(s); AX=3607h             */
  void ar_text3d(int x, int y, char far *s); /* same, AX=3608h                          */
  ```

  The binding turns the BGI-style top `y` into ARABART's baseline `y`.
- **EDITOR.EXE** uses inline assembly blocks inside C (`push ax / mov ax,3603h / push cx / mov cx,1 / … int 10h`). It saves every register before the draw call.
- **SUN.EXE** calls the font selector 59 times: font 3 ×25, 1 ×23, 4 ×5, **5 ×3**, 2 ×3. If ARABART is not loaded, it prints "ARABIC-ART is not active please run ARAB-ART.EXE first."
- **ARABIC/DEMO.COM (the 1991 commercial) does not call ARABART at all.** There is no `AH=36h` anywhere in it. See §5.

**Why it was easy for programmers:**

| Design choice | Effect |
|---|---|
| One interrupt with DOS-style registers (`DS:DX` = string, like `INT 21h/09h`) | Any language that can call an interrupt can use it. No linking. |
| The string is plain ASCII typed in the Arabic keyboard layout | Arabic sits in normal C or assembly string literals in a US-keyboard editor. |
| Inline style keys `@ ! # $ *` | Formatting is part of the text, like markup. No extra calls. |
| Shaping is automatic | The caller never chooses letter forms. |
| Measure call (fn 5) | Right-aligning and centring are one call. |
| 3-D text call (fn 8) | The effect seen in his commercials is one call. |
| Works in the BGI's mode 12h/10h/0Eh and restores the VGA registers | It mixes with Borland graphics on the same screen. |

**What the programmer must still do:** reverse digit and number runs by hand. The demo stores `51<4` to show "٤,١٥" (4,15). Strings are capped at 90 bytes per call. BX is lost on every draw.

### 3. Fonts

**Where:** inside `ARABART.EXE` (4.15) at 0706–7421 (27,932 bytes). In the SUN variant (7.15), the same data comes from `ARAB-ART.FNT`.

**Layout:**

| Offset | Content |
|---|---|
| 05E4–060B | state: screen height, status, bold/italic/underline/size flags, font index, cursor, colours |
| 060C–0665 | 90-byte copy of the caller's string, then **0666–066F zero bytes** (an accidental terminator guard) |
| 0670 | `A000h` (VGA segment) |
| 0672 | bit-reverse table `00 04 02 06 01 05 03 07` |
| 067A | pixel masks `80 40 20 10 08 04 02 01` |
| 0682–06E1 | **keyboard → glyph-code table**, 96 entries for ASCII 20h–7Fh |
| 06E6 / 06E8 | font count (5) / font pointer table (space for 15 pointers) |
| 0706… | fonts: each is a 256-word glyph pointer table followed by glyph data |

**Font header trick:** glyph slots 0–2 never hold glyphs, so they hold metrics. Word 1 is the line height and word 2 is the 3-D shadow offset.

| API font | Address | Height | Shadow | Unique glyphs | Notes |
|---|---|---|---|---|---|
| 1 | 0706 | 18 | 1 | 95 | small text face |
| 2 | 59E7 | 27 | 1 | 103 | more calligraphic, rounder; stored after fonts 3 and 4 in memory, so it was probably added later |
| 3 | 1478 | 34 | 2 | 141 | main display face |
| 4 | 3ECE | 38 | 2 | 87 | its header word 0 is `0706`, copied from font 1 |
| 5 | 7013 | 50 | 3 | 6 own | **only space, ا, لـ, ـشـ, ـمـ, ـس; the other 143 slots point to font 1.** Together these spell **الشمس**. Function 0 reports only 4 fonts. |

**Glyph format** (run-length, drawn from the baseline up and right to left):

```
byte 0   advance width (pixels)
byte 1   D = rows the glyph starts above the baseline
then     (skip, length) pairs: run starts 'skip' px left of the right edge, 'length' px long
EFh      next row (one pixel up)
>EFh     end of glyph
```

The run format is **not a size win**. It is 1.16–2.23× larger than plain bitmaps (font 3: 10,326 vs 8,884 bytes, measured). It makes the styles almost free:

| Style | Inline key | Code | How it is done |
|---|---|---|---|
| Italic | `!` (Shift+1) | C9h | each row up shifts the runs 1 px left. The shear is anchored at the baseline, so letters still join. It is 45°, which is heavy. |
| Bold | `@` (Shift+2) | C8h | +1 px on every run and on the advance |
| Underline | `#` (Shift+3) | CAh | a 1-px line on the baseline row across the advance |
| Size ×2 | `$` (Shift+4) | CBh | skips and lengths doubled; each row written twice (row step 160 bytes) |
| Reset | `*` (Shift+8) | D0h | all off |
| Font 1–4 | Shift+Q/W/E/R | editor only | EDITOR calls fn 3 |
| Colour | Shift+C | editor only | cycles the text colour (fn 1) |
| (undocumented) | Shift+V, `\|` | editor only | Shift+V cycles the shadow colour; `\|` switches between fn 7 and fn 8 (3-D) |

The 5 control codes sit in slots `C8h–CBh, D0h`. These are the would-be "medial" forms of the digits 0–3 and 8. Digits never join, so the shaper can never produce those codes. The shaper also skips them when it looks for a neighbour, so **a letter keeps joining across a style change**: `~gt@k` keeps ف medial (verified).

**Character set:** 28 letters plus ة ى ء ؤ ئ أ آ, the ligatures لا لأ لآ, tatweel (ـ), Arabic-Indic digits ٠–٩, `، ؟ , . + - = / × ÷ < >`. **There are no Latin letters and no harakat (vowel marks).** The yeh's isolated and final forms are drawn without dots (Egyptian convention), and `n` (ى) and `d` (ي) map to the same code.

### 4. Shaping

**Step 1, translate** (0200–022D): each byte goes through the 96-byte table at 0682. Each letter is stored at its "most-joining" form:

| Code bits 7,6 | Form | Who gets it in the table |
|---|---|---|
| `11` | medial | dual-joining letters (ب ت ج … ي, tatweel) |
| `10` | initial | — (produced by the shaper) |
| `01` | final | right-joining letters (ا د ذ ر ز و ة ؤ لا لأ لآ أ آ) |
| `00` | isolated | non-joining (ء, digits, punctuation, space=03h, the second alef `~`) |

The key → letter map follows the standard Arabic PC keyboard layout: `h`=ا `f`=ب `j`=ت `e`=ث `[`=ج `p`=ح `o`=خ `]`=د `` ` ``=ذ `v`=ر `.`=ز `s`=س `a`=ش `w`=ص `q`=ض `'`=ط `/`=ظ `u`=ع `y`=غ `t`=ف `r`=ق `;`=ك `g`=ل `l`=م `k`=ن `i`=ه `,`=و `d`=ي `m`=ة `x`=ء `z`=ئ `c`=ؤ `b`=لا, and with Shift `G`=لأ `B`=لآ `H`=أ `N`=آ `J`=ـ `K`=، `?`=؟. Not supported: `T` (لإ), `Y` (إ) and the harakat keys (Shift+Q/W/E/R/A/S/Z/X).

**Step 2, shape** (022F–02BB): the first letter loses bit 6. Then, for every letter and the next real letter (style codes skipped), **if not (this.bit7 AND next.bit6), clear this.bit7 and next.bit6**. The resulting byte indexes the font's 256-entry glyph table directly. Example (verified): `~gtk` = `30 E9 F6 ED` → `30 A9 F6 6D` = ا isolated, لـ initial, ـفـ medial, ـن final.

| Topic | Behaviour |
|---|---|
| Lam-alef | **No automatic ligature.** It is a separate key (`b` = لا, `G` = لأ, `B` = لآ), as on a typewriter. Typing `g`+`h` gives لـ + ـا, not لا (rendered and checked). |
| Right-to-left | The X given is the **right edge**. Each glyph moves the pen left by its advance. The text is drawn in logical order from right to left. |
| Numbers and Latin | There is no bidi. Digit runs must be stored reversed (DEMO uses `51<4` for ٤,١٥). Latin text has no glyphs and must come from BGI. |
| Line clipping | It stops at the first glyph whose left edge would be past 0. |

### 5. Rendering

**Direct VGA hardware, not BIOS and not BGI.** It reads the BIOS mode (`INT 10h/0Fh`): 12h → 480 lines, 10h → 350, 0Eh → 200, otherwise error. Then it uses EGA/VGA **write mode 0 with Set/Reset**:

```
02F9  BA CE 03     mov dx,3CEh      ; graphics controller
02FC  B0 01 EE     index 1          ; Enable Set/Reset
02FF  42 B0 0F EE  = 0Fh            ;   all 4 planes take colour from Set/Reset
0303  4A 32 C0 EE  index 0          ; Set/Reset
0307  42 8A C3 EE  = colour (BL)
...
0506  B4 08        mov ah,8         ; Bit Mask register
050B  86 C4 EF     out dx,ax        ;   = pixels of this byte to paint
050E  26 8A 25     mov ah,es:[di]   ; read: load the latches
0511  26 88 05     mov es:[di],al   ; write: paint only the masked pixels, in colour
```

There is one write per byte for all 4 planes, with no per-plane loops. At the end (055D) it restores Enable Set/Reset to 0 and Bit Mask to FFh, so BGI keeps working.

| Speed trick or cost | Detail |
|---|---|
| Set/Reset + bit mask | 1 OUT + 1 read + 1 write per screen byte |
| 16-bit `OUT DX,AX` | index and value in one instruction |
| Run-length glyphs | it never tests a blank pixel |
| Cost (measured in the emulator) | font 3: 25,082 instructions, 415 OUTs, 1,357 pixels for 16 characters = **18.5 instructions/pixel**. Font 1: 37.8. |
| Weak point | each run's pixels are ORed into a mask one at a time. There is no span-mask shortcut. The 8-instruction "flush byte" block is copied 4 times. |

**Verification (E2E):** `emu_arabart.py` loads the real unpacked TSR, lets it install, then makes the same calls as DEMO.EXE (fonts 1–3, colours 4–15, `x` starting at 630). A small VGA model applies Set/Reset and Bit Mask. Results:

- The real code's frame is **identical** to my Python re-implementation. Against the DOSBox screenshot (962×600, downscaled to 640×480), **93.9 %** of the lit pixels overlap. The rest is resampling loss.
- Install, double-load refusal, function 0, and the font-range error all behave as described here.

**The 1991 commercial (ARABIC/DEMO.COM) works differently.** It sets EGA mode 10h and plays a script of **9,023 vertical pixel runs** through **BIOS `INT 10h/0Ch` per pixel** (81,930 calls, emulated). That is 15 slides with 23 text lines. It draws each pixel twice for the 3-D look: colour 1 at (x,y) and colour 2 at (x+2,y+2). Each text line patches 5 bytes of its own code: the two step opcodes, a jump offset that turns the shadow on or off, and two colours. Its letterforms look like ARABART font 3: the height is 34 px in both, and the same line is 509 px wide vs 516 px for font 3 bold with the same 2-px shadow. Pixel overlap is only 32 %, so it is likely an earlier version of the font, not the same bitmaps.

### 6. Code quality and style fingerprint

**Structure (measured):**

- The handler has **zero CALL instructions**. It is one 1,448-byte routine with jumps, and the byte-flush sequence is duplicated 4 times.
- There are 72 `CS:` overrides, 10 exit points that each end with `cli / iret` (the `cli` has no effect), and 23 padding `NOP`s. 19 follow `mov/cmp byte [var],imm` where the variable is defined later, and 4 follow short forward `jmp`s. This is the forward-reference artifact of MASM/TASM, so the data was declared after the code.
- Only 8086 instructions are used. Shifts are done one bit at a time, and there is no `push imm` or `enter`. The library runs on an 8088; the Borland C clients need an 80186 or later.
- It is strongly table-driven: the keyboard table, a 256-entry glyph table per font, mask tables, metrics stored in glyph slots, and shared glyph pointers (font 1 has 54 shared slots; font 5 reuses 143 glyphs of font 1).

**Clever parts:**

1. Two join bits inside the glyph code make shaping one short pass. Its core test is 8 instructions; the rest skips style codes.
2. Style codes live in slots the shaper can never produce, and they are transparent to joining.
3. 3-D text runs the same draw loop twice. It resets the style flags between passes so the inline toggles replay the same way, and it shapes the text only once.
4. Italic shear is measured from the baseline, so joined letters stay joined.
5. The SUN build moved the data into `ARAB-ART.FNT`, and the read is capped at exactly the file size (`CX=4F28h`). A larger file is cut, not overflowed.

**Bugs and fragile spots (all verified by code reading; items marked † also by emulation):**

| # | Where | Problem | Effect |
|---|---|---|---|
| 1 | 0186–0198 | The bounds check uses AND, not OR: it rejects only if x≥640 **and** y≥480 | † x=650: the glyph wraps into the next scanline (148 px spread over x=0–639) |
| 2 | 0213–021F | A byte ≥80h is set to 0, but the −20h table bias still applies, so it reads 32 bytes **before** the table | † it draws whatever raw code is in the caller's memory 86 bytes further on (0x28 gave a ب) |
| 3 | 03BF + 0568 | Measure-3D (fn 6) adds both passes | † returns 632 instead of 316. No known client uses fn 6. |
| 4 | 0198, 01EF | Off-screen returns AL=2 with **CF clear**. Only a bad video mode sets CF. | † y=500 → AL=2, CF=0 |
| 5 | 05A6–05B6 | It pops the IRET frame into AX/BX/DX to edit CF | BX is returned holding the caller's CS. On a font error, AX/BX/DX = IP/CS/FLAGS. |
| 6 | 0057–005D | Function 0 returns CX=4, but there are 5 fonts. The 7.15 build still reports BX=040Fh (4.15). | stale constants |
| 7 | 012E–013D | The cursor is set to (300,0), then overwritten with (100,100) | dead stores left over from editing |
| 8 | whole draw | Assumes GC Data Rotate = 0, write mode 0, Map Mask = 0Fh, and never sets them | after a BGI `setwritemode(XOR_PUT)` or a plane mask, colours would be wrong (not tested) |
| 9 | glyph table | Slots B0h/F0h (initial/medial of the non-joining alef 30h) hold yeh glyphs that can never be reached | leftover data |
| 10 | EDITOR 1E20 | Colour cycles 1→17. 16 and 17 wrap to black and blue. | invisible text after 15 presses |
| 11 | C binding | `ar_height` doubles for every `$`, but `$` is a toggle | wrong height for `$…$` strings |

**Compared with typical early-1990s DOS code:** INT 27h, a private function on an existing BIOS vector, no INT 2Fh multiplex and no uninstall were all common in hobby and small-company TSRs of the time. So were one long routine, CS-relative variables and NOP padding. Above the norm: the bit-encoded shaping, the transparent inline styles, the clean restore of VGA state for BGI, and a compact, coherent API. Below the norm: no subroutines and inconsistent register and error contracts.

### 7. What the binaries say about how he worked

| Evidence | Reading | Confidence |
|---|---|---|
| TLINK 3.0 mark in all original headers; NOP-padding pattern; Borland C++ "1991" runtime; BGI driver 2.00 (1988) | He used one Borland toolchain for assembly and C | Verified (marks); assembler identity is a strong inference |
| Versions "4.15" and "7.15", both dated 1993; fn 0 constants left at 4.15 and 4 fonts | Many iterations. Constants were edited by hand, not kept in one place. | Strong inference |
| x≫3 and x&7 computed together by a shift/rotate loop that **reverses** the 3 bits, then repaired with the table `00 04 02 06 01 05 03 07` | A working solution found by experiment, not from a textbook `and dx,7` | Speculation (it may be deliberate) |
| 1991 commercial uses BIOS per-pixel writes; the 1993 library programs the VGA graphics controller directly | His hardware knowledge grew between 1991 and 1993 | Facts verified; growth is an inference |
| Font file signature "YASSER DOT DESIGN"; 27.9 KB of run-length glyphs in 5 fonts | He probably had his own pixel-font editor and encoder. Hand-encoding this many runs is unlikely. | Strong inference |
| Font 5 contains only الشمس; SUN selects font 5 three times; SUN's FNT keeps only 43/44 glyphs of fonts 2 and 4 (all kept glyphs are byte-identical to 4.15) | Assets cut to fit each project and the memory budget | Verified (data); motive is an inference |
| The commercial's copyright is hidden by subtracting 4,5,6… from each byte and decoded at run time | He protected his credit against hex-editing | Verified (mechanism); motive is an inference |
| Egyptian letterforms (dotless final ى), Arabic-Indic digits, standard Arabic key positions | Built for local typists and readers | Verified |
| Dead stores, duplicated blocks, the inverted bounds check | He worked by patching and testing on screen, without code review | Strong inference |

---

## API table

INT 10h, `AH=36h`. Registers not listed as outputs are preserved, **except BX, which functions 4–8 destroy** (functions 5–8 also return garbage in AH).

| AX | Function | Input | Output | Notes |
|---|---|---|---|---|
| 3600h | Install check | – | AX=5944h ("DY" in AL,AH), BX=040Fh (v4.15), CX=4 | SUN tests AX−5943h = 1; EDITOR tests AX=5944h |
| 3601h | Set colours | CL = text colour, CH = shadow colour | – | 0–15 |
| 3602h | Get colours | – | CL, CH | |
| 3603h | Select font | CX = 1…5 | CF=0 OK; **CF=1** → CX = font count, AX/BX/DX destroyed | |
| 3604h | Font info | – | CX = current font (1-based), DX = line height | |
| 3605h | Measure text | DS:DX = string | CX = width in pixels | no drawing; cursor kept |
| 3606h | Measure 3-D text | DS:DX | CX = **2× width** (bug) | |
| 3607h | Draw text | DS:DX = string; CX = right-edge x; BX = baseline y (if CX or BX = FFFFh, uses the current cursor) | CX,DX = new pen x,y; AL = 0 OK / 1 bad mode (CF=1) / 2 off-screen (CF=0) | string = keyboard ASCII, NUL-terminated, first 90 bytes used |
| 3608h | Draw 3-D text | as 3607h | as 3607h | pass 1: CH colour at (x−s, y−s), s = font shadow (1–3 px); pass 2: CL colour at (x, y) |
| 3609h | Set cursor | CX = x, BX = y | – | |
| 360Ah | Get cursor | – | CX = x, BX = y | |
| other AL | – | – | – | returns at once |

Inline codes in the string: `@` bold, `!` italic, `#` underline, `$` double size, `*` reset. Space and unknown keys give an empty advance (code 03h).

Illustrative call (based on the decoded API):

```asm
mov ax,3603h / mov cx,3 / int 10h          ; font 3 (34 px)
mov ax,3601h / mov cx,0F04h / int 10h      ; red text, white shadow
mov ax,3608h / mov cx,639 / mov bx,100     ; 3-D text, right edge 639, baseline 100
mov dx,offset msg / int 10h                ; msg db '~gtk ~guvfd',0  = "الفن العربي"
```

---

## Code-quality rubric

| Area | Score /5 | Reason |
|---|---|---|
| API design | 4.5 | One vector, DOS-style registers, inline markup, a measure call, 3-D in one call. Minus: rides on INT 10h, inconsistent CF, BX clobbered. |
| Arabic shaping | 4.0 | Correct join logic with an elegant 2-bit encoding that is transparent to styles. Minus: no automatic lam-alef, no bidi, no harakat. |
| Rendering | 3.5 | Correct use of VGA Set/Reset and Bit Mask; restores state for BGI. Minus: per-pixel mask building, 18–38 instructions per pixel. |
| Data design | 4.0 | Table-driven, glyph sharing, metrics in spare slots, font file split in 7.15. Minus: run format larger than bitmaps; the FNT holds absolute pointers, so it is tied to one EXE build. |
| Robustness | 2.5 | Bounds check inverted, ≥80h bytes read outside the table, fn 6 bug, VGA state assumed, weak double-load check. Plus: 90-byte cap with a zero guard. |
| Structure / maintainability | 2.0 | No subroutines, duplicated blocks, dead stores, stale constants. |
| Portability | 3.5 | 8086-only code, three EGA/VGA modes. No CGA, Hercules or 256-colour support. |
| **Overall** | **3.4** | A working, original, compact library with two or three ideas better than the norm. The engineering hygiene is typical of a self-taught assembly programmer of the time. |

---

## Notable excerpts (for the museum)

Variable names in brackets are ours; the binary has no symbols.

**1. "Am I already here?"** (ARABART.EXE 0000)

```
mov  ax,3510h      ; Ask DOS: who answers the video interrupt now?
int  21h
mov  si,003Ch      ; Point at my own front door...
mov  cx,12
repe cmpsb         ; ...and compare 12 bytes, including my name tag "DALYASSER".
jne  install       ; Not me? Then install.
```
*Plain English:* before it loads, the program looks at the video "doorbell". If its own name tag is already there, it says "already active" and stops. This protects memory, which was scarce (640 KB in total).

**2. Arabic shaping in one test** (0299–02B8)

```
mov  ch,cl          ; next letter (style codes already skipped)
mov  dh,dl          ; this letter
and  dh,80h         ;   can it reach to the left?
and  ch,40h         ; next letter: can it reach to the right?
cmp  dh,0 / je cut
cmp  ch,0 / je cut
jmp  next           ; both can: they stay joined
cut: and dl,7Fh     ; otherwise this letter lets go on its left...
     and cl,0BFh    ; ...and the next letter lets go on its right.
```
*Plain English:* every letter carries two "hands". Two neighbours join only if both hands reach. This loop picks every Arabic letter shape.

**3. The keyboard is the alphabet** (table at 0682, ASCII `a`…`k`)

```
'a' E3 = ش   'b' 64 = لا   'c' 65 = ؤ   'd' E6 = ي   'e' E7 = ث
'f' E8 = ب   'g' E9 = ل    'h' 6A = ا   'i' EB = ه   'j' EC = ت   'k' ED = ن
     E_ / F_ = joins both sides     6_ = joins right only
```
*Plain English:* a programmer types Arabic on an English keyboard, using the same keys as an Arabic keyboard. The number stored for each key already says how that letter connects.

**4. Painting with the graphics card's own hardware** (02F9, 0506)

```
mov  dx,3CEh        ; talk to the VGA graphics controller
out  dx,al          ; "take the colour from your register, all 4 colour planes"
...
mov  ah,8           ; "only these 8 pixels"
out  dx,ax
mov  ah,es:[di]     ; read the screen byte (fills the card's latches)
mov  es:[di],al     ; write: the card paints only the chosen pixels
```
*Plain English:* instead of painting one pixel at a time through the BIOS, it tells the card the colour once. Then it says "these pixels" and paints up to 8 at a time.

**5. 3-D text by drawing twice** (0568–059D)

```
cmp  byte [mode],8  ; was this the shadow pass?
jne  done
dec  byte [mode]    ; next time: normal pass
mov  ax,[startX] / mov [x],ax
mov  ax,[startY] / mov [y],ax  ; go back to the start point
mov  byte [bold],0  ; reset the styles, so the same @!#$ marks replay
jmp  draw_again
```
*Plain English:* first it draws the text in the shadow colour, moved up and left. Then it draws the same text again on top in the main colour.

**6. A hidden signature** (ARABIC/DEMO.COM 0100)

```
mov  si,01ABh       ; 65 scrambled bytes
mov  al,4
next: mov ah,[si]
sub  ah,al          ; unscramble: subtract 4, 5, 6, ...
mov  [si],ah
inc  si / inc al
loop next           ; -> "KEMYAM Software Corp., <c>1991 YASSER MOHAMED ALI."
```
*Plain English:* the 1991 commercial hides its copyright line, so nobody can find and change it with a file editor. It decodes the line only when it runs.

---

## Glossary

- **TSR (terminate and stay resident):** a DOS program that stays in memory after it exits so that others can use it.
- **Interrupt (INT):** a numbered entry point that programs call to request a service, for example INT 10h for video and INT 21h for DOS.
- **Interrupt vector / hook:** the stored address of an interrupt's handler. To hook is to replace that address with your own handler and pass other calls on to the old one.
- **BIOS:** firmware routines in ROM; INT 10h is its video service.
- **EGA/VGA, mode 12h:** IBM PC graphics standards; mode 12h is 640×480 in 16 colours.
- **Planar memory:** in 16-colour modes, each pixel's colour is split across 4 memory planes at the same address.
- **Set/Reset, Bit Mask, latches:** VGA graphics-controller features. They paint chosen pixels of a byte in one colour on all planes in one write.
- **Glyph:** the drawn shape of one character form.
- **Positional forms:** the Arabic letter shapes isolated, initial, medial and final.
- **Lam-alef (لا):** a required ligature of lam and alef.
- **Tatweel / kashida (ـ):** a joining stroke used to stretch words.
- **Harakat:** Arabic vowel marks (not supported).
- **Bidi:** bidirectional layout, which puts left-to-right numbers correctly inside right-to-left text.
- **Run-length encoding (RLE):** storing "start, length" pairs instead of every pixel.
- **BGI:** Borland Graphics Interface, the graphics library of Turbo C/C++ and Turbo Pascal.
- **DIET:** a 1990s DOS executable compressor by Teddy Matsumoto.
- **MZ header / relocation:** the EXE file header, and the list of addresses DOS patches when it loads the program.
- **PSP:** Program Segment Prefix, the 256-byte block that DOS puts in front of every program.
- **Self-modifying code:** a program that writes into its own instructions while it runs.
- **Arabic-Indic digits:** ٠١٢٣٤٥٦٧٨٩, the digits used in Egypt.

---

## Confidence table

| Claim | Level |
|---|---|
| All EXEs packed with DIET 1.00 (EXE mode), COMs with DIET 1.00/1.00d | Verified (DIE signature match) |
| Original binaries linked with Borland TLINK, version byte 30h | Verified (header mark) |
| Installs with INT 27h, keeps 30,110 bytes, hooks only INT 10h | Verified (code + emulation) |
| API = INT 10h AH=36h, functions 0–10 as in the table | Verified (code + emulation) |
| No unload and no INT 2Fh | Verified |
| Second load is refused by a 12-byte code-signature compare | Verified (emulated) |
| Keyboard-layout ASCII → glyph code table; inline `@ ! # $ *` styles | Verified |
| The key map matches the standard Arabic PC keyboard layout | Strong inference (compared with the common Arabic 101 layout) |
| 2-bit join encoding and single-pass shaper; no automatic lam-alef; no bidi | Verified (code + rendered) |
| 5 fonts (18/27/34/38/50 px), RLE format as described | Verified (rendered glyph sheets) |
| Font 5 is exactly the glyphs of الشمس | Verified (rendered) |
| Font 5 was made for *The Brave Sun* title | Strong inference |
| Direct VGA Set/Reset + Bit Mask rendering; modes 12h/10h/0Eh | Verified |
| Real code reproduces the demo screenshot (93.9 % lit-pixel overlap) | Verified (E2E emulation) |
| Bugs 1–5 and 10 in the table | Verified; 1–4 also by emulation |
| VGA-state assumption breaks after BGI XOR mode | Strong inference (not tested) |
| 1991 commercial does not call ARABART; it plays back BIOS pixel runs | Verified (code + emulation) |
| Commercial lettering comes from an earlier version of font 3 | Strong inference |
| The SUN variant 7.15 is newer than 4.15 | Strong inference (version number, file-based fonts) |
| He had his own font editor ("YASSER DOT DESIGN") | Strong inference |
| The bit-reverse table shows trial-and-error learning | Speculation |
| "DALYASSER" / 5944h ("YD") meaning | Unknown |
| Assembler was TASM rather than MASM | Speculation (both fit) |

---

## Open questions only he can answer

1. What do "DALYASSER" and the install-check value 5944h ("Y","D") stand for? Is "YASSER DOT DESIGN" the name of a tool?
2. How did you draw the five fonts: on graph paper, or with your own editor? How did the glyphs get into the run-length format?
3. Which assembler did you use (MASM or Turbo Assembler)? Which books or manuals did you have? Where did you learn about the VGA Set/Reset and Bit Mask registers?
4. Why INT 10h function 36h? Did you check that no video BIOS used it?
5. Why are there two alef keys (`h` and `~`), with `~` never joining?
6. Why is lam-alef a separate key and not automatic? Was that a choice to match the typewriter or keyboard?
7. What changed from version 1 up to 4.15, and between 4.15 and 7.15? What were the earlier versions like?
8. Was the big 50-pixel font made only for the word "الشمس" on the *Brave Sun* title screen?
9. For the 1991 Port Said Computer Center commercial, how did you turn the Arabic text into pixel data? Did you capture it from the screen of an early ARABART?
10. Why did you scramble the copyright in the commercial? Had someone copied your work before?
11. Who else used ARABART: customers, the computer center, other programmers? Was it sold?
12. Why did you compress your programs with DIET, and how did you find it?
13. Which PCs and screens did you test on (EGA, VGA, a 286 or 386)?
14. Is the bit-reversal table at 0672 a design choice or a fix you found by testing?

---

Unrelated, one line each: `public/images/arabart-editor.png` is byte-identical to `arabart-demo.png`. The `arabart-commercial` bundle loads ARABART although DEMO.COM never calls it, which costs 30 KB and a 1.6 s banner.
