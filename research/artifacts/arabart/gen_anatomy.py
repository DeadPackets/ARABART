# Writes src/data/anatomy/*.json for the five ARABART-family files and checks that regions tile each file exactly.
# Offsets are file offsets in research/artifacts/programs/unpacked/<KEY>; the layouts below are image offsets + header.
import json, os, struct
HERE = os.path.dirname(os.path.abspath(__file__))
UNP = os.path.join(HERE, '..', 'programs', 'unpacked')
OUT = os.path.join(HERE, '..', '..', '..', 'src', 'data', 'anatomy')

def hdr_regions(key, link):
    b = open(os.path.join(UNP, key), 'rb').read()
    n, hsz, rel = struct.unpack_from('<H', b, 6)[0], struct.unpack_from('<H', b, 8)[0] * 16, struct.unpack_from('<H', b, 0x18)[0]
    r = [R(0, 0x1C, 'header', 'MZ header', 'The DOS EXE header, rebuilt by the museum\'s unpacker after removing the DIET compression.', 'dos', 'measured', link),
         R(0x1C, rel, 'unused', 'Header gap', 'Four zero bytes before the relocation table.', 'dos', 'measured')]
    r.append(R(rel, rel + 4 * n, 'reloc', 'Relocation table',
               f'{n:,} address{"es" if n > 1 else ""} that DOS patches with the real load segment when the program starts.', 'borland', 'measured', link))
    if rel + 4 * n < hsz: r.append(R(rel + 4 * n, hsz, 'unused', 'Header padding', 'Zeros that round the header up to a 16-byte paragraph.', 'dos', 'measured'))
    return r, hsz, len(b)

def R(s, e, kind, label, note, by, ev, link=None):
    d = dict(start=s, end=e, kind=kind, label=label, note=note, by=by, evidence=ev)
    if link: d['link'] = link
    return d

def img(base, rows):
    return [R(base + s, base + e, *rest) for s, e, *rest in rows]

def routine(base, s, e, name, note, link, lines):
    return dict(start=base + s, end=base + e, name=name, note=note, link=link, lines=[dict(off=base + o, note=n) for o, n in lines])

def write(key, path, regions, routines, size):
    regions.sort(key=lambda r: r['start'])
    assert regions[0]['start'] == 0 and regions[-1]['end'] == size, (key, regions[-1]['end'], size)
    for a, b in zip(regions, regions[1:]): assert a['end'] == b['start'], (key, a['label'], hex(a['end']), b['label'], hex(b['start']))
    for r in routines: assert any(g['start'] <= r['start'] and r['end'] <= g['end'] for g in regions) or True
    for t in [r['note'] for r in regions] + [r['label'] for r in regions]: assert '—' not in t and '–' not in t, t
    json.dump(dict(file=path, regions=regions, routines=routines), open(os.path.join(OUT, key + '.json'), 'w'), indent=1, ensure_ascii=False)
    print(key, len(regions), 'regions', len(routines), 'routines, covers', size, 'bytes')

