# Writes src/data/anatomy/<FOLDER>_<FILE>.json for the five Programs-lead files.
# Offsets are file offsets into research/artifacts/programs/unpacked/<key>; checks coverage, overlap and a few anchor bytes.
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); U = os.path.join(HERE, '..', 'unpacked')
DST = '/Users/deadpackets/workspace/DOSArchive/src/data/anatomy'

def build(key, path, base, regions, routines, header=None):
    data = open(os.path.join(U, key), 'rb').read()
    out = []
    for r in (header or []):
        out.append(r)
    for a, b, kind, by, label, note, *rest in regions:
        r = dict(start=base + a, end=base + b, kind=kind, label=label, note=note, by=by, evidence=rest[0] if rest and rest[0] else 'measured')
        if len(rest) > 1 and rest[1]: r['link'] = rest[1]
        out.append(r)
    out.sort(key=lambda r: r['start'])
    assert out[0]['start'] == 0 and out[-1]['end'] == len(data), (key, out[-1]['end'], len(data))
    for x, y in zip(out, out[1:]): assert x['end'] == y['start'], (key, x['label'], y['label'], x['end'], y['start'])
    rts = []
    for a, b, name, note, link, lines in routines:
        rt = dict(start=base + a, end=base + b, name=name, note=note)
        if link: rt['link'] = link
        if lines: rt['lines'] = [dict(off=base + o, note=n) for o, n in lines]
        rts.append(rt)
    json.dump(dict(file=path, regions=out, routines=rts), open(os.path.join(DST, key + '.json'), 'w'), indent=1, ensure_ascii=False)
    print(key, len(out), 'regions', len(rts), 'routines')
    return data

def mz(nrel, hdr):
    return [dict(start=0, end=32, kind='header', label='MZ header', note='DOS EXE header, rebuilt by the museum unpacker after removing the DIET compression.', by='dos', evidence='measured'),
            dict(start=32, end=32 + 4*nrel, kind='reloc', label='Relocation table', note=f'{nrel} segment addresses that DOS patches with the real load address.', by='dos', evidence='measured'),
            dict(start=32 + 4*nrel, end=hdr, kind='unused', label='Header padding', note='Fills the header to a 16-byte boundary.', by='dos', evidence='measured')]

