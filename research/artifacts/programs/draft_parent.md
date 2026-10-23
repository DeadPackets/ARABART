### KVC: KEMYAM Virus Capture 1.05 (KVC/KVC.EXE, 1993)

**Glance:** a C program that walks the disk, with Assembly that knows the Koko virus byte by byte, finds it in RAM, files and memory, and removes it cleanly.

**Story.** Koko was a local Egyptian virus that no commercial scanner knew. Yasser and Ebrahim El-Etr took the virus apart by hand. KVC does not search for a generic pattern. It knows exact offsets inside the virus body (+22h, +127h, +5F0h, +6DAh), and it uses the virus's own tricks against it. When Koko is in memory, KVC asks the virus "are you there?" with the virus's own secret call. Then KVC takes the original DOS address that the virus stored for itself and puts it back. The virus stays in RAM but it is cut off from DOS. The help screens say: *"It is a funny virus, all its tricks are untricky."*

**Technical findings**
- **Toolchain:** Borland C++ (RTL string "Borland C++ - Copyright 1991 Borland Intl.", image 0x37C4), **compact model**. Near calls, but c0 pushes far `argv`/`envp` to `main` (5 words, 0000:00E8–00FC) and keeps its own stack segment (SS:SP 0406:0100). `main` = 0000:0525.
- **C vs Assembly:** C module 0000:0210–07E5 (about 1.5 KB: option parsing, recursive directory walk, counters, `printf`). Assembly module 0000:07E6–1294 (about 2.7 KB: RAM check, COM and EXE checkers, message printer, help pages). The Assembly keeps its variables and `$`-strings in the code segment and uses `CS:` overrides. Small C helpers use inline `asm` for DOS calls. One helper does findfirst *and* findnext: `AH = 4Eh + first_flag` (0000:0216).
- **Libraries:** Borland RTL only: `sprintf`, `printf`, `strcmp`, `chsize`. No graphics, and no ARABART call (no INT 10h at all).
- **Interrupts:** INT 21h (3Dh/3Fh/40h/42h/43h/4Eh/4Fh/57h/1Ah/09h/07h/02h), INT 21h AX=FF0Ch (the virus's install check), INT 3 used as a DOS call (see below), and PC-speaker ports 42h/43h/61h for a 20-beep siren.
- **RAM detection and "freeze"** (0000:07E6–0876): `INT 21h AX=FF0Ch` must return `AX=C0C1h` when Koko is resident. KVC then sounds the siren. It calls `AX=3503h` and `AX=2521h` through `INT 3`, not `INT 21h`, so it reads the INT 3 vector and writes it into the INT 21h vector. This only works if Koko keeps the original DOS entry in the INT 3 vector (strong inference). KVC then repeats the check. If the virus no longer answers, it prints `##### Virus Freezed #####`. Otherwise it prints "Virus can not be safly removed from your RAM … reboot from a clean system disk".
- **COM detection** (0000:0CF7): read 1Ah bytes. Bytes 5–25 must equal Koko's entry stub and signature: `50 B8 00 01 50 33 C0 CB 08 00 "KoKo (1)\n\r$"` (DS:059F). Bytes 3–4 give the virus offset in paragraphs. A second check at body+127h must be `BF 00 01 BE 22 01` (`mov di,100h / mov si,122h`, the virus's own restore code). Mismatch prints "Strange signeture, --> Please contact KEMYAM Computer Group."
- **EXE detection** (0000:0F95): the infection marker is **initial SP = C0C1h** (header bytes 10h–11h), the same number as the RAM reply. The entry point is computed from the header (`(hdr + CS)·16 + IP`) and must start `EB 60 90 EA`. Body checks at entry+5F0h (20 bytes, DS:05C1) and entry+6DAh (the COM stub again).
- **Cleaning:** COM: write back the 26 original bytes that Koko saved at body+22h, restore date/time (AX=5700h/5701h), then the C side calls `chsize()` to cut the file to the original size stored at body+18h. EXE: restore CS, IP, SS and SP from the virus's saved copy (entry+4Dh..54h), recompute the page count, and truncate at entry−100h. Before writing, helper 0000:07A0 clears the read-only bit (AX=4301h).
- **Verified end to end:** I built synthetic Koko-marked COM and EXE files from KVC's own checks (not the real virus, which we do not have) and ran the unpacked KVC in an emulator with a virtual disk. Result: 3 files scanned, 2 found, 2 removed. The COM came back byte-exact. The EXE came back with its original header fields and size (`kvc_e2e.py`).
- **Bugs and fragility:**
  - The EXE path does not restore the file date/time, but the COM path does (seen in the E2E trace).
  - The read-only attribute is cleared and never restored.
  - Recursion only enters directories whose attribute byte is exactly 10h (0000:04A0), so a directory with the archive or read-only bit set is skipped.
  - The EXE page count is one page too high when the new size is an exact multiple of 512.
  - The siren uses a busy loop (`mov cx,0FF00h / loop $`), so its length depends on CPU speed.
  - The DGROUP string "a:format.com" (DS:0504) is never referenced: probably a test leftover (speculation).