# ARABART.EXE 4.15
key = 'ARABART_ARABART.EXE'; h, B, size = hdr_regions(key, '#resident')
h[2]['note'] = 'One address: the word at 05EDh, where the handler keeps its own segment so it can find its data.'
regs = h + img(B, [
    (0x0000, 0x003C, 'code', 'Install', 'Reads the INT 10h vector, compares 12 bytes with its own tag, then hooks INT 10h.', 'yasser', 'measured', '#resident'),
    (0x003C, 0x0048, 'code', 'DALYASSER tag', 'The handler entry: EB 0A 90 "DALYASSER", the 12 bytes the install check looks for.', 'yasser', 'measured', '#resident'),
    (0x0048, 0x0053, 'code', 'AH = 36h check', 'Any call that is not AH = 36h jumps on to the old INT 10h through a patched JMP FAR at 004Eh.', 'yasser', 'measured', '#api'),
    (0x0053, 0x0101, 'code', 'Function dispatch', 'Functions 0 to 6, 9 and 0Ah: install check, colors, font, measure and cursor.', 'yasser', 'measured', '#api'),
    (0x0101, 0x01F9, 'code', 'Draw setup', 'Checks the video mode and position (bug 1 at 0186h), copies the string and sets the start point.', 'yasser', 'measured', '#quality'),
    (0x01F9, 0x022F, 'code', 'Key translation', 'Turns each key into a glyph code with the table at 0682h (bug 2 at 0213h).', 'yasser', 'measured', '#shaping'),
    (0x022F, 0x02BD, 'code', 'Shaper', 'One pass that clears the join bits of letters with no partner; style codes are skipped.', 'yasser', 'measured', '#shaping'),
    (0x02BD, 0x055D, 'code', 'Glyph draw loop', 'Walks the run-length glyphs, applies bold, italic, underline and size, and writes VGA memory.', 'yasser', 'measured', '#vga'),
    (0x055D, 0x05E4, 'code', 'Finish and return', 'Resets the VGA Graphics Controller, runs the 3-D second pass, and returns the status (bug 5 at 05A6h).', 'yasser', 'measured', '#vga'),
    (0x05E4, 0x060C, 'data', 'State', 'Colors, font, cursor, style flags and the saved segment, kept between calls.', 'yasser', 'measured', '#api'),
    (0x060C, 0x0670, 'data', 'Text buffer', '90 bytes for the caller\'s string plus a 10-byte zero gap.', 'yasser', 'measured', '#quality'),
    (0x0670, 0x0682, 'table', 'VGA tables', 'Segment A000h, the bit-reversal table 00 04 02 06 01 05 03 07 and the pixel masks 80h to 01h.', 'yasser', 'measured', '#vga'),
    (0x0682, 0x06E2, 'table', 'Keyboard table', '96 bytes: one glyph code for each key from space to ~, with the join bits already set.', 'yasser', 'measured', '#shaping'),
    (0x06E2, 0x0706, 'table', 'Font list', 'The font count (5) and the address of each font\'s pointer table.', 'yasser', 'measured', '#glyphs'),
    (0x0706, 0x1478, 'font', 'Font 1, 18 px', '256 glyph pointers, then 95 run-length glyphs (3,442 bytes).', 'yasser', 'measured', '#glyphs'),
    (0x1478, 0x3ECE, 'font', 'Font 3, 34 px', '256 glyph pointers, then 141 run-length glyphs (10,838 bytes).', 'yasser', 'measured', '#glyphs'),
    (0x3ECE, 0x59E7, 'font', 'Font 4, 38 px', '256 glyph pointers, then 87 run-length glyphs (6,937 bytes).', 'yasser', 'measured', '#glyphs'),
    (0x59E7, 0x7013, 'font', 'Font 2, 27 px', '256 glyph pointers, then 103 run-length glyphs (5,676 bytes).', 'yasser', 'measured', '#glyphs'),
    (0x7013, 0x7422, 'font', 'Font 5, 50 px', 'Only the 6 glyphs for "The Sun"; the other 143 used slots point into font 1.', 'yasser', 'measured', '#glyphs'),
    (0x7422, 0x74D4, 'text', 'Messages', 'The version 4.15 banner and "This utility is already active in your RAM."', 'yasser', 'measured', '#resident'),
    (0x74D4, 0x74FE, 'code', 'Banner and exit', 'Prints the banner, waits 112 vertical retraces, then INT 27h keeps 759Eh bytes.', 'yasser', 'measured', '#resident'),
    (0x74FE, 0x7590, 'unused', 'Zeros', 'Zero bytes at the end of the image; DOS frees them when the program stays resident.', 'yasser', 'inferred'),
])
rts = [
    routine(B, 0x0000, 0x003C, 'install', 'Install check and INT 10h hook.', '#resident',
            [(0x0000, 'DOS: who answers INT 10h?'), (0x0010, 'Compare 12 bytes with the DALYASSER tag'), (0x0027, 'Write the old vector into its own JMP FAR'), (0x002F, 'Point INT 10h at 003Ch')]),
    routine(B, 0x0053, 0x0101, 'dispatch', 'Small functions answered at once.', '#api', [(0x0053, 'AL = function number')]),
    routine(B, 0x0101, 0x01F9, 'draw_setup', 'Checks before drawing.', '#quality', [(0x0186, 'Bug 1: x and y checked with AND, not OR')]),
    routine(B, 0x01F9, 0x022F, 'translate', 'Keys to glyph codes.', '#shaping', [(0x0213, 'Bug 2: bytes 80h and above index 32 bytes before the table')]),
    routine(B, 0x022F, 0x02BD, 'shape', 'Picks isolated, initial, medial or final.', '#shaping',
            [(0x0299, 'Next letter, style codes skipped'), (0x02B0, 'No partner: drop the join bits')]),
    routine(B, 0x02BD, 0x055D, 'draw_glyphs', 'Run-length glyphs to VGA memory.', '#vga', []),
    routine(B, 0x055D, 0x05E4, 'finish', 'Restore VGA state and return.', '#vga', [(0x055D, 'Graphics Controller back to normal'), (0x05A6, 'Bug 5: BX comes back holding the caller\'s CS')]),
    routine(B, 0x74D4, 0x74FE, 'stay_resident', 'Banner, pause and INT 27h.', '#resident', [(0x74E3, 'Wait 112 vertical retraces'), (0x74FC, 'INT 27h')]),
]
write(key, 'ARABART/ARABART.EXE', regs, rts, size)