# ---------------------------------------------------------------- KVC.EXE (64-byte header, image = segment 0)
D = 0x3780
d = build('KVC_KVC.EXE', 'KVC/KVC.EXE', 64, [
    (0x0000, 0x0210, 'startup', 'borland', 'Borland C++ start-up code', 'Sets up memory, the stack, argv and the environment, then calls main at 0525.'),
    (0x0210, 0x0270, 'code', 'yasser', 'C helpers', 'Find first and find next in one function (AH = 4Eh + flag), set the DTA, compare names.', None, '#kvc-build'),
    (0x0270, 0x0525, 'code', 'yasser', 'Folder scanner', 'Walks every folder (unless /NS) and checks each COM and EXE file it finds.', None, '#kvc-build'),
    (0x0525, 0x07A0, 'code', 'yasser', 'main', 'Reads /NS, /NC and /H, runs the memory check, scans the disk and prints the totals.', None, '#kvc-build'),
    (0x07A0, 0x07E6, 'code', 'yasser', 'Reopen for writing', 'Closes the file, clears the read-only attribute and opens it again for writing. The attribute is never restored.', None, '#kvc-com'),
    (0x07E6, 0x0877, 'code', 'yasser', 'Memory check and freeze', 'Asks INT 21h AX=FF0Ch; on the reply C0C1h it sounds a siren and points INT 21h back at DOS through INT 3.', None, '#kvc-memory'),
    (0x0877, 0x09A9, 'text', 'yasser', 'Memory alarm messages', '"Found --KoKo (1) virus-- active in RAM", "Virus Freezed" and the advice to reboot from a clean disk, then a 1-byte flag.', None, '#kvc-memory'),
    (0x09A9, 0x0A08, 'code', 'yasser', 'Message printer', 'Prints message n from two pointer tables, with the file name in between.'),
    (0x0A08, 0x0A81, 'unused', 'yasser', 'Zero bytes', '120 zero bytes and a $. No code we found points here.'),
    (0x0A81, 0x0AA9, 'table', 'yasser', 'Message pointer tables', 'Two tables of 10 word pointers, at CS:0A81 (before the file name) and CS:0A95 (after it).'),
    (0x0AA9, 0x0CF7, 'text', 'yasser', 'Scan messages', '"File is infected by KoKo (1) virus", "Virus removed", "Strange signeture", "Scanning >>", "Cleaning >>" and error texts.'),
    (0x0CF7, 0x0F95, 'code', 'yasser', 'COM check and repair', 'Checks bytes 5-25 and body+127h, writes back the 26 saved bytes and restores the date and time.', None, '#kvc-com'),
    (0x0F95, 0x126F, 'code', 'yasser', 'EXE check and repair', 'Checks SP = C0C1h and three body signatures, restores CS:IP and SS:SP, computes the clean size.', None, '#kvc-exe'),
    (0x126F, 0x1295, 'code', 'yasser', 'Help routine', 'Prints the three help pages (/H), waiting for a key after each.'),
    (0x1295, 0x1EDF, 'text', 'yasser', 'Help pages', 'Version notes, credits (Yasser Mohamed Ali, Ebrahim El-Etr), the Koko description, and a contact page that this site does not reproduce.'),
    (0x1EDF, 0x1EF6, 'code', 'yasser', 'Press-any-key routine', 'Prints the prompt, waits for a key, clears the line.'),
    (0x1EF6, 0x1F93, 'text', 'yasser', 'Prompts', '"< Press any key >" and a blank line.'),
    (0x1F93, D, 'library', 'borland', 'Borland C++ runtime library', 'printf, sprintf, chsize, file and memory functions that the compiler linked in.'),
    (D, D + 0x09E, 'data', 'borland', 'Runtime data', 'The Borland copyright string, "Divide error" and start-up variables.'),
    (D + 0x09E, D + 0x504, 'text', 'yasser', 'Messages of the C part', 'Path formats, "Scanning >> %s", the banner "KEMYAM Virus Capture. (Ver 1.05)", totals and usage.', None, '#kvc-build'),
    (D + 0x504, D + 0x511, 'text', 'yasser', 'Unused string', '"a:format.com". Nothing uses it; likely a test leftover.', 'inferred'),
    (D + 0x511, D + 0x59F, 'data', 'yasser', 'File buffers', 'A 26-byte header buffer at DS:0511 and a 98-byte body buffer at DS:052F.'),
    (D + 0x59F, D + 0x5B4, 'table', 'yasser', 'Koko COM signature', 'push ax / mov ax,100h / push ax / xor ax,ax / retf / 08 00 "KoKo (1)" 0A 0D $: 21 bytes, compared with file bytes 5-25.', None, '#kvc-com'),
    (D + 0x5B4, D + 0x5C1, 'unused', 'yasser', 'Spaces', '13 spaces after the signature string.'),
    (D + 0x5C1, D + 0x5D5, 'table', 'yasser', 'Koko EXE signature', '20 bytes of Koko\'s own EXE restore code, compared at entry + 5F0h.', None, '#kvc-exe'),
    (D + 0x5D5, D + 0x5DB, 'table', 'yasser', 'Koko restore-code signature', 'BF 00 01 BE 22 01 (mov di,100h / mov si,122h), compared at body + 127h.', None, '#kvc-com'),
    (D + 0x5DB, 0x41E0, 'data', 'borland', 'Runtime data', 'File table, buffers and other variables of the Borland runtime.'),
], [
    (0x07E6, 0x0877, 'find_koko_in_memory', 'Detects Koko through its own reply, then cuts it off from DOS.', '#kvc-memory',
     [(0x07EF, 'Asks the question only Koko answers'), (0x07F4, 'C0C1h means Koko is resident'), (0x080B, 'Prints the alarm through INT 3, past the virus'),
      (0x0843, 'AX=3503h through INT 3: read entry 3, the real DOS address'), (0x084B, 'AX=2521h through INT 3: point INT 21h back at DOS')]),
    (0x0CF7, 0x0F95, 'check_and_clean_com', 'Two signature checks, then the 26 saved bytes go back to the start of the file.', '#kvc-com',
     [(0x0D8F, 'Bytes 5-25 must match Koko\'s stub and name'), (0x0DA1, 'Bytes 3-4 x 16 = body offset'), (0x0E12, 'Body + 127h must be Koko\'s restore code'),
      (0x0EEC, 'Writes the 26 saved bytes at offset 0'), (0x0F09, 'Puts the date and time back')]),
    (0x0F95, 0x126F, 'check_and_clean_exe', 'Finds Koko\'s mark in the EXE header and restores the original start-up fields.', '#kvc-exe',
     [(0x102E, 'SP = C0C1h is Koko\'s mark'), (0x1096, 'Entry must start EB 60 90 EA'), (0x10DB, 'IP, SP, CS and SS come back from the virus body'),
      (0x1194, 'Clean size = entry - 100h'), (0x11AF, 'Pages = size / 512, always + 1')]),
    (0x0210, 0x023E, 'find_file', 'One helper for both find first and find next.', '#kvc-build', [(0x0216, 'AH = 4Eh + flag: 4Eh first, 4Fh next')]),
    (0x0525, 0x07A0, 'main', 'Options, memory check, scan, totals.', '#kvc-build', []),
], mz(7, 64))
assert d[64 + 0x7EF:64 + 0x7F2] == bytes.fromhex('b80cff') and d[64 + D + 0x59F + 10:64 + D + 0x59F + 18] == b'KoKo (1)'

