export interface ProgramControl {
  key: string;
  action: string;
}

export interface Program {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  story: string;
  year: number;
  language: string;
  category: string;
  tags: string[];
  folder: string;
  executable: string;
  needsArabart: boolean;
  controls: ProgramControl[];
  image: string;
  launchNotes?: string;
}

export const programs: Program[] = [
  {
    id: "arabart-demo",
    title: "ARABART - Demo",
    subtitle: "Arabic Graphics Library Showcase",
    description:
      "Yasser wrote the ARABART library, first in 1991 and updated until 1993, to write Arabic on DOS graphics screens in different fonts, colors and styles. It picks the right form of each letter (isolated, initial, medial or final) by itself. This demo draws one line, \"Arabic Art 4.15\", in fonts 1 to 4 and in 12 colors, then with stretched words, then all of it again in italic. Press a key for the next screen.",
    story:
      "Borland C and its graphics library could not write a single word of Arabic. ARABART gives them Arabic with one call. It is a small program that stays in memory once it starts, like a background service on your laptop, and any program can ask it to draw. The text goes in as the English keys of an Arabic keyboard. The library joins the letters in five hand-drawn fonts, with bold, italic, underline, double size and 3-D. The demo itself is a loop of a dozen lines of C that talks to ARABART through five tiny functions. It works out every position from the text itself, never from numbers typed in by hand. Three programs in this archive call ARABART: this demo, the editor and The Brave Sun.",
    year: 1991,
    language: "Borland C++ (ARABART itself is assembly)",
    category: "library",
    tags: ["arabic", "graphics", "library", "tsr", "fonts"],
    folder: "ARABART",
    executable: "DEMO.EXE",
    needsArabart: true,
    controls: [{ key: "Any key", action: "Next screen (4 screens, then the demo ends)" }],
    launchNotes: "Watch the first screen fill up, then press any key for the next. The italic screens come last.",
    image: "arabart-demo.png",
  },
  {
    id: "arabart-editor",
    title: "ARABART - Editor",
    subtitle: "Interactive Arabic Text Editor",
    description:
      "A one-line Arabic typewriter for the ARABART library. Type on the keyboard and joined Arabic appears at once, in the font, color and style you pick. It needs ARABART in memory.",
    story:
      "Yasser wrote this small tool in Borland C++, with inline assembly for every call to ARABART. The whole program is one loop of 571 bytes: wait for a key, store it, clear the screen and ask ARABART to draw the whole line again. The keys follow the Arabic keyboard layout. On that layout, Shift with Q, W, E and R types small vowel marks that everyday Arabic leaves out. So he gave those keys a better job: they pick the font.",
    launchNotes: "Type on your keyboard as if it had Arabic key caps. Shift+Q, W, E and R pick the font, Shift+C the color, and Esc quits.",
    year: 1991,
    language: "Borland C++ with inline assembly",
    category: "tool",
    tags: ["arabic", "editor", "interactive", "fonts"],
    folder: "ARABART",
    executable: "EDITOR.EXE",
    needsArabart: true,
    controls: [
      { key: "Letter keys", action: "Type Arabic, using the Arabic keyboard layout" },
      { key: "SHIFT + Q,W,E,R", action: "Font 1, 2, 3 or 4" },
      { key: "SHIFT + 1-4", action: "Italic, bold, underline or double size, on or off from here" },
      { key: "SHIFT + 8", action: "All styles off from here" },
      { key: "SHIFT + C", action: "Next text color" },
      { key: "SHIFT + V", action: "Next 3-D shadow color" },
      { key: "SHIFT + \\", action: "3-D text on or off" },
      { key: "Backspace", action: "Erase the last key" },
      { key: "Esc", action: "Quit" },
    ],
    image: "arabart-editor.png",
  },
  {
    id: "arabart-commercial",
    title: "Arabic Commercial",
    subtitle: "Computer Center Slide Show",
    description:
      "A 1991 slide show for the Port Said Center for Computer Services: fifteen slides of Arabic in color, with 3-D shadows. The Arabic travels as pixels, and a player of 152 bytes paints them back.",
    story:
      "This slide show is the step before ARABART. Every line of Arabic travels as short vertical pen strokes, 9,023 of them for 15 slides. A player of just 152 bytes paints them back one pixel at a time. Before each line, the player rewrites five bytes of its own code to pick the direction, the shadow and both colors. Player and pictures together fit in 4,864 bytes on disk. His signature rides inside, scrambled, and comes back only when the program runs.",
    year: 1991,
    language: "Assembly",
    category: "demo",
    tags: ["arabic", "commercial", "animation", "advertising"],
    folder: "ARABIC",
    executable: "DEMO.COM",
    needsArabart: false,
    controls: [],
    image: "arabic-commercial.png",
    launchNotes: "The slides change by themselves. At the end the screen goes back to text and shows his signature.",
  },
  {
    id: "digi-test",
    title: "Digi-Test",
    subtitle: "Digital Circuit Simulator",
    description:
      "Yasser's 1993 graduation project: draw a circuit of real 74xx logic chips with the keyboard, and Digi-Test simulates it gate by gate. With his team's own plug-in card it also tested the real circuit on the bench and led the technician to the broken chip. Load KEMYAM to see the circuit from the graduation defense.",
    story:
      "Digi-Test was the heart of the KEMYAM group's graduation project, and Yasser wrote the software. It is real object-oriented C++ from 1993. You place real chips on a sheet, wire them with the keypad, and it works out what the circuit does. To test a real board it gives every wire five values: 0, 1, unknown, and two marks that carry a fault to the output. Every chip and gate it knows is a small data file, so a new chip needs no new code. With the team's plug-in card, it drove the real circuit and told the technician exactly where to place the probe next.",
    year: 1993,
    language: "C++, inline assembly",
    category: "tool",
    tags: ["circuits", "simulation", "graduation", "engineering", "gui"],
    folder: "DIGI_T",
    executable: "MAIN.EXE",
    needsArabart: false,
    controls: [
      { key: "F10", action: "Open the menus" },
      { key: "F3", action: "Load a circuit, for example KEMYAM" },
      {
        key: "INS",
        action: "Start a wire between two points",
      },
      {
        key: "DEL",
        action: "Delete the part under the cursor",
      },
    ],
    launchNotes:
      "Press F10 for the menus, then FILE and OPEN, and pick KEMYAM: the circuit from the graduation defense. The fault tests talked to the team's plug-in card, and the truth table went to a printer. This page plays both for you below.",
    image: "digi-test.png",
  },
  {
    id: "text-editor-gui",
    title: "Text Editor - Sample GUI",
    subtitle: "Interview Assignment Editor",
    description:
      "Yasser's answer to the interview assignment for his first professional job: a text editor that loads, saves, scrolls, moves the cursor and switches insert mode. He built it inside Digi-Test, his graduation project, reusing its windows, menus and dialogs, and added one new class for the text.",
    story:
      "For his first professional job, Yasser was set an assignment: a text editor that loads and saves files, scrolls, moves the cursor and switches between insert and overwrite. He wrote two. For EDIT.EXE he took the window system of Digi-Test, his graduation project, and added one new C++ class, TextEditor. The menus, dialogs and windows came along for free. The old code hands every key to the new class through one virtual method call, without ever knowing the editor exists.",
    year: 1993,
    language: "C++",
    category: "tool",
    tags: ["editor", "text", "gui", "interview", "professional"],
    folder: "EDIT",
    executable: "EDIT.EXE",
    needsArabart: false,
    controls: [
      { key: "F10", action: "Open the menus" },
      { key: "INS", action: "Insert mode on or off" },
      { key: "ALT + X", action: "Exit" },
    ],
    launchNotes: "The FILE menu opens by itself at start. Press F10 to open the menus again, Ins to switch insert mode, and Alt-X to quit.",
    image: "text-editor-gui.png",
  },
  {
    id: "text-editor-demo",
    title: "Text Editor - Demo",
    subtitle: "Windows-Inspired Text Editor",
    description:
      "A second editor for the same assignment, all new code, written in three evenings in October 1993. It draws a Windows 3 look pixel by pixel on the VGA screen: a blue title bar, a File menu with help in the status bar, and a red cursor that erases itself.",
    story:
      "Yasser wrote a second editor for the same assignment from scratch, between Thursday 7 and Saturday 9 October 1993: three source files, 838 lines. WINGRAPH.CPP paints a Windows 3 look on the VGA screen with 5 palette colors of its own. EDITOR.CPP sends every key through a switch of 22 cases. FUNCTION.CPP keeps each line of text in its own 204-byte block, behind a table of 601 pointers. The red cursor is XOR drawing: draw it twice and it is gone.",
    year: 1993,
    language: "C++",
    category: "tool",
    tags: ["editor", "text", "windows", "gui", "interview"],
    folder: "EDIT",
    executable: "EDITOR.EXE",
    needsArabart: false,
    controls: [
      { key: "F10", action: "Open the menus" },
      { key: "F3", action: "Open a file" },
      { key: "F2", action: "Save the file" },
      { key: "INS", action: "Insert mode on or off" },
      { key: "ALT + X", action: "Exit" },
    ],
    launchNotes: "Start typing: the text goes in at the red cursor. Ins switches INS ON and OFF, F10 or Alt+F opens the File menu, F2 saves, F3 opens and Alt+X quits.",
    image: "text-editor-demo.png",
  },
  {
    id: "formula-solver",
    title: "Formula Solver",
    subtitle: "Decimal Fixed-Point Calculator",
    description:
      "In 1992 Yasser was challenged, and paid, to do exact decimal math on a PC with nothing but assembly: no math chip, no library. FORM_X is his answer, in 3,546 bytes. Type a formula in x and a range, and it prints ten results, each one exact to 6 decimals. It checks every key as you type, so only a valid formula gets in.",
    story:
      "FORM_X is his answer to a paid challenge: exact decimal math in pure assembly, with no math chip. He built a whole formula solver from scratch. A keyboard filter lets only valid formulas in. A solver works from the innermost brackets out. And his own arithmetic handles 20-digit decimal numbers, one digit per byte. Because it was paid work, he signed it in a way that is hard to remove. His name hides in the code, scrambled, and comes back only while the program runs.",
    year: 1992,
    language: "Assembly",
    category: "tool",
    tags: ["math", "calculator", "bcd", "assembly", "fixed-point"],
    folder: "FORM_X",
    executable: "FORM_X.EXE",
    needsArabart: false,
    controls: [],
    launchNotes: "Type a formula in x, like (x-3)*(x+2)/7, and press Enter. Then type the first and the last value of x, each followed by Enter. Keys that cannot come next are simply ignored.",
    image: "formula-solver.png",
  },
  {
    id: "kvc-antivirus",
    title: "KVC - Kemyam Virus Capture",
    subtitle: "Antivirus for the Koko Virus",
    description:
      "In 1993 a virus called Koko was spreading across PCs in Egypt, and it could wipe a hard disk. No antivirus on the market could see it. Yasser and Ebrahim El-Etr took it apart by hand and wrote KVC, the KEMYAM Virus Capture. It finds Koko in memory with Koko's own secret question, switches it off through Koko's own hiding place, and rebuilds every infected program byte for byte.",
    story:
      "No antivirus on the market could see Koko, a virus that was wiping hard disks across Egypt. KVC, by Yasser and Ebrahim El-Etr, could. Version 1.05 asks the virus a question only Koko answers, then freezes it in memory without a restart. It repairs each program from the original bytes Koko carried inside itself. Its help screen promises a free new version for every new virus.",
    year: 1993,
    language: "C, Assembly",
    category: "utility",
    tags: ["antivirus", "security", "virus", "koko", "framework"],
    folder: "KVC",
    executable: "KVC.EXE",
    needsArabart: false,
    controls: [],
    image: "kvc-antivirus.png",
    launchNotes: "This player runs KVC on a clean PC: type KVC C: and press Enter to check drive C. To watch it catch Koko, start the demo PC further down this page, where a harmless double of Koko is waiting.",
  },
  {
    id: "kemyam-splash",
    title: "Kemyam - Group Names",
    subtitle: "Graduation Project Splash Screen",
    description:
      "The show that opened the defense of Yasser's graduation project in 1993: the KemYam group's name and logo, then a card for each of its five members. Every picture is packed in his own format and played by his own assembly code.",
    story:
      "The KemYam group's name slides in, their logo builds itself column by column, and each of the five members gets a card of their own. Yasser wrote all of it by hand in assembly: the picture format, the decoder and five effects. Its timing counts the screen's refreshes instead of trusting the processor's speed, so its pauses last the same on every PC.",
    launchNotes: "The show plays by itself. When the last card is up, press any key to see his signature sparkle.",
    year: 1993,
    language: "Assembly",
    category: "splash",
    tags: ["splash", "graduation", "animation", "team"],
    folder: "NAMES",
    executable: "NAMES.COM",
    needsArabart: false,
    controls: [],
    image: "kemyam-splash.png",
  },
  {
    id: "arabic-basmallah",
    title: "Arabic Basmallah",
    subtitle: "Islamic Phrase Demo",
    description:
      "The first appearance of Yasser's Arabic engine, in 1991. The program writes the Basmala 16 times, in every mix of bold, underline, italic and double size, each line in its own color. It carries its own copy of the engine, so it runs without the ARABART library loaded.",
    story:
      "PESM is a test card for the engine that became ARABART. Sixteen calls draw the Basmala, a sacred Islamic phrase. The style keys in front of each line count from 0 to 15 in binary, so every mix of the four styles appears once. Its joining code and letter shapes are the same bytes that ARABART 4.15 carries in 1993. PESM calls the engine directly, with the same arguments that programs later send to ARABART.",
    launchNotes: "It draws all sixteen lines, then hands back to DOS with the picture still on screen.",
    year: 1991,
    language: "Assembly",
    category: "demo",
    tags: ["arabic", "islamic", "calligraphy", "arabart", "demo"],
    folder: "PESM",
    executable: "PESM.EXE",
    needsArabart: false,
    controls: [],
    image: "arabic-basmallah.png",
  },
  {
    id: "portsaid-cs-splash",
    title: "Port Said Computer Systems",
    subtitle: "PCS Boot Screen",
    description:
      "The boot screen every PC sold by Port Said Computer Systems showed at start-up. Yasser gave it to the company, and the company gave him his very first computer mouse, something new and rare at the time.",
    story:
      "Yasser made this boot screen as a gift for Port Said Computer Systems, and every computer the company sold showed it when it started. The company thanked him with his very first mouse, a rare thing in Egypt in 1993. He built it on the picture code from his KemYam splash, carried into C.",
    launchNotes: "It plays by itself. When the English name is up, press any key to see his signature sparkle.",
    year: 1993,
    language: "C (Turbo C++) with inline Assembly",
    category: "splash",
    tags: ["splash", "boot", "commercial", "portsaid"],
    folder: "PORTSAID",
    executable: "PORTSAID.EXE",
    needsArabart: false,
    controls: [],
    image: "portsaid-splash.png",
  },
  {
    id: "portsaid-it-screensaver",
    title: "Port Said IT Department",
    subtitle: "Government Screensaver",
    description:
      "Yasser's gift to the computer department of the Port Said Governorate, written while he was an intern there. It ran on every computer in the department: three lines of Arabic drawn stroke by stroke, the last one changing color until someone presses a key.",
    story:
      "Yasser did not ship a picture. He wrote a player of just 156 bytes and a script of pen strokes for it, so the whole program is 1,672 bytes on disk. It ran on every computer in the Port Said Governorate's computer department, where he was an intern. The same year he used that player again, for a doctor's calligraphy splash and a 15-picture advertisement.",
    year: 1991,
    language: "Assembly",
    category: "splash",
    tags: ["screensaver", "government", "internship", "portsaid"],
    folder: "SCREEN",
    executable: "SCREEN.COM",
    needsArabart: false,
    controls: [],
    launchNotes: "It draws the three lines, then keeps redrawing the last one in a new color. Press any key to stop it and see his name.",
    image: "portsaid-screensaver.png",
  },
  {
    id: "brave-sun",
    title: "The Brave Sun",
    subtitle: "Award-Winning Educational Software",
    description:
      "Yasser's entry to the PC Middle East competition for Arabic educational software, which won 3rd place, a cash prize and enterprise software packages. It teaches young Arabic speakers about the sun: the solar system in motion, day and night, the seasons, the Moon, the water cycle, and the sun in the Quran.",
    story:
      "In September 1993 Yasser finished The Brave Sun, his entry to the PC Middle East competition for Arabic educational software. It won 3rd place, with a cash prize and enterprise software packages. Every picture is drawn by his own code. The planets circle the sun at the pace of their real years, and every word of Arabic comes from ARABART, his own Arabic library.",
    year: 1993,
    language: "C (Borland C++) with inline Assembly",
    category: "educational",
    tags: ["educational", "award", "competition", "animation", "sun", "children"],
    folder: "SUN",
    executable: "SUN.EXE",
    needsArabart: true,
    image: "brave-sun.png",
    controls: [
      { key: "UP / DOWN", action: "Move through the menu" },
      { key: "ENTER or SPACE", action: "Choose" },
      { key: "ESC", action: "Go back" },
      { key: "F1", action: "Help" },
      { key: "ALT + X", action: "Exit the program" },
    ],
    launchNotes:
      "His Arabic library, ARAB-ART 7.15, loads first, just as he shipped it with The Brave Sun. Then pick a choice with the arrow keys and Enter.",
  },
  {
    id: "taher",
    title: "TAHER",
    subtitle: "Calligraphic Arabic Splash Screen",
    description:
      "Hired to write the software that printed a lab physician's results, Yasser added a gift nobody asked for: a splash screen with the doctor's name, Taher Ibrahim El-Sarafy, in Arabic calligraphy.",
    story:
      "This splash screen was a gift on top of a paid job. It draws the doctor's name in red and silver Arabic calligraphy: 901 pen strokes, played by the same tiny player Yasser wrote for the Port Said Governorate. His own signature rides along inside, folded so no text search can find it, and unfolds when the program runs.",
    year: 1991,
    language: "Assembly",
    category: "splash",
    tags: ["calligraphy", "arabic", "splash", "medical", "gift"],
    folder: "TAHER",
    executable: "TAHER.COM",
    needsArabart: false,
    controls: [],
    launchNotes: "It draws the doctor's name, pauses for a moment, then returns to text mode and prints his signature.",
    image: "taher.png",
  },
  {
    id: "winkey",
    title: "WINKEY",
    subtitle: "Windowing Library Demo",
    description:
      "The first demo of Yasser's own window toolkit for DOS: a panel of 8 icon buttons with light and shadow, each pressing itself 11 times. The bevels, the icons and the press are his own code, drawn straight onto the EGA graphics card, and the icons live in their own file, MENU2.DAT.",
    story:
      "WINKEY is the first demo of the window toolkit Yasser began for DOS in 1992. A few bytes of table describe every button style, and a separate file holds the icons. His own assembly paints up to 8 pixels with one write to the graphics card. The same pixel trick appears in his Arabic engine, ARABART: a fingerprint of his hand.",
    year: 1992,
    language: "C (Turbo C++) with inline Assembly",
    category: "library",
    tags: ["gui", "windows", "buttons", "library", "3d"],
    folder: "WINKEY",
    executable: "WINKEY.EXE",
    needsArabart: false,
    controls: [],
    launchNotes: "WINKEY needs no keys: it starts by itself, presses each of its 8 buttons 11 times, and ends. Press Restart to watch it again.",
    image: "winkey.png",
  },
];

export function getYears(): number[] {
  return [...new Set(programs.map((p) => p.year))].sort();
}

export function getProgramById(id: string): Program | undefined {
  return programs.find((p) => p.id === id);
}

export function getProgramsByYear(year: number): Program[] {
  return programs.filter((p) => p.year === year);
}
