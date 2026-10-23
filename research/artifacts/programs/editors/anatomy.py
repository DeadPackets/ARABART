# Writes src/data/anatomy/{EDIT_EDITOR.EXE,EDIT_EDIT.EXE,WINKEY_WINKEY.EXE}.json. Offsets are file offsets into the unpacked images (MZ header included).
import json, os
OUT = '/Users/deadpackets/workspace/DOSArchive/src/data/anatomy'
UNP = '/Users/deadpackets/workspace/DOSArchive/research/artifacts/programs/unpacked'
def R(s, e, kind, label, note, by, ev='measured', link=None):
    r = dict(start=s, end=e, kind=kind, label=label, note=note, by=by, evidence=ev)
    if link: r['link'] = link
    return r
def F(s, e, name, note, link, lines=()):
    return dict(start=s, end=e, name=name, note=note, link=link, lines=[dict(off=o, note=n) for o, n in lines])
def write(name, file, regions, routines):
    size = os.path.getsize(f'{UNP}/{name}')
    pos = 0
    for r in regions:
        assert r['start'] == pos, (name, r['label'], hex(r['start']), hex(pos)); assert r['end'] > r['start']; pos = r['end']
    assert pos == size, (name, hex(pos), hex(size))
    for f in routines:
        assert any(r['start'] <= f['start'] and f['end'] <= r['end'] for r in regions), f['name']
        for l in f['lines']: assert f['start'] <= l['off'] < f['end'], (f['name'], hex(l['off']))
    json.dump(dict(file=file, regions=regions, routines=routines), open(f'{OUT}/{name}.json', 'w'), indent=1)
    print(name, len(regions), 'regions', len(routines), 'routines')

