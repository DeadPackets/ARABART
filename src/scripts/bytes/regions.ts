// Shared by the /bytes/ explorer (browser) and BytesMap.astro (build time): kinds, colors, labels, explainers.

export type Layer = 'disk' | 'memory';
export type By = 'yasser' | 'borland' | 'diet' | 'dos' | 'unknown';
export interface Region {
  start: number; end: number; kind: string; label: string; note: string;
  by: By; evidence: 'measured' | 'inferred'; link?: string; auto?: boolean;
}
export interface Routine { start: number; end: number; name: string; note: string; link?: string; lines?: { off: number; note: string }[] }
export interface Anatomy { file?: string; regions: Region[]; routines?: Routine[] }

// VGA colors only. The map sits on the Borland editor blue, so blue itself is never a data color.
export const MEM_KINDS = ['header', 'reloc', 'startup', 'code', 'library', 'data', 'text', 'font', 'image', 'table', 'stack', 'unused'] as const;
export const DISK_KINDS = ['sea', 'header', 'reloc', 'entry', 'unpacker', 'control', 'literal', 'text', 'backref', 'never'] as const;
export const BY: By[] = ['unknown', 'yasser', 'borland', 'diet', 'dos'];

export const MEM_RGB: Record<string, [number, number, number]> = {
  header: [85, 255, 255], reloc: [85, 85, 255], startup: [255, 255, 255], code: [255, 255, 85], library: [170, 170, 170],
  data: [0, 170, 170], text: [255, 85, 85], font: [255, 85, 255], image: [170, 0, 170], table: [85, 255, 85],
  stack: [85, 85, 85], unused: [0, 0, 0], unknown: [0, 170, 170],
};
export const DISK_RGB: Record<string, [number, number, number]> = {
  sea: [0, 0, 170], header: [85, 255, 255], reloc: [85, 85, 255], entry: [255, 255, 255], unpacker: [0, 170, 0],
  control: [170, 170, 170], literal: [0, 170, 170], text: [255, 85, 85], backref: [85, 85, 85], never: [0, 0, 0],
};
export const rgb = (c: [number, number, number]) => `rgb(${c[0]} ${c[1]} ${c[2]})`;

export const MEM_NAME: Record<string, string> = {
  header: 'Header', reloc: 'Fix-up list', startup: 'Start-up code', code: 'Code', library: 'Borland library', data: 'Data',
  text: 'Text', font: 'Font', image: 'Picture', table: 'Table', stack: 'Stack', unused: 'Empty space', unknown: 'Data',
};
export const DISK_NAME: Record<string, string> = {
  header: 'Header', reloc: 'Fix-up', entry: 'DIET start-up code', unpacker: 'DIET unpacker', control: 'Control bits',
  literal: 'Stored byte', text: 'Stored text', backref: 'Copy instruction', never: 'Not needed to start',
};
// one line per disk byte class, for the legend and the byte inspector
export const DISK_SAYS: Record<string, string> = {
  header: 'Part of the header DIET wrote: the manifest DOS reads first.', reloc: 'An address DOS fixes when the program loads.',
  entry: 'One of the first instructions to run. It makes room to unpack.', unpacker: 'Code that rebuilds the program in memory when it starts.',
  control: 'Read one bit at a time: each bit says whether a stored byte or a copy comes next.',
  literal: 'A byte of the real program, stored as it is.', text: 'A stored byte that is part of readable text.',
  backref: 'A copy instruction: go back this far and copy this many bytes.', never: 'The unpacker does not need this byte to start the program.',
};

export const BY_NAME: Record<By, string> = {
  yasser: 'Yasser', borland: 'Borland’s compiler', diet: 'DIET, the packer', dos: 'The EXE format', unknown: '',
};

