import { readFileSync, existsSync, statSync, realpathSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

const INSTRUCTIONS_FILE = 'DEXTER.md';
const MAX_FILE_SIZE = 512 * 1024; // 512KB limit

/**
 * Load custom instructions from DEXTER.md files.
 * Returns combined content: global first, then local.
 * Returns empty string if no files found.
 */
export function loadCustomInstructions(cwd?: string, globalDir?: string): string {
  const sections: string[] = [];

  // Global: ~/.dexter/DEXTER.md
  const globalPath = join(globalDir ?? join(homedir(), '.dexter'), INSTRUCTIONS_FILE);
  const globalContent = readFileSafe(globalPath);
  if (globalContent) {
    sections.push(globalContent);
  }

  // Local: ./DEXTER.md (project-specific)
  const localPath = join(cwd ?? process.cwd(), INSTRUCTIONS_FILE);
  const localContent = readFileSafe(localPath);
  if (localContent) {
    sections.push(localContent);
  }

  return sections.join('\n\n');
}

function readFileSafe(filePath: string): string | null {
  if (!existsSync(filePath)) return null;
  try {
    // Prevent symlink traversal outside parent directory
    const realPath = realpathSync(filePath);
    const expectedDir = dirname(filePath);
    if (!realPath.startsWith(realpathSync(expectedDir))) return null;

    // Prevent unbounded memory consumption
    const stats = statSync(realPath);
    if (stats.size > MAX_FILE_SIZE) return null;

    const content = readFileSync(realPath, 'utf-8').trim();
    return content || null;
  } catch {
    return null;
  }
}
