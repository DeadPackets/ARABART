# Yasser Awad's DOS programs (1991–1993): technical analysis

This covers 15 programs by Yasser Mohamed Ali Awad, Port Said, Egypt, written between 1991 and 1993. The 16th, ARABART (the Arabic text library), has its own analysis in [arabart.md](arabart.md). This file looks at ARABART only where a program uses it.

## TL;DR

- **He shipped in 2 languages and moved from one to the other.**
  - 1991–1992: pure Assembly. The small programs are a 156-byte drawing interpreter, a 20-digit decimal calculator that protects itself, and demos that carry their own copy of his Arabic engine.
  - 1993: Borland C/C++ for structure (classes, menus, file handling), with small inline-Assembly blocks for hardware and DOS.
  - All 17 binaries are compressed with the DIET 1.00 packer: about 704 KB of program shrinks to 296 KB.
- **The best work is low-level and original.**
  - **KVC** finds the Koko virus in RAM with the virus's own "are you there?" call. It then uses the original DOS address that Koko hides in the INT 3 vector to cut the virus off.
  - **Digi-Test** simulates circuits with the textbook five-valued fault logic (D-algorithm style). It drives a lost test board on ISA ports 300h/301h.
  - **FORM_X** checks the formula while you type, and its exit depends on a checksum of its own code.
- **The weak spots are typical of the era but real.**
  - Timing loops depend on CPU speed.
  - Allocations and file errors are often not checked.
  - Bugs verified by running the programs: the text editor corrupts memory on Delete in long lines; Digi-Test can corrupt its own saves through text-mode writes; the Brave Sun's Earth year is typed as 356 days.

## For everyone

- **What he built:** a circuit tester, an antivirus, a calculator, 2 text editors, an award-winning program that teaches about the sun, a window/button library, 6 splash screens and adverts, and the ARABART Arabic library with 2 demos. That is 16 programs in 3 years.
- **How he wrote Arabic in 1991:** he wrote the Arabic as the English keys of an Arabic keyboard. For example, `fsl hggi` means "بسم الله" ("In the name of God"). His own engine then draws the joined Arabic letters.
- **No internet, so he worked out his own methods.** He invented compact picture formats, his own pixel tricks, and his own way to protect his name inside the code. The code shows textbook and Borland-manual patterns, which suggests he learned from books and manuals (inference).
- **He thought about size.** Every program is compressed. One screensaver is 1,672 bytes on disk.
- **He signed his work.** The names "KEMYAM Software Corp." (1991), "KEMYAM Computer Group" (1993) and "Yasser Dot Design" appear in the programs. In paid work he hid his name in encoded form so that nobody could remove it easily.
- **Everything here was checked by running it.** We unpacked every program and ran most of them in an emulator. The emulated screens match the museum screenshots.

---

## Per-program analysis

### How we know (method)

1. **Unpacking:** all 17 binaries use the **DIET 1.00** packer by Teddy Matsumoto, identified with the Detect It Easy signature rules. I ran each unpacker stub in an emulator (Unicorn) until it jumped to the original program. I then dumped the image and found the relocations by loading at 2 addresses and comparing.
2. **Static analysis:** disassembly with Capstone; strings; an interrupt census; compiler start-up code to find `main()`.
3. **Dynamic checks:** a small DOS/BIOS emulator (text mode, EGA/VGA planar memory, files, keyboard). Rendered screens match the museum screenshots for SCREEN, TAHER, ARABIC/DEMO, PESM, FORM_X, NAMES, PORTSAID, WINKEY, SUN and EDITOR.
4. **One repeatable artifact:** `verify_all.py`, which re-unpacks all 17 binaries and re-runs 15 behaviour checks. It is in the scratchpad folder listed at the end.

### At a glance

| Program | Year (evidence) | Toolchain | Memory model / build | Assembly vs C | Video | Needs ARABART? |
|---|---|---|---|---|---|---|
| Digi-Test `MAIN.EXE` | 1993 (strings) | Borland C++ (1991 RTL) | large; 80186+ code; stack checks | C++ with 10+ classes; inline asm < 200 B | VGA 640×480, BGI | **No** |
| KVC `KVC.EXE` | 1993 | Borland C++ | compact | C 1.5 KB + Asm module 2.7 KB | DOS text | **No** |
| FORM_X `FORM_X.EXE` | 1992 | MASM/TASM, no runtime library | separate data/code segments, no stack segment | 100% Asm (3.9 KB code) | text mode, page 1 | **No** |
| The Brave Sun `SUN.EXE` | Sept 1993 (title card) | Borland C++ | large; 80186+; stack checks; 8087 emulator | C (33.6 KB) + inline-asm ARABART wrappers | VGA 640×480, BGI | **Yes** |
| `EDIT.EXE` | 1993 | Borland C++ | large; 80286 code; stack checks | C++ classes, built on the Digi-Test code | VGA, BGI | **No** |
| `EDITOR.EXE` | 7–9 Oct 1993 (project file) | Borland C++ 2.0 | large; 80286 code; stack checks | C++ (procedural); 1 inline `int 21h` | VGA, BGI, Windows 3 colours | **No** |
| `WINKEY.EXE` + `MENU2.DAT` | 1992 (README) | Turbo C++ 1.0 | small | C `main` + C functions with inline-asm bodies | EGA 640×350, direct registers | **No** |
| `PORTSAID.EXE` | 1993 | Turbo C++ 1.0 | tiny model, shipped as EXE | C + inline asm (2.3 KB) + 25 KB bitmaps | EGA 640×350, direct | **No** |
| `NAMES.COM` | 1993 | Assembly | COM | 100% Asm (1.1 KB) + 58 KB bitmaps | EGA 320×200, direct | **No** |
| `SCREEN.COM` | 1991 | Assembly | COM | 100% Asm (156 B) + 3.3 KB script | EGA 640×350, BIOS pixels | **No** |
| `TAHER.COM` | 1991 | Assembly | COM | 100% Asm (same engine as DEMO.COM) | EGA, BIOS pixels | **No** |
| `ARABIC/DEMO.COM` | 1991 | Assembly | COM | 100% Asm | EGA, BIOS pixels | **No** |
| `PESM.EXE` | 1991 (README) | Assembly | EXE, no stack segment | 100% Asm with its own copy of the ARABART engine | VGA 640×480, direct | **No** |
| ARABART `DEMO.EXE`, `EDITOR.EXE` | README 1991; RTL 1991 | Borland C++ | large; 80186+; stack checks | C + inline-asm wrappers | BGI | **Yes** |

**Corrections for `src/data/programs.ts` and the READMEs (all verified):**
- `needsArabart: true` is needed only by **SUN.EXE** and the 2 ARABART programs. The other 12 programs make no INT 10h AH=36h call.
- `RUN.BAT` loads ARABART 4.15 first. SUN's own **ARAB-ART 7.15** then sees the same 12-byte signature (`EB 0A 90 "DALYASSER"`), prints its banner and exits without installing. **So SUN runs on 4.15's fonts, not its own.** Measured 2026-10-22: 1 full stop differs on 1 of 17 screens. The museum bundle now loads 7.15 before SUN.
- **Language fields that the binaries contradict:**
  - NAMES is pure Assembly, not "C, Assembly".
  - WINKEY is Turbo C++ with inline-asm bodies, not pure Assembly.
  - EDIT and EDITOR are C++ (`.CPP` sources, classes), not C.
