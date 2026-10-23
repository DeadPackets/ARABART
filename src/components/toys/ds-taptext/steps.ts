// The CodeSteppers of the TapText page: lines from TapText.exe 1.3 (research/dinarsoft/re/taptext/), the same code
// in C, and steps built from his own default menu (tt.ts), so the numbers match what the visuals show.
import { SAMPLE, picture } from './tt.ts';
export { keyStepper } from '../ds-hijridate/steps.ts';

type Line = { off?: string; label?: string; code: string; note?: string };
type Step = { a: number; c: number; say: string; [k: string]: unknown };

// ---------- Borrowing the focus: 0x1E250, with its helper 0x1E204 ----------
export const BORROW = {
  asm: [
    { off: '1E1EC', code: 'bl   RegisterWindowMessageW', note: 'its own message' },
    { off: '1E214', code: 'cmp  r1,lr', note: 'helper: my message?' },
    { off: '1E21C', code: 'bl   GetFocus', note: 'yes: ask from inside' },
    { off: '1E240', code: 'bl   CallWindowProcW', note: 'no: pass it on' },
    { off: '1E254', code: 'bl   GetForegroundWindow', note: 'the program in front' },
    { off: '1E25C', code: 'bl   IsWindow', note: 'still there?' },
    { off: '1E274', code: 'bl   GetWindowLongW', note: 'its window procedure' },
    { off: '1E284', code: 'str  r0,[r5]', note: 'keep the old one' },
    { off: '1E28C', code: 'bl   SetWindowLongW', note: 'swap in the helper' },
    { off: '1E2A8', code: 'bl   SendMessageW', note: 'send its message' },
    { off: '1E2BC', code: 'bl   SetWindowLongW', note: 'swap the old one back' },
    { off: '1E2CC', code: 'pop  {r4,r5,r6,pc}', note: 'return the focus' },
  ] as Line[],
  c: [
    { code: 'msg = RegisterWindowMessage(' },
    { code: '        L"SpecialGetFocusMessage");' },
    { code: 'LRESULT Helper(HWND w, UINT m,' },
    { code: '               WPARAM a, LPARAM b) {' },
    { code: '  if (m == msg)' },
    { code: '    return (LRESULT)GetFocus();' },
    { code: '  return CallWindowProc(old, w, m, a, b);' },
    { code: '}' },
    { code: 'HWND BorrowFocus(void) {' },
    { code: '  HWND w = GetForegroundWindow();' },
    { code: '  if (!IsWindow(w)) return 0;' },
    { code: '  old = GetWindowLong(w, GWL_WNDPROC);' },
    { code: '  SetWindowLong(w, GWL_WNDPROC, Helper);' },
    { code: '  HWND f = SendMessage(w, msg, 0, 0);' },
    { code: '  SetWindowLong(w, GWL_WNDPROC, old);' },
    { code: '  return f;' },
    { code: '}' },
  ] as Line[],
  steps: [
    { a: 0, c: 0, phase: 0, say: 'At start-up, TapText asks Windows for a message number of its own, named SpecialGetFocusMessage. No other program uses it.' },
    { a: 4, c: 9, phase: 1, say: 'You picked a saved text. Which program is in front? Pocket Word. But which box inside it has the cursor? Windows answers that only for the program that asks, and TapText is not Pocket Word.' },
    { a: 5, c: 10, phase: 1, say: 'The window is still there.' },
    { a: 6, c: 11, phase: 2, say: 'Every window has a window procedure: the one function that receives all its messages. Read Pocket Word’s, and keep it.' },
    { a: 8, c: 12, phase: 3, say: 'Put TapText’s own tiny helper in its place.' },
    { a: 9, c: 13, phase: 4, say: 'Send Pocket Word TapText’s message. Pocket Word’s own thread delivers it, straight to the helper.' },
    { a: 1, c: 4, phase: 4, say: 'The helper checks: is this my message? Yes.' },
    { a: 2, c: 5, phase: 5, say: 'So it calls GetFocus, from inside Pocket Word, and gets the answer only Pocket Word could get: the page you are typing on.' },
    { a: 10, c: 14, phase: 6, say: 'Put Pocket Word’s own procedure back. The swap lasted one message.' },
    { a: 11, c: 15, phase: 7, say: 'TapText now knows exactly where to type, in any program, without changing a byte of it.' },
  ] as Step[],
};

