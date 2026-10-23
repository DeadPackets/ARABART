// The four CodeSteppers of the MemMaid page: his ARM code (MemMaid.exe 2.3 and MemMaidSetup.dll, addresses as loaded),
// the same in C, and the steps. Disassembly: research/dinarsoft/re/memmaid/NOTES.md.
type Line = { off?: string; label?: string; code: string; note?: string };
type Reg = { name: string; value: string; means: string; changed?: boolean };
export type Step = { a: number; c: number; say: string; regs?: Reg[]; [k: string]: unknown };

/* ---------- 1. Reclaim RAM (2E6C8, 4678C, 46658) ---------- */
export const RECLAIM_ASM: Line[] = [
  { off: 'E6C8', label: 'main', code: 'bl    FreeRAM', note: 'free memory, before' },
  { off: 'E6D0', code: 'mov   r6, r0', note: 'keep it' },
  { off: 'E6D4', code: 'ldr   r3, [r4, #0x880]', note: 'box 1 ticked?' },
  { off: 'E6E0', code: 'blne  CloseAllPrograms' },
  { off: 'E6E4', code: 'ldr   r3, [r4, #0x87C]', note: 'box 2 ticked?' },
  { off: 'E6EC', code: 'ldrne r0, =Hibernate', note: 'the callback' },
  { off: 'E6F4', code: 'blne  EnumWindows', note: 'once per window' },
  { off: 'E6F8', code: 'ldr   r3, [r4, #0x884]', note: 'box 3 ticked?' },
  { off: 'E70C', code: 'bleq  CompactAllHeaps' },
  { off: 'E710', code: 'mov   r0, #1000', note: 'milliseconds' },
  { off: 'E714', code: 'bl    Sleep' },
  { off: 'E720', code: 'bl    FreeRAM', note: 'free memory, after' },
  { off: 'E728', code: 'cmp   r5, r6', note: 'more than before?' },
  { off: 'E758', code: 'sub   r0, r5, r6', note: 'RAM won back' },
  { off: '678C', label: 'hib', code: 'str   lr, [sp, #-4]!' },
  { off: '6790', code: 'mov   r3, #0x300' },
  { off: '6794', code: 'orr   r1, r3, #0xFF', note: '0x3FF: WM_HIBERNATE' },
  { off: '67A0', code: 'bl    PostMessageW', note: 'into its mailbox' },
  { off: '67A4', code: 'mov   r0, #1', note: 'TRUE: next window' },
  { off: '6670', label: 'free', code: 'mov   r3, #32', note: 'report size' },
  { off: '667C', code: 'bl    GlobalMemoryStatus' },
  { off: '6680', code: 'ldr   r0, [sp, #12]', note: 'dwAvailPhys: free RAM' },
];
export const RECLAIM_C: Line[] = [
  { code: 'DWORD before = FreeRAM();' },
  { code: 'if (opt.close) CloseAllPrograms();' },
  { code: 'if (opt.hib) EnumWindows(Hibernate, 0);' },
  { code: 'if (opt.compact) CompactAllHeaps();' },
  { code: 'Sleep(1000);', note: 'apps answer' },
  { code: 'DWORD after = FreeRAM();' },
  { code: 'if (after > before) Report(after-before);' },
  { code: '' },
  { code: 'BOOL CALLBACK Hibernate(HWND w, LPARAM) {' },
  { code: '  PostMessage(w, WM_HIBERNATE, 0, 0);' },
  { code: '  return TRUE;' },
  { code: '}' },
  { code: 'DWORD FreeRAM(void) {' },
  { code: '  MEMORYSTATUS m = { sizeof m };' },
  { code: '  GlobalMemoryStatus(&m);' },
  { code: '  return m.dwAvailPhys;' },
  { code: '}' },
];
/** Running Programs as DinarSoft's own MemMaid 2.0 screenshot shows them (Memory column, KB). */
export const APPS = [
  { name: 'Windows Media', kb: 319.78, give: 0.42 },
  { name: 'MemMaid', kb: 227.81, give: 0 },
  { name: 'Notes', kb: 119.9, give: 0.3 },
  { name: 'Contacts', kb: 31.9, give: 0.35 },
  { name: 'File Explorer', kb: 23.9, give: 0.25 },
  { name: 'Solitaire', kb: 23.9, give: 0.3 },
];
const r = (name: string, value: string, means: string, changed = false): Reg => ({ name, value, means, changed });
export const RECLAIM_STEPS: Step[] = [
  { a: 0, c: 0, ph: 'measure', say: 'First, measure. MemMaid calls its little <b>FreeRAM</b> helper to ask how much memory is free right now.', regs: [r('pc', 'E6C8', 'Reclaim RAM starts')] },
  { a: 20, c: 14, ph: 'measure', say: 'The system fills in a short report, <b>MEMORYSTATUS</b>. MemMaid keeps one number from it: the free RAM.', regs: [r('r0', '&m', 'the report to fill in')] },
  { a: 21, c: 15, ph: 'before', say: 'That number comes back in <b>r0</b>, and MemMaid keeps it in r6 as the “before”.', regs: [r('r0', '6.21 MB', 'free RAM, before', true), r('r6', '6.21 MB', 'kept for later', true)] },
  { a: 2, c: 1, ph: 'before', say: 'Three tick boxes decide the work. In this run, box 1, <b>close running programs</b>, is off, so the call is skipped.', regs: [r('r3', '0', 'box 1: off', true)] },
  { a: 6, c: 2, ph: 'enum', say: 'Box 2 is on. <b>EnumWindows</b> walks every window on the device and calls MemMaid’s <b>Hibernate</b> function once for each.', regs: [r('r0', 'Hibernate', 'the function to call', true), r('r3', '1', 'box 2: on', true)] },
  { a: 16, c: 9, ph: 'hib', app: 0, say: 'The message number is <b>3FFh, WM_HIBERNATE</b>. Windows Mobile itself sends it when memory runs low. It means: free whatever you can rebuild later.', regs: [r('r1', '0x3FF', 'WM_HIBERNATE', true), r('r0', 'hwnd', 'Windows Media')] },
  { a: 17, c: 9, ph: 'hib', app: 0, say: '<b>PostMessage</b> drops it in the window’s mailbox and moves on. It never waits for an answer, so one busy app cannot freeze MemMaid.', regs: [r('r0', 'hwnd', 'Windows Media')] },
  { a: 18, c: 10, ph: 'hib', app: 5, say: 'Returning TRUE asks for the next window. Every program on the device gets the same message, one after another.', regs: [r('r0', '1', 'TRUE: keep going', true)] },
  { a: 7, c: 3, ph: 'hibdone', say: 'Box 3, <b>compact running program heap</b>, is off in this run. The next section shows what it does.', regs: [r('r3', '0', 'box 3: off', true)] },
  { a: 10, c: 4, ph: 'wait', say: 'Then MemMaid waits one second. Each app frees its memory in its own time, as it reads its mail.', regs: [r('r0', '1000', 'milliseconds', true)] },
  { a: 11, c: 5, ph: 'after', say: 'Measure again.', regs: [r('r0', '6.40 MB', 'free RAM, after', true), r('r5', '6.40 MB', 'after', true)] },
  { a: 13, c: 6, ph: 'done', say: 'After minus before is the memory it got back. MemMaid shows it: <b>MemMaid has reclaimed</b> the difference, in MB.', regs: [r('r0', '0.19 MB', 'reclaimed', true), r('r6', '6.21 MB', 'before'), r('r5', '6.40 MB', 'after')] },
];

