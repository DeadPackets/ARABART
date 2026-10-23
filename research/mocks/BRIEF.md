# Shared brief: Yasser Awad museum, concept mocks (round 2)

## The project
A museum and homage, built by his son, to **Yasser Awad**: a young engineer in Port Said, Egypt, who wrote DOS software
from 1991 to 1993 with no internet, a few books and trial and error. He later founded a company, **Dinarsoft**.
The site is being rebranded from "DOSArchive" to an archive **and technical analysis** of all of Yasser Awad's work.
Working wordmark for every mock: **Yasser Awad**. Descriptor: "The archive and analysis of his software, 1991 to 1993."
(Do not write his name in Arabic script. The only Arabic name text verified is the screenshot signature
"مهندس / ياسر محمد على" on The Brave Sun title screen.)

Current live site (for reference only, do not copy its look): `/Users/deadpackets/workspace/DOSArchive` (Astro). Every
program runs in the browser through js-dos; mocks only need screenshots, not emulators.

## Audience
Technical and non-technical visitors. Assume ADHD: lead with the single most relevant fact, keep copy short, let depth be
opt-in. Every exhibit has three depths (progressive disclosure):
1. **Glance**: one sentence anyone understands.
2. **Story**: 2 to 4 sentences, human and specific.
3. **Code**: a real, annotated disassembly excerpt for engineers.
Inline technical terms link to a **glossary** (popover on hover/tap, plus a full glossary view).

## Verified facts you may use (do not invent others)
- 15 programs, 1991 to 1993. Data per program (title, subtitle, year, language, executable, folder, byte size,
  description, screenshot): `../../data.js` exposes `window.PROGRAMS`. Screenshots: `../../images/<image>` (962x600 PNG).
  Total executable bytes: 282,675.
- ARABART: an Arabic graphics library for DOS graphics mode, written in Assembly, first written in 1991 and updated
  until 1993. It stays resident in memory (a TSR) and does auto-shaping: each Arabic letter takes an isolated, initial,
  medial or final form depending on its neighbours. Binary string: "Copyright (c)1993 YASSER".
- Toolchain evidence from binary strings: Borland C++ (SUN.EXE, DIGI_T/MAIN.EXE, ARABART/DEMO.EXE), Turbo C, 1990
  Borland International (WINKEY.EXE), a Turbo C Project File (EDIT/EDITOR.PRJ).
- ARABART.EXE (11,183 bytes) and all four .COM programs are compressed: they unpack themselves when started.
- Verified ARABART.EXE entry code (offsets in the load image). Use this as the Code-depth excerpt for ARABART:
  ```
  00003  cld                    ; string copies run forward
  00004  push es                ; remember the segments DOS gave us
  00005  push ds
  00007  mov  ax, cs            ; where our own code was loaded
  0000D  mov  dx, 02C3h         ; size of the packed body, in 16-byte paragraphs
  0001F  mov  cx, 8             ; 8 words = one 16-byte paragraph
  00022  rep  movsw             ; copy one paragraph upward in memory
  00024  dec  bx / dec ax / dec dx   ; step back one paragraph
  00027  jns  00017             ; repeat until the whole body has moved
  00033  mov  dl, 10h           ; 16-bit buffer for the decompressor's bit reader
  00035  jmp  far 0759:04D6     ; jump into the unpacker, which rebuilds the real program
  ```
- Other people named in binaries/screenshots: "KEMYAM Computer Group" (his graduation-project group), "YASSER MOHAMED ALI"
  (signature on KVC and The Brave Sun). The Brave Sun was his entry to a PC Middle East programming competition.
- DinarSoft Corporation (verified): Kanata, Ontario, founded Nov 2002; six Pocket PC / Windows Mobile utilities,
  2003 to 2008: MemMaid (main product), HandySwitcher, HandyMenu, HandyLauncher, TapText, HijriDate (Arabic Hijri
  dates). Press coverage and awards are being verified now: do not claim specific awards yet.
- Career after the DOS years (supplied by his son; treat as verified):
  - **Sakhr Software**, Cairo, Project Leader, Jun 1993 to Sep 1996. Key contributor to Sakhr's ArabicOffice
    applications: a stand-alone multi-threaded printing core used by several products; an object-oriented bilingual,
    multi-style, multi-font text displayer used in the Ustaz Arabic word processor; common Arabic APIs so applications
    ran on Arabic and non-Arabic Windows; the company's first multimedia installer framework, adopted by almost all
    departments.
  - **Newbridge Networks → Alcatel** (Kanata/Ottawa; Alcatel bought Newbridge in 2000; "Alcatel-Lucent" only existed from Dec 2006, so never use that name for this era), Senior Designer and team leader (OSS interfaces), Oct 1996 to Nov 2006. Architect of
    the 5620 CORBA product (distributed, multi-threaded, JIDM standard); contributor to JIDM discussions at the ITU and
    a regular member of the company's ITU conference team; designed "jidmTester", a script-based automated tester
    adopted by Alcatel labs; designed a custom CORBA EventChannel measured at twice the speed of the standard one.
    Patents: US 2006/0288020 was granted as US 7,603,377 B2 (2009), "Method and data structure for indexed storage of
    hierarchically interrelated information in a relational database" (with Ahmed Moustafa and Mohamad Hassoun);
    US 2007/0130192 was abandoned.
