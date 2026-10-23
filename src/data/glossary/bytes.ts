import type { Term } from '../glossary';

export default {
  'mz-header': {
    term: 'MZ header',
    short: 'The table at the start of every DOS .EXE file. It begins with the letters MZ and tells DOS how big the program is, where it starts, where its stack goes and where its fix-ups are.',
    now: 'A package.json for a program. Every Windows .exe still begins with MZ.',
  },
  lz77: {
    term: 'LZ77',
    short: 'A family of compression methods that stores each piece of data either as itself or as “copy this many bytes from that far back”. DIET packs his programs with a method of this family.',
    now: 'The heart of gzip and zip, and of every PNG image.',
  },
  'back-reference': {
    term: 'Back-reference',
    short: 'In LZ77 compression, an instruction to copy bytes already rebuilt instead of storing them again. Every repeat shrinks to one small instruction.',
    now: 'Like a link to an earlier paragraph instead of pasting it twice.',
  },
  entropy: {
    term: 'Entropy',
    short: 'How varied a run of bytes is, from 0 to 8 bits per byte. In his files, text measures about 5, code about 6.7, and packed DIET data about 7.8.',
    now: 'Why a .zip of a .zip does not get any smaller.',
  },
} satisfies Record<string, Term>;