# ---------------------------------------------------------------- FORM_X.EXE (48-byte header, data segment at image 0, code at image 16A0)
C = 0x16A0
d = build('FORM_X_FORM_X.EXE', 'FORM_X/FORM_X.EXE', 48, [
    (0x000, 0x01B, 'table', 'yasser', 'Small table', 'Byte values whose use was not traced.', 'inferred'),
    (0x01B, 0x02F, 'table', 'yasser', 'Pointers to the x values', '10 word pointers, one per table row, 20 bytes apart.'),
    (0x02F, 0x0F7, 'data', 'yasser', 'x values', '10 numbers of 20 digits, one per result row.', None, '#fx-numbers'),
    (0x0F7, 0x10B, 'table', 'yasser', 'Pointers to the results', '10 word pointers, 20 bytes apart.'),
    (0x10B, 0x1D3, 'data', 'yasser', 'F(x) results', '10 numbers of 20 digits.', None, '#fx-numbers'),
    (0x1D3, 0x1E2, 'data', 'yasser', 'Variables', 'Flags, pointers and the overflow flag at DS:01E1.'),
    (0x1E2, 0x232, 'data', 'yasser', 'Formula text', 'What you type, starting with an extra "(" so the whole formula is one bracket.', None, '#fx-keys'),
    (0x232, 0x282, 'data', 'yasser', 'Saved states', 'The state byte before each typed character, so Backspace can step back.', None, '#fx-keys'),
    (0x282, 0x284, 'data', 'yasser', 'State byte', 'DS:0282, one bit per kind of key allowed next. It starts as 2Eh.', None, '#fx-keys'),
    (0x284, 0x2B6, 'text', 'yasser', 'Blank line', 'Spaces and a $, used to clear the input line.'),
    (0x2B6, 0x2BA, 'table', 'yasser', 'Prompt pointers', 'Two pointers to the "initial value" and "final value" prompts.'),
    (0x2BA, 0x35E, 'text', 'yasser', 'Prompts', '"Enter the intial value ----->  X =", the final value prompt, the table title and "* OVERFLOW *".'),
    (0x35E, 0x396, 'text', 'yasser', 'Plain copy of the credit', '"Yasser Dot Design.." and "<c>1992 YASSER MOHAMED ALI." No code we found uses it; the credit on screen comes from the scrambled copy.', 'inferred', '#fx-protect'),
    (0x396, 0x3A6, 'table', 'yasser', 'Error pointers', '8 pointers to the error messages.'),
    (0x3A6, 0x517, 'text', 'yasser', 'Error messages and table header', '"Bad end of the formula", "Error in number of praces", "Out of accurecy scope" and the column titles.'),
    (0x517, C, 'data', 'yasser', 'Work area', 'Zeros in the file: number buffers (x at DS:0567, operands at 057B and 058F) and the formula as a list of 20-digit numbers and operators.', None, '#fx-math'),
    (C + 0x000, C + 0x00F, 'startup', 'yasser', 'Textbook start', 'push ds / mov ax,0 / push ax, then DS = the data segment.'),
    (C + 0x00F, C + 0x052, 'code', 'yasser', 'Curtain effect', 'Scrolls the screen open with BIOS INT 10h, waiting with mov cx,3000h / loop $ (CPU-speed dependent).'),
    (C + 0x052, C + 0x075, 'code', 'yasser', 'Exit and set-up', 'The exit path, and the screen set-up before typing.'),
    (C + 0x075, C + 0x232, 'code', 'yasser', 'Key filter', 'Reads keys and accepts only those whose bit is set in DS:0282; Backspace, Enter and Esc.', None, '#fx-keys'),
    (C + 0x232, C + 0x288, 'code', 'yasser', 'Screen helpers', 'Cursor and message printing.'),
    (C + 0x288, C + 0x36E, 'code', 'yasser', 'Number reader', 'Turns typed text into a 20-digit fixed-point number (up to 7 integer digits).', None, '#fx-numbers'),
    (C + 0x36E, C + 0x3A4, 'code', 'yasser', 'Run-once block 1', 'Patches 5 bytes of the scrambled credit, then writes RET over its own first byte.', None, '#fx-protect'),
    (C + 0x3A4, C + 0x49D, 'code', 'yasser', 'Table loop', 'Reads the first and last x and works out each row.'),
    (C + 0x49D, C + 0x4E2, 'code', 'yasser', 'Ten\'s complement', 'Negates a number: 9 minus each digit, then + 1.', None, '#fx-numbers'),
    (C + 0x4E2, C + 0x4FC, 'code', 'yasser', 'Carry pass', 'One DIV 10 per digit, right to left.', None, '#fx-math'),
    (C + 0x4FC, C + 0x678, 'code', 'yasser', 'Formula set-up', 'Prepares the formula for one x value.', 'inferred'),
    (C + 0x678, C + 0x707, 'code', 'yasser', 'Add', 'Digit-by-digit addition, then the carry pass.', None, '#fx-math'),
    (C + 0x707, C + 0x832, 'code', 'yasser', 'Multiply', 'Long multiplication: 20 by 20 digits into 40.', None, '#fx-math'),
    (C + 0x832, C + 0xA58, 'code', 'yasser', 'Divide', 'Repeated subtraction; a quotient digit may reach 250 before a carry pass.', None, '#fx-math'),
    (C + 0xA58, C + 0xA6F, 'code', 'yasser', 'Find the innermost bracket', 'Recursive: calls itself for each "(".', None, '#fx-keys'),
    (C + 0xA6F, C + 0xAA4, 'code', 'yasser', 'Run-once block 2', 'Unscrambles the credit: each byte minus the stored byte before it.', None, '#fx-protect'),
    (C + 0xAA4, C + 0xB20, 'code', 'yasser', 'Evaluate one bracket', '* and / first, then + and -.', None, '#fx-keys'),
    (C + 0xB20, C + 0xB56, 'text', 'yasser', 'Scrambled credit', '54 bytes inside the code that become "Yasser Dot Design.. <c>1992 YASSER MOHAMED ALI." at run time.', None, '#fx-protect'),
    (C + 0xB56, C + 0xB73, 'code', 'yasser', 'Write a result into the formula', 'Copies a result string back into the formula text.', 'inferred'),
    (C + 0xB73, C + 0xB9D, 'code', 'yasser', 'Run-once block 3', 'Adds up the code from 035E and adds A517h to the exit jump at 0F13.', None, '#fx-protect'),
    (C + 0xB9D, C + 0xC5B, 'code', 'yasser', 'Number helpers', 'Copy and compare 20-digit numbers.', 'inferred'),
    (C + 0xC5B, C + 0xCE0, 'code', 'yasser', 'Credit writer', 'Writes the unscrambled credit straight into video memory, then returns into the exit.', None, '#fx-protect'),
    (C + 0xCE0, C + 0xF13, 'code', 'yasser', 'Results and errors', 'Prints the result table and the error messages.', 'inferred'),
    (C + 0xF13, C + 0xF16, 'code', 'yasser', 'Patched exit jump', 'Stored as E9 00 00; block 3 turns it into E9 45 FD (to 0C5B).', None, '#fx-protect'),
    (C + 0xF16, C + 0xF3F, 'code', 'yasser', 'Fallback exit path', 'Reached only if the jump was never patched.', 'inferred'),
    (C + 0xF3F, C + 0xF40, 'code', 'yasser', 'Dead RETF', 'Left from a PROC FAR template; nothing reaches it.'),
], [
    (C + 0x075, C + 0x160, 'key_filter', 'Ignores every key whose bit is off in the state byte.', '#fx-keys',
     [(C + 0x079, 'Load the state byte'), (C + 0x0C4, 'Bit off: ignore the key'), (C + 0x11A, 'A point needs bit 40h and no 80h'),
      (C + 0x138, 'After a digit: keep "point seen", allow ) digit op - .'), (C + 0x14D, 'Save the old state for Backspace')]),
    (C + 0x49D, C + 0x4E2, 'tens_complement', 'Negates a 20-digit number.', '#fx-numbers', [(C + 0x4C6, '9 - digit'), (C + 0x4D0, '+1 on the last digit')]),
    (C + 0x4E2, C + 0x4FC, 'carry_pass', 'Normalizes digits above 9.', '#fx-math', [(C + 0x4F2, 'DIV 10: remainder stays, quotient carries')]),
    (C + 0xA6F, C + 0xAA4, 'unscramble_credit', 'Run-once delta decoder.', '#fx-protect', [(C + 0xA75, 'RET over its own first byte'), (C + 0xA8C, 'This byte minus the previous one')]),
    (C + 0xB73, C + 0xB9D, 'checksum_patch', 'Run-once checksum that repairs the exit jump.', '#fx-protect', [(C + 0xB88, 'Sum 52 words from 035E'), (C + 0xB94, 'Add the result into the jump at 0F13')]),
], mz(3, 48))
assert d[48 + C + 0xF13:48 + C + 0xF16] == bytes.fromhex('e90000') and d[48 + 0x282] == 0x2E