- So the museum covers an arc: DOS programs in Port Said (1991 to 1993) → Sakhr (1993 to 1996) → Newbridge → Alcatel
  (1996 to 2006) → Dinarsoft. The 15 DOS programs are the playable core; later eras are documented, not emulated.

Glossary terms to define (plain English, one or two sentences each): TSR, Assembly, VGA, BGI (Borland Graphics
Interface), interrupt, COM file, EXE file, executable packer, auto-shaping, ligature, BCD (binary-coded decimal),
Borland C++ / Turbo C, DOSBox / js-dos, byte, paragraph (16 bytes in real-mode x86).

## Every mock must contain
1. A hero with the concept's signature effect, readable in under 3 seconds.
2. The collection (all 15 programs) navigated through the concept's signature interaction.
3. One full exhibit (ARABART) with the three depths, switchable.
4. Glossary: inline term popovers in the exhibit copy, and a full glossary view.
5. The career arc after 1993 (Sakhr, Newbridge → Alcatel with the granted patent, DinarSoft with its six products),
   presented through the concept's own interaction model, concise.
6. Footer: "Built by Youssef Awad for his father."

## Craft rules (from the impeccable design skill; non-negotiable)
- Read `/Users/deadpackets/.claude/skills/impeccable/SKILL.md` and `reference/brand.md`, `reference/animate.md`,
  `reference/overdrive.md` before building. Follow the absolute bans: no gradient text, no side-stripe borders,
  no glassmorphism by default, no hero-metric template, no identical card grids, no eyebrow on every section,
  no em dashes in copy, no cream/beige body, no border + wide soft shadow pairs, card radius ≤ 16px.
- Fonts: avoid the reflex-reject list (Inter, IBM Plex, Space Grotesk/Mono, DM *, Fraunces, Playfair, etc.).
  Max 3 families. Hero clamp max ≤ 6rem. Display letter-spacing ≥ -0.04em.
- Colors in OKLCH, text contrast ≥ 4.5:1.
- Motion: purposeful; ease-out curves (expo/quart/quint), no bounce/elastic. `prefers-reduced-motion` gets a calm,
  complete static version. Reveals enhance visible defaults: content must never be invisible if JS or a transition
  fails. Pause WebGL/rAF loops when off-screen or tab hidden. 60fps target.
- Responsive: must compose at 1440x900 and 390x844 (touch has no hover: every hover interaction needs a tap path).
- Keyboard and screen-reader basics: real buttons/links, focus-visible, labelled controls.

## Tech
- Libraries only from cdnjs/jsdelivr with exact pinned versions: GSAP 3.13.0 (all plugins are free:
  ScrollTrigger, Draggable, InertiaPlugin, SplitText, Flip, Observer, MorphSVG), three.js 0.170.0 (ES module via
  jsdelivr `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js`), and only if your concept needs it:
  cannon-es 0.20.0 or matter-js 0.20.0. Nothing else.
- Hand-written GLSL is welcome where it is the signature.
- Single folder per mock: `mocks/v2/<slug>/index.html` (+ local .js/.css/.json as needed). Use relative paths
  `../../data.js` and `../../images/`. A static server already serves `mocks/` at http://localhost:8765/
  (so your mock is at http://localhost:8765/v2/<slug>/). If it is down, start one:
  `cd <mocks dir> && python3 -m http.server 8765` in the background.

## Verify before you report
- Screenshot helper (headless Chrome with SwiftShader WebGL):
  `<scratchpad>/shoot.sh <name> <url> <width> <height> [virtual_ms]` writes `<scratchpad>/shots/<name>.png`.
  Use your concept slug as a name prefix. Read every PNG you take.
- Chrome cannot make a window narrower than 500px. For phone widths use the iframe harness:
  `http://localhost:8765/frame.html?w=390&h=844&u=<url-encoded mock url>` shot at 520x880.
- Headless virtual time can freeze CSS transitions mid-way. Judge motion by code review, judge layout by screenshots.
- Fix every defect you see (overflow, clipping, contrast, overlap, blank WebGL). Iterate until it would survive a
  high-end studio review.

## Report back (under 250 words)
Concept name, the one-sentence idea, signature interaction(s), palette + fonts, libraries used, the screenshot paths
(desktop + phone), and any known limitations. Do not paste code.
