import { statSync } from 'node:fs';
import { join } from 'node:path';
import type { Program } from './programs';

// Build-time only: real byte counts from the original files
const root = process.cwd();

export function exeSize(p: Program): number {
  return statSync(join(root, 'programs', p.folder, p.executable)).size;
}

export function bundleSize(id: string): number | null {
  try {
    return statSync(join(root, 'public', 'bundles', `${id}.jsdos`)).size;
  } catch {
    return null;
  }
}

export const bytes = (n: number) => n.toLocaleString('en-US');
