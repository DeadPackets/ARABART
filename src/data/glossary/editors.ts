import type { Term } from '../glossary';

// Terms for the EDIT.EXE, EDITOR.EXE and WINKEY writeups
export default {
  'memory-model': {
    term: 'Memory model',
    short: 'A setting of 16-bit DOS compilers that chooses how big the code and the data may grow. "Small" keeps each in one 64 KB block; "large" lets both grow past it by using 4-byte addresses everywhere.',
    now: 'Gone: a 64-bit program has one flat address space, so there is nothing to choose.',
  },
  'far-pointer': {
    term: 'Far pointer',
    short: 'A 4-byte address on the original PC: a segment and an offset. It reaches anywhere in the first megabyte, where a 2-byte near pointer stays inside one 64 KB block.',
    now: 'Every pointer is one plain 64-bit number.',
  },
  heap: {
    term: 'Heap',
    short: 'The pool of memory a program asks for while it runs, with new in C++ or malloc in C. The library keeps a small note next to each block it hands out.',
    now: 'The same in C, C++ and Rust. JavaScript and Python manage it for you.',
  },
  'runtime-library': {
    term: 'Runtime library',
    short: 'Code the compiler adds to every program: start-up, files, memory, strings, numbers.',
    now: 'The C standard library, shared by every program on the system instead of copied into each one.',
  },
  'cpp-class': {
    term: 'Class',
    short: 'A C++ type that keeps data together with the functions that work on it. One class can build on another and replace some of its functions.',
    now: 'The same idea in TypeScript, Java, C#, Swift and Kotlin.',
  },
  vtable: {
    term: 'Virtual method table',
    short: 'A table of function addresses that C++ makes for each class with virtual methods. Each object starts with a pointer to its table, so one call finds the right function for any kind of object.',
    now: 'Still how C++ works, and how Rust calls methods on trait objects. JavaScript’s prototype chain plays the same role.',
  },
  'inline-asm': {
    term: 'Inline assembly',
    short: 'Assembly instructions written inside a C or C++ function. The compiler writes the function’s first and last lines; the author writes the middle.',
    now: 'Still possible with GCC asm blocks or Rust’s asm!, and still the way to reach the hardware directly.',
  },
  ega: {
    term: 'EGA',
    short: "IBM's 1984 color graphics card. Its mode 10h shows 640 × 350 pixels in 16 colors, kept as 4 layers of bits. VGA cards run EGA modes too.",
    now: 'A framebuffer, but split into 4 one-bit layers, one per color bit.',
  },
  'io-port': {
    term: 'I/O port',
    short: 'A numbered address for talking to hardware, separate from memory. The IN and OUT instructions read and write it; the EGA card listens on ports 3CEh and 3CFh.',
    now: 'Drivers use memory-mapped registers; apps call an API such as WebGPU, Metal or Vulkan.',
  },
  'xor-drawing': {
    term: 'XOR drawing',
    short: 'Drawing by flipping the bits of the pixels already on screen. Draw the same shape twice and the screen is exactly as before, so a cursor never needs to remember what was under it.',
    now: 'The canvas blend mode "difference"; cursors today are a separate layer the GPU adds on top.',
  },
  'save-under': {
    term: 'Save-under',
    short: 'Copying the part of the screen behind a menu or dialog into memory before drawing it, then copying it back when it closes.',
    now: 'canvas getImageData() and putImageData(); a window compositor keeps every window in its own buffer.',
  },
  'gap-buffer': {
    term: 'Gap buffer',
    short: 'A text buffer that keeps an empty gap at the cursor. Typing fills the gap, so a keystroke moves almost nothing.',
    now: 'How Emacs stores text.',
  },
  'piece-table': {
    term: 'Piece table',
    short: 'A text buffer that never moves the original text. Edits are a list of pieces that point into the original file and into a buffer of everything typed.',
    now: 'VS Code uses a version called a piece tree.',
  },
  memmove: {
    term: 'memmove',
    short: 'The C library function that copies a block of bytes to another place, even when the two places overlap. Editors use it to open a gap for a new letter.',
    now: 'Array.prototype.copyWithin() in JavaScript, copy_within in Rust.',
  },
  'heap-overflow': {
    term: 'Heap overflow',
    short: 'Writing past the end of a block of heap memory into the next one.',
    now: 'Tools such as AddressSanitizer catch it, and memory-safe languages like Rust rule it out.',
  },
  'busy-wait': {
    term: 'Busy-wait loop',
    short: 'A pause made by counting in a loop. The common way to time an animation on a DOS PC, where programs had the whole machine to themselves.',
    now: 'setTimeout() and requestAnimationFrame(), tied to the clock.',
  },
  'event-loop': {
    term: 'Event loop',
    short: 'The loop at the heart of an interactive program: wait for input, decide which part of the program should handle it, call that part, repeat.',
    now: 'Every browser runs one; all JavaScript runs inside it.',
  },
  'project-file': {
    term: 'Project file',
    short: 'A file the IDE saves with the list of source files, folders and compiler options for one program. Borland used .PRJ for the project and .DSK for the windows left open.',
    now: 'package.json or CMakeLists.txt, plus the editor’s saved workspace.',
  },
  'vga-palette': {
    term: 'VGA palette',
    short: 'The table of 16 (or 256) colors a VGA card shows. A program can set any entry to any of 262,144 colors, and everything already drawn in that entry changes at once.',
    now: 'A design token or a CSS custom property: change it in one place and every use follows.',
  },
  'stack-check': {
    term: 'Stack checking',
    short: 'A compiler option that adds a short test at the start of every function, so a stack about to run out stops with a clear message.',
    now: 'The guard page an operating system puts below every stack.',
  },
  bioskey: {
    term: 'bioskey',
    short: "Borland's C function for reading the keyboard through the BIOS. It returns the key’s scan code and its character together, so arrows and function keys can be told apart.",
    now: 'A keydown event, with both event.code and event.key.',
  },
  'opcode-match': {
    term: 'Opcode matching',
    short: 'Comparing two programs function by function, using only the order of their instructions and ignoring the addresses that change between builds. The same order means the same source code.',
    now: 'Binary diffing tools such as BinDiff match functions between two builds the same way.',
  },
} satisfies Record<string, Term>;