/* ---------- 2. A helper inside every app (63628, and PerformInst in MemMaidSetup.dll at 10001980) ---------- */
export const INJECT_ASM: Line[] = [
  { off: '3650', label: 'inj', code: 'ldr   r0, ="coredll.dll"' },
  { off: '3654', code: 'bl    GetModuleHandleW' },
  { off: '3680', code: 'ldr   r1, ="PerformCallBack4"' },
  { off: '3690', code: 'bl    GetProcAddressW', note: 'found by name' },
  { off: '36DC', code: 'ldr   r0, ="MemMaidSetup.dll"' },
  { off: '36E0', code: 'bl    LoadLibraryW', note: 'his own helper' },
  { off: '36EC', code: 'ldr   r1, ="PerformInst"' },
  { off: '36F4', code: 'bl    GetProcAddressW' },
  { off: '374C', code: 'mov   r0, #1' },
  { off: '3754', code: 'ldr   pc, [sl]', note: 'SetKMode(TRUE)' },
  { off: '375C', code: 'mvn   r0, #0', note: 'every process' },
  { off: '3764', code: 'ldr   pc, [r6]', note: 'SetProcPermissions' },
  { off: '3778', code: 'bl    OpenProcess', note: 'the app to tidy' },
  { off: '37A8', code: 'ldr   r1, ="LoadLibraryW"' },
  { off: '37B4', code: 'bl    MapPtrToProcess', note: 'as the app sees it' },
  { off: '37E8', code: 'ldr   pc, [r8]', note: 'load it in there' },
  { off: '3808', code: 'bl    MapPtrToProcess', note: 'PerformInst, mapped' },
  { off: '3830', code: 'ldr   pc, [r8]', note: 'run it in there' },
  { off: '384C', code: 'ldr   r1, ="FreeLibrary"' },
  { off: '3884', code: 'mov   pc, r4', note: 'unload it in there' },
  { off: '388C', code: 'bl    CloseHandle' },
  { off: '38A0', code: 'ldr   pc, [r6]', note: 'rights back' },
  { off: '1984', label: 'inst', code: 'bl    CoFreeUnusedLibraries' },
  { off: '1998', code: 'ldr   r1, ="HeapCompact"' },
  { off: '199C', code: 'bl    GetProcAddressW' },
  { off: '19A8', code: 'bl    GetProcessHeap', note: 'the app’s own heap' },
  { off: '19B4', code: 'mov   pc, r4', note: 'HeapCompact(heap, 0)' },
];
export const INJECT_C: Line[] = [
  { code: 'void CompactHeapOf(DWORD pid) {' },
  { code: '  call = Find(core, L"PerformCallBack4");' },
  { code: '  me = LoadLibrary(L"MemMaidSetup.dll");' },
  { code: '  job = Find(me, L"PerformInst");' },
  { code: '  SetKMode(TRUE);', note: 'system rights' },
  { code: '  SetProcPermissions(~0);', note: 'every app' },
  { code: '  app = OpenProcess(0, FALSE, pid);' },
  { code: '  CALLBACKINFO ci = { app,' },
  { code: '    Map(LoadLibraryW, app), path };' },
  { code: '  there = call(&ci, 0, 0, 0);', note: 'load, inside' },
  { code: '  ci.pfn = Map(job, app);' },
  { code: '  call(&ci, 0, 0, 0);', note: 'run, inside' },
  { code: '  ci.pfn = Map(FreeLibrary, app);' },
  { code: '  ci.pvArg0 = there; call(&ci, 0,0,0);' },
  { code: '  CloseHandle(app);', note: 'rights back' },
  { code: '}' },
  { code: '' },
  { code: 'int PerformInst(void) {', note: 'MemMaidSetup.dll' },
  { code: '  CoFreeUnusedLibraries();' },
  { code: '  HeapCompact(GetProcessHeap(), 0);' },
  { code: '}' },
];
export const INJECT_STEPS: Step[] = [
  { a: 3, c: 1, ph: 0, say: 'Windows Mobile has a function Microsoft never documented for apps: <b>PerformCallBack4</b>. It runs a function <b>inside another process</b>. MemMaid looks it up in coredll.dll by its name.', regs: [r('r0', 'coredll', 'the core system library'), r('r1', '"Perform…"', 'the name to look up')] },
  { a: 5, c: 2, ph: 1, say: 'Next, his own helper library, <b>MemMaidSetup.dll</b>. The same file the installer runs, with one more job inside.', regs: [r('r0', 'hModule', 'MemMaidSetup.dll, in MemMaid', true)] },
  { a: 7, c: 3, ph: 1, say: 'The job is a function named <b>PerformInst</b>. An install step, by its name. It is the part that will run inside the other app.', regs: [r('r5', 'PerformInst', 'its address in MemMaid', true)] },
  { a: 11, c: 5, ph: 2, say: 'For a moment MemMaid steps up to system rights: <b>SetKMode</b>, then <b>SetProcPermissions</b> with every bit set, so it may reach any process.', regs: [r('r0', '0xFFFFFFFF', 'all 32 processes', true)] },
  { a: 12, c: 6, ph: 3, say: 'It opens the app to tidy, here Pocket Internet Explorer.', regs: [r('sb', 'hProcess', 'iexplore.exe', true)] },
  { a: 14, c: 8, ph: 3, say: 'Each app sees memory at its own addresses. <b>MapPtrToProcess</b> turns an address in MemMaid into the same place as the other app sees it.', regs: [r('r0', 'LoadLibraryW', 'as iexplore.exe sees it', true)] },
  { a: 15, c: 9, ph: 4, say: 'Call 1: <b>LoadLibrary, inside the app</b>. The helper DLL is now part of Pocket IE.', regs: [r('r0', 'hModule', 'the helper, inside iexplore.exe', true)] },
  { a: 17, c: 11, ph: 5, say: 'Call 2: <b>PerformInst, inside the app</b>. From here on, the code runs as Pocket IE.', regs: [] },
  { a: 22, c: 18, ph: 6, say: 'First it unloads the COM libraries the app loaded and no longer uses.', regs: [] },
  { a: 25, c: 19, ph: 7, say: '<b>GetProcessHeap</b> gives the app’s own heap, its pool of small memory blocks. Over time the pool fills with gaps.', regs: [r('r0', 'heap', 'iexplore.exe’s heap', true)] },
  { a: 26, c: 19, ph: 8, say: '<b>HeapCompact</b> joins the gaps and hands whole free pages back to the system. Only code inside the app may do this to its heap. That is why MemMaid goes in.', regs: [r('r0', 'heap', 'compacted'), r('r1', '0', 'no flags')] },
  { a: 19, c: 13, ph: 9, say: 'Call 3: <b>FreeLibrary, inside the app</b>. The helper leaves and the app runs on as before, lighter.', regs: [r('r0', 'there', 'the helper’s handle in iexplore.exe')] },
  { a: 21, c: 14, ph: 10, say: 'Permissions go back as they were. Then the next process, until every app on the device has had its turn.', regs: [r('r0', 'old', 'the permissions MemMaid had before')] },
];