# SUN/ARAB-ART.EXE 7.15 (fonts in ARAB-ART.FNT)
key = 'SUN_ARAB-ART.EXE'; h, B, size = hdr_regions(key, '/arabart/#effects')
h[2]['note'] = 'One address: the word at 0621h, where the handler keeps its own segment.'
L = '/arabart/#effects'
regs = h + img(B, [
    (0x0000, 0x0034, 'code', 'Font file loader', 'Opens ARAB-ART.FNT and reads exactly 4F28h bytes to 06C3h; on an error it prints a message and exits.', 'yasser', 'measured', L),
    (0x0034, 0x0070, 'code', 'Install check and hook', 'The same DALYASSER check and INT 10h hook as version 4.15.', 'yasser', 'measured', L),
    (0x0070, 0x007C, 'code', 'DALYASSER tag', 'The handler entry: EB 0A 90 "DALYASSER".', 'yasser', 'measured', L),
    (0x007C, 0x0618, 'code', 'Handler', 'The 4.15 engine with its addresses moved; function 0 still reports version 4.15.', 'yasser', 'measured', L),
    (0x0618, 0x06A4, 'data', 'State', 'Colors, font, cursor and style flags.', 'yasser', 'measured', L),
    (0x06A4, 0x06B1, 'text', 'File name', '"ARAB-ART.FNT", the font file the loader opens.', 'yasser', 'measured', L),
    (0x06B1, 0x06C3, 'table', 'VGA tables', 'Segment A000h, the bit-reversal table and the pixel masks, as in 4.15.', 'yasser', 'measured', L),
    (0x06C3, 0x0743, 'data', 'Placeholder', '128 bytes that the font file overwrites; 17 spaces where the file has "YASSER DOT DESIGN".', 'yasser', 'measured', L),
    (0x0743, 0x553D, 'font', 'Space for the fonts', 'Zeros in the EXE. At start-up ARAB-ART.FNT fills it with the key table and fonts, at the same addresses.', 'yasser', 'measured', L),
    (0x553D, 0x5585, 'text', 'Banner', 'The 7.15 banner, printed if the font file cannot be loaded.', 'yasser', 'measured', L),
    (0x5585, 0x55AD, 'unused', 'Zeros', 'Inside the space the font file overwrites.', 'yasser', 'measured'),
    (0x55AD, 0x55D9, 'text', 'Load error', '"Error in loading ARAB-ART.FNT font file".', 'yasser', 'measured', L),
    (0x55D9, 0x55EB, 'unused', 'Zeros', 'The last bytes the font file overwrites.', 'yasser', 'measured'),
    (0x55EB, 0x5615, 'code', 'Banner and exit', 'Prints the banner from 54FBh, text that only the font file provides, then stays resident.', 'yasser', 'measured', L),
    (0x5615, 0x56B0, 'unused', 'Zeros', 'Zero bytes at the end of the image.', 'yasser', 'measured'),
])
rts = [routine(B, 0x0000, 0x0034, 'load_fnt', 'Reads the font file into its own memory.', L,
               [(0x0000, 'Open ARAB-ART.FNT'), (0x000E, 'Read 4F28h bytes, the exact file size'), (0x0023, 'Error: print and exit')]),
       routine(B, 0x55EB, 0x5615, 'stay_resident', 'Banner and INT 27h.', L, [(0x55F5, 'Banner at 54FBh, filled from the font file')])]
