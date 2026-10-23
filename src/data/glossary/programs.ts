import type { Term } from '../glossary';

// Terms for the KVC, FORM_X, SCREEN, TAHER and PESM writeups
export default {
  'tens-complement': {
    term: "Ten's complement",
    short: 'A way to keep negative numbers without a minus sign, like a car’s odometer rolled back past zero: 0000 minus 1 shows 9999. Each digit becomes 9 minus itself, then 1 is added. Subtracting then becomes plain adding.',
    now: "Every CPU today does the same thing in binary, called two's complement.",
  },
  checksum: {
    term: 'Checksum',
    short: 'One number made by adding up a block of bytes. Change any byte and the total changes, so a program can tell its code was touched.',
    now: 'The same idea as a file hash, or the integrity hash on a script tag.',
  },
  'virus-signature': {
    term: 'Virus signature',
    short: 'Bytes that only one virus has, at known places in a file. Find them and you know exactly which virus you have.',
    now: 'Antivirus definitions and YARA rules are long lists of signatures.',
  },
  'file-infector': {
    term: 'File infector',
    short: 'A virus that copies itself into programs. It changes where each program starts so the virus runs first, then hands control back so nothing looks wrong.',
    now: 'Like a supply-chain attack that slips code into a package, then lets the package work as usual.',
  },
  'pc-speaker': {
    term: 'PC speaker',
    short: 'The little beeper inside an IBM PC. It can only push its cone out or pull it in; a timer chip switches it back and forth fast enough to make a tone.',
    now: 'A square-wave oscillator, the simplest sound a Web Audio page can make.',
  },
  tokenizer: {
    term: 'Tokenizer',
    short: 'The first step in reading a formula or a program: it cuts the text into pieces such as numbers, names and signs.',
    now: 'Every compiler, JSON parser and syntax highlighter starts with one.',
  },
  'state-machine': {
    term: 'State machine',
    short: 'Code that is always in one of a few states. Each input moves it to the next state, and the state decides which inputs it accepts.',
    now: 'The idea behind form wizards, UI flows and network protocols.',
  },
  'operator-precedence': {
    term: 'Operator precedence',
    short: 'The rule that times and divide come before plus and minus, and brackets before everything, so 2 + 3 × 4 is 14, not 20.',
    now: 'The same order JavaScript and every spreadsheet use.',
  },
  obfuscation: {
    term: 'Obfuscation',
    short: 'Scrambling code or text so it reads as nonsense in the file, while the program unscrambles it as it runs.',
    now: 'JavaScript minifiers and app protectors still do this.',
  },
  interpreter: {
    term: 'Interpreter',
    short: 'A small program that reads instructions in its own little language and carries them out one by one.',
    now: 'The JavaScript engine in your browser and Python both work this way.',
  },
  'static-linking': {
    term: 'Static linking',
    short: 'Building a library into each program that uses it, so the program runs with nothing else installed.',
    now: 'Like bundling your npm dependencies into one file. Go and Rust programs usually ship this way.',
  },
  'file-attribute': {
    term: 'File attribute',
    short: 'A few flags DOS keeps for each file, such as read-only and hidden. A read-only file has to be unlocked before a program can change it.',
    now: 'File permissions on macOS and Linux.',
  },
  edr: {
    term: 'EDR',
    short: 'Endpoint detection and response: security software on each computer that watches what programs do, raises alerts and can stop or undo an attack.',
  },
  'behavior-detection': {
    term: 'Behavior detection',
    short: 'Spotting a virus by what it does, such as rewriting many programs, instead of by bytes it carries. It can catch a virus nobody has seen before.',
  },
} satisfies Record<string, Term>;