// What each kind is, and the 2026 thing that does the same job
export const EXPLAIN: Record<string, { what: string; now: string }> = {
  header: {
    what: 'A short manifest at the front of the file. DOS reads it to learn how big the program is, where it starts and where its stack goes.',
    now: 'A package.json for a program. Every Windows .exe still starts with the letters MZ.',
  },
  reloc: {
    what: 'The list of fix-ups: places in the program that hold memory addresses. DOS adds the real load address to each one when the program starts.',
    now: 'Resolving relative URLs against the page they loaded from.',
  },
  startup: {
    what: 'Code that runs before the program proper. It sets up the stack, memory and the command line, then calls main().',
    now: 'The runtime that boots before your code, like the bootstrap a bundler puts in front of your modules.',
  },
  code: {
    what: 'The processor’s own instructions, one after another. Zoom in to the Code level to read them.',
    now: 'The compiled part of a bundle: the code that runs.',
  },
  library: {
    what: 'Code Borland’s compiler adds to every program: printing, files, memory and graphics drivers. Every program built with it carries its own copy.',
    now: 'node_modules bundled into your app.',
  },
  data: {
    what: 'Values the code works with: numbers, settings and lists.',
    now: 'The constants and variables of a bundle.',
  },
  text: {
    what: 'Messages and words the program shows. His Arabic is stored as the keys of an Arabic keyboard (fsl hggi is بسم الله), so here it reads as Latin letters.',
    now: 'String literals, or a translation file.',
  },
  font: {
    what: 'Letter shapes, stored as small pictures that the code copies to the screen.',
    now: 'A web font file.',
  },
  image: {
    what: 'A picture stored inside the program, as raw pixels or in his own compact format.',
    now: 'An image asset bundled with an app.',
  },
  table: {
    what: 'Values worked out in advance, so the code looks them up instead of computing them each time.',
    now: 'A lookup object, or a precomputed array.',
  },
  stack: {
    what: 'Room for the call stack: return addresses and local values.',
    now: 'The call stack you see in a JavaScript error.',
  },
  unused: {
    what: 'Room kept free, ready for values the program fills in as it runs.',
    now: 'Memory set aside up front, like new Array(n).',
  },
  unknown: {
    what: 'Values the code works with: numbers, settings and lists.',
    now: 'The constants and variables of a bundle.',
  },
  entry: {
    what: 'DIET’s first instructions. They move the packed program out of the way, so it can be rebuilt in place.',
    now: 'The first lines of a self-extracting zip.',
  },
  unpacker: {
    what: 'DIET’s unpacker. It rebuilds the real program byte by byte, then jumps to its first instruction.',
    now: 'The unzip code inside a self-extracting archive. UPX works the same way today.',
  },
  packed: {
    what: 'The real program, compressed. Stored bytes are kept as they are, copy instructions say “go back this far and copy this many”, and control bits say which comes next.',
    now: 'A .gz file: the same family of compression.',
  },
  never: {
    what: 'Bytes at the end of the file that the unpacker does not need to start the program.',
    now: 'Like extra data after the end of a zip archive.',
  },
};

// Automatic anatomy rows from public/bytes/files.json: [start, end, kind, extra]
type AutoRow = [number, number, string, string | number];
export function autoRegions(rows: AutoRow[], entryText: string, relocs: number): Region[] {
  return rows.map(([start, end, k, x]) => {
    const n = (end - start).toLocaleString('en-US');
    const base = { start, end, auto: true as const, evidence: 'measured' as const };
    switch (k) {
      case 'header': return { ...base, kind: 'header', by: 'dos', label: 'Header',
        note: `The manifest DOS reads first: the program's size, its start at ${entryText}, and its stack.` };
      case 'reloc': return { ...base, kind: 'reloc', by: 'dos', label: 'Fix-up list',
        note: `${relocs.toLocaleString('en-US')} addresses that DOS fixes with the real load address when the program starts.` };
      case 'pad': return { ...base, kind: 'unused', by: 'dos', label: 'Header padding', note: 'Zeros that round the header up to a whole 16-byte paragraph.' };
      case 'code': return { ...base, kind: 'code', by: 'unknown', label: 'Code',
        note: `Instructions reached from the first one, at ${entryText}, by following every jump and call.` };
      case 'text': return { ...base, kind: 'text', by: 'unknown', label: 'Text', note: `Readable text, for example "${x}".` };
      case 'unused': return { ...base, kind: 'unused', by: 'unknown', label: 'Empty space', note: `${n} bytes of zeros, kept free for values the program fills in.` };
      default: return { ...base, kind: 'data', by: 'unknown', label: 'Data', note: `${n} bytes of values the code works with: variables, tables or pictures.` };
    }
  }) as Region[];
}

export const pageFor = (id: string, base: string) => (id === 'arabart' ? `${base}/arabart/` : `${base}/program/${id}/`);
export function linkFor(link: string | undefined, id: string, base: string) {
  if (!link) return '';
  if (link.startsWith('#')) return pageFor(id, base) + link;
  if (link.startsWith('/')) return base + link;
  return link;
}
export const deepLink = (base: string, key: string, layer: Layer, at?: number) =>
  `${base}/bytes/?f=${encodeURIComponent(key)}&layer=${layer}${at != null ? `&at=${at.toString(16)}` : ''}`;