# EDITOR.EXE: header 0x6E0, DGROUP at file 0x7D00
H = 0x6E0; S01F6 = H + 0x1F60; S027A = H + 0x27A0; DG = H + 0x7620
write('EDIT_EDITOR.EXE', 'EDIT/EDITOR.EXE', [
    R(0, 0x20, 'header', 'MZ header', 'DOS EXE header: 432 relocations, initial stack at 08AB:0080. Rebuilt by the museum unpacker after removing DIET.', 'dos'),
    R(0x20, H, 'reloc', 'Relocation table', '432 far addresses that DOS adjusts for the load segment, 4 bytes each.', 'dos'),
    R(H, H + 0x217, 'startup', 'Borland C++ start-up (c0)', 'Sets up segments and the stack, clears the zero-filled data, takes over the divide-error interrupt, calls main.', 'borland'),
    R(H + 0x217, S01F6 + 0xE, 'library', 'Borland C++ runtime library', 'C library code: bioskey, new and delete, fopen, fgetc, fputc, memmove, strlen and more (7,511 bytes).', 'borland', link='#ed-build'),
    R(S01F6 + 0xE, H + 0x2624, 'code', 'WINGRAPH.CPP', 'His screen code: palette, title bar, menu bar, the File menu with its save-under, the status bar. 1,718 bytes from 159 source lines.', 'yasser', link='#ed-screen'),
    R(H + 0x2624, H + 0x27AD, 'code', 'EDITOR.CPP', 'main: starts graphics, reads keys with bioskey and dispatches them through a 22-entry key table. 393 bytes from 119 lines.', 'yasser', link='#ed-build'),
    R(H + 0x27AD, H + 0x39A3, 'code', 'FUNCTION.CPP', 'The editor: insert, Enter, Delete, Backspace, cursor, redraw, load, save and the file dialog. 4,598 bytes from 560 lines.', 'yasser', link='#ed-buffer'),
    R(H + 0x39A3, H + 0x39B0, 'unused', 'Alignment padding', 'Zero bytes the linker adds so the next segment starts on a 16-byte boundary.', 'borland'),
    R(H + 0x39B0, DG, 'library', 'BGI graphics library', 'Borland Graphics Interface: initgraph, bar, line, rectangle, outtextxy, getimage, putimage and more (15,472 bytes). The card driver loads from EGAVGA.BGI.', 'borland', link='#ed-screen'),
    R(DG, DG + 0x92, 'data', 'Runtime data', 'Borland copyright string and runtime variables.', 'borland'),
    R(DG + 0x92, DG + 0x1C6, 'text', 'His strings and flags', 'Menu items, status-bar help lines, TEST-EDITOR, INS ON/OFF, dialog texts; the insert flag (015Eh) and the line count (015Fh).', 'yasser', link='#ed-screen'),
    R(DG + 0x1C6, DG + 0xA72, 'data', 'Runtime and BGI data', 'Stack limit, file table, graphics driver names and BGI error messages.', 'borland'),
    R(DG + 0xA72, DG + 0x13D6, 'table', 'Line table', '601 far pointers, one per line of text. Zero in the file; filled while the editor runs.', 'yasser', link='#ed-buffer'),
    R(DG + 0x13D6, DG + 0x13EA, 'data', 'Cursor and screen variables', 'Screen column (13DAh), row, column in the line, current line, line height 12 and character width 8.', 'yasser', link='#ed-buffer'),
    R(DG + 0x13EA, DG + 0x1490, 'data', 'Runtime zero-filled data', 'Work space for the runtime library, cleared at start-up.', 'borland', 'inferred'),
    R(DG + 0x1490, 0x9210, 'stack', 'Initial stack', '128 bytes at 08AB:0080, from the header.', 'borland'),
], [
    F(S01F6 + 0x0E, S01F6 + 0x8A, 'set_palette', 'Reads the palette, then sets 5 entries: red, white, light gray, dark gray and blue.', '#ed-screen',
      [(S01F6 + 0x22, 'getpalette'), (S01F6 + 0x34, 'Color 12 becomes pure red (63,0,0): the cursor color')]),
    F(S01F6 + 0x8A, S01F6 + 0x244, 'draw_screen', 'Clears the screen to white and draws the title bar, menu bar and status bar.', '#ed-screen'),
    F(S01F6 + 0x279, H + 0x2624, 'file_menu', 'The File drop-down: saves the screen behind it, lists 4 items and writes each help line in the status bar at y 462.', '#ed-screen',
      [(S01F6 + 0x3DC, 'outtextxy at y 462: the help line')]),
    F(H + 0x2624, H + 0x27AD, 'main', 'Reads a key with bioskey(0), then jumps through a 22-entry table at 0262:0135.', '#ed-him'),
    F(S027A + 0x40, S027A + 0x5E, 'exit_editor', 'Frees every line, closes graphics, then ends with INT 21h AH=4Ch directly.', '#ed-bugs',
      [(S027A + 0x58, 'Raw DOS exit: skips the runtime clean-up')]),
    F(S027A + 0x1CF, S027A + 0x296, 'toggle_cursor', 'Draws 3 thin rectangles in XOR mode with color 3; called again to erase.', '#ed-screen',
      [(S027A + 0x1DF, 'setwritemode(1): XOR'), (S027A + 0x28E, 'setwritemode(0): normal again')]),
    F(S027A + 0x34E, S027A + 0x458, 'insert_char', 'Opens a gap in the 204-byte line with memmove, then stores the character.', '#ed-buffer',
      [(S027A + 0x375, 'Line full (204) in insert mode: ignore'), (S027A + 0x3CC, 'memmove(line+col+1, line+col, 204-col)'), (S027A + 0x40E, 'Store the character')]),
    F(S027A + 0x458, S027A + 0x50C, 'redraw_lines', 'Clears a band of the text area and draws each line again with outtextxy.', '#ed-screen'),
    F(S027A + 0x50C, S027A + 0x66E, 'new_line', 'Enter: moves the later line pointers down, makes a new 204-byte line and moves the text after the cursor into it.', '#ed-buffer',
      [(S027A + 0x5DA, 'memmove: the text after the cursor moves to the new line')]),
    F(S027A + 0x96D, S027A + 0xACF, 'load_file', 'Reads the file a byte at a time; Tab becomes 6 spaces and long lines wrap at 201.', '#ed-bugs',
      [(S027A + 0xA0E, 'fgetc'), (S027A + 0xA7A, 'End-of-file test after the byte is stored: the stray FFh')]),
    F(S027A + 0xACF, S027A + 0xB66, 'save_file', 'Asks for a name, opens it in text mode and writes every character with fputc.', '#ed-bugs'),
    F(S027A + 0xB66, S027A + 0xD9D, 'file_dialog', 'Asks for a file name of up to 13 characters in a box that saves the screen behind it.', '#ed-screen'),
    F(S027A + 0xF41, S027A + 0x10AD, 'delete_char', 'Delete: at the end of a line it joins the next line; otherwise it shifts the line left with a wrong length.', '#ed-bugs',
      [(S027A + 0xF67, 'si = strlen(line)'), (S027A + 0x108E, 'memmove(line+col, line+col+1, strlen+1): too long')]),
])

