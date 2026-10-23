import type { Term } from '../glossary';

// Terms for the Digi-Test writeup (src/writeups/digi-test.astro)
export default {
  'borland-cpp': {
    term: 'Borland C++',
    short: "Borland's C and C++ compiler for DOS, from 1991. It came with its own editor, debugger, graphics library and a set of ready-made container classes, all in one box.",
    now: 'An all-in-one IDE and toolchain, like Visual Studio or JetBrains CLion.',
  },
  inheritance: {
    term: 'Inheritance',
    short: 'Building one class on top of another. The new class gets the parent’s data and methods, and can replace any of them with its own.',
    now: 'class Button extends Component in TypeScript.',
  },
  'virtual-method': {
    term: 'Virtual method',
    short: 'A method each subclass can write its own way. The program calls it through a table, so one line of code works for every kind of object.',
    now: 'A method declared in a TypeScript interface, or a trait method in Rust.',
  },
  'class-library': {
    term: 'Container class library',
    short: 'Ready-made C++ containers that came with Borland C++: Array, SortedArray and friends, all built on one base class called Object.',
    now: 'The C++ standard library’s std::vector, or JavaScript’s Array and Map.',
  },
  'logic-gate': {
    term: 'Logic gate',
    short: 'A tiny circuit that answers AND, OR, NOT, NAND or NOR for its inputs. Every input and output is a 0 or a 1.',
    now: 'The && and || of a program, built in hardware. A modern CPU holds billions of them.',
  },
  ttl: {
    term: 'TTL (74xx chips)',
    short: 'The 7400 family of logic chips. A 7400 holds four 2-input NAND gates in a 14-pin package; pin 7 is ground and pin 14 is the +5 volt supply.',
    now: 'Still sold for teaching and repair. New designs put the same gates inside an FPGA or a custom chip.',
  },
  'open-collector': {
    term: 'Open-collector output',
    short: 'A chip output that can only pull a wire down to 0. Several of them can safely share one wire.',
    now: 'The open-drain pins of a microcontroller, and the wires of the I2C bus.',
  },
  'truth-table': {
    term: 'Truth table',
    short: 'Every combination of a circuit’s inputs, with the output for each one. A circuit with n inputs has 2ⁿ rows.',
    now: 'Like a table-driven unit test that lists every case.',
  },
  netlist: {
    term: 'Netlist',
    short: 'The list of which pins connect to which: the circuit with the drawing taken away.',
    now: 'What KiCad and every chip design tool produce for the factory.',
  },
  'logic-simulator': {
    term: 'Logic simulator',
    short: 'Software that works out, gate by gate, what a circuit will output for given inputs.',
    now: 'Logisim for teaching; Verilator and Icarus Verilog for real chip designs.',
  },
  'stuck-at-fault': {
    term: 'Stuck-at fault',
    short: 'The standard way to describe a broken chip: one wire stuck at 0, or stuck at 1, whatever the circuit tries to put on it.',
    now: 'Still the basic fault model in chip testing.',
  },
  'test-pattern': {
    term: 'Test pattern',
    short: 'One set of input values for a circuit. A good pattern makes a broken circuit give a different answer from a working one.',
    now: 'Chip makers run thousands of generated patterns on every chip they ship.',
  },
  'five-valued-logic': {
    term: 'Five-valued logic',
    short: 'Logic with five values instead of two: 0, 1, X (not known yet), D (1 if the chip works, 0 if it is broken) and D̄ (the opposite). One pass follows a fault through the whole circuit.',
    now: 'Verilog simulators use a cousin: 0, 1, X and Z.',
  },
  'controlling-value': {
    term: 'Controlling value',
    short: 'The input value that decides a gate on its own: a 0 settles an AND or a NAND, a 1 settles an OR or a NOR.',
    now: 'Short-circuit evaluation: false && anything is false, true || anything is true.',
  },
  'd-algorithm': {
    term: 'D-algorithm',
    short: "J. Paul Roth's 1966 method for finding a test pattern for a broken pin. It marks the fault as D or D̄ and searches for inputs that carry the mark to an output, stepping back when it hits a dead end.",
    now: 'Its descendants, PODEM and FAN, run inside today’s chip test tools.',
  },
  atpg: {
    term: 'ATPG',
    short: 'Automatic test pattern generation: software that works out the inputs that reveal a circuit’s faults.',
    now: 'A standard step in chip design, done by tools such as Synopsys TestMAX and Siemens Tessent.',
  },
  'fault-dictionary': {
    term: 'Fault dictionary',
    short: 'A table made in advance: for each test pattern, which broken pin changes which output. Match a real board’s answers against it to name the fault.',
    now: 'Like matching an error signature against a list of known causes.',
  },
  'guided-probe': {
    term: 'Guided probe',
    short: 'A repair method where the program tells the technician where to touch next. It walks back from a wrong output until it finds the part that turns good inputs into a bad output.',
    now: 'Still used in board repair; boundary scan (JTAG) now reads many of the same points from software.',
  },
  'isa-bus': {
    term: 'ISA card',
    short: 'A card for the expansion slots of the IBM PC and AT. The program reaches it at numbered I/O ports; IBM kept ports 300h to 31Fh free for home-made cards.',
    now: 'PCI Express replaced ISA. For a home-made board, USB and an Arduino do the job.',
  },
  mmio: {
    term: 'Memory-mapped I/O',
    short: 'Hardware registers that appear at memory addresses, so ordinary reads and writes control the device.',
    now: 'How almost every modern device is driven, from graphics cards to a Raspberry Pi’s pins.',
  },
  gpio: {
    term: 'GPIO',
    short: 'General-purpose input and output: pins of a small chip that software can set to 0 or 1, or read.',
    now: "Arduino's digitalWrite() and digitalRead().",
  },
  'text-mode-file': {
    term: 'Text mode (files)',
    short: 'A setting of the DOS C library that writes every line feed byte (0Ah) as two bytes, 0Dh 0Ah, the line ending DOS expects in text.',
    now: "Windows still does it: you open a file with 'b' to keep the bytes exactly as they are.",
  },
  'chain-code': {
    term: 'Chain code',
    short: 'A path stored as a start point plus one small number per step, each number a direction.',
    now: 'The h, v and l commands of an SVG path, or a turtle in a kids’ coding app.',
  },
  'ctrl-z': {
    term: 'Ctrl-Z (1Ah)',
    short: 'The DOS mark for the end of a text. The TYPE command stops printing a file when it reaches this byte.',
    now: 'PNG files put 1Ah in their first 8 bytes for the same reason.',
  },
} satisfies Record<string, Term>;