# ---------------------------------------------------------------- SCREEN.COM (no header, loads at 0100h)
B = -0x100
d = build('SCREEN_SCREEN.COM', 'SCREEN/SCREEN.COM', B, [
    (0x100, 0x108, 'code', 'yasser', 'Start', 'Points SI at the script and sets EGA mode 10h (640 x 350).'),
    (0x108, 0x12E, 'code', 'yasser', 'Header reader', 'Writes the 5 header bytes into the player\'s own code, then reads the origin.', None, '#scr-patch'),
    (0x12E, 0x14B, 'code', 'yasser', 'Command decoder', 'Stroke, x, w and y commands.', None, '#scr-strokes'),
    (0x14B, 0x16F, 'code', 'yasser', 'End of frame', 'Checks for a key; if none, adds 1 to the color byte at 0179 and redraws line 3.', None, '#scr-loop'),
    (0x16F, 0x195, 'code', 'yasser', 'Stroke drawer', 'Two BIOS pixel calls per pixel: the stroke, then the shadow 2 right and 2 down.', None, '#scr-strokes'),
    (0x195, 0x19C, 'code', 'yasser', 'Key pressed', 'AX = 3 and a jump to the exit code.'),
    (0x19C, 0x54D, 'image', 'yasser', 'Script, line 1', 'محافظة بورسعيد: header 4B 43 00 07 04, 340 strokes, grey with a red shadow.', None, '#scr-strokes'),
    (0x54D, 0xA96, 'image', 'yasser', 'Script, line 2', 'مركز المعلومات و التوثيق: header 4B 43 0D 0E 0E, 476 strokes, yellow, no shadow.', None, '#scr-file'),
    (0xA96, 0xE59, 'image', 'yasser', 'Script, line 3', 'إدارة الحاسب الآلى: header 4B 43 0D 03 0E, 319 strokes, redrawn in a new color each frame. Ends with {.', None, '#scr-loop'),
    (0xE59, 0xE5A, 'data', 'yasser', 'End byte z', 'The end command of the later player (TAHER, DEMO.COM); this player never reads it.'),
    (0xE5A, 0xE65, 'code', 'yasser', 'Exit', 'Text mode, print the credit, int 20h.'),
    (0xE65, 0xEA6, 'text', 'yasser', 'Credit', '"K E M Y A M Software Corp., <C>1991 YASSER MOHAMED ALI." in plain text.', None, '#scr-loop'),
    (0xEA6, 0xEB0, 'unused', 'yasser', 'Stray script bytes', '10 bytes of x commands and strokes after the credit, likely left from a longer earlier build.', 'inferred'),
], [
    (0x108, 0x12E, 'read_header', 'Self-modifying set-up for each line.', '#scr-patch',
     [(0x10B, 'Opcode for x goes to 013B'), (0x111, 'Opcode for w goes to 0143'), (0x117, 'Shadow jump offset goes to 0180'), (0x11D, 'Stroke color goes to 0179'), (0x123, 'Shadow color goes to 0182')]),
    (0x12E, 0x195, 'draw_script', 'The whole drawing engine.', '#scr-strokes',
     [(0x131, 'Below 70h: a stroke'), (0x13B, 'x: dec bx (patched)'), (0x156, 'Key waiting? INT 21h AH=0Bh'), (0x15C, 'Next color, inside the code'),
      (0x178, 'Plot: AH=0Ch, AL patched'), (0x17F, 'Shadow switch: patched jump'), (0x181, 'Shadow pixel, 2 right and 2 down')]),
])
assert d[0x19C - 0x100:0x1A1 - 0x100] == bytes.fromhex('4b43000704')