# EDIT.EXE: header 0x14D0, DGROUP at file 0x123F0
H = 0x14D0; DG = H + 0x10F20
seg = lambda s: H + s * 16
write('EDIT_EDIT.EXE', 'EDIT/EDIT.EXE', [
    R(0, 0x20, 'header', 'MZ header', 'DOS EXE header: 1,322 relocations, initial stack at 1201:0080. Rebuilt by the museum unpacker after removing DIET.', 'dos'),
    R(0x20, 0x14C8, 'reloc', 'Relocation table', '1,322 far addresses that DOS adjusts for the load segment, 4 bytes each.', 'dos'),
    R(0x14C8, H, 'unused', 'Header padding', 'Zero bytes that round the header up to 333 paragraphs.', 'dos'),
    R(H, H + 0x217, 'startup', 'Borland C++ start-up (c0)', 'Sets up segments and the stack, clears the zero-filled data, calls main.', 'borland'),
    R(H + 0x217, seg(0x2D1), 'library', 'Borland C++ runtime library', 'C and C++ library code: operator new and delete, file I/O, memset, movmem and more.', 'borland', link='#eg-reuse'),
    R(seg(0x2D1), seg(0x473), 'code', 'TextEditor class (segment 02D1)', 'The only new segment: 22 functions, 6,688 bytes, none of them in Digi-Test. Lines, typing, cursor moves, load and save.', 'yasser', link='#eg-class'),
    R(seg(0x473), seg(0x4BB), 'code', 'Key loop and window helpers (0473)', 'The key loop at 0473:01A9 is new; 3 of the 5 compared functions match Digi-Test.', 'yasser', link='#eg-virtual'),
    R(seg(0x4BB), seg(0x541), 'code', 'Digi-Test code (04BB)', '7 of 8 compared functions match Digi-Test instruction for instruction.', 'yasser', link='#eg-reuse'),
    R(seg(0x541), seg(0x917), 'code', 'main, menus and dialogs (0541)', 'main at 0541:0003 is new; 40 of the other 42 compared functions match Digi-Test (14,384 of 15,709 bytes).', 'yasser', link='#eg-reuse'),
    R(seg(0x917), seg(0x92A), 'code', 'New helper (0917)', 'One function, 303 bytes, not in Digi-Test.', 'yasser'),
    R(seg(0x92A), seg(0xB23), 'code', 'Digi-Test code (092A)', '9 of 10 compared functions match Digi-Test, including one of 2,138 instructions.', 'yasser', link='#eg-reuse'),
    R(seg(0xB23), seg(0xB2D), 'code', 'Keyboard helpers (0B23)', '3 small functions, all from Digi-Test; 0B23:000C reads a key.', 'yasser', link='#eg-virtual'),
    R(seg(0xB2D), seg(0xD2B), 'code', 'Window classes (0B2D)', 'The Digi-Test window base class and drawing helpers: 27 of 32 compared functions match.', 'yasser', link='#eg-class'),
    R(seg(0xD2B), DG, 'library', 'BGI graphics library', 'Borland Graphics Interface, byte for byte the same as in EDITOR.EXE apart from one data segment value (15,472 bytes).', 'borland'),
    R(DG, DG + 0x5A, 'data', 'Runtime data', 'Borland copyright string and runtime error messages.', 'borland'),
    R(DG + 0x5A, DG + 0x8F5, 'text', 'His strings and method tables', 'NONAME.TXT, the TextEditor method table at 00ADh, menus and help lines, many left over from Digi-Test. Both ends are approximate.', 'yasser', 'inferred', link='#eg-reuse'),
    R(DG + 0x8F5, DG + 0x1042, 'data', 'Runtime and BGI data', 'Graphics card names, BGI error messages and runtime tables.', 'borland', 'inferred'),
    R(DG + 0x1042, DG + 0x10F0, 'data', 'Zero-filled data', 'Cleared at start-up (1042h to 10E6h). 1042h holds the application object that main runs.', 'unknown', 'inferred', link='#eg-virtual'),
    R(DG + 0x10F0, 0x13560, 'stack', 'Initial stack', '128 bytes at 1201:0080, from the header.', 'borland'),
], [
    F(seg(0x2D1) + 0x3, seg(0x2D1) + 0x1E7, 'TextEditor::TextEditor', 'Constructor: allocates the 80-byte object if needed, calls the Digi-Test window constructor, sets the method table, makes the 500-slot line table and line 0.', '#eg-class',
      [(seg(0x2D1) + 0x1C, 'operator new(50h) when this is null'), (seg(0x2D1) + 0x53, 'Base class constructor 0B2D:0004 (Digi-Test)'), (seg(0x2D1) + 0x64, 'Method table pointer = 00ADh'), (seg(0x2D1) + 0xBE, 'Capacity = 500 lines')]),
    F(seg(0x2D1) + 0x40D, seg(0x2D1) + 0x572, 'TextEditor::handle_key', 'Method table slot 2: F10 opens the menu, other keys go to about a dozen editing methods.', '#eg-virtual'),
    F(seg(0x2D1) + 0xC4E, seg(0x2D1) + 0xEEB, 'TextEditor::insert', 'Tab becomes 8 spaces; pads past the end of the text; movmem opens a gap of 255 - column bytes.', '#eg-insert',
      [(seg(0x2D1) + 0xD16, 'Is the key a Tab?'), (seg(0x2D1) + 0xD36, 'Refuse at column 255'), (seg(0x2D1) + 0xDC3, 'movmem(line+col, line+col+n, 255-col)'), (seg(0x2D1) + 0xDE0, 'memset writes the character')]),
    F(seg(0x473) + 0x1A9, seg(0x473) + 0x428, 'key_loop', 'Starts as if F10 was pressed, reads keys, ends on Alt-X, and calls method slot 2 of the active window.', '#eg-virtual',
      [(seg(0x473) + 0x1CE, 'Pretend F10: the FILE menu opens at start'), (seg(0x473) + 0x257, 'Read a key'), (seg(0x473) + 0x29F, 'call far [bx+8]: virtual call')]),
    F(seg(0x541) + 0x3, seg(0x541) + 0xF8, 'main', 'Creates the application object, runs the key loop, destroys it with flag 3, closes graphics.', '#eg-virtual',
      [(seg(0x541) + 0xD0, 'Run the key loop'), (seg(0x541) + 0xD8, 'Destructor flag 3: destroy and free')]),
])