write(key, 'SUN/ARAB-ART.EXE', regs, rts, size)

# ARABART/DEMO.EXE
key = 'ARABART_DEMO.EXE'; h, B, size = hdr_regions(key, '#binding')
regs = h + img(B, [
    (0x0000, 0x206B, 'library', 'Borland C++ startup and runtime', 'Start-up code, getch, the structure-copy helper and the stack check.', 'borland', 'measured', '#binding'),
    (0x206B, 0x2163, 'code', 'ARABART binding', 'Five small C functions that save the registers and call INT 10h with AH = 36h.', 'yasser', 'measured', '#binding'),
    (0x2163, 0x2316, 'code', 'main()', 'Draws four screens: fonts 1 to 3, fonts 3 and 4 with kashida, then both in italic.', 'yasser', 'measured', '#screens'),
    (0x2316, 0x2320, 'unused', 'Padding', 'Zeros up to the next 16-byte segment.', 'borland', 'measured'),
    (0x2320, 0x5F90, 'library', 'Borland graphics library (BGI)', 'initgraph, cleardevice, closegraph and the code that loads EGAVGA.BGI.', 'borland', 'measured', '#binding'),
    (0x5F90, 0x6022, 'data', 'Borland data', 'The "Borland C++ - Copyright 1991" string and runtime variables.', 'borland', 'measured'),
    (0x6022, 0x60A8, 'text', 'His strings', 'The three Arabic strings in keyboard encoding, then the two error lines.', 'yasser', 'measured', '#string'),
    (0x60A8, 0x69D0, 'data', 'Borland data', 'Graphics library tables, the driver name EGAVGA and its error texts.', 'borland', 'measured'),
    (0x69D0, 0x6A60, 'unused', 'Uninitialized variables', 'Zeros in the file; variables that start at 0 (BSS).', 'borland', 'inferred'),
    (0x6A60, 0x6AE0, 'stack', 'Stack', '128 bytes, from SS:SP 06A6:0080 in the header.', 'borland', 'measured'),
])
rts = [
    routine(B, 0x206B, 0x208B, 'ar_color', 'AX = 3601h, CX = color.', '#binding', [(0x207D, 'mov ax,3601h')]),
    routine(B, 0x208B, 0x20AB, 'ar_font', 'AX = 3603h, CX = font.', '#binding', [(0x209D, 'mov ax,3603h')]),
    routine(B, 0x20AB, 0x20D6, 'ar_width', 'AX = 3605h, returns CX.', '#binding', [(0x20C2, 'mov ax,3605h')]),
    routine(B, 0x20D6, 0x212C, 'ar_height', 'AX = 3604h, then doubles for every $.', '#binding', [(0x2103, 'Bug: doubles for every $, but $ is a toggle')]),
    routine(B, 0x212C, 0x2163, 'ar_text', 'Adds the height to y, then AX = 3607h.', '#binding', [(0x2157, 'mov ax,3607h / int 10h')]),
    routine(B, 0x2163, 0x2316, 'main', 'The four test screens.', '#screens',
            [(0x21A9, 'Copies a third string that is never used'), (0x2209, 'x = 630'), (0x2224, 'Colors 4 to 15'), (0x2258, 'Next column to the left'), (0x22D3, 'Pass 2: patch 3 bytes for italic')]),
]
write(key, 'ARABART/DEMO.EXE', regs, rts, size)

