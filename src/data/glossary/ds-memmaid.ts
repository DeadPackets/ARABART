import type { Term } from '../glossary';

// Terms for the MemMaid writeup (src/writeups/dinarsoft-memmaid.astro)
export default {
  'mm-ram': {
    term: 'Main memory',
    short: 'The Pocket PC’s RAM. On Windows Mobile 2003 one chip held both your files and your running programs, so every byte of junk took room from the apps.',
    now: 'The RAM in your phone. Files moved to flash storage from Windows Mobile 5 on, as they live on a phone today.',
  },
  'mm-wm-hibernate': {
    term: 'WM_HIBERNATE',
    short: 'The message Windows Mobile sends an app when memory runs low. A well-made app answers by letting go of what it can rebuild later: pictures, caches, hidden windows.',
    now: 'onTrimMemory on Android, didReceiveMemoryWarning on iOS.',
  },
  'mm-heap-compact': {
    term: 'Heap compaction',
    short: 'Tidying a program’s working memory: blocks in use move together, and the free pages between them go back to the system.',
    now: 'What a garbage collector does after it frees objects in Java, C# or JavaScript.',
  },
  'mm-process': {
    term: 'Process',
    short: 'One running program, with its own memory. Windows CE gave each process a slot of 32 MB, and a program could not normally see into another’s.',
    now: 'Every app on a phone runs in its own process, in its own sandbox.',
  },
  'mm-callback4': {
    term: 'PerformCallBack4',
    short: 'A Windows CE system function that runs a function inside another process, as if that process had called it. MemMaid used it to send its helper into each app.',
    now: 'No store app may do this today. Debuggers and tools like Frida do.',
  },
  'mm-kmode': {
    term: 'Kernel mode',
    short: 'The level the system itself runs at, with access to all memory. SetKMode let a Windows CE program step up to it for a moment.',
    now: 'Root access, or a kernel driver. Phones keep it from apps today.',
  },
  'mm-registry': {
    term: 'Registry',
    short: 'The settings store of Windows and Windows Mobile: keys like folders, values like files, shared by the system and every app.',
    now: 'Settings and SharedPreferences on Android, UserDefaults on iOS, but one app at a time.',
  },
  'mm-multi-sz': {
    term: 'REG_MULTI_SZ',
    short: 'A registry value that holds a list of strings as one block: each string ends with a zero, and one more zero ends the list.',
    now: 'A list in a JSON settings file.',
  },
  'mm-loader': {
    term: 'Loader',
    short: 'The part of the system that finds a DLL when a program asks for one, and maps it into memory. It looks in a fixed list of folders, in order.',
    now: 'The PATH and library search path on any computer today.',
  },
  'mm-dll': {
    term: 'DLL',
    short: 'A dynamic link library: code that many programs share, loaded when one asks for it.',
    now: 'A .so file on Android and Linux, a .dylib or framework on Apple systems.',
  },
  'mm-startup-folder': {
    term: 'StartUp folder',
    short: 'A folder, \\Windows\\StartUp, that Windows Mobile reads at every start. Each shortcut in it runs.',
    now: 'Login items on a Mac, startup apps on Windows.',
  },
  'mm-lnk': {
    term: 'Shortcut file',
    short: 'On Windows Mobile a .lnk file is a line of plain text: the length of the command, a # sign, and the command. 21#\\Windows\\poutlook.exe starts Outlook.',
    now: 'A .desktop file on Linux, or an alias on a Mac.',
  },
  'mm-notify-queue': {
    term: 'Notification queue',
    short: 'The system’s list of programs to start at a set time or on an event, such as a sync, a card going in, or the device waking up.',
    now: 'AlarmManager and WorkManager on Android, BGTaskScheduler on iOS.',
  },
  'mm-memory-division': {
    term: 'Memory division',
    short: 'On Windows Mobile 2003, the line between RAM for files and RAM for programs. The system moved it by itself; MemMaid let you set it.',
    now: 'Nothing like it today: storage and memory are separate chips.',
  },
  'mm-soft-reset': {
    term: 'Soft reset',
    short: 'Restarting a Pocket PC. Programs close and start fresh; your files stay.',
    now: 'Restarting your phone.',
  },
  'mm-string-table': {
    term: 'String table',
    short: 'Every word a program shows, in one numbered list. The code asks for string 675; the table says “Quick Cleaner”.',
    now: 'The strings files that apps translate, one per language.',
  },
  'mm-device-id': {
    term: 'Device ID',
    short: 'A number the Pocket PC’s maker burned into each device. MemMaid read it with KernelIoControl and turned it into the 16-letter code on its License Key screen.',
    now: 'identifierForVendor on iOS, ANDROID_ID on Android.',
  },
  'mm-trackbar': {
    term: 'Trackbar',
    short: 'The Windows name for a slider control. A program sets its range and can mark a band on it.',
    now: 'An HTML range input.',
  },
} satisfies Record<string, Term>;
