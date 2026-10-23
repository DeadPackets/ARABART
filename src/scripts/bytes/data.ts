// Build time only (Astro frontmatter): the byte map data plus the authored anatomy files.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { autoRegions, type Anatomy, type Region } from './regions';

export interface FileMeta {
  key: string; path: string; id: string; x: number; y: number; w: number; h: number;
  disk: { size: number; out: number; com: boolean; regions: Region[]; counts: Record<string, number> };
  mem: { size: number; hdr: number; relocs: number; entry: number; entryText: string; auto: [number, number, string, string | number][] };
}

// Same patterns as scripts/bytes/build.py: personal phone numbers and the P.O. box never reach the page
const PRIVATE = [/\(\d\d\) ?\d{3}-\d{3,}/g, /\d{3}-\d{3,}/g, /w>f> \d+/g];
// A P.O. box number, kept out of the source: any 6-digit run with this SHA-256 is hidden too
const PRIVATE_SHA = 'd864f8fd8f76e61708f3213689b5f6c7442a56c6c6adf2dddc8aadc932e0fced';
const sha = (s: string) => createHash('sha256').update(s).digest('hex');
const clean = (s = '') => PRIVATE.reduce((t, p) => t.replace(p, '(hidden)'), s).replace(/\d{6}/g, d => (sha(d) === PRIVATE_SHA ? '(hidden)' : d));

const raw = import.meta.glob<Anatomy>('../../data/anatomy/*.json', { eager: true, import: 'default' });

export function loadBytes() {
  const meta = JSON.parse(readFileSync(join(process.cwd(), 'public/bytes/files.json'), 'utf8'));
  const files: FileMeta[] = meta.files;
  const anatomy: Record<string, Anatomy> = {};
  for (const [p, a] of Object.entries(raw)) {
    const key = p.split('/').pop()!.replace(/\.json$/, '');
    const f = files.find(x => x.key === key);
    if (!f || !a?.regions?.length) continue;
    const regions = a.regions
      .map(r => ({ ...r, start: Math.max(0, r.start), end: Math.min(f.mem.size, r.end), label: clean(r.label), note: clean(r.note) }))
      .filter(r => r.end > r.start)
      .sort((x, y) => x.start - y.start);
    const routines = (a.routines || []).map(r => ({ ...r, name: clean(r.name), note: clean(r.note), lines: r.lines?.map(l => ({ ...l, note: clean(l.note) })) }));
    anatomy[key] = { regions, routines };
  }
  const memRegions = (f: FileMeta): Region[] => anatomy[f.key]?.regions ?? autoRegions(f.mem.auto, f.mem.entryText, f.mem.relocs);
  return { meta, files, anatomy, memRegions };
}

// Program ids to files; ARABART.EXE has no program entry, the /arabart/ page passes "arabart"
export const filesFor = (files: FileMeta[], id: string) => files.filter(f => f.id === id);
