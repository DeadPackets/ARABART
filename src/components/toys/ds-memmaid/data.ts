// Facts for the MemMaid page, all from his binaries and DinarSoft's own pages and screenshots.
// Research: research/dinarsoft/re/memmaid/NOTES.md (every number below is traced there).
import ui from './ui.json';

export const STR = ui.str as Record<string, string[] | string[][]>;
export const LANGS = ui.langs as { id: string; name: string }[];
export const s = (k: string, lang = 0) => (STR[k] as string[])[lang];

/** The 14 files of the multilingual 2.3 CAB (Build 230, June 2008), as they land on the device. */
export const PARTS = [
  { name: 'MemMaid.exe', bytes: 629760, dir: '\\Program Files\\MemMaid', kind: 'app',
    what: 'The whole app: 29 cleaners, Reclaim RAM, the startup manager, a registry editor, a database explorer, card tools and more. 41 screen layouts and about 98,700 ARM instructions.',
    calls: 'Talks to the system through 348 functions in 8 system libraries, 321 of them in coredll.dll, the core of Windows Mobile.' },
  { name: 'MemMaidVGARes.dll', bytes: 245248, dir: '\\Program Files\\MemMaid', kind: 'art',
    what: 'Pictures only, at double size for sharp VGA screens: the six big tab icons, the toolbar, the check boxes. MemMaid loads it only on VGA screens.',
    calls: 'No code to speak of: 492 bytes. Like an @2x image folder.' },
  { name: 'mm_fra.dll', bytes: 51200, dir: '\\Program Files\\MemMaid', kind: 'lang', what: 'All 709 interface strings in French.', calls: 'Two functions: GetLangName and GetString.' },
  { name: 'mm_ger.dll', bytes: 49152, dir: '\\Program Files\\MemMaid', kind: 'lang', what: 'German.', calls: 'GetLangName, GetString.' },
  { name: 'mm_ita.dll', bytes: 49152, dir: '\\Program Files\\MemMaid', kind: 'lang', what: 'Italian.', calls: 'GetLangName, GetString.' },
  { name: 'mm_sky.dll', bytes: 47104, dir: '\\Program Files\\MemMaid', kind: 'lang', what: 'Slovak.', calls: 'GetLangName, GetString.' },
  { name: 'mm_csy.dll', bytes: 46592, dir: '\\Program Files\\MemMaid', kind: 'lang', what: 'Czech.', calls: 'GetLangName, GetString.' },
  { name: 'mm_rus.dll', bytes: 44544, dir: '\\Program Files\\MemMaid', kind: 'lang', what: 'Russian.', calls: 'GetLangName, GetString.' },
  { name: 'mm_chs.dll', bytes: 26112, dir: '\\Program Files\\MemMaid', kind: 'lang', what: 'Simplified Chinese, the smallest: one character often says what a whole English word does.', calls: 'GetLangName, GetString.' },
  { name: 'MemMaid.htm', bytes: 53148, dir: '\\Windows', kind: 'help', what: 'The built-in help: about 30 topics, opened at the right page for the screen you are on.', calls: 'Plain HTML for the Pocket PC help viewer.' },
  { name: 'MemMaid.bmp', bytes: 29134, dir: '\\Windows', kind: 'help', what: 'The help’s picture: the screen with every part labeled.', calls: '168 × 167 pixels, 256 colors.' },
  { name: 'MemMaidLauncher.exe', bytes: 12800, dir: '\\Windows', kind: 'helper', what: 'A tiny starter that lives in \\Windows. It finds where MemMaid is installed, in main memory or on a card, and starts it. At boot it applies the tweaks that need a restart and starts the clean-on-reset.',
    calls: 'Reads HKLM\\SOFTWARE\\Apps\\DinarSoft MemMaid to find the app.' },
  { name: 'MemMaidSetup.dll', bytes: 9216, dir: '\\Program Files\\MemMaid', kind: 'helper', what: 'Runs during install and uninstall: shortcuts, the trial date, settings from an older version. It also carries PerformInst, the helper MemMaid sends into other apps to tidy their memory.',
    calls: 'Exports Install_Init, Install_Exit, Uninstall_Init and PerformInst.' },
] as const;