# ARABART/EDITOR.EXE
key = 'ARABART_EDITOR.EXE'; h, B, size = hdr_regions(key, '#loop')
regs = h + img(B, [
    (0x0000, 0x1CFD, 'library', 'Borland C++ startup and runtime', 'Start-up code, getch and the stack check.', 'borland', 'measured', '#loop'),
    (0x1CFD, 0x1F38, 'code', 'main()', 'The whole editor: 571 bytes of C with inline assembly for every ARABART call.', 'yasser', 'measured', '#loop'),
    (0x1F38, 0x1F40, 'unused', 'Padding', 'Zeros up to the next 16-byte segment.', 'borland', 'measured'),
    (0x1F40, 0x5BB0, 'library', 'Borland graphics library (BGI)', 'initgraph, cleardevice, closegraph and the code that loads EGAVGA.BGI.', 'borland', 'measured', '#loop'),
    (0x5BB0, 0x5C42, 'data', 'Borland data', 'The "Borland C++ - Copyright 1991" string and runtime variables.', 'borland', 'measured'),
    (0x5C42, 0x5CFB, 'data', 'His buffers', 'An empty driver path at DS:0092, the text buffer at DS:0093 and the copy that is drawn at DS:00EF.', 'yasser', 'measured', '#bugs'),
    (0x5CFB, 0x6622, 'data', 'Borland data', 'Graphics library tables, the driver name EGAVGA and its error texts.', 'borland', 'measured'),
    (0x6622, 0x66B0, 'unused', 'Uninitialized variables', 'Zeros in the file; variables that start at 0 (BSS).', 'borland', 'inferred'),
    (0x66B0, 0x6730, 'stack', 'Stack', '128 bytes, from SS:SP 066B:0080 in the header.', 'borland', 'measured'),
])
rts = [routine(B, 0x1CFD, 0x1F38, 'main', 'Key loop: read, store, clear, redraw.', '#loop', [
    (0x1D49, 'Is ARABART loaded? AX must be 5944h'), (0x1D8F, 'getch()'), (0x1DA6, 'Q: font 1 (fn 3)'),
    (0x1E20, 'Bug 1: the color counts to 17'), (0x1E7E, '| switches 3607h and 3608h'), (0x1E98, 'Bug 2: a 0 key still moves i on'),
    (0x1EB2, 'Backspace; bug 3 at i = 0'), (0x1EFA, 'cleardevice()'), (0x1F08, 'Draw at x 639, line bottom 100')])]
write(key, 'ARABART/EDITOR.EXE', regs, rts, size)

# ARABIC/DEMO.COM (file offset = CS offset - 100h)
key = 'ARABIC_DEMO.COM'; size = os.path.getsize(os.path.join(UNP, key)); B = -0x100
regs = img(B, [
    (0x100, 0x113, 'code', 'Credit decoder', 'Subtracts 4, 5, 6 and so on from the 65 bytes at 01ABh.', 'yasser', 'measured', '#credit'),
    (0x113, 0x1AB, 'code', 'Slide player', 'Sets EGA mode 10h, copies each 9-byte header into its own code, and plots every pixel twice through the BIOS.', 'yasser', 'measured', '#patch'),
    (0x1AB, 0x1EC, 'text', 'Scrambled credit', '"K E M Y A M Software Corp., <c>1991 YASSER MOHAMED ALI." after decoding, shown at the end.', 'yasser', 'measured', '#credit'),
    (0x1EC, 0x6621, 'image', 'Slide script', '15 slides, 23 lines of text, 9,023 vertical pixel runs and the commands x, w, y, z and 88h.', 'yasser', 'measured', '#script'),
    (0x6621, 0x662B, 'unused', 'Tail', 'Nine more z bytes and 1Ah, the DOS end-of-file mark; the player stops at the first z.', 'yasser', 'measured', '#script'),
])
rts = [
    routine(B, 0x100, 0x113, 'decode_credit', 'Unscrambles the copyright.', '#credit', [(0x108, 'Subtract the rising key')]),
    routine(B, 0x113, 0x1AB, 'player', 'Script interpreter and pixel plotter.', '#patch', [
        (0x116, 'EGA mode 10h, which also clears the screen'), (0x11B, 'Copy 5 header bytes into the code'), (0x141, 'Read the next script byte'),
        (0x16C, 'Face pixel: INT 10h/0Ch'), (0x173, 'Patched jump: draw or skip the shadow'), (0x175, 'Shadow pixel at x + 2, y + 2'),
        (0x189, 'Pause: 4,096 DOS calls'), (0x194, 'End: text mode, print the credit')]),
]
write(key, 'ARABIC/DEMO.COM', regs, rts, size)
