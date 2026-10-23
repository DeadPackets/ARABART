import type { Term } from '../glossary';

// Terms for the HandyLauncher writeup (src/writeups/dinarsoft-handylauncher.astro)
export default {
  'hl-tray': {
    term: 'Tray',
    short: 'The strip of small icons in a corner of the Pocket PC screen, where programs that run in the background show themselves. Tap one to talk to its program.',
    now: 'The menu bar icons at the top right of a Mac, or the icons next to the clock on Windows.',
  },
  'hl-tap-and-hold': {
    term: 'Tap and hold',
    short: 'Keeping the stylus on the screen for a moment instead of lifting it. Windows Mobile draws a ring of red dots while it waits, then treats it as a second kind of tap.',
    now: 'A long press on a phone, which opens a menu instead of the app.',
  },
  'hl-shellexecute': {
    term: 'ShellExecuteEx',
    short: 'The Windows call that opens anything by its name: a program, a document, a song. Windows looks up which program handles that kind of file and starts it.',
    now: 'The open command on a Mac, or tapping a link in a browser: you name the thing, the system picks the app.',
  },
  'hl-orientation': {
    term: 'Screen orientation',
    short: 'Which way up the screen is drawn. Windows Mobile 2003 SE and later could turn the picture 90, 180 or 270 degrees, so a Pocket PC could be held sideways.',
    now: 'A phone turning its screen when you turn it, or an app locking itself to landscape.',
  },
  'hl-runtime-lookup': {
    term: 'Looking up a call at run time',
    short: 'Asking the system for a function by its name while the program runs, instead of linking to it in advance. If the device is too old to have it, the program carries on without it.',
    now: 'Feature detection in JavaScript: if ("share" in navigator) { … }.',
  },
  'hl-registry': {
    term: 'Registry',
    short: 'The settings database every Windows and Windows Mobile program shares, organized in folders called keys. HandyLauncher keeps each menu item there as a small group of values.',
    now: 'localStorage in a browser, or the defaults database an app writes on a Mac.',
  },
  'hl-dialog-template': {
    term: 'Dialog template',
    short: 'A description of a window stored inside the program file: each control, its kind, its words and its position in dialog units. Windows builds the window from it when the program asks.',
    now: 'A JSON layout file, or an Android layout XML, that the app inflates into a screen.',
  },
  'hl-owner-drawn': {
    term: 'Owner-drawn menu',
    short: 'A menu that the program paints itself, item by item, instead of letting Windows do it. That is how his menus got their icons and his own colors.',
    now: 'A custom right-click menu built with HTML and CSS instead of the browser’s plain one.',
  },
  'hl-function-table': {
    term: 'Function table (.pdata)',
    short: 'A list inside every Windows Mobile program file with the start and length of each function. The system reads it to unwind the call stack after an exception, and it also lets anyone count and compare his functions exactly.',
    now: 'A table of contents for the compiled code, like the symbol list a bundler prints for a JavaScript build.',
  },
  'hl-key-engine': {
    term: 'Key engine',
    short: 'The function the three Handy apps share that turns a 16-letter code into a 16-letter key. It shuffles 120 numbers using the product name, the way the RC4 cipher shuffles 256, then mixes each letter with the shuffle.',
    now: 'A keyed hash, like an HMAC: the same input gives the same output, and the key (here the product name) changes everything.',
  },
} satisfies Record<string, Term>;