# WINKEY.EXE: header 0x30, DGROUP at file 0x1840
H = 0x30
names = [(0x239,'load_menu_file','Opens MENU2.DAT (name stored in the code) and reads up to 4,000 bytes.',1),
 (0x27C,'draw_icon','Draws a run-length icon with Set/Reset and Bit Mask, one write per byte.',16),
 (0x353,'gc_reset','Turns Set/Reset off and the Bit Mask back to FFh.',3),
 (0x363,'set_color','Enable Set/Reset = 0Fh, Set/Reset = color.',3),
 (0x37B,'image_size','Bytes needed to save a screen area. Never called.',0),
 (0x3BE,'dos_alloc','INT 21h AH=48h; returns 0 on failure.',1),
 (0x3EA,'save_area','Copies a screen area plane by plane to memory. Never called.',0),
 (0x47B,'restore_area','Copies a saved area back to the screen. Never called.',0),
 (0x4D7,'dos_free','INT 21h AH=49h.',1),
 (0x4E3,'xor_highlight','Flips plane 3 in a rectangle: a highlight. Never called.',0),
 (0x5BA,'bar','Filled rectangle in the current color.',1),
 (0x66F,'checker_fill','Fills a rectangle with a checkerboard. Never called.',0),
 (0x765,'hv_line','Horizontal or vertical line.',8),
 (0x85C,'rectangle','Rectangle outline. Never called.',0),
 (0x8A3,'button_3d','Draws rings from the style table at 09B2h, then fills the face.',17)]