### FORM_X: the formula solver (FORM_X/FORM_X.EXE, 1992)

**Glance:** about 3.9 KB of hand-written Assembly that reads a formula, checks it while you type, and prints a 10-row table of results in 20-digit decimal arithmetic. It protects its author credit with self-modifying code and a checksum.

**Story.** This was a paid challenge: do decimal maths with no maths co-processor. Yasser wrote a whole small calculator. It has a parser that blocks wrong keys, an evaluator that rewrites the formula step by step, and +, −, × and ÷ on long decimal numbers stored one digit per byte. Because someone paid for it, he also hid his name inside the code. The name is stored encoded and decoded only at run time. A checksum makes the program's exit fail if someone changes the protection code.

**Technical findings**
- **Toolchain:** pure Assembly, no compiler run-time library. Data segment at image 0000, code segment 016A (CS:IP 016A:0000), no stack segment (SS:SP 0000:0000). The entry is the classic textbook EXE skeleton: `push ds / mov ax,0 / push ax / mov ax,DATA / mov ds,ax`. The file ends with a dead `RETF` (016A:0F3F), left from a `PROC FAR` template. Forward jumps assemble as `JMP SHORT` + `NOP` (for example 00C2–00D3), which is typical of a one-pass MASM/TASM build.
- **Number format:** each value is 20 bytes of *unpacked* BCD, one digit 0–9 per byte. It is **fixed point, not floating point:** 14 integer digits and 6 fraction digits (the formatter at 02BC right-aligns the integer part at digit 13). Typed numbers are limited to 7 integer digits ("Too big number"). Negative values use **ten's complement**: 9 − digit, then +1 (016A:049D). A first digit > 4 means negative.
- **Arithmetic:** add = digit-wise add, then carry normalisation (016A:04E2) with one `DIV 10` per digit. Multiply = schoolbook, 20×20 digits into a 40-digit accumulator, then a 6-digit shift. Divide = repeated subtraction (adding the complement). The quotient digit counts up to 250 (FAh) before a carry pass, which saves normalisations. There is overflow detection on sign changes. The program does **not** use the x86 BCD instructions (AAA/AAM/DAA: 0 occurrences).
- **Parser:** while you type, byte DS:0282 holds a bitmask of what may come next (excerpt E2). Wrong keys are ignored. Example: after `(`, only `(`, a digit, `x` or a unary `−` is allowed. A second decimal point is blocked. On Enter, parentheses are counted. The evaluator recurses into the innermost `( )` (016A:0A58), then makes 2 passes over a flat buffer (`*` and `/` first, then `+` and `−`) and writes each result back into the text.
- **Protection (verified):** 3 run-once blocks overwrite their own first byte with `RET` (C3h) after the first call (016A:036E, 0A6F, 0B73).
  - Block 1 patches 5 bytes of the hidden credit.
  - Block 2 delta-decodes 53 bytes at 0B21: each byte minus the previous original byte, with an extra borrow. The result is the text "Yasser Dot Design.. <c>1992 YASSER MOHAMED ALI."
  - Block 3 sums 52 bytes of block 1's code, adds A517h, and adds that to a `JMP` displacement at 0F13 that is stored as 0000.
  - With the original code, the final `JMP` goes to 0C5B, which writes the decoded credit straight into video RAM and exits. With one changed byte, it goes to 0D5C and the program no longer exits correctly (`verify_all.py`).
