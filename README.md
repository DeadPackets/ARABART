# ARABART

A museum of my father Yasser Awad's software, named after ARABART, the Arabic graphics library he wrote in Port Said in 1991. His 15 DOS programs run in your browser, his Arabic engine is ported line by line to JavaScript, and his DinarSoft Pocket PC apps are archived with free unlock keys.

**[Visit ARABART](https://projects.deadpackets.pw/ARABART/)**

## Stack

- **[Astro](https://astro.build/)**: static site generator
- **[js-dos v8](https://js-dos.com/)**: DOSBox compiled to WebAssembly, runs his programs
- **[GSAP](https://gsap.com/)**, **[Lenis](https://lenis.darkroom.engineering/)** and **[OGL](https://github.com/oframe/ogl)**: animation, smooth scroll and the WebGL hero
- **GitHub Actions**: builds and deploys to GitHub Pages on every push to `master`

## Layout

```
src/
  pages/        Routes: home, /arabart/, /program/<id>/, /dinarsoft/, patents, career, primer, glossary, bytes
  writeups/     One explainer per program and per DinarSoft app
  components/   shell/ (era windows, header, hero), toys/ (interactive explainers), explain/, DosPlayer
  lib/          Ports of his code: arabart/ (the engine), formx/, kvc/, dinarsoft/ (unlock keys), eras/
  data/         Programs, DinarSoft catalog, glossary, byte maps
scripts/
  build-bundles.mjs   Packs programs/ into .jsdos bundles (built in CI, not committed)
  bytes/              Builds the Every Byte maps
programs/       His original DOS program files
public/         Fonts, screenshots, byte-map data, the DinarSoft archive (installers, screens, press)
research/       Reverse-engineering notes and the proofs behind every claim on the site
```

## Development

```bash
npm install
npm run dev       # build the bundles, then start the dev server
npm run build     # production build into dist/
npm run preview   # serve dist/
```

## Programs

| Program | Year | Language | What it is |
|---------|------|----------|------------|
| ARABART Demo | 1991 | Assembly | Arabic graphics library showcase |
| ARABART Editor | 1991 | Assembly | Interactive Arabic text editor |
| ARABART Commercial | 1991 | Assembly | Animated store advertisement |
| Digi-Test | 1993 | C++, Assembly | Digital circuit simulator |
| Text Editor (GUI) | 1993 | C | Interview assignment editor |
| Text Editor (Demo) | 1993 | C | Windows-inspired text editor |
| Formula Solver | 1992 | Assembly | BCD floating point calculator |
| KVC Antivirus | 1993 | C, Assembly | Antivirus for the Koko virus |
| Kemyam Names | 1993 | C, Assembly | Graduation project splash screen |
| Arabic Basmallah | 1991 | Assembly | Islamic phrase demo |
| Port Said CS | 1993 | C, Assembly | PCS boot screen |
| Port Said IT | 1991 | Assembly | Government screensaver |
| The Brave Sun | 1993 | C, Assembly | Award-winning educational software |
| TAHER | 1991 | Assembly | Calligraphic Arabic splash screen |
| WINKEY | 1992 | Assembly | Windowing library demo |

## Credits

- DinarSoft's pages, installers and press coverage were recovered from the [Internet Archive](https://web.archive.org/). Yasser Awad released the DinarSoft apps as freeware (`research/dinarsoft/RELEASE.md`).
- IBM VGA font from [The Ultimate Oldschool PC Font Pack](https://int10h.org/oldschool-pc-fonts/) by VileR, CC BY-SA 4.0.
- Archivo, Martian Mono, Pixelify Sans and Reem Kufi under the SIL Open Font License 1.1 (`public/fonts/ofl/`).

## License

MIT