ends = [n[0] for n in names[1:]] + [0xA16]
rout = []
for (a, nm, note, k), e in zip(names, ends):
    lines = []
    if a == 0x27C: lines = [(H + 0x2D0, 'EFh: one row up'), (H + 0x2F4, 'x mod 8 the long way: shift 3 bits out reversed ...'), (H + 0x301, '... and reverse them back with the table at 033Dh'), (H + 0x30C, 'Bit Mask register'), (H + 0x320, 'Latch read, then write')]
    if a == 0x239: lines = [(H + 0x245, 'DS = CS: the file name lives in the code')]
    if a == 0x8A3: lines = [(H + 0x8D9, 'Top-left color of this ring'), (H + 0x926, 'Bottom-right color'), (H + 0x9B2, 'Style table starts here')]
    rout.append(F(H + a, H + e, nm, note, '#wk-pixels' if a in (0x27C, 0x353, 0x363) else ('#wk-button' if a == 0x8A3 else '#wk-made'), lines))
rout.append(F(H + 0xA16, H + 0xFEC, 'main', 'Mode 10h, allocate, load, draw the panel, then 8 copies of the same block: press and release one button 11 times.', '#wk-button',
   [(H + 0xA20, 'INT 10h AX=0010h: EGA 640 x 350'), (H + 0xA51, 'Panel: button(5,5,200,306, style 40h)'), (H + 0xA72, 'Pressed: style 50h'), (H + 0xA8B, 'Icon moved 2 pixels'), (H + 0xAA8, 'Busy-wait to 40,000'), (H + 0xFE2, 'Free the memory; the screen stays in graphics mode')]))
write('WINKEY_WINKEY.EXE', 'WINKEY/WINKEY.EXE', [
    R(0, 0x1C, 'header', 'MZ header', 'DOS EXE header: 3 relocations, initial stack at 01AE:0080. Rebuilt by the museum unpacker after removing DIET.', 'dos'),
    R(0x1C, 0x20, 'unused', 'Header padding', 'Unused header bytes before the relocation table.', 'dos'),
    R(0x20, 0x2C, 'reloc', 'Relocation table', '3 addresses that DOS adjusts for the load segment.', 'dos'),
    R(0x2C, H, 'unused', 'Header padding', 'Zero bytes that round the header up to 3 paragraphs.', 'dos'),
    R(H, H + 0x239, 'startup', 'Turbo C++ start-up (c0)', 'Sets up segments and the stack, then calls main.', 'borland'),
    R(H + 0x239, H + 0xA16, 'code', 'His drawing library', '15 routines of inline assembly in C functions; 6 are never called. Includes the button style table at 09B2h.', 'yasser', link='#wk-made'),
    R(H + 0xA16, H + 0xFEC, 'code', 'main', 'Plain C: sets EGA mode 10h, loads the icons, draws the panel and presses 8 buttons 11 times each.', 'yasser', link='#wk-button'),
    R(H + 0xFEC, H + 0x1810, 'library', 'Turbo C runtime library', 'Exit code, DOS memory and I/O helpers (2,084 bytes).', 'borland'),
    R(H + 0x1810, H + 0x1AE0, 'data', 'Runtime data', 'Turbo C++ copyright string, runtime messages and variables. WINKEY keeps no data of its own here.', 'borland'),
    R(H + 0x1AE0, 0x1B90, 'stack', 'Initial stack', '128 bytes at 01AE:0080, from the header.', 'borland'),
], rout)
