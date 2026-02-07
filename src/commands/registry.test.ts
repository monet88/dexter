import { describe, expect, test } from 'bun:test';
import { filterCommands, COMMANDS } from './registry';

describe('filterCommands', () => {
  test('returns [] for empty string', () => {
    expect(filterCommands('')).toEqual([]);
  });

  test('returns [] for non-slash input', () => {
    expect(filterCommands('hello')).toEqual([]);
    expect(filterCommands('model')).toEqual([]);
  });

  test('returns all commands for "/" alone', () => {
    expect(filterCommands('/')).toEqual(COMMANDS);
  });

  test('returns matching commands for "/se"', () => {
    const results = filterCommands('/se');
    const names = results.map(c => c.name);
    expect(names).toContain('/settings');
    expect(names).toContain('/settings add');
    expect(names).toContain('/settings help');
    expect(names).toContain('/settings delete');
    expect(names).not.toContain('/model');
    expect(names).not.toContain('/use');
  });

  test('returns exact match for "/model"', () => {
    const results = filterCommands('/model');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('/model');
  });

  test('returns [] for no match "/xyz"', () => {
    expect(filterCommands('/xyz')).toEqual([]);
  });

  test('is case-insensitive', () => {
    const results = filterCommands('/Model');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('/model');
  });

  test('matches sub-commands: "/settings d"', () => {
    const results = filterCommands('/settings d');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('/settings delete');
  });

  test('returns [] for "/model " (trailing space)', () => {
    expect(filterCommands('/model ')).toEqual([]);
  });

  test('returns [] for special characters "/set$"', () => {
    expect(filterCommands('/set$')).toEqual([]);
  });
});