// ---------- Typing: 0x137F4 ----------
export const TYPE_TEXT = 'Hi,\r\n...\r\nBest Regards\r\n'; // TapText's sample "General" email template

export const TYPE = (() => {
  const asm: Line[] = [
    { off: '13820', code: 'bl   wcslen', note: 'how long?' },
    { off: '13834', code: 'bl   GetClassNameW', note: 'what kind of box?' },
    { off: '13840', code: 'bl   lstrcmpW', note: '"noteeditclass"?' },
    { off: '1388C', code: 'bl   SetClipboardData', note: 'Notes: the clipboard' },
    { off: '138AC', code: 'bl   PostMessageW', note: 'Notes: its Paste' },
    { off: '138D4', code: 'bl   PostMessageW', note: 'WM_CHAR space' },
    { off: '138EC', code: 'bl   PostMessageW', note: 'WM_CHAR backspace' },
    { off: '138F4', code: 'bl   Sleep', note: '100 ms' },
    { off: '13900', code: 'ldrh r2,[r5]', note: 'next character' },
    { off: '13904', code: 'cmp  r2,#0xa', note: 'line feed: skip' },
    { off: '1391C', code: 'bl   PostMessageW', note: 'WM_CHAR: the character' },
    { off: '13924', code: 'cmp  r3,#0xd', note: 'a new line?' },
    { off: '13940', code: 'bl   PostMessageW', note: 'WM_KEYDOWN Enter' },
    { off: '1395C', code: 'bl   PostMessageW', note: 'WM_KEYUP' },
    { off: '13974', code: 'bl   PostMessageW', note: 'WM_CHAR space' },
    { off: '13994', code: 'bl   PostMessageW', note: 'WM_CHAR backspace' },
    { off: '139A4', code: 'bhi  13900', note: 'to the end' },
  ];
  const c: Line[] = [
    { code: 'void Type(HWND w, WCHAR *s, int n) {' },
    { code: '  if (n == -1) n = wcslen(s);' },
    { code: '  GetClassName(w, cls, 250);' },
    { code: '  if (!lstrcmp(cls, L"noteeditclass")) {' },
    { code: '    SetClipboardData(CF_UNICODETEXT, h);' },
    { code: '    PostMessage(w, WM_COMMAND, 0x1647, 0);' },
    { code: '    Sleep(100); return;' },
    { code: '  }' },
    { code: "  PostMessage(w, WM_CHAR, ' ', 1);" },
    { code: "  PostMessage(w, WM_CHAR, '\\b', 1);" },
    { code: '  Sleep(100);' },
    { code: '  for (; n > 0; n--, s++) {' },
    { code: "    if (*s == '\\n') continue;" },
    { code: '    PostMessage(w, WM_CHAR, *s, 1);' },
    { code: "    if (*s == '\\r') {" },
    { code: '      PostMessage(w, WM_KEYDOWN, VK_RETURN, 1);' },
    { code: '      PostMessage(w, WM_KEYUP, ...);' },
    { code: "      PostMessage(w, WM_CHAR, ' ', 1);" },
    { code: '      Sleep(100);' },
    { code: "      PostMessage(w, WM_CHAR, '\\b', 1);" },
    { code: '    }' },
    { code: '  }' },
    { code: '}' },
  ];
  // Replay his loop over the text, keeping the page and the queue of posted messages after each step
  const q: string[] = [], show = (ch: string) => (ch === ' ' ? 'space' : ch === '\b' ? 'backspace' : ch === '\r' ? 'Enter' : `“${ch}”`);
  let doc = '';
  const post = (m: string, ch?: string) => {
    q.push(ch === undefined ? m : `${m} ${show(ch)}`);
    if (m === 'WM_CHAR' && ch !== undefined) doc = ch === '\b' ? doc.slice(0, -1) : doc + (ch === '\r' ? '\n' : ch);
  };
  const snap = (s: Step): Step => ({ ...s, doc, q: q.slice(-6), n: q.length });
  const steps: Step[] = [];
  const chars = [...TYPE_TEXT];
  steps.push(snap({ a: 0, c: 1, say: `The sample General email reply: “Hi,”, a new line, three dots, a new line, “Best Regards”. ${chars.length} characters.` }));
  steps.push(snap({ a: 1, c: 2, say: 'What kind of box is in front? GetClassName asks Windows for its class name.' }));
  steps.push(snap({ a: 2, c: 3, say: 'Notes’ editor is called noteeditclass. Notes gets the whole text through the clipboard and its own Paste command. This is Pocket Word, so TapText types.' }));
  post('WM_CHAR', ' ');
  steps.push(snap({ a: 5, c: 8, say: 'First a space…' }));
  post('WM_CHAR', '\b');
  steps.push(snap({ a: 6, c: 9, say: '…and a backspace, which take each other away, then a tenth of a second’s pause.' }));
  let k = 0;
  for (const ch of chars) {
    k++;
    if (ch === '\n') { if (k === 5) steps.push(snap({ a: 9, c: 12, say: 'The line feed after it is skipped, so one new line stays one new line.' })); continue; }
    post('WM_CHAR', ch);
    if (k === 1) steps.push(snap({ a: 10, c: 13, say: '“H” goes in as one WM_CHAR message: the same message a key press makes. Pocket Word cannot tell it from typing.' }));
    if (k === 3) steps.push(snap({ a: 10, c: 13, say: '“i”, then the comma.' }));
    if (ch === '\r') {
      if (k === 4) steps.push(snap({ a: 11, c: 14, say: 'A new line. The character goes first…' }));
      post('WM_KEYDOWN Enter'); post('WM_KEYUP');
      if (k === 4) steps.push(snap({ a: 13, c: 16, say: '…then the Enter key itself, pressed and released, for programs that listen for the key instead of the character.' }));
      post('WM_CHAR', ' '); post('WM_CHAR', '\b');
      if (k === 4) steps.push(snap({ a: 15, c: 19, say: 'Then a space, a pause and a backspace, as at the start.' }));
    }
  }
  steps.push(snap({ a: 16, c: 21, say: `To the end: ${chars.length} characters became ${q.length} messages, each one a key press as far as Pocket Word knows.` }));
  return { asm, c, steps };
})();