/* ---------- 3. DLL Optimizer: one more folder on the loader's search path (57964) ---------- */
export const LOADER_ASM: Line[] = [
  { off: '7970', label: 'path', code: 'ldr   r7, ="\\Loader"' },
  { off: '7988', code: 'mov   r0, #0x80000002', note: 'HKEY_LOCAL_MACHINE' },
  { off: '79A0', code: 'bl    RegCreateKeyExW' },
  { off: '79C4', code: 'add   r1, r7, #16', note: '"SystemPath"' },
  { off: '79D8', code: 'bl    RegQueryValueExW', note: 'size only' },
  { off: '79F8', code: 'bl    operator new[]', note: 'room for one more' },
  { off: '7A1C', code: 'bl    RegQueryValueExW', note: 'read the list' },
  { off: '7A44', code: 'bl    _wcsicmp', note: 'our folder?' },
  { off: '7A50', code: 'moveq r4, #1', note: 'yes: done' },
  { off: '7A6C', code: 'add   r5, r5, r3, lsl #1', note: 'skip it and its zero' },
  { off: '7A74', code: 'bl    wcslen' },
  { off: '7A7C', code: 'bne   7A34', note: 'until an empty one' },
  { off: '7A90', code: 'bl    wcscpy', note: 'add at the end' },
  { off: '7AA8', code: 'strh  sl, [r3]', note: 'one more zero' },
  { off: '7AB8', code: 'bl    RegDeleteValueW' },
  { off: '7AC4', code: 'mov   r3, #7', note: 'REG_MULTI_SZ' },
  { off: '7AD8', code: 'bl    RegSetValueExW' },
  { off: '7B74', code: 'bl    RegFlushKey', note: 'save it now' },
];
export const LOADER_C: Line[] = [
  { code: '#define PATH L"SystemPath"' },
  { code: 'void AddToSearchPath(const WCHAR *dir) {' },
  { code: '  k = OpenKey(HKLM, L"\\\\Loader");' },
  { code: '  Query(k, PATH, NULL, &size);' },
  { code: '  list = new WCHAR[size/2+wcslen(dir)+1];' },
  { code: '  Query(k, PATH, list, &size);' },
  { code: '  WCHAR *p = list; BOOL there = FALSE;' },
  { code: '  while (wcslen(p)) {' },
  { code: '    if (!_wcsicmp(dir, p)) there = TRUE;' },
  { code: '    p += wcslen(p) + 1;' },
  { code: '  }' },
  { code: '  if (!there) {' },
  { code: '    wcscpy(p, dir); p[wcslen(dir)+1] = 0;' },
  { code: '    RegDeleteValue(k, PATH);' },
  { code: '    Set(k, PATH, REG_MULTI_SZ, list, n);' },
  { code: '  }' },
  { code: '  RegFlushKey(k); RegCloseKey(k);' },
  { code: '}' },
];
export const LOADER_STEPS: Step[] = [
  { a: 2, c: 2, ph: 'open', say: 'The Windows CE loader, the part that finds a DLL when an app asks for one, reads its settings from <b>HKLM\\Loader</b>.', regs: [r('r0', 'HKLM', 'the whole machine'), r('r1', '\\Loader', 'the key')] },
  { a: 4, c: 3, ph: 'size', say: 'Its search path is the value <b>SystemPath</b>, like <code>PATH</code> on your computer. First MemMaid asks only for its size.', regs: [r('r1', 'SystemPath', 'the value name')] },
  { a: 6, c: 5, ph: 'read', p: 0, say: 'Then it reads the list. It is one block of text: each folder ends with a zero, and a second zero ends the list.', regs: [r('r5', 'p', 'entry 1', true)] },
  { a: 7, c: 8, ph: 'cmp', p: 0, say: 'Entry 1 is <code>\\Windows\\</code>. Not our folder.', regs: [r('r5', '\\Windows\\', 'this entry'), r('r6', '\\Storage Card\\DLL Store\\', 'our folder')] },
  { a: 9, c: 9, ph: 'next', p: 1, say: 'Skip its letters and its zero. The next character is a zero too, an empty entry: the end of the list.', regs: [r('r5', 'p', 'the end', true)] },
  { a: 12, c: 12, ph: 'add', p: 1, say: 'Not found, so MemMaid writes its folder at the end…', regs: [r('r0', 'p', 'the end of the list'), r('r1', 'DLL Store', 'the card folder')] },
  { a: 13, c: 12, ph: 'zero', p: 1, say: '…and one more zero, so the list ends properly again.', regs: [] },
  { a: 16, c: 14, ph: 'save', say: 'It writes the list back as <b>REG_MULTI_SZ</b>, type 7, a list of strings.', regs: [r('r3', '7', 'REG_MULTI_SZ', true)] },
  { a: 17, c: 16, ph: 'load', say: 'After a soft reset the loader searches both folders. An app asks for its DLL by name, and finds it on the card.', regs: [] },
];