- **EDIT.EXE and EDITOR.EXE are 2 different editors,** not one editor with 2 GUIs. None of EDIT's 124 functions matches any of EDITOR's 30. EDIT is built on the Digi-Test code base.
- **FORM_X is fixed point, not floating point:** 14 integer digits and 6 decimals.
- **The ARABIC/DEMO advertisement** is for "Port Said Center for Computer Services" (مركز بورسعيد لخدمات الكمبيوتر), a services centre with membership cards, not a hardware store.
- **`DIGI_T/HEADDER.PRN` and `FOOTTER.PRN` are not Digi-Test files.** They are Epson printer bitmaps of the Arabic letterhead of Dr. Taher Ibrahim El-Sarafy's medical lab, so they belong to the TAHER job. They contain a street address and a phone number: do not publish those.
- **Personal data:** KVC's help screens list group members' phone numbers, and SUN's exit card has a P.O. box and a phone number. Leave those out of any page you build from them.

---

### 1. Digi-Test: graduation project (DIGI_T/MAIN.EXE, 1993)

**Glance:** about 131 KB of his own C++ (75% of the code) that draws logic circuits, simulates them with fault-aware logic, prints truth tables, and drove a custom test board.

**Story.** This was the KEMYAM group's graduation project. You place real TTL chips (7400–7440) on a grid, wire them with the arrow keys, and the program works out how the circuit behaves. With the group's hardware board, it applied test patterns to a real circuit and helped find the faulty chip with a "guided probe". The board is lost, but the code that talked to it survives. It shows the board as a plug-in card at I/O ports 300h/301h. The README's "KEMYAM" defence circuit is `FIL0.CIR`: a 7404, 7408, 7411 and 7432 with 8 inputs and 38 wires.

**Technical findings**
- **Toolchain:** Borland C++ (RTL string from 1991), large model. `main()` is at 0E9D:000F, called far with far `argv`/`envp`. It uses 80186+ instructions (`ENTER`, `PUSH imm`), so it needs a 286-class PC. Stack checking is on in about 540 functions. The code is not optimised (`JMP` to the next instruction, reloading the same local) (strong inference).
- **Real C++:** vtables for Gate, Wire, Node, Prime I/O, ScreenImage, IC, Technology, Group and others; "Pure virtual function called"; Borland 2.0/3.0-style constructors (`if (this==0) this = operator new(...)`). He also compiled Borland's container class library (ABSTARRY.CPP, `Array`, `SortedArray`) inside his project. Its segments sit between his own modules (strong inference).
- **Code split** (175,424 B of code): his own code 74.8%, Borland RTL 10.1%, BGI graphics 8.8%, class library 5.1%, an `SPARR.CPP` module 1.1%.
- **Assembly:** only inline blocks, under 200 bytes in all: board I/O, a 2-tone speaker siren, raw DOS file writes, and printer output with INT 21h AH=05h. The inline assembler encodes register moves as `31/89/88` while the compiler uses `33/8B/8A`, which makes the blocks easy to find.
- **Graphics:** `EGAVGA.BGI` and the `.CHR` fonts load from disk at run time. Only TRIP.CHR is used with a constant argument. The screen is VGA 640×480×16 (strong inference from the frame coordinates). There is no mouse; the keyboard is read with `bioskey`.
- **The test board** (2529:0B10): reverse the 8 stimulus bits, `OUT 301h`, `OUT 300h`, then read port 300h 2,000 times and keep the last value as the circuit's answer. The guided probe reads bit 3 of port 300h. Ports 300h–31Fh are the IBM "prototype card" range, so this was an ISA card, not a printer-port device (strong inference).
- **Simulation:** 5-valued logic, coded 1 = 0, 2 = 1, 15 = X (unknown), 6 = D and 9 = D̄ (fault effects; corrected 2026-10-22: the tester sends a 1 to the card for code 6, at 2529:00C7), as in Roth's D-algorithm.
  - A gate is only 2 numbers: its *controlling value* and an *inversion flag*. AND = (0, no), NAND = (0, yes), OR = (1, no), NOR = (1, yes).
  - The evaluator counts inputs by kind and decides the output from the counts (excerpt E5).
  - A recursive routine resets values to X as it backs out, which is backtracking test generation (strong inference).
  - The menus build a fault dictionary ("make a dectionary"), list "UNDETECTABLE" faults, and run "DETECT FAULT" through the board.
- **Truth tables:** the program tries all 2ⁿ input rows with an odometer-style counter and prints them to `PRN`.
- **Data files** (decoder `digit/decode_formats.py` parses all 70 files exactly; 170/170 wire paths re-trace to their start points):
  - Every file is framed the same way: `"Copyright 1993 by KEMYAM (c) For <X> Save"`, a Ctrl-Z (so DOS `TYPE` stops at the copyright), the data, and a 4-byte trailer equal to the file size, checked on load.
  - `GROUP.<ext>` files are catalogues of `FILn.<ext>` members. `BFLn.<ext>` is the previous version, kept as a one-level backup on save.
  - `.GAT` holds the inputs/outputs, controlling value and inversion.
  - `.IC` holds per-pin gate number and pin type (input 20h, output 40h, GND 10h, VCC 02h), the gate type and the logic family.
  - `.TCK` means **"Tecknologies"** (logic families TTL and TTL open-collector), not a clock.
  - `.CIR` holds the objects (IC, node, prime I/O) and the wires. Each wire is stored as **numeric-keypad direction digits**, the same keys used to draw it (8 = up, 6 = right, …), plus "jump 7 cells" codes.
- **Bugs (verified):**
  - Files are written in DOS *text* mode, so any `0Ah` byte becomes `0D 0Ah`. A save whose size contains a `0Ah` byte (for example 266 bytes) would fail its own size check on reload. None of the 75 shipped files hits it.
  - The IC library has data errors. 7413/7420/7421/7440 share one copy-pasted pin map with pin 4 and pin 9 wrong. 7440 is typed AND but is a NAND. 7426 is not marked open-collector. 8 ICs name gate types (`Not`, `Buffer`, `And4_1`) that are not in the 9-gate library.
  - Unzeroed buffers write leftover RAM into the data files: fragments of Borland iostream names and "FDREAD  EXE" (where they came from is speculation).
  - `initgraph` is called first with driver 2 (MCGA) and an uninitialised mode, unchecked; then again with autodetect, checked. The board read keeps a junk high byte.

### 2. KVC: KEMYAM Virus Capture 1.05 (KVC/KVC.EXE, 1993)

**Glance:** a C program that walks the disk, plus an Assembly module that knows the Koko virus byte by byte and removes it from RAM and from files.

**Story.** Koko was a local virus that no commercial scanner detected. Yasser and Ebrahim El-Etr took it apart by hand. KVC does not search for a generic pattern. It knows exact offsets inside the virus body (+18h, +22h, +127h, +5F0h, +6DAh), and it uses the virus's own tricks against it. If Koko is in memory, KVC asks it the virus's secret question. It then takes the original DOS address that the virus stored for itself and puts it back, so the virus stays in RAM but is cut off from DOS. Its help screen quotes Yasser: *"It is a funny virus, all its tricks are untricky."*

**Technical findings**
- **Toolchain:** Borland C++ RTL, **compact model**: near code, but c0 pushes far `argv`/`envp` (0000:00E8–00FC) and keeps its own stack segment. `main` = 0000:0525.
- **C vs Assembly:**
  - C module 0000:0210–07E5 (about 1.5 KB): options `/NS` `/NC` `/H`, recursive directory walk, counters, `printf`. Small C helpers use inline `asm` for DOS calls. One helper does both findfirst and findnext by computing `AH = 4Eh + first_flag` (0000:0216).
  - Assembly module 0000:07E6–1294 (about 2.7 KB): it keeps its variables and `$`-strings in the code segment (`CS:` overrides).