- **Verified results:** `(x-3)*(x+2)/7` at x = −1.5 gives −0.321428. `1/x` at 6 gives 0.166666 (truncated, not rounded). `x/0` gives `* OVERFLOW *`. The output matches the museum screenshot layout.
- **Fragility:** the opening "scroll curtain" uses `mov cx,3000h / loop $` (CPU-speed dependent). The text UI uses video page 1 (INT 10h AH=05h). Error-message spellings ("praces", "accurecy", "intial") show there was no spell checker.

### SCREEN: the governorate screensaver (SCREEN/SCREEN.COM, 1991)

**Glance:** 156 bytes of code that play a 3.3 KB drawing script. This is a tiny "vector font player", 1,672 bytes on disk.

**Story.** For the Port Said Governorate IT department, Yasser did not ship a big picture file. He wrote a tiny interpreter. The Arabic lettering is stored as a list of short vertical strokes, and the program draws them one by one with a coloured shadow. It then redraws the last line again and again in changing colours until someone presses a key. The rendered output says "Port Said Governorate / Information and Documentation Center / Computer Department" (Arabic: محافظة بورسعيد / مركز المعلومات و التوثيق / إدارة الحاسب الآلى).

**Technical findings**
- Pure Assembly .COM, EGA mode 10h (640×350×16). It plots pixels through BIOS INT 10h AH=0Ch. There is no direct video-memory access and no ARABART call.
- **Script format** (interpreter at 0100–019B):
  - A segment header is 5 bytes. They are written *into the interpreter's own instructions*: the opcodes for the `x` and `w` commands (`dec bx`/`inc bx`), a jump displacement that switches the drop shadow on or off, the main colour, and the shadow colour. Then a word X origin and a word Y origin.
  - Command bytes below 70h are `(offset, length)`: draw a vertical run. `x`/`w` move one column. `y` starts a new segment. `{` ends a frame.
- **Animation:** at `{`, it checks the keyboard (INT 21h AH=0Bh). If no key, it increments the colour byte inside the code (cycling 2–15) and redraws from script offset 0A9B.
- Exit: text mode 3, then the **plain-text** credit "K E M Y A M Software Corp., <C>1991 YASSER MOHAMED ALI.".
- Verified: my emulated render matches the museum screenshot (`render/screen.png`).
- Note: this is not a TSR screensaver. It has no timer hook. It runs until a key is pressed.

### TAHER and ARABIC/DEMO: the same player, refined (TAHER/TAHER.COM, ARABIC/DEMO.COM, 1991)

**Glance:** the first 241 bytes of the two files are identical: one engine, two scripts. One is a calligraphy splash for a physician; the other is a 15-slide shop advertisement.

**Story.** After SCREEN, Yasser improved the player and reused it. TAHER shows the physician's name, "Taher Ibrahim El-Sorafy" (Arabic: طاهر ابراهيم الصرفي), in calligraphy with a grey shadow. DEMO.COM is an animated advertisement for "Port Said Center for Computer Services" (Arabic: مركز بورسعيد لخدمات الكمبيوتر). It offers a membership card for one pound with a 10% discount on computers, supplies, colour printing, training courses, an "information bank" for the latest software, and computer rental. The last slide says "Programming: Yasser Mohamed Ali" (Arabic: برمجة ياسر محمد علي).

