import type { Term } from '../glossary';

// Terms for the HandyMenu writeup (src/writeups/dinarsoft-handymenu.astro)
export default {
  'hm-tray-icon': {
    term: 'Tray icon',
    short: 'A small icon a program puts at the bottom of the Pocket PC’s Today screen, so it is one tap away while it waits in the background.',
    now: 'A menu bar extra on a Mac, or a quick-settings tile on Android.',
  },
  'hm-tap-and-hold': {
    term: 'Tap and hold',
    short: 'The Pocket PC’s right-click: keep the stylus on the screen and a ring of red dots fills in. When it closes, the program does its second action.',
    now: 'A long-press on a phone.',
  },
  'hm-owner-draw': {
    term: 'Owner-drawn menu',
    short: 'A menu whose items the program paints itself, so it can add icons and its own colors to an ordinary system menu.',
    now: 'A custom context menu in a web app, drawn with your own HTML and CSS.',
  },
  'hm-jump-table': {
    term: 'Jump table',
    short: 'A list of addresses, or distances, that a switch statement can compile into. The program reads one row and jumps there, instead of testing every case in turn.',
    now: 'Compilers for C, Rust and Go still build one for a dense switch or match.',
  },
  'hm-ioctl': {
    term: 'KernelIoControl',
    short: 'A Windows CE call that sends a numbered command straight to the lowest layer of the system, the code written for that device’s chips. HandyMenu uses it to restart the device.',
    now: 'ioctl() on Linux, or a phone’s system API that only system apps may call.',
  },
  'hm-cpl': {
    term: 'Control panel applet',
    short: 'One page of Settings, kept in its own file. Pocket PC opened a page when a program started ctlpnl.exe with the page number on its command line.',
    now: 'A deep link into Settings: ms-settings:dateandtime on Windows, a Settings intent on Android.',
  },
  'hm-dynamic-linking': {
    term: 'Loading a function at run time',
    short: 'Asking the system for a function by name while the program runs (LoadLibrary, then GetProcAddress), so the program still starts on a device that lacks it.',
    now: 'Feature detection in JavaScript: if ("share" in navigator), or a dynamic import().',
  },
  'hm-bmp': {
    term: 'BMP file',
    short: 'The Windows picture format: a 14-byte file header, a 40-byte picture header, then the color of every pixel, row by row from the bottom.',
    now: 'Still opened by every browser and image viewer. PNG does the same job, compressed.',
  },
  'hm-dhcp': {
    term: 'DHCP',
    short: 'How a device borrows an address on a network: it asks, the network’s server offers one, the device accepts, the server confirms. The address is lent for a set time.',
    now: 'Exactly the same today. Your home router is the DHCP server for every phone and laptop in the house.',
  },
  'hm-salt': {
    term: 'Salt',
    short: 'A small, fixed change mixed into stored data, so the bytes on disk never match the plain values they hide.',
    now: 'The salt added to a password before it is hashed.',
  },
} satisfies Record<string, Term>;