/* ---------- 4. The unlock key: his RC4-style shuffle of 120 numbers (6AB44) ---------- */
export const KEY_ASM: Line[] = [
  { off: 'AB54', label: 'scrbl', code: 'bl    wcslen', note: 'letters in' },
  { off: 'AB58', code: 'ldr   r5, ="MemMaid2"', note: 'the word' },
  { off: 'AB94', code: 'strh  r3, [r2], #2', note: 'S[i] = i' },
  { off: 'AB9C', code: 'cmp   r3, #120', note: '120 numbers' },
  { off: 'ABC4', code: 'ldrh  r3, [r3]', note: 'K[i] = word[i%8]' },
  { off: 'ABF4', code: 'ldrh  r4, [lr, sb]!', note: 'S[i]' },
  { off: 'AC04', code: 'add   r3, r3, r4', note: 'K[i]+S[i]+j' },
  { off: 'AC0C', code: 'umull r1, r3, r0, r6', note: '% 120' },
  { off: 'AC28', code: 'strh  r4, [r2]', note: 'swap' },
  { off: 'AC50', code: 'add   r1, sl, #1', note: 'i = i + 1' },
  { off: 'AC70', code: 'add   r0, r4, sb', note: 'j = j + S[i]' },
  { off: 'AC98', code: 'strh  r4, [r2]', note: 'swap' },
  { off: 'ACA0', code: 'add   r1, r3, r4', note: 'S[i] + S[j]' },
  { off: 'ACC0', code: 'eor   r1, r3, r5', note: 'XOR the letter' },
  { off: 'ACC4', code: 'umull r2, r3, r1, fp', note: '% 25' },
  { off: 'ACD8', code: 'add   r3, r3, #65', note: '+ ’A’' },
  { off: 'ACE4', code: 'cmp   r3, #79', note: 'O or later?' },
  { off: 'ACE8', code: 'strh  r3, [r6]', note: 'write it' },
  { off: 'ACEC', code: 'addhs r3, r3, #1', note: 'skip O' },
  { off: 'ACF0', code: 'strhhs r3, [r6]', note: 'write that' },
];
export const KEY_C: Line[] = [
  { code: 'void Scramble(WCHAR *s, WCHAR *w) {' },
  { code: '  WORD S[120], K[120]; int i, j, t, v;' },
  { code: '  for (i=0; i<120; i++) S[i] = i;' },
  { code: '  for (i=0; i<120; i++) K[i] = w[i % n];' },
  { code: '  for (i=j=0; i<120; i++) {' },
  { code: '    j = (K[i]+S[i]+j) % 120; swap(S,i,j);' },
  { code: '  }' },
  { code: '  for (i=j=0; *s; s++) {' },
  { code: '    i = (i+1) % 120;  t = S[i];' },
  { code: '    j = (j+t) % 120;  swap(S,i,j);' },
  { code: "    v = (S[(S[i]+t)%120]^*s) % 25 + 'A';" },
  { code: "    *s = v >= 'O' ? v + 1 : v;" },
  { code: '  }' },
  { code: '}' },
];

