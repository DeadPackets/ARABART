import type { Term } from '../glossary';

// Terms used by the ARABART writeups (arabart, arabart-demo, arabart-editor, arabart-commercial, arabic-basmallah)
export default {
  bios: {
    term: 'BIOS',
    short: 'The built-in code in ROM on every PC. Programs asked it for basic services by number: INT 10h for the screen, INT 16h for the keyboard.',
    now: 'UEFI firmware. Apps no longer call it; the operating system’s drivers talk to the hardware.',
  },
  psp: {
    term: 'PSP',
    short: 'Program Segment Prefix: 256 bytes that DOS puts in front of every program it loads. They hold the command line and the way back to DOS.',
    now: 'The record an operating system keeps for each running process.',
  },
  'int-27h': {
    term: 'INT 27h',
    short: 'The DOS call that ends a program but keeps it in memory. DX says how many bytes to keep.',
    now: 'Starting a background service that keeps running after its installer closes.',
  },
  'install-check': {
    term: 'Install check',
    short: 'A question a resident program asks before it loads: “Am I already in memory?” If the answer is yes, it does not load a second copy.',
    now: 'A single-instance lock, such as a lock file or a named mutex.',
  },
  'register-convention': {
    term: 'Register calling convention',
    short: 'Giving a function its inputs in the CPU’s registers (AX, BX, CX, DX) instead of in memory. Every DOS and BIOS service worked this way.',
    now: 'System calls still do it. On 64-bit Linux the first arguments go in RDI, RSI and RDX.',
  },
  'carry-flag': {
    term: 'Carry flag',
    short: 'A one-bit flag in the CPU. A DOS service sets it to report an error, and the caller checks it with one jump instruction.',
    now: 'A function that returns an error code, or throws.',
  },
  'key-encoding': {
    term: 'Arabic-keyboard encoding',
    short: 'Storing Arabic as the English keys that carry each Arabic letter on an Arabic keyboard. “gtk” means لفن, because g, t and k carry ل, ف and ن.',
    now: 'Unicode text in UTF-8, typed through a keyboard layout. The layout and the stored text are now separate things.',
  },
  glyph: {
    term: 'Glyph',
    short: 'The drawn shape of one character, or of one form of it. An Arabic letter can need up to 4 glyphs: alone, at the start, in the middle and at the end of a word.',
    now: 'The same word is used for the shapes inside every OpenType and TrueType font.',
  },
  'joining-type': {
    term: 'Joining type',
    short: 'Which sides an Arabic letter can connect on: the letter before, the letter after, both, or neither. Alef joins only the letter before it. Beh joins both.',
    now: 'A Unicode property (Joining_Type) that shaping engines such as HarfBuzz read for every character.',
  },
  'opentype-shaping': {
    term: 'OpenType shaping',
    short: 'How a modern font engine turns letters into glyphs. It reads each letter’s joining type, picks the start, middle, end or alone form from the font, and joins lam-alef into one shape.',
    now: 'HarfBuzz does this inside Chrome, Firefox, Android and many other systems.',
  },
  kashida: {
    term: 'Kashida (tatweel)',
    short: 'The joining stroke ـ that stretches an Arabic word without changing its letters: الفـــن instead of الفن. Calligraphers use it to fill a line.',
    now: 'The Unicode character U+0640. Some layout engines add it to justify text.',
  },
  harakat: {
    term: 'Harakat',
    short: 'Small vowel marks above or below Arabic letters. Most everyday Arabic leaves them out.',
    now: 'Unicode combining marks, placed by the font’s mark-positioning tables.',
  },
  bidi: {
    term: 'Bidi (bidirectional text)',
    short: 'Text that mixes right-to-left Arabic with left-to-right numbers or English words. Each run reads in its own direction.',
    now: 'The Unicode Bidirectional Algorithm orders the runs for you, in every browser and phone.',
  },
  'arabic-indic-digits': {
    term: 'Arabic-Indic digits',
    short: 'The digits ٠١٢٣٤٥٦٧٨٩, used in Egypt and much of the Arab world. Numbers read left to right, even inside right-to-left text.',
    now: 'Unicode U+0660 to U+0669.',
  },
  baseline: {
    term: 'Baseline',
    short: 'The invisible line that letters sit on. Joined Arabic letters meet along it.',
    now: 'The same idea in every font, and in CSS as vertical-align: baseline.',
  },
  'run-length-encoding': {
    term: 'Run-length encoding',
    short: 'Storing a picture as runs, “start here and paint this many pixels”, instead of storing every pixel one by one.',
    now: 'Still used in fax images, BMP files and many game sprite formats.',
  },
  'bit-planes': {
    term: 'Bit planes',
    short: 'How 16-color VGA stores pixels: 4 layers of memory at the same address, each holding one bit of every pixel’s color.',
    now: 'A modern framebuffer keeps each pixel’s whole color together, for example in 4 bytes.',
  },
  'graphics-controller': {
    term: 'VGA Graphics Controller',
    short: 'A set of settings on the VGA card, reached through I/O ports 3CEh and 3CFh. They decide what one byte written by the CPU does to the 4 bit planes.',
    now: 'The blend and write-mask state of a GPU pipeline.',
  },
  'set-reset': {
    term: 'Set/Reset',
    short: 'A VGA setting that holds a color. When it is on, every write paints that color into all 4 bit planes at once.',
    now: 'Like a GPU fill with one solid color.',
  },
  'bit-mask': {
    term: 'Bit Mask register',
    short: 'A VGA setting with one bit for each of the 8 pixels in a byte. Only the pixels whose bit is 1 change on the next write.',
    now: 'A per-pixel write mask, like a stencil.',
  },
  latches: {
    term: 'VGA latches',
    short: 'Four hidden VGA registers that hold the last byte read from each bit plane. Read first, then write, and the pixels you did not pick keep their color.',
    now: 'Like a read-modify-write on a texture: load, change only some pixels, store.',
  },
  'vertical-retrace': {
    term: 'Vertical retrace',
    short: 'The short pause while a CRT’s beam goes back to the top of the screen, about 70 times a second in VGA text mode. Programs watch port 3DAh for it and use it as a clock.',
    now: 'VSync, and requestAnimationFrame in a browser.',
  },
  'self-modifying-code': {
    term: 'Self-modifying code',
    short: 'A program that writes new values into its own instructions while it runs, for example to change a color or a jump.',
    now: 'Like setting shader uniforms before each draw call. JIT compilers in browsers write new code in a controlled way.',
  },
  'dead-store': {
    term: 'Dead store',
    short: 'A value written to a variable and then written again before anything reads it. The program runs the same either way.',
    now: 'Compilers remove them for you while they optimize.',
  },
} satisfies Record<string, Term>;