/** What each system library gave him, and what an app calls today. */
export const APIS = [
  { then: 'toolhelp.dll: CreateToolhelp32Snapshot, Process32First, Heap32First', job: 'List every running program, its threads and its memory', now: 'Android: ActivityManager.getRunningAppProcesses. iOS keeps this to itself.' },
  { then: 'coredll: GlobalMemoryStatus', job: 'How much RAM is free right now', now: 'Android: ActivityManager.getMemoryInfo. iOS: os_proc_available_memory.' },
  { then: 'coredll: PostMessage(window, WM_HIBERNATE)', job: 'Tell an app that memory is low', now: 'Android: onTrimMemory. iOS: didReceiveMemoryWarning. Only the system can send them today.' },
  { then: 'coredll: PerformCallBack4, SetKMode', job: 'Run a function inside another app', now: 'No store app may do this today. Debuggers and tools like Frida do.' },
  { then: 'coredll: RegOpenKeyEx, RegSetValueEx', job: 'Read and write settings for the whole system', now: 'Android: SharedPreferences and Settings. iOS: UserDefaults, one app at a time.' },
  { then: 'coredll: CeRunAppAtTime, CeSetUserNotificationEx', job: 'Wake MemMaid at a time, or when the device starts', now: 'Android: AlarmManager, WorkManager. iOS: BGTaskScheduler.' },
  { then: 'coredll: KernelIoControl(IOCTL_HAL_GET_DEVICEID)', job: 'The device’s own ID, for the unlock code', now: 'Android: ANDROID_ID. iOS: identifierForVendor.' },
  { then: 'coredll: SHGetSpecialFolderPath, SHCreateShortcut', job: 'Find the StartUp folder and make shortcuts', now: 'Android: launcher shortcuts. iOS: Home Screen quick actions.' },
] as const;

/** The 29 cleaners of 2.3, in MemMaid’s own order. i = index into STR.cats. where: what it reads and what it removes. */
export const CLEANERS: { where: string[]; reg?: string; how: string; area: 'files' | 'reg' | 'queue' | 'ram' }[] = [
  { area: 'ram', where: ['every running program'], how: 'Asks every program to close, except MemMaid and ActiveSync.' },
  { area: 'ram', where: ['every program’s memory'], how: 'Sends the low-memory message and tidies each program’s memory from inside it.' },
  { area: 'files', where: ['\\Windows\\Temp'], reg: 'HKLM\\System\\FileSys  TempPath', how: 'The system’s temporary files.' },
  { area: 'files', where: ['\\Temp'], how: 'Leftovers in the main temp folder.' },
  { area: 'files', where: ['\\Windows\\AvantGo'], reg: 'HKCU\\Software\\AvantGo  DatabaseLocation', how: 'AvantGo’s offline web pages. MemMaid checks the AvantGo version first, so it only touches files it knows.' },
  { area: 'files', where: ['\\Windows\\Profiles\\guest\\Temporary Internet Files'], reg: '…\\Explorer\\Shell Folders  Cache', how: 'Pocket Internet Explorer’s cache. The folder name comes from the registry, so it works on every device.' },
  { area: 'files', where: ['\\Windows\\Profiles\\guest\\Cookies'], reg: '…\\Explorer\\Shell Folders  Cookies', how: 'Cookies, except the ones you keep on your own list.' },
  { area: 'reg', where: ['the typed-address list'], reg: 'Explorer\\AddressHistory', how: 'The addresses you typed into Pocket IE.' },
  { area: 'files', where: ['\\Windows\\Profiles\\guest\\History'], reg: '…\\Explorer\\Shell Folders  History', how: 'Pocket IE’s history files.' },
  { area: 'files', where: ['\\Application Data\\Opera\\cache4'], reg: 'Opera.ini  [User Prefs] Cache Directory4', how: 'Opera’s cache. MemMaid opens Opera’s own settings file to find where it really is.' },
  { area: 'files', where: ['\\NetFront33\\cache'], reg: 'HKCU\\Software\\access\\NetFront33\\BrowserPref  L2CacheDir', how: 'The NetFront browser’s cache, for version 3.2 and 3.3.' },
  { area: 'files', where: ['\\Windows\\Start Menu\\…\\*.lnk'], how: 'Shortcuts whose program is gone. MemMaid reads each shortcut’s target and checks that the file is there.' },
  { area: 'reg', where: ['HKCR\\CLSID', 'file types', 'MIME types'], how: 'Registry entries that point at nothing: COM objects whose DLL is gone, file types with no program.' },
  { area: 'files', where: ['\\Windows\\AppMgr\\*.DAT', '\\Windows\\*.unload'], how: 'Uninstall data of programs that are no longer installed.' },
  { area: 'reg', where: ['HKLM\\Software\\Apps'], how: 'Install records whose folder is gone.' },
  { area: 'files', where: ['\\…\\Annotations\\*.ebo'], how: 'Microsoft Reader bookmarks of books you deleted.' },
  { area: 'files', where: ['\\Windows\\Messaging\\Attachments'], reg: 'HKCU\\Software\\Microsoft\\MAPI  AttachPath', how: 'Saved mail attachments.' },
  { area: 'queue', where: ['notification queue'], how: 'The same program signed up twice for the same event.' },
  { area: 'queue', where: ['notification queue'], how: 'Wake-ups for programs that are no longer installed.' },
  { area: 'queue', where: ['notification queue'], how: 'Wake-ups that can never run.' },
  { area: 'files', where: ['\\Application Data\\Microsoft\\Media Player\\WMDRM'], how: 'Windows Media license files.' },
  { area: 'files', where: ['\\Application Data\\VirtualEarthMobile'], how: 'Map tiles from Virtual Earth Mobile.' },
  { area: 'files', where: ['\\Windows\\Log'], reg: 'HKLM\\SOFTWARE\\AirPrime\\SS_Log', how: 'The phone’s call and radio logs, on Phone Edition devices.' },
  { area: 'files', where: ['a folder you choose'], how: 'Everything in a folder of your own, for any app’s cache.' },
  { area: 'files', where: ['a second folder you choose'], how: 'A second folder of your own.' },
  { area: 'files', where: ['*.tmp  *.log  *.bak  *.?'], how: 'Files by extension: three he picked, and one of yours.' },
  { area: 'files', where: ['any folder'], how: 'Empty files, zero bytes long.' },
  { area: 'files', where: ['\\Application Data\\GoogleMaps\\cache-GLM.dat'], how: 'Google Maps for Mobile’s map cache.' },
  { area: 'files', where: ['\\~Recycled'], how: 'The recycle bin that file managers keep.' },
];

