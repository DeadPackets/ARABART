import type { Term } from '../glossary';

// Terms for the HandySwitcher writeup (src/writeups/dinarsoft-handyswitcher.astro), shared by the other Handy pages
export default {
  'hs-windows-mobile': {
    term: 'Windows Mobile',
    short: 'Microsoft’s system for pocket computers and smartphones, from 2003 to 2010. Before 2003 it was called Pocket PC. Programs were written in C and C++ against a small version of the Windows API.',
    now: 'What Android and iOS are today.',
  },
  'hs-arm': {
    term: 'ARM processor',
    short: 'The low-power chip family inside Pocket PCs (StrongARM and XScale). DinarSoft’s programs are ARM machine code: 4-byte instructions that work on 16 small slots inside the chip, named r0 to r15.',
    now: 'The same family runs every phone today, and Apple’s M-series Macs.',
  },
  'hs-window-proc': {
    term: 'Window procedure',
    short: 'The one function that handles every message a window gets: taps, key presses, “please close”, “repaint”. Windows calls it for each message, one at a time.',
    now: 'An event handler, like a single addEventListener that receives every event.',
  },
  'hs-subclassing': {
    term: 'Subclassing a window',
    short: 'Swapping in your own message handler for another window’s, keeping the old one, and passing on every message you do not handle.',
    now: 'Monkey-patching a function, or a middleware that wraps a handler and calls next().',
  },
  'hs-post-message': {
    term: 'Posting a message',
    short: 'Dropping a message into another window’s queue and moving on, without waiting. Programs on Windows talk to each other this way.',
    now: 'window.postMessage between browser tabs and iframes.',
  },
  'hs-wm-close': {
    term: 'WM_CLOSE',
    short: 'The polite request to close a window. The program can save its work first, ask a question, or ignore it.',
    now: 'SIGTERM on Linux and macOS, or a “beforeunload” in the browser.',
  },
  'hs-terminate': {
    term: 'TerminateProcess',
    short: 'Ends a program at once, from outside, without asking it. The system takes back its memory.',
    now: 'kill -9, or Force Quit on a Mac.',
  },
  'hs-service': {
    term: 'Windows Mobile service',
    short: 'A DLL that services.exe loads at startup and keeps running in the background. It has a short three-letter prefix (HandySwitcher’s is HSW) and its settings live in the registry under Services.',
    now: 'A launchd daemon on macOS or a systemd service on Linux.',
  },
  'hs-registry': {
    term: 'Registry',
    short: 'The system-wide settings store on Windows: keys like folders, holding named values. Every program keeps its settings there.',
    now: 'A key-value store for the whole system, like macOS defaults or localStorage for every app at once.',
  },
  'hs-device-id': {
    term: 'Device ID',
    short: 'A number burned into each Pocket PC that the system hands out when asked (the IOCTL_HAL_GET_DEVICEID request). Shareware turned it into a code the buyer could read out to the seller.',
    now: 'A hardware fingerprint, like the identifier an app store uses to tie a license to one phone.',
  },
  'hs-rc4': {
    term: 'RC4',
    short: 'A famous cipher from 1987: shuffle a deck of 256 numbers with a password, then keep swapping cards and dealing one out for each byte. DinarSoft’s key engine uses the same deal-and-swap idea with a deck of 120.',
    now: 'RC4 once protected Wi-Fi (WEP) and HTTPS. Today ChaCha20 does that job.',
  },
  'hs-tap-and-hold': {
    term: 'Tap and hold',
    short: 'Windows Mobile’s right click: keep the stylus still and a ring of red dots fills in, then a second menu opens.',
    now: 'A long press on a phone.',
  },
  'hs-dialog-template': {
    term: 'Dialog template',
    short: 'A screen’s layout stored as data inside the program: every label, box and button with its position and size. Windows builds the screen from it at run time.',
    now: 'An Android XML layout or a SwiftUI view description.',
  },
  'hs-cab': {
    term: 'CAB installer',
    short: 'The install package for a Pocket PC: the program files plus a small list of where each one goes and what to add to the registry.',
    now: 'An APK on Android or an IPA on iOS.',
  },
} satisfies Record<string, Term>;
