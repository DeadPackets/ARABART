# Koko double and marked samples

We do not have the Koko virus and never will. These files copy only what KVC checks, so KVC treats them exactly as it treated Koko, and nothing else.

```
uv run -q --with capstone python -I research/artifacts/koko/build.py                  # writes programs/KVC_LIVE/, clean/, listing.txt
uv run -q --with unicorn --with playwright python -I research/artifacts/koko/e2e.py   # writes e2e-report.md and jsdos-*.png
```

| File | Bytes | What it is |
|---|---|---|
| `programs/KVC_LIVE/DOUBLE.COM` | 128 | The Koko double. Stays in memory and answers KVC's question. |
| `programs/KVC_LIVE/HELLO.COM` | 1,844 | `clean/HELLO.COM` (61 bytes) with Koko's COM marks, stored scrambled. |
| `programs/KVC_LIVE/GREET.EXE` | 2,132 | `clean/GREET.EXE` (96 bytes) with Koko's EXE marks, stored scrambled. |
| `programs/KVC_LIVE/UNWRAP.COM` | 96 | Unscrambles the two samples in place when the scene boots; START.BAT then deletes it. |
| `programs/KVC_LIVE/KVC.EXE` | 11,000 | Yasser's original, unchanged (copy of `programs/KVC/KVC.EXE`). |
| `programs/KVC_LIVE/START.BAT`, `SCAN.BAT` | | Boot scene (UNWRAP, delete it, load the double); `SCAN` types `KVC C:` for the visitor. |
| `listing.txt` | | Disassembly of every byte of code the double and the samples can run. |

The KVC signature bytes are read from KVC itself (`research/artifacts/programs/unpacked/KVC_KVC.EXE`, data segment at image offset 3780h). `build.py` has no other source for them.

## Every byte KVC checks

KVC addresses are code-segment offsets in the unpacked image. "Body" is the block Koko adds to a file; body offset X runs at offset X+100h of its own segment (Koko was written like a COM program).

### In memory (KVC 07E6)

| KVC does | KVC expects | The double |
|---|---|---|
| `INT 21h` with `AX=FF0Ch` (07EF) | `AX=C0C1h` back | Its 14-byte resident handler returns `C0C1h` for `FF0Ch` and passes every other call to DOS unchanged. |
| Prints and calls DOS through `INT 3` (080B, 0843, 084B, 085B) | The `INT 3` slot holds the real DOS entry, so calls there skip Koko | At load it copies the DOS entry into the `INT 3` slot. |
| `INT 3` with `AX=3503h`, then `AX=2521h` (0840-084B) | Reading slot 3 gives the DOS entry; writing it into slot 21h cuts Koko off | Same: after this, no call reaches the double. |
| Asks `FF0Ch` again (07EF) | No answer: prints `##### Virus Freezed #####` | No answer, because DOS does not know `FF0Ch`. |

### COM files (KVC 0CF7)

| File offset | Bytes | Meaning | KVC uses it to |
|---|---|---|---|
| 5-25 | `50 B8 00 01 50 33 C0 CB 08 00` + `KoKo (1)` CR LF `$` | Koko's entry stub (`push ax / mov ax,100h / push ax / xor ax,ax / retf`), then a word, then its name | Spot Koko (compared with KVC DS:059F) |
| 3-4 | paragraphs | Where the body starts, in 16-byte steps | Find the body |
| 0-2 | `8C C8 05` | `mov ax,cs / add ax,` with bytes 3-4 as the number: the only 5 bytes that fit before `push ax`. Not checked by KVC. | |
| body+127h | `BF 00 01 BE 22 01` | `mov di,100h / mov si,122h`: Koko's code that puts the host's first bytes back | Confirm it is Koko (DS:05D5), else "Strange signeture" and no change |
| body+18h | word | Original file size | Cut the file back to it (`chsize` in the C part) |
| body+22h | 26 bytes | Original first 26 bytes | Write them back over the stub; file date and time restored |

### EXE files (KVC 0F95)

| Where | Bytes | Meaning | KVC uses it to |
|---|---|---|---|
| Header 10h-11h | `C1 C0` | Initial stack pointer `C0C1h`, the same number as the memory answer | Spot Koko |
| Entry = (header paragraphs + CS) x 16 + IP | `EB 60 90 EA` | `jmp short +60h / nop / jmp far` | Confirm the entry is Koko's |
| entry+4Dh, 4Fh, 51h, 53h | 4 words | The host's original CS, SS, IP, SP | Write them back into the header |
| entry+5F0h | `0E 1F BE 22 01 8B 44 16 A3 4D 01 8B 44 0E A3 4F 01 8B 44 10` | Koko's own code that saves those 4 header fields | Confirm (DS:05C1), else "Strange signeture" |
| entry+6DAh+5 | first 20 bytes of the COM stub above | Koko keeps its COM stub inside its body | Confirm (DS:059F) |
| entry-100h | | Where the original file ended | Cut the file there, then fix the size fields (header bytes 2-5) |

`build.py` puts the body right after a paragraph-sized original, as Koko's `entry-100h` rule needs, so the cleaned files match the originals byte for byte (proved in `e2e-report.md`).

## Why it is harmless

- **DOUBLE.COM.** At load it makes 3 DOS calls (read the `INT 21h` slot, set the `INT 3` slot, set the `INT 21h` slot), prints one line and stays resident in 288 bytes (its 256-byte header plus 32 bytes). The resident part is 14 bytes: compare, answer, or jump to DOS. It never opens a file, touches a disk, reads the date, watches the keyboard or copies itself. It has no payload.
- **Marked samples.** When run, the fake body prints one line, then starts the real program: for the COM it copies the saved 26 bytes back in memory and jumps to them, for the EXE it jumps to the saved CS:IP with the saved stack. The e2e run logs every DOS call they make: `09h` (print) and `4Ch` (exit), nothing else.
- **The copied Koko bytes are data or plain jumps.** The 20-byte block at body+5F0h and the stub copy at body+6DAh sit where no jump in our code goes (see `listing.txt`). The Koko bytes that do run are the COM entry stub (13 bytes) and the EXE entry jump (`EB 60`), which only reach our body, and the two loads at body+127h, which set up the copy back.
- **No way to spread.** No file in the scene contains code that finds files or writes one it found. UNWRAP.COM opens exactly two names written into it, HELLO.COM and GREET.EXE, and is deleted before the visitor gets the prompt.

## Nothing hosted holds Koko's bytes in plain form

The samples must carry the 47 bytes of KVC's signature table (21 + 20 + 6), which are Koko's own bytes, or KVC would not recognize them. So they are stored scrambled: each byte XOR a rolling key (A5h, plus 4Dh for every byte after), which repeats only every 256 bytes. `UNWRAP.COM` (96 bytes, in `listing.txt`) is the first line of `START.BAT`: it opens the two files, XORs them back, writes them and closes them, with no other DOS call, and `START.BAT` deletes it. The plain bytes exist only in the visitor's emulator memory. `e2e.py` part 0 proves that no file in `programs/KVC_LIVE`, the bundle, and no file inside the bundle holds any of the three runs; part 1 proves UNWRAP restores them exactly.