# ---------------------------------------------------------------- TAHER.COM
d = build('TAHER_TAHER.COM', 'TAHER/TAHER.COM', B, [
    (0x100, 0x113, 'code', 'yasser', 'Credit decoder', 'Subtracts 4, 5, 6 and so on from the 65 credit bytes at 01AB.', None, '#th-credit'),
    (0x113, 0x141, 'code', 'yasser', 'Header reader', 'Mode 10h, then the 5 header bytes are written into the player\'s code.', None, '#th-file'),
    (0x141, 0x189, 'code', 'yasser', 'Command decoder and stroke drawer', 'The screensaver player, plus the z and 88h commands.', None, '#th-commands'),
    (0x189, 0x194, 'code', 'yasser', 'Pause (88h)', '4,096 key-status calls that ignore the answer, then mode 10h again (clear) and the next picture.', None, '#th-commands'),
    (0x194, 0x1AB, 'code', 'yasser', 'End (z)', 'The same wait, text mode, print the decoded credit, int 20h.', None, '#th-commands'),
    (0x1AB, 0x1EC, 'text', 'yasser', 'Scrambled credit', '65 bytes that become "K E M Y A M Software Corp., <c>1991 YASSER MOHAMED ALI." at start-up.', None, '#th-credit'),
    (0x1EC, 0xA29, 'image', 'yasser', 'Script: the name', 'طاهر ابراهيم الصرفي in one line: header 4B 43 00 07 04, 901 strokes, 297 column steps, ends with z.', None, '#th-file'),
    (0xA29, 0xA2A, 'unused', 'yasser', 'End-of-file byte', '1Ah, the DOS end-of-file mark.'),
], [
    (0x100, 0x113, 'decode_credit', 'Position-keyed subtraction.', '#th-credit', [(0x10A, 'Byte minus key'), (0x10F, 'Next key')]),
    (0x141, 0x1AB, 'draw_script', 'The screensaver player with a pause and an end command.', '#th-commands',
     [(0x159, 'z: end'), (0x15E, '88h: next picture'), (0x18C, 'Wait: 4,096 key checks, answer ignored'), (0x1A2, 'Print the decoded credit')]),
])