// ---------- Macros: the driver 0x1E2EC and the scanner 0x139F4 ----------
export const MACRO_TEXT = 'Ottawa in {{DATE:MMMM d, yyyy}}\r\nThe time is now {{TIME:h:mm tt}}\r\n'; // TapText's sample "Date and time" item

export const MACRO_ASM: Line[] = [
  { off: '13A10', code: 'bl   wcsstr', note: '"{{DATE:"?' },
  { off: '13A20', code: 'bl   operator new', note: 'a Date macro' },
  { off: '13A70', code: 'bl   wcsstr', note: '"{{TIME:"?' },
  { off: '13AB4', code: 'bl   wcsstr', note: '"{{TAB"?' },
  { off: '13B08', code: 'bl   wcsstr', note: '"{{CTRL-"?' },
  { off: '1E2F8', code: 'bl   sub_1E250', note: 'borrow the focus' },
  { off: '1E310', code: 'bl   sub_139F4', note: 'find a macro' },
  { off: '1E330', code: 'bl   sub_1E2DC', note: 'type the text before' },
  { off: '1E33C', code: 'bl   sub_13B78', note: 'read up to }}' },
  { off: '1E358', code: 'mov  pc,r3', note: 'run it: vtable[1]' },
  { off: '1E35C', code: 'bl   sub_1E250', note: 'borrow the focus again' },
  { off: '1E378', code: 'bl   sub_1E2DC', note: 'type the rest' },
];
export const MACRO_C: Line[] = [
  { code: 'BOOL TypeItem(Item *it) {' },
  { code: '  HWND f = BorrowFocus();' },
  { code: '  for (WCHAR *p = it->text; *p; ) {' },
  { code: '    Macro *m;' },
  { code: '    WCHAR *at = FindMacro(p, &m);' },
  { code: '    if (!at) { Type(f, p, -1); break; }' },
  { code: '    Type(f, p, at - p);' },
  { code: '    p = m->Read(at);', note: 'up to }}' },
  { code: '    m->Run(f);' },
  { code: '    f = BorrowFocus();' },
  { code: '  }' },
  { code: '  return TRUE;' },
  { code: '}' },
  { code: 'WCHAR *FindMacro(WCHAR *p, Macro **m) {' },
  { code: '  if ((at = wcsstr(p, L"{{DATE:")))' },
  { code: '    *m = new DateMacro;' },
  { code: '  else if ((at = wcsstr(p, L"{{TIME:")))' },
  { code: '    *m = new TimeMacro;' },
  { code: '  else if ((at = wcsstr(p, L"{{TAB")))' },
  { code: '    *m = new TabMacro;' },
  { code: '  else if ((at = wcsstr(p, L"{{CTRL-")))' },
  { code: '    *m = new CtrlMacro;' },
  { code: '  return at;' },
  { code: '}' },
];