- **No ARABART, no graphics:** there is no INT 10h at all.
- **RAM check and "freeze"** (0000:07E6, excerpt E1):
  - `INT 21h AX=FF0Ch` returns `AX=C0C1h` only when Koko is resident.
  - KVC then sounds a 20-beep siren through the PIT (ports 42h/43h/61h). It calls `AX=3503h` and `AX=2521h` *through `INT 3`*: it reads the INT 3 vector and writes it into the INT 21h vector.
  - This only makes sense if Koko parks the original DOS entry in INT 3 (strong inference). KVC re-checks; if the virus no longer answers, it prints `##### Virus Freezed #####`.
- **COM detection** (0000:0CF7):
  - Bytes 5–25 of the file must be Koko's stub plus its name: `push ax / mov ax,100h / push ax / xor ax,ax / retf / 08 00 / "KoKo (1)\n\r$"`. Bytes 3–4 give the body offset in paragraphs.
  - Body+127h must be `BF 00 01 BE 22 01` (`mov di,100h / mov si,122h`, Koko's own restore code). Otherwise it prints "Strange signeture, --> Please contact KEMYAM Computer Group."
- **EXE detection** (0000:0F95):
  - The marker is **initial SP = C0C1h**, the same number as the RAM reply.
  - The entry point `((header + CS)·16 + IP)` must start `EB 60 90 EA`.
  - Two more checks follow: at entry+5F0h (20 bytes) and entry+6DAh (the COM stub again).
- **Cleaning:**
  - COM: write back the 26 original bytes from body+22h, restore the date/time, then C calls `chsize()` to cut the file to the size stored at body+18h.
  - EXE: restore CS, IP, SS and SP from the virus's saved copy, recompute the page count, and cut the file at entry−100h.
  - The read-only bit is cleared first (helper 0000:07A0).
- **Verified end to end:** I built synthetic Koko-marked files from KVC's own checks (we do not have the real virus) and ran the unpacked KVC on a virtual disk. Result: 3 scanned, 2 found, 2 removed. The COM came back byte-exact; the EXE came back with its original header fields and size.
- **Bugs and fragility:**
  - The EXE path does not restore the file date/time, but the COM path does (seen in the trace).
  - The read-only attribute is never restored.
  - Recursion skips directories whose attribute byte is not exactly 10h (0000:04A0).
  - The EXE page count is 1 too high when the new size is a multiple of 512.
  - The siren uses a CPU-speed busy loop.
  - The string "a:format.com" in the data segment (DS:0504) is never used. It is probably a test leftover (speculation).

### 3. FORM_X: the formula solver (FORM_X/FORM_X.EXE, 1992)

**Glance:** 3.9 KB of hand-written Assembly. It reads a formula, blocks wrong keys while you type, prints a 10-row table in 20-digit decimal arithmetic, and protects its credit with self-modifying code and a checksum.

**Story.** This was a paid challenge: decimal maths without a maths co-processor. He wrote a complete small calculator: a parser that refuses wrong keys, an evaluator that rewrites the formula step by step, and +, −, × and ÷ on long decimal numbers stored one digit per byte. Because it was paid work, he also hid his name in the code. It is stored encoded and decoded only at run time. A checksum makes the exit fail if someone changes the protection.

**Technical findings**
- **Toolchain:** pure Assembly, no runtime library. Data segment at 0000; code segment 016A (CS:IP 016A:0000); no stack segment (SS:SP 0:0).
  - The entry is the classic textbook EXE skeleton `push ds / mov ax,0 / push ax / mov ax,DATA / mov ds,ax`.
  - The code ends with a dead `RETF` (016A:0F3F) left from a `PROC FAR` template.
  - Forward jumps assemble as `JMP SHORT` + `NOP` (for example 00D1–00D3), typical of a one-pass MASM/TASM build.
- **Number format:** 20 bytes of unpacked BCD, one decimal digit per byte. It is **fixed point: 14 integer + 6 fraction digits** (016A:02BC). Typed numbers may have up to 7 integer digits. Negatives use **ten's complement** (`9 − digit`, then +1, at 016A:049D); a first digit above 4 means negative.
- **Arithmetic:**
  - Add: digit-wise, then a carry pass (016A:04E2) that uses one `DIV 10` per digit.
  - Multiply: schoolbook, 20×20 digits into a 40-digit accumulator.
  - Divide: repeated subtraction. The quotient digit may count to 250 (FAh) before a carry pass, which saves work.
  - Overflow is caught from sign changes.
  - It **does not use** the x86 BCD instructions (`AAA`/`AAM`/`DAA`: 0 uses).
- **Parser:** byte DS:0282 holds a bitmask of what may come next.
  - The start state and "after `(`" are both 2Eh: `(`, digit, `x` or unary `−`.
  - After a digit: `)`, digit, operator, `−` or `.`; a second `.` is blocked.
  - The formula may be up to 70 characters, and parentheses are counted on Enter.
  - The evaluator recurses into the innermost `( )`, then makes 2 passes over a flat buffer (`* /`, then `+ −`) and writes each result back into the text.
- **Protection (verified):** 3 run-once blocks overwrite their own first byte with `RET` (016A:036E, 0A6F, 0B73).
  - Block 1 patches 5 bytes of the hidden text.
  - Block 2 delta-decodes 53 bytes at 0B21 (excerpt E2) into "Yasser Dot Design.. <c>1992 YASSER MOHAMED ALI."
  - Block 3 sums 52 bytes of block 1's code and adds A517h to a `JMP` at 0F13 whose displacement is stored as 0. Intact, the jump goes to 0C5B, which writes the credit straight into video RAM and exits. **With one changed byte, it goes to 0D5C and the program no longer exits properly.**
- **Verified results:** `(x−3)·(x+2)/7` at x = −1.5 gives −0.321428; `1/6` gives 0.166666 (truncated, not rounded); `x/0` gives `* OVERFLOW *`. The layout matches the museum screenshot.
- **Fragility:** the "curtain" intro uses `mov cx,3000h / loop $` (CPU-speed dependent). The error texts show there was no spell checker ("praces", "accurecy", "intial").

### 4. The Brave Sun (SUN/SUN.EXE, September 1993)

**Glance:** about 33.6 KB of Borland C in 8 modules. It draws hand-coded vector pictures and animated orbits on VGA, with every word of Arabic text drawn by his ARABART driver.

**Story.** This was his 3rd-place entry in the PC Middle East Arabic educational software competition. The title card reads "الشمس الجريئة" ("The Brave Sun"), "an educational program for young Arabic speakers", "design and implementation: Eng. Yasser Mohamed Ali", "first release, September 1993".
- **Sun and nature:** the solar system with 4 orbiting planets, temperature, sunspots, gravity, distance (8 min 18 s of light), fusion, energy and size.
- **Cycle of life:** day and night, seasons, solstices, 8 Moon phases, the water cycle.
- **The sun in the Quran:** 15 verse references.

All the pictures are made of literal coordinates in hundreds of `line`/`lineto` calls.

**Technical findings**
- **Toolchain:** Borland C++ (1991 RTL), large model, 80186+ code (it will not run on an 8088/8086), stack checks on. It uses the Borland 8087 emulator (INT 34h–3Dh, about 10 KB) for `sin`/`cos`.
- **Code split** (86.8 KB image): RTL 11.7 KB, his code 33.6 KB, emulator 10 KB, BGI 15.5 KB, data 14 KB.
- **Graphics:**
  - BGI on VGA 640×480×16, with `EGAVGA.BGI` loaded from disk.
  - 129 calls to `setrgbpalette` (88 is the `setcolor` count; corrected 2026-10-22): colours are set to black to draw hidden, then revealed.
  - Planets are sprites made with `getimage`/`putimage`.
  - The graphics init is almost the Borland manual's `initgraph` example word for word (strong inference).
- **ARABART binding** (segment 04B6): inline-asm wrappers around INT 10h AH=36h for functions 0, 1, 3, 4, 5, 7 and 8, plus his own "shadow text" (grey copy offset by 6 px) and "outline text" (4 diagonal copies). If the driver does not answer `5944h`, SUN prints "ARABIC-ART is not active please run ARAB-ART.EXE first." and exits.
- **Arabic text** is stored as Arabic-keyboard Latin letters: `hgals` = الشمس ("the sun"). Digits are stored reversed for right-to-left printing (`3991` → 1993). `#` toggles underline and `$` marks double size. Decoded content: 291 lines (`gfxprogs/sun_strings_decoded.txt`).
- **Orbits** (06D2:0A35): each frame turns Mercury by π/80 and the other planets by π/80 × 88 ÷ their period. The periods are floats at DS:19C1–19CD: Venus 225, Mercury 88, **Earth 356**, Mars 687.
  - The real Earth year is 365.25 days, so 356 is probably a digit swap; Earth orbits about 2.5% too fast (strong inference).
  - π is computed as 22 ÷ 7 although `math.h` has `M_PI`.
- **Timing:** the animation loops are `while (!bioskey(1)) { draw; step; }` with no `delay()` and no retrace wait. Speed is pure CPU speed, which explains the DOSBox `cycles` commits for brave-sun in this repo (strong inference).
- **Fragility:**
  - It needs a 186+ CPU, VGA, ARABART, `EGAVGA.BGI` and `ARAB-ART.FNT` in the current directory.
  - Both exits use a raw `int 21h/4Ch`; the second leaves AL unset, so the DOS errorlevel is random.

### 5. The text editors (EDIT/EDIT.EXE and EDIT/EDITOR.EXE, 1993)

**Glance:** 2 separate editors for a job interview. EDITOR.EXE is new, Windows-3-styled, and written in about 3 evenings. EDIT.EXE re-uses the Digi-Test interface with a new text-editor class.

**Story.** The assignment asked for load, save, scrolling, an insert/overwrite toggle and cursor movement.
- **EDITOR.EXE ("TEST-EDITOR")** imitates Windows 3: a blue title bar, a "File" menu with an underlined F, a status bar showing "INS ON/OFF", and Windows colours made by redefining 5 VGA palette entries. Its project file says it was built from 3 sources (838 lines) between **Thursday 7 and Saturday 9 October 1993** (last build 20:47).
- **EDIT.EXE ("EDIT-TEST Ver 1.00")** is the Digi-Test interface re-used. 89 of its 124 functions (73% of instructions) are identical to Digi-Test functions. Leftover circuit menu texts and the 5 group members' names are still inside. Only one segment (6,688 bytes, measured 2026-10-22) is new: a `TextEditor` class.

**Technical findings**
- **EDITOR.PRJ / EDITOR.DSK** (Turbo C project and desktop files):
  - Sources: WINGRAPH.CPP (159 lines, 1,718 B code), EDITOR.CPP (119 lines, 393 B), FUNCTION.CPP (560 lines, 4,598 B). The code sizes land exactly on EDITOR.EXE's segment boundaries.
  - Paths: output `D:\SPEC\`; include path `D:\SPEC\;F:\BC2\INCLUDE;F:\BC2\WORK;F:\BC2\OUT;C:\SUN;`.
  - The Transfer menu includes TASM at `F:\BC2\BIN\TASM` and Turbo Debugger. The system headers are stamped 13 Feb 1991, which is **Borland C++ 2.0** (strong inference).
  - The `.DSK` has 3 editor windows open: `EDITOR.CPP`, `WINGRAPH.CPP` and a scratch `X.CPP`.
  - `C:\SUN` on the include path suggests The Brave Sun was built on the same machine.
  - About 130 option flags are present but not decoded.
- **Builds:** both editors are large model, 80286 code, stack checks on, BGI VGA; EGAVGA.BGI loads from disk. The 2 BGI copies are byte-identical, so they came from the same installation. There is no mouse; keys are read with `bioskey`.
- **EDITOR's text buffer:**
  - A table of **601 far pointers** (DS:0A72), each pointing to a 204-byte line made with `new`.
  - Insert = `memmove` a gap, pad with spaces past the end of the line ("virtual space"), store the character (excerpt in `editors/excerpts.txt`).
  - Enter shifts the pointer table. Scrolling jumps 5 lines or 10 columns.
  - The cursor is 3 rectangles drawn in XOR mode, so drawing it twice erases it.
  - Dialogs save the screen under them with `getimage` and restore it after.
- **EDIT's buffer:** an array of 500 line pointers of 255 bytes, tab = 8 spaces, inside a C++ object with a virtual method table.
- **Verified bugs (reproduced in emulation):**
  1. Load uses `while (!feof(f))`, so every load-and-save adds a line with byte FFh.
  2. **Delete** moves `strlen(line)+1` bytes starting at the cursor instead of `len − col` (excerpt E8). On a 150-character line, Delete at column 100 runs past the 204-byte block. In the test, the next line "HELLO" became "ELLO" (heap corruption).
  3. Alt-X exits with a raw `int 21h/4Ch`, so `exit()` never restores the divide-error vector.
- **Not verified, but likely:**
  - Backspace has the same length pattern as Delete.
  - `new`/`fopen` failures are not checked.

### 6. WINKEY: window and button library demo (WINKEY/WINKEY.EXE + MENU2.DAT, 1992)

**Glance:** a Turbo C++ program whose library functions are inline Assembly that writes the EGA hardware directly. It draws 8 three-dimensional icon buttons that "press" and "pop out".

**Story.** WINKEY was the start of his own windowing toolkit. The demo shows a panel with 8 buttons: a DOS logo, floppy disks, a drive and documents. Each one flashes pressed and raised 11 times. The icons come from `MENU2.DAT`. The demo reads no keys; it plays and exits.

**Technical findings**
- **Toolchain:** "Turbo C++ - Copyright 1990 Borland Intl.", small model, `main` at 0000:0A16 in compiled C. The 15 library routines are C functions whose bodies are inline Assembly; the file name `MENU2.DAT` sits inside one function's code. 6 of the 15 are never called (getimage, putimage, XOR highlight, checkerboard fill, rectangle, imagesize), so it was meant as a general library.
- **Video:** EGA mode 10h, written directly through the Graphics Controller (3CEh: set/reset, bit mask, read map) and the Sequencer map mask (3C4h). No BGI.
- **Pixel trick** (0000:02F4, excerpt E7): x ÷ 8 and x mod 8 come out of one 3-step `shr`/`rcl` loop that reverses the low 3 bits. A table `00 04 02 06 01 05 03 07` turns them back. **The same bytes appear in ARABART 4.15, ARAB-ART 7.15 and PESM, and in no other binary.**
- **MENU2.DAT** (3,005 bytes): an 8-entry offset table, then 42×26 run-length icons drawn right to left and bottom to top. `EFh` = next row up, `FCh` = new colour segment, `FDh`–`FFh` = end, otherwise (skip, length) pairs. This is the same row-run scheme and the same `EFh` "next row" code as ARABART's glyphs. `main` hard-codes the 8 offsets instead of reading the table.
- **Code style:** `main` is 8 near-identical copy-pasted blocks, not a loop. The delay is `for (i = 0; i <= 40000L; i++) { i--; i++; }` (CPU-speed dependent). A failed DOS allocation would make it read the file into segment 0 (the interrupt table) (inference).

### 7. Port Said Computer Systems boot screen (PORTSAID/PORTSAID.EXE, 1993)

**Glance:** a tiny-model Turbo C program, mostly inline Assembly, that flies logo tiles in with floating-point motion and then reveals pre-drawn Arabic and English banners.

**Story.** Every PC sold by PCS showed this at start-up: "بورسعيد للحاسبات" ("Port Said Computers") and "PORT-SAID COMPUTER SYSTEMS". He received his first mouse for it.

**Technical findings**
- **Why an EXE with entry 0000:0100:** it is a Turbo C++ 1.0 *tiny-model* program, which would normally become a `.COM`. All 10 relocations are inside Borland's 8087 emulator, and segment relocations prevent a `.COM` link, so it shipped as an EXE (relocations verified; motive strong inference).
- **Size:** about 2.3 KB of his code and 25 KB of 6 run-length bitmaps stored inside the code segment, addressed through `CS`.
- **Floating point** is used only for straight-line fly-ins, which pulls in about 10 KB of emulator. The fly-ins call `delay(0)`, so their speed is pure CPU speed.
- **Shared with NAMES.COM:** 153 identical bytes (the run-length loop, the plane blit, the retrace wait, the key wait and the "YASSER DOT DESIGN" sign-off), rewritten here as C functions with inline asm.
- **Bugs and fragility:**
  - The DOS allocation wrapper returns 0 on failure, and none of its 3 callers check it. On low memory the decoder would write over the interrupt table.
  - The key wait uses INT 16h AH=11h, which needs an AT-class BIOS.

### 8. KEMYAM group splash (NAMES/NAMES.COM, 1993)

**Glance:** about 1.1 KB of hand-written Assembly that plays 10 compressed EGA pictures with wipe effects and introduces the 5 group members.

**Story.** For the graduation defence, the splash shows the KEMYAM logo, "Computer Group", and one card per member: Yasser Mohamed Ali, Mohamed Asaad Fouda, Khalid Zakaria Moustafa, Hatem Mohamed Moustafa, Ebrahem El-Syed El-Etr. Ebrahem El-Etr is very probably the KVC co-author, since KVC credits "Ebrahim El-Etr" (strong inference). It ends with "YASSER DOT DESIGN. <c>1993 YASSER MOHAMED ALI" in text mode, sparkling one character at a time.

**Technical findings**
- **Pure Assembly** (README says "C, Assembly"): no C start-up or runtime. It sets its own stack (`mov ss,cs / mov sp,0500h`) inside a 1 KB zero block.
- **Video:** EGA 320×200×16, written plane by plane through the Sequencer map mask. Images are 4 separate bitplanes, each run-length coded: byte `37h, count, value`; `37h 00` = end (excerpt E6). The busy pictures hardly compress (ratio about 1.0); DIET does the real work (59,402 → 13,090 bytes).
- **Timing:** mostly vertical-retrace waits (port 3DAh, CPU independent), the best timing in the collection. Two effects still use busy loops.
- **Fragility:** the decode buffer is placed after the program from a hard-coded size, with no DOS allocation or check. INT 16h AH=11h needs an AT BIOS.

### 9. SCREEN: the governorate screensaver (SCREEN/SCREEN.COM, 1991)

**Glance:** 156 bytes of code that play a 3.3 KB drawing script: a tiny "vector font player", 1,672 bytes on disk.

**Story.** For the Port Said Governorate IT department, he did not ship a picture file. He wrote a tiny interpreter. The Arabic lettering is a list of short vertical strokes drawn one by one, each with a coloured shadow. The last line is then redrawn in changing colours until someone presses a key. It reads "محافظة بورسعيد / مركز المعلومات و التوثيق / إدارة الحاسب الآلى" ("Port Said Governorate / Information and Documentation Center / Computer Department").

**Technical findings**
- Pure Assembly `.COM`, EGA mode 10h, pixels through BIOS INT 10h AH=0Ch. No ARABART.
- **Script format** (interpreter 0100–019B, excerpt E3):
  - Each segment starts with 5 header bytes that are **written into the interpreter's own instructions**: the opcodes for the `x`/`w` step commands, a jump displacement that switches the shadow on or off, and 2 colours. Then come an X and a Y origin.
  - Bytes below 70h are `(offset, length)` vertical runs. `x`/`w` move one column. `y` starts a new segment. `{` ends a frame.
- **Animation:** at `{` it polls the keyboard (INT 21h AH=0Bh). If no key, it increments the colour byte *inside the code* (2–15) and redraws from 0A9B.
- Exit: text mode, then the **plain-text** credit "K E M Y A M Software Corp., <C>1991 YASSER MOHAMED ALI."
- It is not a resident screensaver: there is no timer hook. It runs until a key is pressed.

### 10. TAHER and ARABIC/DEMO: one engine, two clients (TAHER/TAHER.COM, ARABIC/DEMO.COM, 1991)

**Glance:** the first 241 bytes of the 2 files are identical: the improved SCREEN player. One is a calligraphy splash for a physician; the other is a 15-slide shop advertisement.

**Story.** TAHER draws the name of the lab physician who hired him, "Taher Ibrahim El-Sarafy" (طاهر ابراهيم الصرفي), in red calligraphy with a grey shadow.

DEMO.COM advertises "Port Said Center for Computer Services" (مركز بورسعيد لخدمات الكمبيوتر). It offers a 1-pound membership card with a 10% discount on computers, supplies, colour printing, training courses in all languages, an "information bank" for the latest software, and computer rental. Its last slide reads "برمجة ياسر محمد علي" ("Programmed by Yasser Mohamed Ali").

**Technical findings**
- **Changes from SCREEN's interpreter:** `x`/`w` swap direction; new opcode `88h` = pause (4,096 DOS key-status polls), clear the screen by resetting mode 10h, next slide; `z` = end.
- **Hidden credit:** at start-up, 65 bytes at 01AB are decoded by subtracting a rising key (4, 5, 6, …). The result, "K E M Y A M Software Corp., <c>1991 YASSER MOHAMED ALI.", is printed at exit.
- **Gift vs paid work:** SCREEN, a gift, keeps its credit in plain text. TAHER and DEMO, paid or commercial work, hide it, and so does FORM_X.
- **Script sizes:** TAHER 2,110 B; DEMO 25,663 B, compressed by DIET to 4,864 B (19%).
- **No ARABART call** (the ARABART analysis agrees). The letters look like typeset Arabic, so they may have been captured from ARABART output with a tool that did not survive (speculation).
- **Fragility:** pause lengths depend on CPU speed. There is no way to quit before the end.

### 11. PESM: the Basmallah demo (PESM/PESM.EXE, 1991)

**Glance:** about 6 KB of Assembly that carries its own copy of the ARABART engine. It does not need the TSR.

**Story.** PESM draws "بسم الله الرحمن الرحيم" ("In the name of God, the Most Gracious, the Most Merciful") 16 times in 2 columns, in different colours, sizes and styles. It is a style sampler.

**Technical findings**
- Pure Assembly, VGA mode 12h, pixels through the VGA Graphics Controller (Set/Reset = colour, Bit Mask per pixel, latch read-then-write).
- **No INT 10h AH=36h:** it calls a local routine (0000:0284) with the ARABART register convention (`AH=36h`, AL = colour, CX = x, BX = y, DS:DX = text).
- **Shared with ARABART 4.15 (1993):** 3,298 bytes (3,271 when only runs of 16+ bytes count; the figure depends on the minimum run length), mostly glyph tables, plus the 136-byte shaping routine. So the engine was re-used as source.
- **Text** is the Arabic-keyboard key string `fsl hggi hgvplk hgvpdl`, mapped through a key-to-glyph table (CS:09FB).
- **Shaping:** sets "joins next" (bit 80h) and "joins previous" (bit 40h) from the neighbours. Glyphs are row runs drawn upward, with `EFh` = next row.
- **Style keys** become internal codes C8h–CBh and D0h: bold, italic, underline, double height, reset. `CFh n` selects font n.
- **Verified:** my VGA emulation **with no ARABART loaded** reproduces the museum screenshot.
- **Fragility:** it exits in graphics mode, so the DOS prompt prints over the picture (visible in the museum screenshot). It has a dead `RET` after `int 21h/4Ch` (0000:00FB) and no stack segment.

### 12. ARABART clients (ARABART/DEMO.EXE and ARABART/EDITOR.EXE)

**Glance:** Borland C++ large-model programs, 80186+ code with stack checks, using BGI. They talk to the TSR through thin wrappers: `push ax..dx / mov ax,36xxh / int 10h / pop` (DEMO 207D–215A).
- DEMO uses functions 1, 3, 4, 5 and 7. One wrapper doubles the text height for each `$` in the string (DEMO 20D6).
- **EDITOR checks for the TSR** (`AX=3600h` → expects 5944h, EDITOR 1D49) and returns cleanly if it is missing. **DEMO never checks;** without the TSR its calls fall through to the video BIOS and draw nothing (inference).
- Both need a 186+ CPU.

---

## Engineering fingerprint

Recurring habits, each seen in 3 or more programs.

1. **Make it small.**
   - All 17 binaries are DIET-packed: 704 KB of program becomes 296 KB (42%).
   - DIET 1.00 records the original header size in the EXE header's `e_ovno` field; this checks out for all 13 EXEs.
   - SCREEN's player is 156 bytes. Images live inside code segments (PORTSAID, NAMES).
2. **His own run-length picture formats, drawn right to left.**
   - SCREEN/TAHER/DEMO scripts use vertical runs.
   - ARABART glyphs and MENU2.DAT icons use row runs with the same `EFh` "next row" code.
   - NAMES/PORTSAID bitplanes use a `37h` escape.
   - That is 4 related formats from one person. The ARABART analyst also infers a private font editor and encoder.
3. **Arabic as Arabic-keyboard ASCII.** PESM, SUN and both ARABART clients store Arabic text as the Latin keys of the Arabic layout, with inline style keys. No code page and no special editor were needed.
4. **He reused his own code.**
   - SCREEN → TAHER → DEMO (one player).
   - ARABART engine → PESM (3.3 KB shared).
   - The x-mod-8 pixel idiom in WINKEY, ARABART, ARAB-ART and PESM.
   - NAMES (Assembly) → PORTSAID (the same routines as C with inline asm).
   - The Digi-Test GUI → EDIT.EXE (73%).
   - The KEMYAM file-header style in all Digi-Test formats.
5. **C for structure, Assembly at the edges.**
   - In 1993 the C/C++ programs keep Assembly to thin inline blocks: INT 10h/36h wrappers, board ports, the speaker, raw DOS calls.
   - The 1991–92 programs are all Assembly.
   - KVC is the clearest mix: C walks the directories, and Assembly knows the virus.
6. **Code that rewrites itself.**
   - SCREEN and TAHER patch script values into their own opcodes.
   - FORM_X uses run-once blocks that turn themselves into `RET`, plus a checksum-patched jump.
   - SCREEN cycles colours by incrementing a byte inside an instruction.
7. **He signed his work, and protected the signature in paid work.**
   - Signatures: "KEMYAM Software Corp." (1991), "KEMYAM Computer Group" (1993), "Yasser Dot Design".
   - ARABART's handler carries "DALYASSER" and its install reply is 5944h, ASCII "YD" (inference: "Yasser Dot").
   - Gifts carry plain credits (SCREEN); paid work hides them (TAHER, DEMO, FORM_X).
8. **Validation where he expected users, little elsewhere.**
   - Strong: FORM_X filters every key; KVC confirms each infection with 3 signatures; Digi-Test files carry a size trailer.
   - Weak: allocation results are never checked (PORTSAID, WINKEY, EDITOR); Digi-Test writes binary data in text mode; `fopen` failures are silent.
9. **Timing by CPU speed.** Busy loops or no delay appear in FORM_X, TAHER, DEMO, KVC, Digi-Test, WINKEY, PORTSAID and SUN. Only NAMES (mostly) and PORTSAID's `delay()` use the vertical retrace.
10. **Assembly habits inside C.**
    - Raw `int 21h/4Ch` exits from C (SUN, EDITOR).
    - Debug-friendly builds: stack checks on, no optimisation, 286 code. This is the same for every Borland C++ build except KVC.

## Code-quality rubric

Scores are 1 (poor) to 5 (excellent), measured against early-1990s DOS software from individuals and small shops. The comparison column is an assessment, not a survey.

| Dimension | Score | Reasons (evidence) | Compared with the era |
|---|---|---|---|
| Low-level skill (hardware, DOS internals) | **5** | Direct EGA/VGA register programming; PIT speaker; ISA board I/O; TSR conventions; disinfecting a resident virus by restoring its stolen vector; self-relocating tricks | Above most hobby and in-house work; this is the level of good commercial utilities |
| Algorithms and data design | **4** | 20-digit BCD with lazy carry; a typing state machine; 5-valued D-calculus gate model; 4 compact run-length formats; table-driven code. Minus: `DIV` per digit, O(n) line insert (fine at 600 lines) | Above average |
| Correctness (measured) | **3.5** | FORM_X correct in every test; KVC correct on synthetic samples; renders exact. Minus: EDITOR Delete/feof bugs, Digi-Test text-mode saves and IC table errors, SUN's 356 | Typical: few tools of the era were tested systematically |
| Robustness and error handling | **2.5** | Good input validation and integrity checks in places; unchecked allocations, ignored file errors, raw exits elsewhere | Typical of the era; below polished commercial tools |
| Structure and reuse | **4** | C++ classes with virtual methods in Digi-Test/EDIT; his own libraries reused across 5 projects. Minus: copy-paste (WINKEY `main`, Digi-Test pin maps) | Above average for a student |
| Portability and fragility | **2** | CPU-speed timing in 8 programs; 186/286-only builds; VGA required; files must be in the current directory; AT-only BIOS calls | Common at the time, and the main obstacle to running them today |
| Size efficiency | **5** | Compression everywhere; a 156-byte player; formats tuned for size | Excellent |
| User experience | **4** | Right-to-left Arabic with shadows and outlines; menus, help keys and dialogs; a Windows-3 look; alarm sounds; keys filtered as you type | Strong, especially for Arabic in 1991–93 |

## Notable excerpts

Addresses are seg:off in the unpacked images. Comments are plain English.

**E1. KVC uses the virus against itself** (KVC 0000:07EF–084B, selected lines)
```
07EF  B8 0C FF   mov ax,0FF0Ch     ; ask the secret question only Koko answers
07F2  CD 21      int 21h
07F4  3D C1 C0   cmp ax,0C0C1h     ; Koko replies "I am here"
07F7  75 6B      jne 0864          ; no answer: memory is clean
  ...                              ; (alarm: 20 beeps on the PC speaker)
0840  B8 03 35   mov ax,3503h      ; "where does INT 3 point?"
0843  CC         int 3             ; Koko keeps the real DOS address in INT 3
0844  06 1F      push es / pop ds
0846  8B D3      mov dx,bx         ; DS:DX = the real DOS entry
0848  B8 21 25   mov ax,2521h      ; "make INT 21h point there"
084B  CC         int 3             ; DOS calls now bypass the virus
```

**E2. FORM_X unlocks its own credit, once** (FORM_X 016A:0A6F–0AA3)
```
0A6F  90           nop               ; becomes RET after the first run
0A75  2E C6 04 C3  mov cs:[si],0C3h  ; SI=0A6Fh: write RET over my own first byte
0A79  BE 20 0B     mov si,0B20h      ; the hidden text is stored as code
0A7C  B9 35 00     mov cx,35h        ; 53 bytes
0A83  2E 8A 1C     mov bl,cs:[si]    ; the first byte is the starting "previous"
0A86  46           inc si
0A87  2E 8A 04     mov al,cs:[si]    ; loop: next encoded byte
0A8A  8A D0        mov dl,al         ; keep the encoded value
0A8C  2B C3        sub ax,bx         ; decoded = this byte - previous byte
0A8E  80 FC 00     cmp ah,0          ; borrowed?
0A93  FE C8        dec al            ;   then take 1 more
0A95  2E 88 04     mov cs:[si],al    ; write the plain letter back
0A98  8A DA        mov bl,dl         ; the encoded byte is the next "previous"
0A9E  46           inc si
0A9F  E2 E6        loop 0A87
```
*The result is "Yasser Dot Design.. <c>1992 YASSER MOHAMED ALI." A separate checksum ensures the program's exit only works if this code is untouched.*

**E3. A whole screensaver's drawing engine** (SCREEN 012E–0191, condensed)
```
012E  mov dl,[si] / inc si      ; read one script byte
0131  cmp dl,70h / jl 016F      ; below 70h: a stroke (offset, length)
0136  cmp dl,'x' / dec bx       ; 'x': move one column (opcode set by script)
013E  cmp dl,'w' / inc bx       ; 'w': move the other way
0146  cmp dl,'y' / je 0108      ; 'y': new segment, reload colours
014B  cmp dl,'{' ...            ; '{': frame done, key pressed? else next colour
016F  add dx,di / mov cl,[si]   ; row = origin + offset; CL = stroke length
0178  mov ax,0C03h / int 10h    ; plot a pixel (colour byte patched by script)
017F  jmp 018E                  ; displacement patched: skip or draw the shadow
0181  mov ax,0C0Eh / ...int 10h ; shadow pixel 2 right, 2 down
018E  inc dx / loop 0178        ; next pixel down the stroke
```

**E4. Talking to the lost test board** (Digi-Test 2529:0B2C–0B4E)
```
0B2C  B4 00     mov ah,0
0B2E  B9 08 00  mov cx,8          ; reverse the 8 test bits
0B31  31 DB     xor bx,bx         ;   (to match how the board was wired)
0B33  D1 E8     shr ax,1
0B35  D1 D3     rcl bx,1
0B37  E2 FA     loop 0B33
0B39  89 D8     mov ax,bx
0B3B  BA 01 03  mov dx,301h
0B3E  EE        out dx,al         ; send the inputs to the card at port 301h
0B3F  86 E0     xchg al,ah
0B41  D1 E8     shr ax,1
0B43  BA 00 03  mov dx,300h
0B46  EE        out dx,al         ; second write, to port 300h
0B4B  BA 00 03  mov dx,300h       ; then read port 300h 2,000 times
0B4E  EC        in al,dx          ; and keep the last value as the answer
```

**E5. A textbook fault-simulation gate in a few comparisons** (Digi-Test 0EFF:0191–01CB)
```
0191  mov al,es:[bx+18h]    ; this gate's "controlling value" (0 for AND/NAND)
0198  cmp al,[bp-8]         ; does this input have it?
019D  mov byte [bp-2],1     ;   yes: the output is decided
01A6  cmp al,[bp-7]         ; the non-controlling value?
01AB  inc byte [bp-4]       ;   count it
01B5  cmp ax,6 / je 01C1    ; D (fault effect)?  count it
01BA  cmp ax,9 / je 01C6    ; D (fault effect)?      count it
01CB  inc byte [bp-3]       ; otherwise unknown (X): count it
```
*Logic values: 1 = 0, 2 = 1, 15 = X, 6 = D and 9 = D̄, the notation of the D-algorithm for test generation.*

**E6. Ten lines that unpack every picture** (NAMES 08A3–08B7; the same loop in PORTSAID)
```
08A3  lodsb            ; next byte
08A4  cmp al,37h       ; 37h is the escape byte
08A6  je 08AB
08A8  stosb            ; ordinary byte: copy it
08A9  jmp 08A3
08AB  lodsb            ; escape: read the count
08AC  cmp al,0         ; count 0 = end of picture
08AE  je 08B9
08B0  xor ch,ch / mov cl,al
08B4  lodsb            ; the value to repeat
08B5  rep stosb        ; write it 'count' times
08B7  jmp 08A3
```

**E7. A home-made pixel trick, found in 4 programs** (WINKEY 0000:02F4–0306)
```
02F4  B9 03 00     mov cx,3          ; 3 times:
02F7  33 DB        xor bx,bx
02F9  D1 EA        shr dx,1          ;   push the lowest bit of x out of DX...
02FB  D1 D3        rcl bx,1          ;   ...and into BX (bits arrive reversed)
02FD  E2 FA        loop 02F9         ; now DX = x / 8 (the byte on screen)
02FF  03 FA        add di,dx
0301  2E 8A 8F 3D 03  mov cl,cs:[bx+033Dh] ; table 0 4 2 6 1 5 3 7 un-reverses
                                     ; BX into x mod 8 (the bit in the byte)
```
*A textbook would use `AND 7`. The identical bytes appear in ARABART 4.15, ARAB-ART 7.15 and PESM: one person's own method.*

**E8. An honest bug** (EDITOR 027A:1061–108E, Delete key)
```
1061  mov ax,si / inc ax          ; length = strlen(line) + 1   <- the bug
1064  push ax
106C  mov ax,[bx+0A72h] / add ax,[13DEh] / inc ax
1075  push seg / push ax          ; source = line + cursor + 1
1081  mov ax,[bx+0A72h] / add ax,[13DEh]
1089  push seg / push ax          ; destination = line + cursor
108E  call memmove                ; shift the rest of the line left
```
*The length should be "characters after the cursor", not "the whole line". At column 100 of a 150-character line it moves 51 bytes too many, into the next line's memory: "HELLO" became "ELLO" in our test. Written in 3 evenings for a job interview.*

## Glossary

- **BCD (binary-coded decimal):** storing numbers as decimal digits (here, one digit per byte) instead of binary.
- **Ten's complement:** a way to store negative decimal numbers: replace each digit d with 9 − d, then add 1.
- **Fixed point:** a fixed number of decimal places (FORM_X: 6), unlike floating point.
- **Packer / DIET:** a tool that compresses an EXE or COM file and adds a small stub that decompresses it in memory at start-up.
- **TSR (terminate and stay resident):** a DOS program that stays in memory after it exits and provides services, such as ARABART.
- **Interrupt / INT n / vector:** a numbered entry point into DOS or the BIOS. The *vector* is the address stored for each number, and a program can replace it ("hook").
- **INT 21h / INT 10h:** the DOS services and the BIOS video services.
- **Memory model (tiny, small, compact, large):** whether code and data addresses are 16-bit (near) or segment+offset (far) in a 16-bit DOS program.
- **c0 / RTL:** Borland's start-up code and runtime library (`printf`, `fopen`, …).
- **BGI:** Borland Graphics Interface, the graphics library and drivers (`EGAVGA.BGI`) used with Turbo/Borland C.
- **EGA/VGA planar memory:** 16-colour graphics stored as 4 bit-planes, written through hardware registers (ports 3C4h/3CEh).
- **Inline assembly:** Assembly instructions written inside a C function.
- **Self-modifying code:** a program that changes its own instructions while it runs.
- **Checksum:** a number computed from bytes, used to detect changes.
- **Run-length encoding (RLE):** storing "this value, N times" or "start, length" instead of every pixel.
- **D-algorithm / five-valued logic:** a classic method for testing digital circuits. Besides 0, 1 and X (unknown), it uses D and D̄ for "1 in the good circuit, 0 in the faulty one" and the reverse.
- **ISA prototype card ports (300h–31Fh):** the I/O addresses IBM set aside for home-made expansion cards.
- **PIT:** the timer chip that also drives the PC speaker.
- **Vertical retrace:** the moment the monitor's beam returns to the top. Waiting for it gives timing that does not depend on CPU speed.
- **XOR drawing:** drawing by flipping pixels, so drawing the same shape twice erases it.
- **80186+ instructions (ENTER, LEAVE, PUSH imm):** instructions that the original 8088 PC cannot run.
- **Stack checking:** a compiler option that tests for stack overflow at the start of every function.

## Confidence table

| Claim | Confidence |
|---|---|
| All 17 binaries are packed with DIET 1.00; unpacked images are exact | Verified (DIE signature rule; emulated unpack; relocation diff; `e_ovno` check on 13 EXEs) |
| Collection is 704 KB unpacked → 296 KB packed | Verified (arithmetic) |
| FORM_X: 20-digit unpacked BCD, 14.6 fixed point, ten's complement, no AAA/DAA | Verified (code + emulated results) |
| FORM_X self-decoding credit and checksum-patched exit | Verified (emulation, one-byte tamper test) |
| FORM_X was built with MASM or TASM from a textbook skeleton | Strong inference |
| SCREEN/TAHER/DEMO are one run-length interpreter; renders match the screenshots | Verified |
| The run-length scripts were captured from ARABART output | Speculation |
| PESM contains its own ARABART engine and needs no TSR | Verified (emulation without TSR; 3,298 shared bytes) |
| KVC detects Koko with FF0Ch→C0C1h and the stated file signatures; cleans COM byte-exact | Verified (code + synthetic E2E) |
| Koko keeps the original DOS entry in the INT 3 vector | Strong inference (only explanation for KVC's INT 3 calls) |
| Koko's EXE marker is initial SP = C0C1h | Verified (KVC's check reads header bytes 10h–11h) |
| Digi-Test is C++ with 10+ classes and uses Borland's class library | Verified |
| Digi-Test's board was an ISA card at 300h/301h | Strong inference (port use verified) |
| Digi-Test uses 5-valued D-calculus; backtracking test generation | Verified (values and gate model); strong inference (backtracking) |
| Digi-Test data formats as described; 70 files parse exactly | Verified |
| Digi-Test text-mode save bug and IC table errors | Verified (code + data) |
| HEADDER/FOOTTER.PRN are the TAHER lab letterhead | Verified (content); strong inference (which job) |
| SUN needs ARABART; RUN.BAT makes it run on 4.15 instead of 7.15 | Verified (code: shared 12-byte signature, 7.15 exits) |
| SUN's Earth period constant is 356 | Verified (float at DS:19C9) |
| 356 is a typo for 365 | Strong inference |
| SUN's animation speed depends only on CPU speed | Verified (no delay or retrace in its loops) |
| EDIT and EDITOR are different programs; EDIT is 73% Digi-Test code | Verified (function opcode matching, strings) |
| EDITOR built 7–9 Oct 1993 with Borland C++ 2.0 | Verified (project timestamps); strong inference (version) |
| EDITOR Delete and feof bugs | Verified (emulated reproduction) |
| WINKEY is Turbo C++ with inline-asm library; MENU2.DAT format | Verified |
| x-mod-8 idiom shared by WINKEY, ARABART, ARAB-ART, PESM only | Verified (byte search over all 17 images) |
| NAMES is pure Assembly; PORTSAID reuses 153 bytes of it | Verified |
| PORTSAID is an EXE because of emulator relocations | Verified (relocation placement); strong inference (motive) |
| NAMES "Ebrahem El-Etr" is KVC's co-author | Strong inference (same surname) |
| 5944h "YD" = "Yasser Dot" | Speculation |
| He learned mainly from books and Borland manuals | Strong inference (textbook skeleton, manual example code, vendor class library sources) |

## What the binaries say about how he learned and worked

- **Books and manuals (strong inference).** FORM_X uses the textbook EXE skeleton and keeps the dead `RETF` of a `PROC FAR` template; PESM keeps a dead `RET` after its exit call. SUN's graphics start-up is almost exactly Borland's manual example. Digi-Test compiles Borland's own class-library source inside the project, so he read the vendor's code.
- **Self-made methods (inference).** He uses a reversed-bits table instead of `AND 7`, and decimal arithmetic without the x86 BCD instructions. He invented 4 picture formats. These look like the work of someone who solved problems from first principles.
- **Debugging by hand.** KVC hard-codes 5 offsets inside the Koko body and knows the virus parks DOS in INT 3. That needs a careful disassembly of the virus, probably with DEBUG or Turbo Debugger (TD is in his IDE's Transfer menu).
- **Debug-friendly builds.** Stack checks on, no optimisation, assertions compiled in (Digi-Test): he chose safety while developing.
- **Fast iteration.** EDITOR went from first file to last build in about 3 evenings. EDIT re-used 73% of Digi-Test to save time.
- **His machine (inference).** MS-DOS 5 with Windows 3.x (CONFIG.SYS); drives C:, D: and F:; Borland C++ 2.0 with TASM on F:; The Brave Sun on C:. Leftover RAM in Digi-Test files names a tool called FDREAD (speculation).
- **English as a second language, no spell checker.** "praces", "dectionary", "Tecknologies", "signeture", "Freezed".

## Interview questions only his memory can answer

1. Where did you get DIET, and why compress every program? Was it to fit everything on one floppy?
2. How did you get a Koko sample? How did you find that it answers FF0Ch with C0C1h and parks DOS in INT 3?
3. What was the Digi-Test board: an ISA card at port 300h? Who designed and built it, and what did the second write to port 300h do?
4. How did you turn Arabic lettering into the stroke scripts in SCREEN, TAHER and DEMO? Did you write a capture or encoding tool?
5. Which books or manuals did you learn Assembly and C from? Did you have Borland's manuals on paper?
6. Did someone try to remove your name from your programs? Is that why FORM_X, TAHER and DEMO hide it?
7. What do "KEMYAM", "Yasser Dot Design", "DALYASSER" and "YD" stand for? Is KEMYAM made from the members' initials?
8. Which editor did you submit for the job, EDIT or EDITOR? What did the interviewers say?
9. In The Brave Sun the Earth year is 356 days in the code. Do you remember that line?
10. What PC did you develop on (CPU, video card, disks), and when did you first own one?
11. Who was the sixth KEMYAM member, Ahmed El-Gayar, who is in KVC but not in the NAMES splash?
12. What other programs from these years are missing from this archive (for example the TAHER lab-results software)?

---

**Artifacts** (scratchpad, temporary): `/private/tmp/claude-501/-Users-deadpackets-workspace-DOSArchive/bb845a97-0c40-416d-bb30-299debf3ecff/scratchpad/re/programs/`. Contents:
- `verify_all.py` re-runs every check above. Output: `verify_all.out.txt`.
- `unpacked/` holds the unpacked binaries; `render/` holds the emulated screens.
- `digit/`, `editors/` and `gfxprogs/` hold the per-program notes, decoders and renders.
