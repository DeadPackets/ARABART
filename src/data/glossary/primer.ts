import type { Term } from '../glossary';

export default {
  hex: {
    term: 'Hexadecimal',
    short: 'Counting in base 16, with the digits 0 to 9 and A to F. An h after a number marks it as hex: 10h is 16, FFh is 255. Two hex digits make one byte.',
    now: '0x7FFF in JavaScript and C, #FF8800 in CSS.',
  },
  kilobyte: {
    term: 'KB (kilobyte)',
    short: 'In DOS, 1,024 bytes. So 64 KB is 65,536 bytes, 640 KB is 655,360 bytes, and 1 MB is 1,048,576 bytes.',
    now: 'A KiB. A phone photo today is a few thousand of them.',
  },
  dos: {
    term: 'DOS',
    short: 'Disk Operating System, MS-DOS or PC DOS. It loads one program at a time and gives it files, memory and the screen through INT 21h.',
    now: 'An operating system small enough to read in an afternoon: a program loader plus a file system.',
  },
  'conventional-memory': {
    term: 'Conventional memory',
    short: 'The first 640 KB of a PC. DOS, its drivers and the running program all share it.',
    now: 'The memory one browser tab may use, shared with the runtime.',
  },
  'upper-memory': {
    term: 'Upper memory',
    short: 'The top 384 KB of the first megabyte. IBM kept it for the screen’s memory and the built-in chips, so a write there reaches the hardware.',
    now: 'Memory-mapped hardware, like the registers of a microcontroller.',
  },
  'video-memory': {
    term: 'Video memory',
    short: 'Memory on the graphics card that the processor sees at a fixed address: A0000h for graphics, B8000h for color text. Write a byte there and the screen changes at once.',
    now: 'A canvas’s ImageData, where the numbers are the picture.',
  },
  rom: {
    term: 'ROM',
    short: 'Read-only memory: a chip with code built in at the factory. The PC’s BIOS and the video BIOS live in ROM near the top of the first megabyte.',
    now: 'Firmware, such as UEFI on the flash chip of a PC.',
  },
  'text-mode': {
    term: 'Text mode',
    short: 'A screen mode where the card draws the letters itself. A program writes two bytes per cell, a letter and its colors, on a grid of 80 by 25.',
    now: 'A terminal window, with the font built into the hardware.',
  },
  'cpu-register': {
    term: 'Register',
    short: 'A small named slot inside the processor, 16 bits on these PCs: AX, BX, CX, DX and a few more. Programs pass values to DOS and the BIOS in them.',
    now: 'The arguments of a function call, kept as close to the processor as possible.',
  },
  stack: {
    term: 'Stack',
    short: 'A last-in, first-out area of memory for return addresses and local values. Calls push onto it; returns pop off it.',
    now: 'The call stack you see in a JavaScript error.',
  },
  'load-segment': {
    term: 'Load address',
    short: 'Where in memory DOS puts a program. It depends on what is loaded already, so the program finds out only when it starts.',
    now: 'The base URL a page loads from, or the random base address ASLR picks.',
  },
  'entry-point': {
    term: 'Entry point',
    short: 'The first instruction a program runs. An EXE header names it; a COM file always starts at offset 100h.',
    now: 'The main field of package.json, or main() itself.',
  },
  hook: {
    term: 'Hook',
    short: 'Putting your own address into an entry of the interrupt table, so calls to that service reach your code first. A good hook passes every call it does not handle on to the old address.',
    now: 'Middleware that calls next(), or wrapping a function to watch its calls.',
  },
  'int-21h': {
    term: 'INT 21h',
    short: 'The door into DOS. A program puts a function number in a register, such as 09h to print text or 4Ch to exit, and runs int 21h.',
    now: 'A system call.',
  },
  'int-10h': {
    term: 'INT 10h',
    short: 'The video service of the BIOS: set a screen mode, draw a pixel, and more. ARABART stands in front of it and adds function 36h, Arabic.',
    now: 'A graphics driver’s API.',
  },
  'int-16h': {
    term: 'INT 16h',
    short: 'The keyboard service of the BIOS: wait for a key, or check whether one is waiting.',
    now: 'Reading keydown events.',
  },
  'protected-mode': {
    term: 'Protected mode',
    short: 'The mode of later processors that keeps programs apart and reaches far more than 1 MB. DOS programs ran in real mode instead.',
    now: 'Where every operating system runs today, so one app cannot touch another.',
  },
  'a20-line': {
    term: 'A20 line',
    short: 'The 21st address wire. With 20 wires an address past 1 MB wraps back to 0; on later PCs the A20 switch lets it reach almost 64 KB more.',
    now: 'An odometer that rolls over, with a switch to add one more digit.',
  },
  linker: {
    term: 'Linker',
    short: 'The tool that joins compiled pieces and libraries into one program file. For an EXE it also writes the list of fix-ups. Borland’s linker is TLINK.',
    now: 'A bundler such as esbuild or webpack, which joins modules into one file.',
  },
  assembler: {
    term: 'Assembler',
    short: 'The tool that turns assembly text into the processor’s bytes. The two main DOS assemblers were Microsoft MASM and Borland TASM.',
    now: 'NASM, or the assembler inside every C compiler.',
  },
  'turbo-debugger': {
    term: 'Turbo Debugger',
    short: 'Borland’s full-screen debugger. It steps through a program one line at a time and shows the registers, the stack and memory.',
    now: 'The Sources panel of browser DevTools, with breakpoints and watches.',
  },
  'dos-debug': {
    term: 'DEBUG',
    short: 'A small debugger that came with DOS. It can read code as assembly, step through it, and change bytes in memory or on disk.',
    now: 'A hex editor and a command-line debugger in one small tool.',
  },
} satisfies Record<string, Term>;
