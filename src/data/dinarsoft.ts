// DinarSoft: the company, its six apps, their versions, downloads, awards and reviews.
// Facts: research/dinarsoft/{INVENTORY,BRAND,RELEASE}.md, its site mirror and captures, research/career.md.
// Images, installers and hashes come from public/dinarsoft/manifest.json (research/dinarsoft/scripts/publish_hub.py).
import manifest from '../../public/dinarsoft/manifest.json';

export type AppId = 'memmaid' | 'handyswitcher' | 'handymenu' | 'handylauncher' | 'taptext' | 'hijridate';
export const APP_IDS: AppId[] = ['memmaid', 'handyswitcher', 'handymenu', 'handylauncher', 'taptext', 'hijridate'];

const base = import.meta.env.BASE_URL;
type Rec = { src: string; w: number; h: number; wayback?: string; timestamp?: string | null; owner?: string };
const images = manifest.images as Record<string, Rec>;

export interface Img { src: string; w: number; h: number }
export function img(key: string): Img {
  const r = images[key];
  if (!r) throw new Error(`DinarSoft image "${key}" is not in public/dinarsoft/manifest.json`);
  return { src: `${base}/${r.src}`, w: r.w, h: r.h };
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** '2007-07-11' or '20070711093000' to 'July 11, 2007'; '2007-07' to 'July 2007'; '2007' stays. */
export function longDate(d: string) {
  const s = d.replace(/-/g, '');
  const y = s.slice(0, 4), m = +s.slice(4, 6), day = +s.slice(6, 8);
  if (!m) return y;
  return day ? `${MONTHS[m - 1]} ${day}, ${y}` : `${MONTHS[m - 1]} ${y}`;
}
const iso = (ts: string) => `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`;
const wb = (ts: string, url: string) => `https://web.archive.org/web/${ts}/${url}`;

// ---------- The apps ----------

export interface Screen { key: string; alt: string; fit?: boolean; hot?: { x: number; y: number; to: number; label: string } }
export interface Release { v: string; date: string; notes: string[] }
export interface App {
  id: AppId;
  name: string;
  pre: string;
  post: string;
  slogan: string;
  one: string;
  story: string[];
  does: string;
  price: string;
  runs: string;
  releases: Release[];
  screens: Screen[];
}

export const apps: App[] = [
  {
    id: 'memmaid', name: 'MemMaid', pre: 'Mem', post: 'Maid', slogan: 'The Best Maid for PocketPCs',
    one: 'His flagship: it finds everything that fills a Pocket PC’s memory, clears it in one tap, then hands you the controls for the rest of the device.',
    does: 'Cleans memory, schedules cleaning, manages startup programs, services and the registry',
    story: [
      'MemMaid looked through the whole device for whatever was eating its memory: browser caches, temporary files, cookies, the leftovers of apps you had removed, reminders that pointed at nothing. One tap on Clean, and the space came back. DinarSoft called it “the #1 maintenance utility for Windows Mobile devices.”',
      'Then it kept growing. Version 2.0 had more than 25 cleaners, a cleaning schedule, a full registry editor, a database explorer, a startup manager and a CPU monitor, each on its own tab. Think of your phone’s storage settings, a task manager and a system cleaner, joined into one small app.',
      'Reviewers around the world loved it. eMobie called it “the Swiss Army Knife of PPC utilities” and gave it five stars. It was a finalist in the magazine’s Best Software Awards four years running, from 2005 to 2008, and Russia’s CHIP magazine put it on its cover disc twice.',
    ],
    price: '$14.99 in 2006, $19.99 in 2008',
    runs: 'Pocket PC 2002 (version 1.73), Windows Mobile 2003, 5 and 6. Portrait, landscape and square screens',
    releases: [
      { v: '1.0', date: '2003-06-16', notes: ['The first release.'] },
      { v: '1.3', date: '2003-08-03', notes: ['Windows Mobile 2003 SE support.', 'Lists, cleans and deletes the device’s databases.', 'Manages Today screen plug-ins: turn them on and off, reorder them, change their settings.', 'Sets the order of startup programs.', 'A file finder by name, with wildcards, and by size.', 'A cleaner for the leftovers of removed apps.', 'Help that follows the screen you are on.'] },
      { v: '1.4', date: '2004-11-30', notes: ['The DLL Optimizer, a new memory tweak.', 'A 2D or 3D chart of storage use.', 'Running processes sorted by the memory they hold.', 'A light QuickCleaner shortcut.', 'Remembers your last tab and screen.'] },
      { v: '1.41', date: '2005-01-01', notes: ['A stronger DLL Optimizer and uninstall cleaner.'] },
      { v: '1.44', date: '2005-05-01', notes: ['The DLL Optimizer moves Today plug-ins too.', 'Storage use handles memory cards bigger than 4 GB.'] },
      { v: '1.5', date: '2005-11-11', notes: ['Windows Mobile 5 support.'] },
      { v: '1.61', date: '2006-05-23', notes: ['AvantGo 6.2 support.', 'The DLL Optimizer shows every DLL on the device.'] },
      { v: '1.72', date: '2006-07-20', notes: ['Reclaim RAM: frees the memory that running programs hold, by the megabyte.', 'Switches between portrait and landscape on the fly.', 'New cleaners for Opera, NetFront, Virtual Earth, Windows Media DRM and leftover reminders.', 'Menus that match Windows Mobile 5.'] },
      { v: '1.73', date: '2007-02-17', notes: ['A new setup program.', 'The new DinarSoft logo on the About screen.'] },
      { v: '2.0', date: '2007-07-11', notes: ['A new look, rebuilt from the ground up.', 'More than 25 new and updated cleaners.', 'Scheduled cleaning.', 'A full registry editor with import and export.', 'A database manager and explorer.', 'CPU and memory usage, card tools, a CAB installer, file types, system tweaks.', 'Windows Mobile 6, and VGA and QVGA screens.'] },
      { v: '2.1', date: '2007-12-15', notes: ['Speaks German, French and Simplified Chinese.', 'Choose which browser cookies to keep.', 'New cleaners for the Recycle Bin and the Google Maps cache.'] },
      { v: '2.2', date: '2008-02-13', notes: ['Speaks Russian, Italian, Slovak and Czech too.', 'Installed programs sorted by name.'] },
      { v: '2.3', date: '2008-06-16', notes: ['800 by 480 screens, like the Sony Ericsson Xperia X1.', 'The latest AvantGo and Opera.', 'Sort installed apps by date, name or size.'] },
    ],
    screens: [
      { key: 'mm2-1', alt: 'MemMaid 2, Quick Cleaner: a checklist of what to clean, from closing running programs to Internet Explorer’s cache, with Clean and Scan buttons.' },
      { key: 'mm2-6', alt: 'Running Programs: Windows Media, MemMaid, Notes, Contacts, File Explorer and Solitaire with the memory each one holds, and Activate, Memory and Terminate buttons.' },
      { key: 'mm2-5', alt: 'Storage Usage: a folder tree with the size of each folder, over a 3D pie chart of the apps that use the most space.' },
      { key: 'mm2-4', alt: 'Startup Items: the shortcuts that run when the device starts, HandyLauncher, HandyMenu and HandySwitcher among them, with buttons to reorder or remove them.' },
      { key: 'mm2-sc', alt: 'Cleaning Schedule: clean on soft reset or daily at 12:00 AM, with a Schedule Frequency dialog set to weekly, on Wednesday.' },
      { key: 'mm2-2', alt: 'Notification Queue: reminders the system will fire by time or by event, each with its program, its argument and when it runs.' },
      { key: 'mm2-3', alt: 'System Tweaks: Internet Explorer’s cache size, reading buffer, history and connections, with Optimize and Apply buttons.' },
      { key: 'mm2-lf', alt: 'Look and Feel: pick the background stripes, the button style and your own highlight and text colors.' },
    ],
  },
  {
    id: 'handyswitcher', name: 'HandySwitcher', pre: 'Handy', post: 'Switcher', slogan: 'The Ultimate Task Manager',
    one: 'A task manager in the title bar: see every running app, switch with a tap, and close for real. The magazine’s best task manager of 2007 and of 2008.',
    does: 'Switches between running apps and closes them for real',
    story: [
      'On a Pocket PC, the X in the corner did not close an app. It only hid it, and the app kept running and holding memory. HandySwitcher made that X close for real, and put a small icon in the title bar that opened a list of everything running. Tap a name to switch to it, tap its X to close it, or close them all at once.',
      'Version 2.7 brought the phone’s own keys into play: arrows to pick an app, Enter to switch, Right to close, so it worked with one thumb. Version 3.0 added skins, CPU and memory usage, a list of apps to leave alone, and your own actions for tap and tap-and-hold. It is the app switcher every phone has today, written by one engineer in Kanata.',
      'Smartphone & Pocket PC magazine named it the best task manager of 2007, and again of 2008.',
    ],
    price: '$7.99 for 2.7, $9.99 for 3.x',
    runs: 'Pocket PC 2002, Windows Mobile 2003 and 5 (2.7); Windows Mobile 6 too (3.1). Portrait, landscape and square screens',
    releases: [
      { v: '1.0', date: '2003-09-11', notes: ['The first release.'] },
      { v: '2.0', date: '2004-03-31', notes: ['Colorful menus, in the colors you choose.', 'Places HandyMenu’s icon in compact mode.'] },
      { v: '2.0 update', date: '2004-07-31', notes: ['Speaks Dutch and Spanish.'] },
      { v: '2.1', date: '2005-06-13', notes: ['The menu follows the theme colors.', 'Close All shows even with one program running.'] },
      { v: '2.5', date: '2005-10-31', notes: ['Windows Mobile 5 support.'] },
      { v: '2.7', date: '2006-03-27', notes: ['Square screens.', 'The hardware keys: Enter switches, Right closes, Left cancels, for one-hand use.', 'Auto switch: rest on an app in the menu and HandySwitcher switches to it after a delay you set.', 'Better phone edition support.'] },
      { v: '3.0', date: '2007-05-05', notes: ['Skins and a menu you arrange yourself.', 'Your own actions for tap and tap-and-hold.', 'An X that really closes, and Close All.', 'CPU and memory usage.', 'Ends background processes and frees the memory they leave.', 'Windows Mobile 6, VGA and QVGA, every screen direction.'] },
      { v: '3.1', date: '2008-04-13', notes: ['Faster, and a free upgrade for 3.0 owners.'] },
    ],
    screens: [
      { key: 'hs3-6', alt: 'HandySwitcher’s menu open from the title bar: Calendar, Internet Explorer, Notes, File Explorer, Excel Mobile and ActiveSync, each with a red X, then Close All, Minimize All, CPU Usage and Memory Usage.' },
      { key: 'hs3-1', alt: 'CPU and Memory Usage: 18 processes and the memory each one holds, with Refresh, Terminate and CPU buttons.' },
      { key: 'hs3-3', alt: 'HandySwitcher Settings, Ignore List: automation rules such as Reclaim RAM on Close Program, and an option to confirm before closing programs that do not respond.' },
      { key: 'hs3-4', alt: 'HandySwitcher Settings, Menu Items: checkboxes for Close All But Active, Close All, Minimize All, CPU Usage, Memory Usage, Minimize Active and Close Active.' },
    ],
  },
  {
    id: 'handymenu', name: 'HandyMenu', pre: 'Handy', post: 'Menu', slogan: 'Powerful System Access',
    one: 'One tap in the corner for the things you reach for most: power off, reset, screen capture, brightness, memory, rotation.',
    does: 'A menu of system shortcuts: power, reset, capture, brightness, rotation',
    story: [
      'HandyMenu put a small power icon on the screen. Tap it, and a menu opened with the system controls people reached for every day: power off, soft reset, brightness, memory, Today themes and plug-ins, the clock, running programs. It added tools of its own too, like a screen capture, an IP address helper and a screen-off button. Think of the quick settings panel you swipe down on your phone today.',
      'You could turn each item on or off, move it up or down, and color the menu your way. It spoke English, German, Dutch, Portuguese and Spanish, and switched between them while running. Pocket PC Thoughts called version 2.5 “A steal at $5.99!”',
    ],
    price: '$5.99',
    runs: 'Pocket PC 2002, Windows Mobile 2003 and 5 (3.6); Windows Mobile 6 too (3.7). Portrait, landscape and square screens',
    releases: [
      { v: '1.0', date: '2003-07-06', notes: ['The first release.'] },
      { v: '2.0', date: '2004-03-31', notes: ['English and German.', 'Colorful menus you design.'] },
      { v: '2.5', date: '2004-07-29', notes: ['English, German, Dutch and Portuguese, switched while it runs.', 'Windows Mobile 2003 SE support.', 'Sharp icons for VGA screens.', 'Shortcuts to MemMaid.', 'Turns the screen left or right.'] },
      { v: '2.6', date: '2004-10-06', notes: ['Follows the theme colors.'] },
      { v: '2.7', date: '2004-11-01', notes: ['Speaks Spanish, with a fresh Dutch.'] },
      { v: '2.9', date: '2005-06-08', notes: ['Flips the screen 180 degrees.', 'Screen off and screen refresh.', 'An IP helper: view, release and renew addresses.'] },
      { v: '3.0', date: '2005-06-30', notes: ['Screen capture and screen orientation.', 'VGA and Windows Mobile 5 support.'] },
      { v: '3.6', date: '2006-03-06', notes: ['Square screens.'] },
      { v: '3.7', date: '2008-06-24', notes: ['Windows Mobile 6, in the 2008 installer.'] },
    ],
    screens: [
      { key: 'hm', alt: 'The Today screen of a Pocket PC in May 2005, with HandyMenu’s green power icon at the bottom right.', hot: { x: 228, y: 308, to: 1, label: 'Tap HandyMenu’s icon' } },
      { key: 'hmcolors', alt: 'HandyMenu open: Soft Reset, Power Off, Brightness, Memory, Today Themes, Today Plugins, Today Screen, Clock and Running Programs, each with its icon.' },
    ],
  },
  {
    id: 'handylauncher', name: 'HandyLauncher', pre: 'Handy', post: 'Launcher', slogan: 'The Seamless Launcher',
    one: 'Your own start menu in the corner of the screen, and every shortcut opens in the screen direction you chose for it.',
    does: 'A start menu of your own, with a screen direction per shortcut',
    story: [
      'HandyLauncher put a tiny icon on the Today screen that opened your own menu of programs, folders and documents. Anything you wanted, one tap away, without filling the home screen. A second menu opened with tap-and-hold, so it held twice as many shortcuts.',
      'From version 3.2 it did something clever. It turned the screen to portrait or landscape before opening each shortcut, so your spreadsheet always opened wide and your notes opened tall. Advanced users could even pass it command-line options, the way you pass flags to a script.',
    ],
    price: '$5.49',
    runs: 'Pocket PC 2002, Windows Mobile 2003 and 5. Portrait, landscape and square screens',
    releases: [
      { v: '1.0', date: '2003-08-23', notes: ['The first release.'] },
      { v: '2.0', date: '2004-08-12', notes: ['English and German.', 'Colorful menus you design.', 'A -X option to open the menu from the top of the screen.'] },
      { v: '3.0', date: '2004-09-24', notes: ['Two menus: one for tap, one for tap-and-hold, for twice the shortcuts.'] },
      { v: '3.2', date: '2005-03-11', notes: ['Turns the screen to portrait or landscape before it opens each shortcut.'] },
      { v: '3.3', date: '2005-11-08', notes: ['Windows Mobile 5 support.'] },
      { v: '3.4', date: '2006-03-15', notes: ['Square screens.'] },
    ],
    screens: [
      { key: 'hmenuscreen', alt: 'The Today screen in September 2006, with HandyMenu’s and HandyLauncher’s icons at the bottom right.', hot: { x: 230, y: 284, to: 1, label: 'Tap HandyLauncher’s icon' } },
      { key: 'hlauncherscreen', alt: 'HandyLauncher open: My Documents, Pocket Excel, Pocket Word, Calculator, File Explorer, Internet Explorer, MSN Messenger and Solitaire.' },
    ],
  },
  {
    id: 'taptext', name: 'TapText', pre: 'Tap', post: 'Text', slogan: 'More Text, Less Taps.',
    one: 'Saved text, typed into any app in two taps: signatures, replies, addresses, form answers and date stamps. Best Misc. Utility of 2007.',
    does: 'Types saved text and date stamps into any app',
    story: [
      'Typing on a Pocket PC meant a stylus and a tiny keyboard on the screen. TapText put a small icon at the top of the screen that opened your own menus of saved text. Pick an item, and TapText typed it into whatever app you were in, Word, Notes, email or a web form, without leaving it and without changing your keyboard. Today, text replacement and saved replies in your mail app do the same.',
      'It wrote date and time stamps in the format you chose, nested menus inside menus, gave each item an icon from its own library, and filled forms field by field. Smartphone & Pocket PC magazine named it the best Misc. Utility of 2007.',
    ],
    price: '$9.99',
    runs: 'Pocket PC 2002, Windows Mobile 2003 and 5. Portrait, landscape and square screens',
    releases: [
      { v: '1.0', date: '2005-03-07', notes: ['The first release.'] },
      { v: '1.1', date: '2005-03-28', notes: ['Notes up to 8,000 characters each.', 'Keeps the first letter in the case you chose.', 'Works fully with TextMaker.', 'More date formats.', 'Copy, cut, paste and undo inside the options.'] },
      { v: '1.2', date: '2005-04-14', notes: ['More date formats.', 'Special keys: Ctrl+B, Ctrl+I, Ctrl+U and Tab.'] },
      { v: '1.3', date: '2006-02-27', notes: ['Import and export your menus, to back up or switch profiles.', 'Room for longer text.', 'Smarter {tap} for filling forms.', 'Square screens.'] },
    ],
    screens: [
      { key: 'taptextscreen', alt: 'TapText’s start screen: a pen signing a line, “TapText”, and “Tap more with only a tap”.' },
      { key: 'ttmc', alt: 'TapText’s menu: Signatures, Email templates, Reports, Meeting Notes, Quotes, Finding Help and Financial, each with its icon.', fit: true },
      { key: 'tto', alt: 'TapText’s options: a tree of menus and items, from Signatures and Business Card to Email templates and Project Status, with buttons to add, edit and reorder.', fit: true },
    ],
  },
  {
    id: 'hijridate', name: 'HijriDate', pre: 'Hijri', post: 'Date', slogan: 'What is Today',
    one: 'Today’s date in the Hijri calendar, in Arabic or English, right on the Pocket PC’s home screen.',
    does: 'Shows the Hijri and Gregorian dates on the Today screen, in Arabic or English',
    story: [
      'The Hijri calendar follows the moon. It sets the dates of Ramadan and the two Eids for Muslims everywhere. HijriDate put it on the Pocket PC’s Today screen, its home screen, in Arabic or English, beside the usual date or instead of it. It was the first light-weight Today plug-in for the Hijri calendar.',
      'It drew its Arabic by itself, with no extra fonts or programs, and calculated the date for Mecca. You could move it a day earlier or later to match the crescent sighting where you live. A tap switched between the two calendars.',
    ],
    price: '$2.99',
    runs: 'Pocket PC 2002, Windows Mobile 2003 and 5',
    releases: [
      { v: '1.0', date: '2003-06-27', notes: ['The first release.'] },
      { v: '1.1', date: '2004-03-10', notes: ['A stronger date engine.'] },
      { v: '1.2', date: '2004-04-20', notes: ['Windows Mobile 2003 support.'] },
      { v: '1.5', date: '2005-03-05', notes: ['Windows Mobile 5 support.'] },
    ],
    screens: [
      { key: 'hijriscreen', alt: 'The Today screen with HijriDate: Sunday 2 Ramadan 1427 and Sunday 24 September 2006, both written in Arabic.' },
    ],
  },
];
export const appById = Object.fromEntries(apps.map(a => [a.id, a])) as Record<AppId, App>;
export const icon = (id: AppId) => img(`icon-${id}`);
export const screenImg = (s: Screen) => img(`screen-${s.key}`);

// ---------- Downloads ----------

export interface Download {
  file: string; app: AppId; version: string; kind: 'device' | 'desktop'; bytes: number; sha256: string;
  href: string; credit: string; source: string; latest: boolean;
}
const APP_OF: [RegExp, AppId][] = [[/MemMaid/, 'memmaid'], [/HandySwitcher/, 'handyswitcher'], [/HandyMenu/, 'handymenu'], [/HandyLauncher/, 'handylauncher'], [/TapText/, 'taptext'], [/HijriDate/, 'hijridate']];
const LATEST = new Set(['DinarSoftMemMaid_en.CAB', 'DinarSoftMemMaid_en_Setup.exe', 'DinarSoftMemMaid.CAB', 'DinarSoftMemMaid_Setup.exe', 'DinarSoftHandySwitcher_Demo.CAB', 'DinarSoftHandySwitcher_Setup.exe', 'DinarSoftHandyMenu.CAB', 'DinarSoftHandyMenu_Setup.exe', 'DinarSoftHandyLauncher34.CAB', 'DinarSoftHandyLauncher34_Setup.exe', 'DinarSoftTapText13.CAB', 'DinarSoftTapText13.exe', 'DinarSoftHijriDate15.CAB', 'DinarSoftHijriDate15.exe']);
const VERSION_LABEL: Record<string, string> = {
  'DinarSoftHandySwitcher27.exe': '2.7, the 2007 installer',
  'DinarSoftHandySwitcher27_20061223.exe': '2.7, the 2006 installer',
  'CHIP-2006-06_DinarSoftMemMaidPG15a.exe': '1.5a, from CHIP magazine’s disc (June 2006)',
  'CHIP-2008-06_DinarSoftHandySwitcher_Setup.exe': '3.1, first build, from CHIP magazine’s disc (June 2008)',
};
export const downloads: Download[] = manifest.downloads.map((d): Download => {
  const app = APP_OF.find(([re]) => re.test(d.file))![1];
  const chip = d.archive_item as string | null;
  return {
    file: d.file, app, bytes: d.bytes, sha256: d.sha256,
    version: VERSION_LABEL[d.file] ?? d.version.replace(/\(Build (\d+)\)/, 'build $1'),
    kind: /\.cab$/i.test(d.file) ? 'device' : 'desktop',
    href: `${base}/dinarsoft/downloads/${d.file}`,
    credit: chip ? `Recovered from the Internet Archive (CHIP magazine’s cover disc, ${longDate(chip.slice(-7))})` : `Recovered from the Internet Archive (Wayback Machine, ${longDate(d.timestamp!)})`,
    source: chip ?? wb(d.timestamp!, d.original_url!),
    latest: LATEST.has(d.file),
  };
}).sort((a, b) => APP_IDS.indexOf(a.app) - APP_IDS.indexOf(b.app) || +b.latest - +a.latest || b.version.localeCompare(a.version, 'en', { numeric: true }));
export const totalBytes = downloads.reduce((n, d) => n + d.bytes, 0);

// ---------- Captures ----------

export interface Shot extends Img { key: string; alt: string; link: string; credit: string }
/** A published capture: the image, a link to the archived page, and its credit line. */
export function shot(key: string, alt: string): Shot {
  const r = images[key];
  const i = img(key);
  const chip = r.wayback!.startsWith('https://archive.org/');
  const link = chip ? r.wayback!.split(' ')[0] : r.wayback!;
  const credit = chip ? `via the Internet Archive, ${link.replace('https://archive.org/details/', 'archive.org item ')}` : `via the Internet Archive, Wayback Machine, ${longDate(r.timestamp!)}`;
  return { ...i, key, alt, link, credit };
}

// ---------- Awards: Pocket PC Magazine, later Smartphone & Pocket PC, Best Software Awards ----------

export type Level = 'Nominee' | 'Finalist' | 'Winner';
export interface Award { app: AppId; year: number; level: Level; category?: string; shots: Shot[] }
const nom = (y: number, a: AppId) => shot(`tp-${y}-ppcmag-nominations--${a}`, `${appById[a].name} on the magazine’s ${y} nominations page`);
const win = (y: number, a: AppId) => shot(y === 2008 ? `tp-2008-smartphonemag-winners-p2--${a}` : `tp-${y}-smartphonemag-winners--${a}`, `${appById[a].name} on the magazine’s ${y} winners page`);
export const awards: Award[] = [
  { app: 'handymenu', year: 2003, level: 'Nominee', category: 'Today-screen Plug-ins', shots: [nom(2003, 'handymenu')] },
  { app: 'memmaid', year: 2004, level: 'Nominee', category: 'System and Registry', shots: [nom(2004, 'memmaid')] },
  { app: 'handymenu', year: 2004, level: 'Nominee', category: 'System and Registry', shots: [nom(2004, 'handymenu')] },
  { app: 'handyswitcher', year: 2004, level: 'Nominee', category: 'Task Management', shots: [nom(2004, 'handyswitcher')] },
  { app: 'memmaid', year: 2005, level: 'Finalist', category: 'Maintenance', shots: [win(2005, 'memmaid'), nom(2005, 'memmaid')] },
  { app: 'taptext', year: 2005, level: 'Nominee', category: 'Soft Keyboards', shots: [nom(2005, 'taptext')] },
  { app: 'handymenu', year: 2005, level: 'Nominee', category: 'System and Registry', shots: [nom(2005, 'handymenu')] },
  { app: 'handyswitcher', year: 2005, level: 'Nominee', category: 'Task Management', shots: [nom(2005, 'handyswitcher')] },
  { app: 'memmaid', year: 2006, level: 'Finalist', category: 'Maintenance', shots: [win(2006, 'memmaid'), nom(2006, 'memmaid')] },
  { app: 'taptext', year: 2006, level: 'Nominee', category: 'Soft Keyboards', shots: [nom(2006, 'taptext')] },
  { app: 'handymenu', year: 2006, level: 'Nominee', category: 'System and Registry', shots: [nom(2006, 'handymenu')] },
  { app: 'handyswitcher', year: 2006, level: 'Nominee', category: 'Task Management', shots: [nom(2006, 'handyswitcher')] },
  { app: 'memmaid', year: 2007, level: 'Finalist', category: 'Multifunction Maintenance Tools', shots: [win(2007, 'memmaid'), nom(2007, 'memmaid')] },
  { app: 'taptext', year: 2007, level: 'Winner', category: 'Misc. Utilities', shots: [win(2007, 'taptext'), nom(2007, 'taptext')] },
  { app: 'handyswitcher', year: 2007, level: 'Winner', category: 'Task Managers', shots: [win(2007, 'handyswitcher'), nom(2007, 'handyswitcher')] },
  { app: 'handymenu', year: 2007, level: 'Nominee', category: 'System and Registry', shots: [nom(2007, 'handymenu')] },
  { app: 'handylauncher', year: 2007, level: 'Nominee', category: 'Today Launchers', shots: [nom(2007, 'handylauncher')] },
  { app: 'handyswitcher', year: 2008, level: 'Winner', category: 'Task Managers', shots: [win(2008, 'handyswitcher')] },
  { app: 'memmaid', year: 2008, level: 'Finalist', category: 'Multifunction Maintenance Tools', shots: [win(2008, 'memmaid')] },
  { app: 'taptext', year: 2008, level: 'Finalist', category: 'Misc. Utilities', shots: [win(2008, 'taptext')] },
  { app: 'handymenu', year: 2008, level: 'Finalist', category: 'System and Registry', shots: [win(2008, 'handymenu')] },
  { app: 'handylauncher', year: 2008, level: 'Nominee', shots: [win(2008, 'handylauncher')] },
];
export const AWARD_YEARS = [2003, 2004, 2005, 2006, 2007, 2008];

/** Other honors, from the stores' and sites' pages and DinarSoft's own releases. */
export interface Honor { app: AppId; date: string; title: string; by: string; link?: string; shot?: Shot }
const rel = (ts: string, path: string) => wb(ts, `http://www.dinarsoft.com/news/${path}`);
export const honors: Honor[] = [
  { app: 'handyswitcher', date: '2003', title: 'Foxpop Gold', by: 'Foxpop' },
  { app: 'memmaid', date: '2006-07-26', title: 'Finalist, Handango Champion Awards, Best Application for Work', by: 'Handango', link: rel('20081120155240', 'hngchampion.html') },
  { app: 'memmaid', date: '2006-08-01', title: 'Editor’s Choice', by: 'PocketGear', link: rel('20081120172304', 'memmaid-is-editor-choice.html') },
  { app: 'memmaid', date: '2006-10-30', title: 'A Dr. File Finder Favorite', by: 'Tucows', link: wb('20071212153437', 'http://www.tucows.com/article/1128') },
  { app: 'memmaid', date: '2006-12-11', title: 'Five stars', by: 'Pocketland', link: rel('20081120131814', 'pocketland-reviewed-memmaid-and-gave-it-5-stars.html') },
  { app: 'memmaid', date: '2007-01-09', title: 'Software Tip of the month', by: 'Pocketland Spain', link: rel('20081120135841', 'pocketland-spain-reviewed-memmaid.html') },
  { app: 'memmaid', date: '2007-11-17', title: 'One of the Best Applications for 2007', by: 'Handango', link: rel('20080819151325', 'memmaid-named-one-of-the-best-applications-for-2007-by-handango.html') },
  { app: 'memmaid', date: '2007', title: 'Number 7 in the Top 10 of 2007', by: 'Clinton Fitch' },
  { app: 'handyswitcher', date: '2007', title: 'Staff Pick, “what we can’t live without”', by: 'Handango' },
];

// ---------- Reviews (quotes under 15 words) ----------

export interface Review { app: AppId; date: string; outlet: string; where?: string; by?: string; title: string; quote?: string; rating?: string; shots: Shot[] }
const r = (key: string, alt: string) => shot(key, alt);
export const reviews: Review[] = [
  { app: 'handymenu', date: '2004-04-16', outlet: 'Pocket PC Life', where: 'UK', by: 'Tim Hillebrand', title: 'HandyMenu V.2.0 Reviewed', rating: '5 of 5 stars', shots: [r('tp-2004-04-pocketpclife-handymenu--headline', 'HandyMenu V.2.0 Reviewed, posted Friday, April 16, 2004'), r('tp-2004-04-pocketpclife-handymenu--rating', 'Review box: DinarSoft, HandyMenu 2.0, reviewed by Tim Hillebrand, five stars')] },
  { app: 'handyswitcher', date: '2004-04-17', outlet: 'Pocket PC Life', where: 'UK', by: 'Tim Hillebrand', title: 'Handy Switcher V 2.0 Reviewed', rating: '4 of 5 stars', shots: [r('tp-2004-04-pocketpclife-handyswitcher--headline', 'Handy Switcher V 2.0 Reviewed, posted Saturday, April 17, 2004'), r('tp-2004-04-pocketpclife-handyswitcher--rating', 'Review box: DinarSoft, HandySwitcher 2.0, reviewed by Tim Hillebrand, four stars')] },
  { app: 'memmaid', date: '2004-07-01', outlet: 'Geekzone', where: 'New Zealand', by: 'M Freitas', title: 'MemMaid for Pocket PC review', quote: 'a nice well polished tool', shots: [r('tp-2004-07-geekzone-memmaid--headline', 'MemMaid for Pocket PC review')] },
  { app: 'handymenu', date: '2004-07-17', outlet: 'Geekzone', where: 'New Zealand', by: 'M Freitas', title: 'HandyMenu review', quote: 'access to any of these functions just a tap away', shots: [r('tp-2004-07-geekzone-handymenu--headline', 'HandyMenu review')] },
  { app: 'memmaid', date: '2004-07-23', outlet: 'Pocket PC Dubai', where: 'UAE', by: 'Mabini', title: 'MemMaid Review', quote: 'MemMaid Version 1.2 that finally ended my search', shots: [r('tp-2004-07-pocketpcdubai-memmaid--headline', 'MemMaid Review')] },
  { app: 'handymenu', date: '2004-09-08', outlet: 'Pocket PC Thoughts', by: 'Doug Raeburn', title: 'All Tapped Out? DinarSoft’s HandyMenu v2.5 Reviewed', quote: 'A steal at $5.99!', shots: [r('tp-2004-09-ppcthoughts-handymenu--headline', 'All Tapped Out? DinarSoft’s HandyMenu v2.5 Reviewed')] },
  { app: 'memmaid', date: '2004-09-09', outlet: 'eMobie', by: 'Russ Terrell', title: 'Dinar Soft’s MemMaid Reviewed', quote: 'the Swiss Army Knife of PPC utilities', rating: '5 of 5 stars', shots: [r('tp-2004-09-emobie-memmaid--headline', 'Dinar Soft’s MemMaid Reviewed, posted 09 September 2004'), r('tp-2004-09-emobie-memmaid--verdict', 'Rating: five stars. Overview: MemMaid is the Swiss Army Knife of PPC utilities.')] },
  { app: 'memmaid', date: '2004-11-04', outlet: 'PocketPC Reviews', title: 'MemMaid 1.3 from DinarSoft', quote: 'MemMaid is a godsend!', shots: [r('tp-2004-11-pocketpcreviews-memmaid--verdict', 'Conclusion: for a reviewer a must, for the heavy user essential, MemMaid is a godsend!')] },
  { app: 'memmaid', date: '2005-01-07', outlet: 'Pocketnow', by: 'Tim Adams', title: 'Dinarsoft’s MemMaid v1.4', quote: 'it certainly has found a place in my must-have list', shots: [r('tp-2005-01-pocketnow-memmaid--headline', 'Dinarsoft’s MemMaid v1.4, January 7, 2005, review by Tim Adams, Contributing Editor')] },
  { app: 'taptext', date: '2005-03-07', outlet: 'AximSite', by: 'Jim McGowan', title: 'Tap Text', rating: '4 of 5 stars', shots: [r('tp-2005-03-aximsite-taptext--headline', 'Tap Text, by Jim McGowan, March 7, 2005. Developer DinarSoft, price US $7.99, rating four of five')] },
  { app: 'taptext', date: '2005-04-29', outlet: 'Pocket PC Thoughts', by: 'John Walkosak', title: 'DinarSoft TapText 1.0: Repetitive Text Entry is Less Repetitive', quote: 'Easy to use; Clean Interface; Easy to Customize; Good Price.', shots: [r('tp-2005-04-ppcthoughts-taptext--headline', 'DinarSoft TapText 1.0: Repetitive Text Entry is Less Repetitive')] },
  { app: 'memmaid', date: '2005-06-15', outlet: 'PDA247', where: 'UK', by: 'Neil Brown', title: 'MemMaid', quote: 'Gives control over nearly every aspect of memory management', shots: [r('tp-2005-06-pda247-memmaid--headline', 'Topic: MemMaid by Neil Brown, 15/06/2005')] },
  { app: 'handyswitcher', date: '2006-03-27', outlet: 'pdaBlast', by: 'pdaBlast! Staff', title: 'HandySwitcher Task Management for Your Pocket PC', shots: [r('tp-2006-03-pdablast-handyswitcher--headline', 'HandySwitcher Task Management for Your Pocket PC, by pdaBlast! Staff, March 27, 2006')] },
  { app: 'handyswitcher', date: '2006-06-19', outlet: 'TreoCentral', by: 'Tim Hillebrand', title: 'Task Manager Shoot-Out for the 700W', quote: 'it remains always visible for easy access', shots: [r('tp-2006-06-treocentral-shootout--headline', 'Task Manager Shoot-Out for the 700W, June 19, 2006, by Tim Hillebrand'), r('tp-2006-06-treocentral-shootout--dinarsoft', 'Handy Switcher ($7.99): a screenshot of its menu, and how it sits in the task bar, always visible')] },
  { app: 'memmaid', date: '2006-07-30', outlet: 'Just Another Mobile Monday', by: 'PatrickJ', title: 'Review - Short Take on MemMaid 1.72', shots: [r('tp-2006-07-jamm-memmaid--headline', 'Review - Short Take on MemMaid 1.72')] },
  { app: 'taptext', date: '2006-08-02', outlet: 'Pocket PC Thoughts', by: 'Brad Adrian', title: 'Speed Up Text Entry With TapText', quote: 'TapText is quickly becoming a utility that I can’t live without', shots: [r('tp-2006-08-ppcthoughts-taptext--headline', 'Speed Up Text Entry With TapText')] },
  { app: 'memmaid', date: '2006-09-11', outlet: 'Tucows', by: 'Michael E. Callahan, “Dr. File Finder”', title: 'Shareware Spotlight: MemMaid', quote: 'If you have a PDA or smartphone this is a program you must have.', shots: [r('tp-2006-09-tucows-memmaid--verdict', 'MemMaid is simply packed with neat tools. If you have a PDA or smartphone this is a program you must have. I recommend it highly.')] },
  { app: 'memmaid', date: '2006-10-30', outlet: 'Tucows', by: 'Michael E. Callahan, “Dr. File Finder”', title: 'Favorite - MemMaid', quote: 'MemMaid is a powerful tool for your smartphone or PDA', shots: [r('tp-2006-10-tucows-favorite--headline', 'Favorite, MemMaid: a powerful tool for your smartphone or PDA, and one of Doc’s Favorites. Version 1.72.')] },
  { app: 'memmaid', date: '2007-01-09', outlet: 'Pocketland', where: 'in English, Spanish, German, French and Italian', title: 'MemMaid Cleans House', quote: 'MemMaid helps to clean up the memory on your device', shots: [r('tp-2007-01-pocketland-net-memmaid--headline', 'MemMaid Cleans House')] },
  { app: 'memmaid', date: '2007-01', outlet: 'Technology at Play', title: 'MemMaid by Dinarsoft', quote: 'MemMaid is an extremely handy program for the Pocket PC.', shots: [r('tp-2007-01-technologyatplay-memmaid--headline', 'MemMaid by Dinarsoft')] },
  { app: 'handyswitcher', date: '2007-01-17', outlet: 'GadgetMix', by: 'Kamaldeep Singh', title: 'Dinarysoft HandySwitcher Reviewed!', quote: 'functional and must have on every Pocket PC', shots: [r('tp-2007-gadgetmix-handyswitcher--headline', 'HandySwitcher is one of the lightest task switchers, and a full-fledged task manager.'), r('tp-2007-gadgetmix-handyswitcher--verdict', 'A small light-weight application, but, functional and must have on every Pocket PC')] },
  { app: 'handymenu', date: '2007-01-17', outlet: 'GadgetMix', by: 'Preetha', title: 'HandyMenu Reviewed!', quote: 'a very useful and handy application which saves time too', shots: [r('tp-2007-gadgetmix-handymenu--headline', 'Dinarsoft’s Handy menu is, as the name suggests, a very handy software.'), r('tp-2007-gadgetmix-handymenu--verdict', 'Easy to use, customisable, user friendly, cheap, light on memory, tight integration with other Dinarsoft products')] },
  { app: 'memmaid', date: '2007-04-17', outlet: 'GadgetMix', by: 'Kamaldeep', title: 'Dinarsoft Memmaid Reviewed!', quote: 'the perfect maid for your pocket pc', shots: [r('tp-2007-gadgetmix-memmaid--headline', 'Keeping the Pocket PC healthy and clutter-free just got easy. Memmaid is the perfect maid for your pocket pc.')] },
  { app: 'memmaid', date: '2007-04-30', outlet: 'ClintonFitch.com', by: 'Judie Hughes', title: 'DinarSoft MemMaid 1.73', quote: 'The cleaning feature alone would make MemMaid a must have application', shots: [r('tp-2007-05-clintonfitch-memmaid--headline', 'DinarSoft MemMaid 1.73')] },
  { app: 'handyswitcher', date: '2007-05-17', outlet: 'GadgetMix', by: 'Kamaldeep Singh', title: 'Dinarsoft HandySwitcher 3 Reviewed!', quote: 'simple-yet-powerful application', shots: [r('tp-2007-06-gadgetmix-handyswitcher3--verdict', 'So, in the end, do I recommend it? YES, go get it!')] },
  { app: 'memmaid', date: '2007-07-11', outlet: 'Mobile-View', by: 'Allistair Lee', title: 'DinarSoft’s MemMaid 2.0 Reviewed!', quote: 'Definitely deserves a 10/10 rating!', shots: [r('tp-2007-07-mobileview-memmaid--headline', 'DinarSoft’s MemMaid 2.0 Reviewed!')] },
  { app: 'taptext', date: '2007-08-23', outlet: 'The Gadgeteer', by: 'Kent Lanum', title: 'DinarSoft TapText - Windows Mobile Utility', quote: 'I really cannot see any problems with DinarSoft’s TapText', shots: [r('tp-2007-08-gadgeteer-taptext--headline', 'DinarSoft TapText - Windows Mobile Utility'), r('tp-2007-08-gadgeteer-taptext--verdict', 'Conclusion and Thoughts: I really cannot see any problems with DinarSoft’s TapText input software.')] },
  { app: 'memmaid', date: '2007-09-03', outlet: 'Just Another Mobile Monday', by: 'Brandon Steili', title: 'Review: MemMaid 2.0 and/vs SKTools 3.1.9', quote: 'I love MemMaid and its not going anywhere.', shots: [r('tp-2007-09-jamm-memmaid2-vs-sktools--headline', 'Review: MemMaid 2.0 and/vs SKTools 3.1.9')] },
  { app: 'memmaid', date: '2007-09-12', outlet: 'Eten Blog', by: 'Tariq Bamadhaj', title: 'Spring Cleaning With DinarSoft’s MemMaid', quote: 'MemMaid fills a gap left by Microsoft in the memory management department', shots: [r('tp-2007-09-etenblog-memmaid--headline', 'Spring Cleaning With DinarSoft’s MemMaid'), r('tp-2007-09-etenblog-memmaid--verdict', 'What I like about MemMaid is that it allows you to schedule the cleaning process, so your device will always be optimized.')] },
  { app: 'memmaid', date: '2007-08-18', outlet: 'AximSite', by: 'Bryan Eley', title: 'MemMaid 2.0', rating: '5 out of 5', shots: [r('tp-2007-10-aximsite-memmaid2--headline', 'MemMaid 2.0'), r('tp-2007-10-aximsite-memmaid2--rating', 'Rating: 5 out of 5')] },
  { app: 'memmaid', date: '2007', outlet: 'MyPDACafe', title: 'MemMaid by DinarSoft', shots: [r('tp-2007-mypdacafe-memmaid--headline', 'MemMaid by DinarSoft')] },
  { app: 'taptext', date: '2007-12-12', outlet: 'Eten Blog', by: 'Tariq Bamadhaj', title: 'TapText Data With Ease', quote: 'a great text-entering application', shots: [r('tp-2007-12-etenblog-taptext--headline', 'TapText Data With Ease')] },
  { app: 'memmaid', date: '2009-01-03', outlet: 'Windows Central', title: 'Review: MemMaid Memory Management Utility', quote: 'Extremely powerful and comprehensive suite of memory and storage management utilities', rating: '5 out of 5', shots: [r('tp-2009-01-windowscentral-memmaid--headline', 'Review: MemMaid Memory Management Utility')] },
];

/** Russia’s CHIP magazine put his apps on its cover discs. */
export const discs = [
  { app: 'memmaid' as AppId, date: '2006-06', title: 'MemMaid 1.6', shot: shot('tp-chip-2006-06--entry', 'CHIP magazine’s disc page for MemMaid 1.6, in Russian, with two MemMaid screens') },
  { app: 'handyswitcher' as AppId, date: '2007-05', title: 'HandySwitcher 2.7', shot: shot('tp-chip-2007-05--entry', 'CHIP magazine’s disc page for HandySwitcher 2.7, in Russian, with its menu open') },
  { app: 'handyswitcher' as AppId, date: '2008-06', title: 'HandySwitcher 3.1', shot: shot('tp-chip-2008-06--entry', 'CHIP magazine’s disc page for HandySwitcher 3.1, in Russian, with its Menu Items settings') },
  { app: 'memmaid' as AppId, date: '2008-09', title: 'MemMaid 2.3', shot: shot('tp-chip-2008-09--entry', 'CHIP magazine’s disc page for MemMaid 2.3, in Russian, with its Database Usage screen') },
];

// ---------- His press releases (dinarsoft.com/news, 2006 to 2008) ----------

export interface Press { date: string; title: string; his: boolean; link: string; app?: AppId }
const P = (date: string, title: string, his: boolean, ts: string, path: string, app?: AppId): Press => ({ date, title, his, link: rel(ts, path), app });
export const press: Press[] = [
  P('2008-06-16', 'MemMaid is updated to version 2.3', false, '20081013091446', 'memmaid-is-updated-to-version-2.3.html', 'memmaid'),
  P('2008-04-13', 'HandySwitcher 3.1 released', false, '20081023020544', 'handyswitcher-3.1-released.html', 'handyswitcher'),
  P('2008-02-13', 'MemMaid 2.2 Released (more languages added)', true, '20081106051854', 'memmaid-2.2-released-more-languages-added.html', 'memmaid'),
  P('2007-12-17', 'MemMaid 2.1 Released with multi-language support', true, '20081106042117', 'memmaid-2.1-released-with-multi-language-support.html', 'memmaid'),
  P('2007-12-16', 'Eten Blog Dot Com reviewed TapText', true, '20080917020621', 'eten-blog-dot-com-reviewed-taptext.html', 'taptext'),
  P('2007-11-17', 'MemMaid named one of the “Best Applications for 2007” by Handango', true, '20080819151325', 'memmaid-named-one-of-the-best-applications-for-2007-by-handango.html', 'memmaid'),
  P('2007-11-16', 'Two DinarSoft products selected as “Best software award 2007” by PocketPC Magazine', true, '20081120171608', 'two-dinarsoft-products-selected-as-best-software-award-2007-by-pocketpc-maga.html'),
  P('2007-10-12', 'Three DinarSoft products announced finalists in the annual “Best Software for PocketPC (2007)” award', true, '20081120133259', 'three-dinarsoft-products-announced-finalists-in-its-annual-best-software-for-pocketpc-2007.html'),
  P('2007-09-03', 'JustAnotherMobileMonday reviewed MemMaid 2.0', true, '20081120125013', 'justanothermobilemonday-reviewed-memmaid-2.0.html', 'memmaid'),
  P('2007-08-23', 'the-gadgeteer reviewed TapText 1.3', true, '20081120144545', 'the-gadgeteerreviewed-taptext-1.3.html', 'taptext'),
  P('2007-08-18', 'AximSite-MobilitySite reviewed MemMaid 2.0', true, '20081120171858', 'aximsite-mobilitysite-reviewed-memmaid-2.0.html', 'memmaid'),
  P('2007-08-07', 'PocketPC Magazine nominates five DinarSoft titles for the “Best Software in 2007” award', true, '20081120153258', 'pocketpc-magazine-nominaets-five-dinarsoft-titles-for-the-best-software-in-2007.html'),
  P('2007-07-11', 'All-new MemMaid 2.0 Released', true, '20081120162518', 'all-new-memmaid-2.0-released.html', 'memmaid'),
  P('2007-07-11', 'Mobile-View reviewed the new MemMaid 2.0', true, '20081120150508', 'mobile-view-reviewed-the-new-memmaid-2.0.html', 'memmaid'),
  P('2007-05-17', 'GadgetMix reviewed the new HandySwitcher 3.0', true, '20081120131111', 'gadgetmix-reviewed-the-new-handyswitcher-3.0.html', 'handyswitcher'),
  P('2007-05-05', 'All-new HandySwitcher 3.0 Released', false, '20081120145432', 'handyswitcher3release.html', 'handyswitcher'),
  P('2007-04-30', 'ClintonFITCH reviewed MemMaid', true, '20081120164212', 'clintonfitch-reviewed-memmaid.html', 'memmaid'),
  P('2007-04-17', 'MemMaid 1.73 reviewed by GadgetMix.com', false, '20081120143912', 'gadgetmix-reviewed-memmaid.html', 'memmaid'),
  P('2007-01-17', 'HandySwitcher and HandyMenu reviewed by GadgetMix.com', false, '20081120154403', 'gadgetmix-reviews-handyswitcher.html'),
  P('2007-01-09', 'MemMaid gets a “Software Tip” Award from Pocketland Spain', false, '20081120135841', 'pocketland-spain-reviewed-memmaid.html', 'memmaid'),
  P('2006-12-11', 'PocketLand reviewed MemMaid and gave it 5 stars', true, '20081120131814', 'pocketland-reviewed-memmaid-and-gave-it-5-stars.html', 'memmaid'),
  P('2006-11-15', 'DinarSoft Corporation launches its newly renovated website', false, '20081120133942', 'website-launch.html'),
  P('2006-11-01', 'DinarSoft Corporation changed its logo', true, '20081120160741', 'logochange.html'),
  P('2006-10-01', 'PPC Magazine announced MemMaid a finalist in its annual “Best Software for PocketPC (2006)” award', true, '20081120165747', 'memmaid-finalist-2006.html', 'memmaid'),
  P('2006-09-06', 'tucows.com reviewed MemMaid 1.72 and selected it as a Dr. File Finder Favorite', true, '20081120163835', 'tucows-reviewed-memmaid.html', 'memmaid'),
  P('2006-08-08', 'DinarSoft Corporation releases MemMaid 1.72 with a new ReclaimRAM module', false, '20081120141609', 'memmaid-1.72-released.html', 'memmaid'),
  P('2006-08-02', 'PocketPCThoughts.com reviewed TapText 1.3 for PocketPC', true, '20081120141108', 'pocketpcthoughts-reviewed-taptex.html', 'taptext'),
  P('2006-08-01', 'MemMaid for PocketPC is selected as “editor’s choice” by PocketGear.com', true, '20081120172304', 'memmaid-is-editor-choice.html', 'memmaid'),
  P('2006-07-26', 'Handango selects MemMaid among the finalists of its annual champion award', true, '20081120155240', 'hngchampion.html', 'memmaid'),
  P('2006-03-27', 'DinarSoft Corporation releases HandySwitcher 2.7 with hardware keys support', false, '20081120163017', 'handyswitcher-2.7-released.html', 'handyswitcher'),
  P('2006-02-27', 'DinarSoft Corporation releases TapText 1.3 for PocketPC with import/export ability', false, '20081120162014', 'taptext-1.3-released.html', 'taptext'),
];

// ---------- The company ----------

export const company = {
  founded: '2002-11',
  place: 'Kanata, Ontario',
  tagline: 'Mobile Software for every need',
  logoDate: '2006-11-01',
  relaunch: '2006-11-15',
  site: wb('20081206084630', 'http://www.dinarsoft.com/'),
  about: wb('20081106124500', 'http://www.dinarsoft.com/company/about.html'),
  colors: [
    { hex: '#CF2F2F', name: 'Logo red', use: 'The mark, and the red questions on every product page' },
    { hex: '#433C3C', name: 'Charcoal', use: 'The DinarSoft wordmark' },
    { hex: '#B8380E', name: 'Slogan rust', use: 'Every product slogan' },
    { hex: '#A82711', name: 'Menu red', use: 'Menu hover, FAQ links' },
    { hex: '#6A6A6A', name: 'Menu gray', use: 'The drop-down menus' },
    { hex: '#E9E9ED', name: 'Page gray', use: 'Behind every page' },
  ],
};