/** Steps for his "Date and time" item with any of his date and time formats, on any date. */
export function macroSteps(dateFmt = 'MMMM d, yyyy', timeFmt = 'h:mm tt', now: Date = SAMPLE) {
  const text = `Ottawa in {{DATE:${dateFmt}}}\r\nThe time is now {{TIME:${timeFmt}}}\r\n`;
  const d0 = text.indexOf('{{DATE:'), d1 = text.indexOf('}}', d0) + 2, t0 = text.indexOf('{{TIME:'), t1 = text.indexOf('}}', t0) + 2;
  const date = picture(dateFmt, now), time = picture(timeFmt, now);
  const out1 = 'Ottawa in ', out2 = out1 + date, out3 = out2 + '\nThe time is now ', out4 = out3 + time, out5 = out4 + '\n';
  const s = (a: number, c: number, hi: [number, number] | null, out: string, say: string): Step => ({ a, c, hi, out, text, say });
  const steps: Step[] = [
    s(5, 1, null, '', 'TapText borrows the focus first, as above.'),
    s(0, 14, [d0, d1], '', 'Look for {{DATE: anywhere in what is left. It is there, after “Ottawa in ”.'),
    s(1, 15, [d0, d1], '', 'Make a Date macro: a small C++ object. Each kind of macro is its own class with its own Read and Run, the way plug-ins share one interface today.'),
    s(7, 6, [0, d0], out1, 'Type the text before it, “Ottawa in ”, one key message at a time.'),
    s(8, 7, [d0, d1], out1, `Read the format up to the closing braces: ${dateFmt}.`),
    s(9, 8, [d0, d1], out2, `Run it. Windows’ own GetDateFormat writes “${date}” in the language of the phone, and it is typed.`),
    s(10, 9, null, out2, 'Borrow the focus again. After a {{TAB}}, it would be the next box of a form, so the next text lands in the next box.'),
    s(2, 16, [t0, t1], out2, 'Next pass. No {{DATE: is left, so it tries {{TIME: and finds it.'),
    s(7, 6, [d1, t0], out3, 'Type the new line and “The time is now ”.'),
    s(9, 8, [t0, t1], out4, `Run the Time macro: “${time}”.`),
    s(11, 5, [t1, text.length], out5, 'Nothing left to find. Type the last new line, and the item is done.'),
  ];
  return { text, steps };
}

export const MACRO = macroSteps();