/** Every release, from DinarSoft’s revision history. Builds that survive carry their measurements. */
export const VERSIONS = [
  { v: '1.0', date: 'June 16, 2003', notes: ['First release.'] },
  { v: '1.3', date: '', notes: ['Windows Mobile 2003 SE', 'Databases: list, info, delete', 'Your own entries in the notification queue', 'Today plug-ins: list, switch on and off, reorder', 'StartUp programs in the order you choose', 'File Finder by name and size', 'Help for every screen'] },
  { v: '1.4', date: 'November 30, 2004', notes: ['DLL Optimizer', 'Storage charts in 2-D and 3-D', 'QuickCleaner shortcut', 'Remembers your last tab and screen'] },
  { v: '1.41', date: 'January 1, 2005', notes: ['A smarter DLL Optimizer and uninstall cleaner'] },
  { v: '1.44', date: 'May 1, 2005', notes: ['DLL Optimizer moves Today plug-ins too', 'Cards bigger than 4 GB'] },
  { v: '1.5', date: 'November 11, 2005', notes: ['Windows Mobile 5'] },
  { v: '1.5a', date: 'March 2006', notes: ['The build on CHIP magazine’s 2006 disc'], bytes: 327680, code: 181432, dialogs: 20, imports: 249, logo: 1 },
  { v: '1.61', date: 'May 23, 2006', notes: ['AvantGo 6.2', 'Every DLL in the DLL Optimizer'] },
  { v: '1.72', date: 'July 20, 2006', notes: ['Portrait and landscape on the fly', 'Reclaim RAM', 'Menus like Windows Mobile 5', 'New cleaners: dangling notifications, NetFront, Opera, Virtual Earth, Media DRM, \\Temp'], bytes: 357888, code: 203696, dialogs: 21, imports: 258, logo: 1 },
  { v: '1.73', date: 'February 17, 2007', notes: ['New setup program', 'The new DinarSoft logo in the About screen', 'The version for Pocket PC 2002'], bytes: 358400, code: 204684, dialogs: 21, imports: 259, logo: 2 },
  { v: '2.0', date: 'July 11, 2007', notes: ['A new shiny look', 'More than 25 new and updated cleaners', 'Cleaner schedule', 'Full registry editor with import and export', 'Database manager and explorer', 'Card tools, CAB installer, file types', 'CPU and memory use', 'System tweaks and application cache mover', 'VGA, square and landscape screens', 'Windows Mobile 6'] },
  { v: '2.1', date: 'December 15, 2007', notes: ['German, French and Simplified Chinese', 'Cookies you choose to keep', 'New cleaners: Recycle Bin, Google Maps cache'] },
  { v: '2.2', date: 'February 13, 2008', notes: ['Russian, Italian, Slovak and Czech'] },
  { v: '2.3', date: 'June 16, 2008', notes: ['800 × 480 screens, like the Sony Ericsson Xperia X1', 'AvantGo 6.5 and Opera 8.65', 'Installed apps sorted by date, name or size'], bytes: 629760, code: 394752, dialogs: 41, imports: 348, logo: 2 },
] as const;
