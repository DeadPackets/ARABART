import type { Term } from '../glossary';

// Terms used by the HijriDate writeup (src/writeups/dinarsoft-hijridate.astro)
export default {
  'hd-today-screen': {
    term: 'Today screen',
    short: 'The home screen of a Windows Mobile Pocket PC: one column of small panels for the date, mail, tasks and appointments. Other programs could add their own panel to it.',
    now: 'The home screen of a phone, with its widgets.',
  },
  'hd-today-plugin': {
    term: 'Today plug-in',
    short: 'A small DLL that adds a panel to the Today screen. The Today screen loads it, gives it a strip of the screen, and asks it every two seconds whether it needs to redraw.',
    now: 'A home screen widget: WidgetKit on iPhone, an App Widget on Android.',
  },
  'hd-hijri': {
    term: 'Hijri calendar',
    short: 'The Islamic calendar. Its 12 months follow the moon, so a year is about 354 days. A month starts when the new crescent is first seen after sunset. Years count from the Hijra, the Prophet’s move from Mecca to Medina in 622.',
    now: 'Still the calendar for Ramadan, the two Eids and the Hajj. Every browser ships it: Intl.DateTimeFormat with calendar islamic-umalqura.',
  },
  'hd-new-moon': {
    term: 'New moon',
    short: 'The moment the moon passes between the Earth and the sun, so its lit side faces away from us. A few hours to a day later, a thin crescent can be seen just after sunset.',
    now: 'Astronomy apps print it to the minute.',
  },
  'hd-julian-day': {
    term: 'Julian day',
    short: 'A plain count of days since noon on 1 January 4713 BC. Astronomers use it so that any two dates subtract into a number of days, with no months or leap years in the way.',
    now: 'A Unix timestamp, counted in days instead of seconds.',
  },
  'hd-dll': {
    term: 'DLL',
    short: 'A dynamic-link library: a file of code that another program loads and calls. HijriDate is one DLL that the Today screen loads.',
    now: 'A shared library: a .dylib on a Mac, a .so on Linux, a module a host app imports.',
  },
  'hd-bitblt': {
    term: 'BitBlt',
    short: 'The Windows call that copies a rectangle of pixels from one picture to another. A rule called a raster operation mixes the two: copy, AND, OR, XOR and more.',
    now: 'drawImage on a canvas with globalCompositeOperation.',
  },
  'hd-rop': {
    term: 'Raster operation',
    short: 'The rule BitBlt uses to mix source pixels with the pixels already there, bit by bit. AND keeps a pixel only where both are on, OR turns it on where either is on, XOR flips it.',
    now: 'Blend modes and compositing operators in CSS and canvas, such as multiply, screen and xor.',
  },
  'hd-soft-float': {
    term: 'Software floating point',
    short: 'The phone’s ARM chip had no hardware for decimal fractions. So every add or multiply of a double was a call into a small library in the system (__addd, __muld).',
    now: 'What a JavaScript engine does on a chip with no float unit. Phones today all have one.',
  },
  'hd-device-id': {
    term: 'Device ID',
    short: 'A number burned into each Pocket PC that tells it apart from every other one. Programs read it with one system call, KernelIoControl.',
    now: 'identifierForVendor on iPhone, ANDROID_ID on Android.',
  },
  'hd-registry': {
    term: 'Registry',
    short: 'The Windows settings database: a tree of keys and values. Programs save their options and their unlock keys there.',
    now: 'UserDefaults on iPhone, SharedPreferences on Android, localStorage in a browser.',
  },
  'hd-rc4': {
    term: 'RC4',
    short: 'A simple, famous cipher from 1987: shuffle a table of numbers with a key, then walk the table to make a stream of numbers to mix into the text. DinarSoft’s key function is built the same way, with 120 numbers.',
    now: 'Retired from Wi-Fi and HTTPS. The idea of a keyed shuffle lives on in every stream cipher.',
  },
} satisfies Record<string, Term>;
