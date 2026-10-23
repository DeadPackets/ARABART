import type { Term } from '../glossary';

export default {
  byte: {
    term: 'Byte',
    short: 'Eight bits. Enough for one letter of text, or a whole number from 0 to 255.',
    now: 'One element of a Uint8Array. A UTF-8 letter of English is still one byte.',
  },
  paragraph: {
    term: 'Paragraph',
    short: 'A block of 16 bytes. Segment numbers count in paragraphs, so segment 1 starts 16 bytes after segment 0.',
    now: 'Like alignment in memory today: addresses that land on neat boundaries.',
  },
  segment: {
    term: 'Segment',
    short: 'A starting point in memory. The processor multiplies the segment by 16 and adds an offset to reach any byte, so an address is written segment:offset, like A000:1F4C.',
    now: 'buffer.subarray(segment * 16), then an index into that slice.',
  },
  'real-mode': {
    term: 'Real mode',
    short: 'How the PC ran DOS: one megabyte of memory, one program at a time, and every program free to read or write any byte, DOS included.',
    now: 'Firmware on a small board such as an Arduino: your code owns the whole machine.',
  },
  interrupt: {
    term: 'Interrupt',
    short: 'A numbered event. Hardware fires one when a key goes down or the clock ticks; a program fires one to ask DOS or the BIOS for help. The PC looks up the number in a table and runs that code.',
    now: 'An event handler, like addEventListener, and a system call, in one mechanism.',
  },
  ivt: {
    term: 'Interrupt table',
    short: 'The first 1,024 bytes of memory: 256 addresses, one for each interrupt number. Write a new address into an entry and your code answers that interrupt.',
    now: 'A map from event names to handler functions.',
  },
  tsr: {
    term: 'TSR',
    short: 'Terminate and Stay Resident: a program that ends but keeps its code in memory. It usually sits in front of a system service, so every program after it can call it. ARABART is one.',
    now: 'A background service, or middleware in front of an API.',
  },
  assembly: {
    term: 'Assembly',
    short: 'The processor’s own instructions written as words, one line per instruction: mov, add, jmp. An assembler turns them into bytes.',
    now: 'What any compiled language becomes in the end. WebAssembly’s text format reads much the same.',
  },
  vga: {
    term: 'VGA',
    short: 'IBM’s 1987 graphics standard. His programs use its 640 × 480 mode with 16 colors, kept in four color planes.',
    now: 'The graphics card and its framebuffer, years before GPUs.',
  },
  bgi: {
    term: 'BGI',
    short: 'Borland Graphics Interface: Borland’s drawing library for C and Pascal. Lines, circles, fills and text, with a driver file such as EGAVGA.BGI for the card.',
    now: 'The canvas 2D API: one drawing API, a driver underneath for each screen.',
  },
  'com-file': {
    term: 'COM file',
    short: 'The simplest DOS program: raw code with no header. DOS copies it 256 bytes into one 64 KB block of memory and runs it.',
    now: 'A plain script: no manifest, it just runs from the top.',
  },
  'exe-file': {
    term: 'EXE file',
    short: 'A DOS program that starts with a header: the letters MZ and a small manifest. It says where to start, where the stack goes, and which addresses DOS must fix when it loads the program.',
    now: 'A bundle with a package.json in front. Windows .exe files still start with MZ.',
  },
  relocation: {
    term: 'Fix-up (relocation)',
    short: 'A spot in a program that holds a real memory address. The program cannot know where DOS will load it, so DOS adds the load address to every spot on the list when it starts.',
    now: 'Resolving a relative URL against the page it loaded from.',
  },
  packer: {
    term: 'Executable packer',
    short: 'A tool that compresses a program and puts a small unpacker in front. The file is smaller on disk; when it runs, it rebuilds itself in memory first.',
    now: 'A self-extracting zip, or gzip on a JavaScript bundle. UPX still does exactly this.',
  },
  diet: {
    term: 'DIET',
    short: 'A program packer for DOS by Teddy Matsumoto. Every one of Yasser’s program files is packed with DIET 1.00 and unpacks itself in memory when it starts.',
    now: 'UPX, or a self-extracting archive.',
  },
  'auto-shaping': {
    term: 'Auto-shaping',
    short: 'Choosing the right form of each Arabic letter from the letters beside it: on its own, at the start, in the middle or at the end of a word. That is how the word joins up.',
    now: 'What HarfBuzz does in every browser and phone when it draws Arabic.',
  },
  ligature: {
    term: 'Ligature',
    short: 'Two or more letters drawn as one shape, such as lam-alef: لا. ARABART gives it its own key, b, as on an Arabic keyboard.',
    now: 'An OpenType ligature, like the fi in a good font or => in a coding font.',
  },
  bcd: {
    term: 'BCD',
    short: 'Binary-coded decimal: each decimal digit stored on its own, so money-style sums come out exact, with no binary rounding.',
    now: 'Decimal types: Python’s Decimal, Java’s BigDecimal, SQL’s NUMERIC.',
  },
  'fixed-point': {
    term: 'Fixed point',
    short: 'Numbers with a set count of digits after the point, worked out with whole-number math.',
    now: 'Storing money as cents in an integer.',
  },
  'turbo-c': {
    term: 'Turbo C / Borland C++',
    short: 'Borland’s C and C++ tools for DOS: a blue full-screen editor, compiler and debugger in one program. Yasser wrote his C programs in it.',
    now: 'An IDE such as VS Code with the compiler and debugger built in.',
  },
  disassembly: {
    term: 'Disassembly',
    short: 'Turning a program’s bytes back into readable assembly. His source code is lost, so this site reads his programs this way.',
    now: 'Ghidra or IDA, or the source maps of the web, in reverse.',
  },
  emulator: {
    term: 'Emulator',
    short: 'A program that acts out a whole computer in software. Here, DOSBox built for the browser (js-dos) runs his programs on a 1990s PC.',
    now: 'A virtual machine, or a game console emulator.',
  },
} satisfies Record<string, Term>;