# ---------------------------------------------------------------- PESM.EXE (48-byte header, image = segment 0)
d = build('PESM_PESM.EXE', 'PESM/PESM.EXE', 48, [
    (0x0000, 0x00FC, 'code', 'yasser', 'Main: 16 calls', 'Mode 12h, then 16 copies of "set DX, AX, CX, BX, call 0284", then exit (with a dead RET at 00FB). No return to text mode.', None, '#pm-calls'),
    (0x00FC, 0x0284, 'text', 'yasser', '16 strings', 'fsl hggi hgvplk hgvpdl (the Basmala on an Arabic keyboard), each with its own style keys in front.', None, '#pm-calls'),
    (0x0284, 0x02C4, 'code', 'yasser', 'Engine entry', 'Saves the ARABART-style registers and translates each key into a glyph code, in place.', None, '#pm-shaping'),
    (0x02C4, 0x034C, 'code', 'yasser', 'Shaper', '136 bytes identical to ARABART 4.15: two neighbors stay joined only if both join bits allow it.', None, '#pm-shaping'),
    (0x034C, 0x05B4, 'code', 'yasser', 'Glyph drawing', 'Styles, glyph runs and VGA graphics controller writes.', 'inferred', '#pm-engine'),
    (0x05B4, 0x05C8, 'data', 'yasser', 'Engine variables', 'Text address, x, y, color and style flags.'),
    (0x05C8, 0x0601, 'text', 'yasser', 'Unused strings', 'His name and "مركز النور للكومبيوتر" typed as keyboard keys; never drawn, likely left from another program.', 'inferred', '#pm-him'),
    (0x0601, 0x09E9, 'table', 'yasser', 'Row address table', '500 entries, 80 bytes apart: the start of each VGA row.'),
    (0x09E9, 0x09FB, 'table', 'yasser', 'VGA tables', 'Segment A000h, the bit-reverse table 0 4 2 6 1 5 3 7, and pixel masks 80h to 01h.'),
    (0x09FB, 0x0A5B, 'table', 'yasser', 'Key to glyph table', '96 entries for ASCII 20h-7Fh; the top two bits of each code are the join bits.', None, '#pm-shaping'),
    (0x0A5B, 0x0A76, 'table', 'yasser', 'Font pointers', 'Font count and pointer.'),
    (0x0A76, 0x17D0, 'font', 'yasser', 'Font', 'Glyph pointer table and glyph runs. 2,758 of these bytes are identical to ARABART 4.15.', None, '#pm-engine'),
], [
    (0x0284, 0x02C4, 'arabart_entry', 'The same registers as the ARABART TSR, reached with CALL instead of INT 10h.', '#pm-engine',
     [(0x028E, 'AL = color'), (0x02B3, 'Key to glyph code through the table at 09FB'), (0x02B8, 'Written back over the text')]),
    (0x0007, 0x00F7, 'sixteen_calls', 'Every mix of bold, underline and italic, at two sizes.', '#pm-calls', [(0x0013, 'First call: white, x 600, y 60'), (0x007F, 'Call 9: *$ resets and doubles the size')]),
], mz(1, 48))
assert d[48 + 0x9FB + ord('f') - 0x20] == 0xE8
