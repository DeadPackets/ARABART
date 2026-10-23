export interface Term {
  term: string;
  short: string;
  now?: string;
}

// One file per author in ./glossary/ so parallel writers never edit the same file
const files = import.meta.glob<{ default: Record<string, Term> }>('./glossary/*.ts', { eager: true });

export const glossary: Record<string, Term> = {};
for (const [path, mod] of Object.entries(files)) {
  for (const [id, t] of Object.entries(mod.default)) {
    if (glossary[id]) throw new Error(`Glossary term "${id}" is defined twice (second time in ${path})`);
    glossary[id] = t;
  }
}
