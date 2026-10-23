import { programs } from '../data/programs';

// One plain sentence per program: the page's lead, the description for link previews, and the NC info panel text
export const glance: Record<string, string> = {
  'arabart-demo': 'The showcase for his Arabic engine: one line of Arabic in four fonts and twelve colors, stretched, then all of it again in italic.',
  'arabart-editor': 'A one-line Arabic typewriter. With every key you press, his library joins the whole line again, in the font, color and style you pick.',
  'arabart-commercial': 'A 15-slide Arabic advert for a computer services center in Port Said, played by a 152-byte player he wrote.',
  'digi-test': 'His graduation project: put real logic chips on a board, wire them up, and watch the circuit run.',
  'text-editor-gui': 'The text editor he wrote to get his first job, with menus and windows, built on the Digi-Test interface.',
  'text-editor-demo': 'A second editor for the same job interview, with the look of Windows 3. He built it in three evenings.',
  'formula-solver': 'A paid challenge: exact 20-digit math, written by hand in assembly for a PC with no math chip. Type a formula in x and get a table of answers.',
  'kvc-antivirus': 'An antivirus for Koko, an Egyptian virus that wiped hard drives and that no scanner on the market could find. KVC knows it byte by byte.',
  'kemyam-splash': 'About 1.1 KB of assembly that plays 10 compressed pictures and introduces the five members of his graduation team.',
  'arabic-basmallah': 'The Basmala drawn 16 times, in every mix of bold, underline and italic, at two sizes and in different colors, by its own copy of ARABART.',
  'portsaid-cs-splash': 'The start-up screen on every PC that Port Said Computer Systems sold. They paid him with his first mouse.',
  'portsaid-it-screensaver': "The screensaver for Port Said Governorate's IT department: 156 bytes of code, shorter than a tweet, that play a drawing script.",
  'brave-sun': 'Arabic educational software about the sun, with moving orbits. It won third place in the PC Middle East programming competition in 1993.',
  taher: 'A calligraphy splash screen for a lab physician’s software, with his name, Taher Ibrahim El-Sarafy, in Arabic.',
  winkey: 'The start of his own window toolkit: eight 3-D buttons with icons that press in and pop back out.',
};

// The order of his programs everywhere on the site: the ARABART demo and editor first, then by year
const lib = (id: string) => id === 'arabart-demo' || id === 'arabart-editor';
export const shelf = programs.map((p, i) => ({ p, i })).sort((a, b) => +lib(b.p.id) - +lib(a.p.id) || a.p.year - b.p.year || a.i - b.i).map(x => x.p);
