import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { loadCustomInstructions } from './load-instructions';

describe('loadCustomInstructions', () => {
  let tempDir: string;
  let localDir: string;
  let globalDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'dexter-test-'));
    localDir = join(tempDir, 'project');
    globalDir = join(tempDir, 'global');
    mkdirSync(localDir, { recursive: true });
    mkdirSync(globalDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  test('returns empty string when no files exist', () => {
    expect(loadCustomInstructions(localDir, globalDir)).toBe('');
  });

  test('returns local content when only local DEXTER.md exists', () => {
    writeFileSync(join(localDir, 'DEXTER.md'), 'Local instructions');
    expect(loadCustomInstructions(localDir, globalDir)).toBe('Local instructions');
  });

  test('returns global content when only global DEXTER.md exists', () => {
    writeFileSync(join(globalDir, 'DEXTER.md'), 'Global instructions');
    expect(loadCustomInstructions(localDir, globalDir)).toBe('Global instructions');
  });

  test('returns global then local separated by double newline when both exist', () => {
    writeFileSync(join(globalDir, 'DEXTER.md'), 'Global rules');
    writeFileSync(join(localDir, 'DEXTER.md'), 'Local rules');
    expect(loadCustomInstructions(localDir, globalDir)).toBe('Global rules\n\nLocal rules');
  });

  test('ignores empty files', () => {
    writeFileSync(join(localDir, 'DEXTER.md'), '');
    expect(loadCustomInstructions(localDir, globalDir)).toBe('');
  });

  test('ignores whitespace-only files', () => {
    writeFileSync(join(localDir, 'DEXTER.md'), '   \n  \n  ');
    expect(loadCustomInstructions(localDir, globalDir)).toBe('');
  });

  test('trims content from files', () => {
    writeFileSync(join(localDir, 'DEXTER.md'), '\n  Hello world  \n\n');
    expect(loadCustomInstructions(localDir, globalDir)).toBe('Hello world');
  });

  test('silent fail on nonexistent directory', () => {
    const badDir = join(tempDir, 'nonexistent', 'deep', 'path');
    expect(loadCustomInstructions(badDir, badDir)).toBe('');
  });
});