/** Step through Scramble(text, word), recording what the visual needs: the 120 numbers and the letters so far. */
export function keyTrace(text: string, word: string): Step[] {
  const S = Array.from({ length: 120 }, (_, i) => i);
  const steps: Step[] = [];
  steps.push({ a: 3, c: 2, S: [...S], out: '', say: `Start with the numbers 0 to 119 in order. That is the whole machine: <b>120 numbers</b>.`, regs: [r('i', '0…119', 'S[i] = i')] });
  for (let i = 0, j = 0; i < 120; i++) {
    j = (word.charCodeAt(i % word.length) + S[i] + j) % 120;
    [S[i], S[j]] = [S[j], S[i]];
  }
  steps.push({ a: 8, c: 5, S: [...S], out: '', mixed: true, say: `Shuffle them 120 times, steered by the word <b>${word}</b>. A different word gives a different order, so each product gets its own keys.`, regs: [r('K', word, 'the word, repeated', true)] });
  let out = '';
  for (let n = 0, i = 0, j = 0; n < text.length; n++) {
    i = (i + 1) % 120;
    const t = S[i];
    j = (j + t) % 120;
    [S[i], S[j]] = [S[j], S[i]];
    const k = S[(S[i] + t) % 120];
    const ch = text.charCodeAt(n);
    let v = ((k ^ ch) % 25) + 65;
    if (v >= 79) v += 1;
    out += String.fromCharCode(v);
    const first = n === 0;
    steps.push({
      a: first ? 13 : n === 1 ? 18 : 17, c: first ? 10 : 11, S: [...S], out, i, j, k, at: n,
      say: first
        ? `Letter 1, <b>${text[n]}</b>. Step i forward, add S[i] to j, swap the two. The number at S[i] + S[j] is <b>${k}</b>. ${k} XOR ${ch} (the code of ${text[n]}) is ${k ^ ch}; the remainder after dividing by 25 picks a letter: <b>${out[n]}</b>.`
        : n === 1 ? `Letter 2, <b>${text[n]}</b>, becomes <b>${out[n]}</b>. The key uses 25 letters: every letter but O.`
        : `Letter ${n + 1}, <b>${text[n]}</b>, becomes <b>${out[n]}</b>.${n === text.length - 1 ? ` The key is <b>${out.match(/.{1,4}/g)!.join(' - ')}</b>.` : ''}`,
      regs: [r('i', String(i), 'steps one by one', true), r('j', String(j), 'jumps by S[i]', true), r('k', String(k), 'the mixed number', true), r('ch', `${text[n]} = ${ch}`, 'the letter in'), r('out', out[n], 'the key letter', true)],
    });
  }
  return steps;
}