**Technical findings**
- The same run-length interpreter as SCREEN, with these changes:
  - `x`/`w` swap direction.
  - New opcode `88h` = pause (4,096 INT 21h AH=0Bh polls), reset mode 10h (clears the screen), next slide.
  - New opcode `z` = end.
- **Hidden credit:** at start-up, 65 bytes at 01AB are decoded by subtracting a rising key (4, 5, 6, …). They give "K E M Y A M Software Corp., <c>1991 YASSER MOHAMED ALI.", which is printed at exit. SCREEN (a gift) keeps the credit in plain text. TAHER and DEMO (paid/commercial) hide it.
- Sizes: TAHER script 2,110 bytes. DEMO script 25,663 bytes compressed by DIET to 4,864 (19%).
- No ARABART call. The letter shapes are pre-drawn runs. They look like a typeset Arabic font, so they may have been captured from ARABART output (speculation: no capture tool survives).
- Verified: renders match the museum screenshots (`render/taher.png`, `render/arabicdemo_sheet.png`).
- Fragility: pause length depends on CPU speed. There is no keyboard exit until the script ends.

### PESM: the Basmallah demo (PESM/PESM.EXE, 1991)

**Glance:** about 6 KB of Assembly that includes its own copy of the ARABART text engine. It does not need the TSR.

**Story.** PESM prints "In the name of God, the Most Gracious, the Most Merciful" (Arabic: بسم الله الرحمن الرحيم) 16 times, in 2 columns, in different colours and styles: normal, bold, underlined, italic and double size. It is a sampler of what the engine can do.

**Technical findings**
- Pure Assembly, VGA mode 12h (640×480×16). It writes pixels through the VGA Graphics Controller (port 3CEh: Set/Reset = colour, Bit Mask per pixel) using read-then-write latch tricks.
- **No INT 10h AH=36h call.** It calls a local routine (0000:0284) with the ARABART register convention: `AH=36h`, AL=colour, CX=x, BX=y, DS:DX=text. It shares 3,298 bytes (glyph tables and the 136-byte shaping routine) with ARABART 4.15. So the engine was reused as a source module.
- **Text is stored as Arabic-keyboard key letters:** `fsl hggi hgvplk hgvpdl` is بسم الله الرحمن الرحيم typed on an Arabic keyboard layout. A table at CS:09FB, indexed by character − 20h, maps keys to glyph codes.
- The shaping pass sets "joins next" (bit 80h) and "joins previous" (bit 40h) from the neighbours, and skips diacritic codes C8h–CBh and D0h.
- Inline style codes: C8h bold, C9h italic, CAh underline, CBh double height, D0h reset, CFh n = font n.
- Verified: my planar-VGA emulation with **no ARABART loaded** reproduces the museum screenshot (`render/pesm.png`).
- Fragility: it exits in graphics mode, so the DOS prompt appears over the drawing (visible in the museum screenshot). It has a dead `RET` after `INT 21h/4Ch` (0000:00FB). No stack segment.

### ARABART clients: DEMO.EXE and EDITOR.EXE (ARABART folder)

**Glance:** Borland C++ programs that use BGI graphics and call the ARABART TSR through thin inline-Assembly wrappers.

- Far-code model with **80186+ instructions** (`ENTER`/`LEAVE`, for example DEMO 20AB) and **stack-overflow checks** in its functions (`cmp [2E6h],sp`). They will not run on an 8088 PC/XT.
- Each wrapper saves registers, loads `AX=36xxh` and parameters, and runs `INT 10h` (DEMO 207D–215A). DEMO uses AL=01h, 03h, 04h, 05h and 07h.
- One wrapper counts `$` characters in a string and doubles the line height for each one (DEMO 20D6), so `$` looks like an inline "double size" code (inference).
- **EDITOR checks for the TSR** (AX=3600h → expects 5944h "YD", EDITOR 1D49) and, if it is missing, calls a clean-up routine and returns 0. **DEMO does not check:** without the TSR, its INT 10h AH=36h calls go to the BIOS and do nothing (inference).
