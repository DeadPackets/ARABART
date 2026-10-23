import type { Term } from '../glossary';

// Terms used by the TapText writeup (src/writeups/dinarsoft-taptext.astro)
export default {
  'tt-sip': {
    term: 'Input panel',
    short: 'The small keyboard a Pocket PC drew at the bottom of the screen, tapped with a stylus. It could also read handwriting.',
    now: 'The on-screen keyboard of a phone.',
  },
  'tt-window-proc': {
    term: 'Window procedure',
    short: 'The one function that receives every message sent to a window: taps, keys, paint requests. Swap it, and you decide what happens to those messages.',
    now: 'An event handler; swapping one is like wrapping a function in JavaScript.',
  },
  'tt-focus': {
    term: 'Focus',
    short: 'The box that gets what you type, the one with the blinking cursor. Windows answers “which box has the focus?” only for the program that owns it.',
    now: 'document.activeElement in a web page.',
  },
  'tt-wm-char': {
    term: 'WM_CHAR',
    short: 'The message Windows sends a window for each character typed. A program can post the same message itself, and the window cannot tell it from a real key press.',
    now: 'A synthetic input or keypress event.',
  },
  'tt-clipboard': {
    term: 'Clipboard',
    short: 'The shared place where Copy puts text and Paste takes it from, open to every program.',
    now: 'The same clipboard, on every phone and computer.',
  },
  'tt-macro': {
    term: 'Macro',
    short: 'A placeholder in saved text that TapText fills in as it types. {{DATE:…}} gives the date in a chosen format and {{TIME:…}} the time. {{TAB}} jumps to the next box, and {{CTRL-B}} turns on bold.',
    now: 'Template variables, like {{date}} in a text expander or an email template.',
  },
  'tt-cplusplus-class': {
    term: 'C++ class',
    short: 'A type that bundles data with its own functions. Classes that share one set of virtual functions can be called the same way, each doing its own thing.',
    now: 'An interface with several implementations, in Swift, Kotlin or TypeScript.',
  },
  'tt-registry': {
    term: 'Registry',
    short: 'The Windows settings database: a tree of keys and values that every program can read and write.',
    now: 'UserDefaults on iPhone, SharedPreferences on Android.',
  },
  'tt-cab': {
    term: 'CAB file',
    short: 'The installer package of Windows Mobile: a compressed archive of the program’s files, plus a setup DLL that runs on the device during the install.',
    now: 'An .ipa on iPhone or an .apk on Android.',
  },
} satisfies Record<string, Term>;
