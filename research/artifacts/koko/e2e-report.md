# kvc-live end-to-end report

**Result: PASS** (safety 3/3, emulator 10/10, js-dos not run, siren 3/3)

Generated 2026-10-23 20:06 by `research/artifacts/koko/e2e.py`.

Rerun:

```
uv run -q --with capstone python -I research/artifacts/koko/build.py   # rebuild scene files
uv run -q --with unicorn --with playwright python -I research/artifacts/koko/e2e.py
```

## Part 0: nothing hosted holds Koko's bytes in plain form

KVC's signature table is 47 bytes of Koko's code (21 + 20 + 6), read from KVC itself. HELLO.COM and GREET.EXE are stored scrambled (each byte XOR a rolling key), and UNWRAP.COM, the first line of START.BAT, puts them back inside the emulator.

| Check | Result |
|---|---|
| no scene file in programs/KVC_LIVE holds a plain signature run | PASS |
| the bundle file holds no plain signature run | PASS |
| no file inside the bundle holds a plain signature run | PASS |

Searched 7 scene files, the 13,333-byte bundle and its 8 members.

## Part 1: Unicorn PC, shipped KVC.EXE (packed, 11,000 bytes)

Real interrupt table. On a copy of `programs/KVC_LIVE`: UNWRAP.COM runs and is deleted, as START.BAT does; DOUBLE.COM loads resident; then `KVC C:`.

| Check | Result |
|---|---|
| UNWRAP.COM only opens, reads, seeks, writes and closes (DOS calls 3Dh, 3Fh, 42h, 40h, 3Eh, 4Ch) | PASS |
| after UNWRAP, the samples carry all 47 signature bytes KVC looks for | PASS |
| Koko found in memory | PASS |
| Koko frozen (INT 21h now points at DOS, not the double) | PASS |
| alarm: 20 tones on the PC speaker, then speaker off | PASS |
| alarm divisors alternate 1000, 1600 | PASS |
| 4 files scanned, 2 found, 2 removed | PASS |
| HELLO.COM equals the clean original byte for byte | PASS |
| GREET.EXE equals the clean original byte for byte | PASS |
| marked samples only print and exit (DOS calls 09h, 4Ch) | PASS |

### Vectors

- After the double loads: INT 21h = 0700:0106 (the double), INT 3 = F000:1108 (DOS entry)
- After KVC: INT 21h = F000:1108, INT 3 = F000:1108

### Alarm as KVC played it (port 42h divisors, instructions per tone)

| # | Divisor | Hz | Instructions |
|---|---|---|---|
| 1 | 1000 | 1193.2 | 65,299 |
| 2 | 1600 | 745.7 | 65,300 |
| 3 | 1000 | 1193.2 | 65,299 |
| 4 | 1600 | 745.7 | 65,300 |
| 5 | 1000 | 1193.2 | 65,299 |
| 6 | 1600 | 745.7 | 65,300 |
| 7 | 1000 | 1193.2 | 65,299 |
| 8 | 1600 | 745.7 | 65,300 |
| 9 | 1000 | 1193.2 | 65,299 |
| 10 | 1600 | 745.7 | 65,300 |
| 11 | 1000 | 1193.2 | 65,299 |
| 12 | 1600 | 745.7 | 65,300 |
| 13 | 1000 | 1193.2 | 65,299 |
| 14 | 1600 | 745.7 | 65,300 |
| 15 | 1000 | 1193.2 | 65,299 |
| 16 | 1600 | 745.7 | 65,300 |
| 17 | 1000 | 1193.2 | 65,299 |
| 18 | 1600 | 745.7 | 65,300 |
| 19 | 1000 | 1193.2 | 65,299 |
| 20 | 1600 | 745.7 | 65,293 |

### Samples before and after (output when run)

- HELLO.COM marked (1,844 bytes): `[This file wears Koko's marks for the KVC demo. It cannot spread.] / Hello! I am HELLO.COM, a clean little program.`
- HELLO.COM cleaned (61 bytes, sha256 f8a972aa30c02d2f, clean original f8a972aa30c02d2f): `Hello! I am HELLO.COM, a clean little program.`
- GREET.EXE marked (2,132 bytes): `[This file wears Koko's marks for the KVC demo. It cannot spread.] / Hello! I am GREET.EXE, a clean little program.`
- GREET.EXE cleaned (96 bytes, sha256 6866a26b7d120644, clean original 6866a26b7d120644): `Hello! I am GREET.EXE, a clean little program.`

### Text screen when KVC exits

```
              *****    KEMYAM Virus Capture. (Ver 1.05)    *****
                   Found  --KoKo (1) virus--  active in  RAM
                           ##### Virus Freezed #####
Scanning >>  C:\GREET.EXE
File is infected by  KoKo (1) virus   ********** >  Virus removed  < **********
Scanning >>  C:\HELLO.COM
File is infected by  KoKo (1) virus   ********** >  Virus removed  < **********
 Total file(s) scanned  >>     4   File (s)
 Total virus(s) found   >>     2   Virus(s)
 Total virus(s) removed >>     2   virus(s)
                        <c>1993 KEMYAM Computer Group.
                 YASSER MOHAMED ALI.   -----   EBRAHIM EL-ETR
```

## Part 2: js-dos

Skipped: http://localhost:4322/ARABART/program/kvc-antivirus/ did not answer (HTTP Error 404: Not Found).

## Part 3: `src/lib/kvc/siren.ts` in Chrome, started by a real click

| Check | Result |
|---|---|
| refuses to start without a click or key press | PASS |
| plays for the KVC alarm length (1.31 s at 1 µs per instruction) | PASS |
| high tone 1193 Hz, low tone 746 Hz (within 2%) | PASS |

Measured with the same analyser as part 2: tone present 1.32 s, median pitch 1193 Hz and 746 Hz. Without a gesture `play()` answered: "The siren starts only from a click or key press.".
