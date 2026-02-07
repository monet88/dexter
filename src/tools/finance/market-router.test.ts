import { describe, expect, test } from 'bun:test';
import { normalizeVnTicker, looksLikeVnTicker, detectMarket, extractBaseTicker, isVnTicker } from './market-router';

describe('normalizeVnTicker', () => {
  test('keeps .VN suffix', () => {
    expect(normalizeVnTicker('ACB.VN')).toBe('ACB.VN');
  });

  test('converts lowercase .vn suffix', () => {
    expect(normalizeVnTicker('acb.vn')).toBe('ACB.VN');
  });

  test('converts HOSE: format', () => {
    expect(normalizeVnTicker('HOSE:ACB')).toBe('ACB.VN');
  });

  test('converts HNX: format', () => {
    expect(normalizeVnTicker('HNX:SHB')).toBe('SHB.VN');
  });

  test('converts UPCOM: format', () => {
    expect(normalizeVnTicker('UPCOM:VEA')).toBe('VEA.VN');
  });

  test('adds .VN to plain ticker', () => {
    expect(normalizeVnTicker('ACB')).toBe('ACB.VN');
  });

  test('handles lowercase exchange prefix', () => {
    expect(normalizeVnTicker('hose:fpt')).toBe('FPT.VN');
  });

  test('trims whitespace', () => {
    expect(normalizeVnTicker('  ACB  ')).toBe('ACB.VN');
  });

  test('throws for empty string', () => {
    expect(() => normalizeVnTicker('')).toThrow('Invalid ticker');
  });

  test('throws for whitespace-only', () => {
    expect(() => normalizeVnTicker('   ')).toThrow('Invalid ticker');
  });

  test('throws for "HOSE:" without symbol', () => {
    expect(() => normalizeVnTicker('HOSE:')).toThrow('Invalid ticker');
  });

  test('throws for "--help" (invalid chars)', () => {
    expect(() => normalizeVnTicker('--help')).toThrow('Invalid ticker');
  });

  test('throws for path traversal attempt', () => {
    expect(() => normalizeVnTicker('../etc/passwd')).toThrow('Invalid ticker');
  });

  test('throws for ticker exceeding 10 chars', () => {
    expect(() => normalizeVnTicker('ABCDEFGHIJK')).toThrow('Invalid ticker');
  });
});

describe('looksLikeVnTicker', () => {
  test('returns true for .VN suffix', () => {
    expect(looksLikeVnTicker('ACB.VN')).toBe(true);
  });

  test('returns true for lowercase .vn suffix', () => {
    expect(looksLikeVnTicker('acb.vn')).toBe(true);
  });

  test('returns true for HOSE: prefix', () => {
    expect(looksLikeVnTicker('HOSE:ACB')).toBe(true);
  });

  test('returns true for HNX: prefix', () => {
    expect(looksLikeVnTicker('HNX:SHB')).toBe(true);
  });

  test('returns true for UPCOM: prefix', () => {
    expect(looksLikeVnTicker('UPCOM:VEA')).toBe(true);
  });

  test('returns false for US ticker', () => {
    expect(looksLikeVnTicker('AAPL')).toBe(false);
  });

  test('returns false for NYSE: prefix', () => {
    expect(looksLikeVnTicker('NYSE:AAPL')).toBe(false);
  });

  test('returns false for empty string', () => {
    expect(looksLikeVnTicker('')).toBe(false);
  });
});

describe('detectMarket', () => {
  test('returns VN for .VN suffix', () => {
    expect(detectMarket('FPT.VN')).toBe('VN');
    expect(detectMarket('VNM.VN')).toBe('VN');
    expect(detectMarket('HPG.vn')).toBe('VN');
  });

  test('returns VN for HOSE: prefix', () => {
    expect(detectMarket('HOSE:ACB')).toBe('VN');
  });

  test('returns VN for HNX: prefix', () => {
    expect(detectMarket('HNX:SHB')).toBe('VN');
  });

  test('returns VN for UPCOM: prefix', () => {
    expect(detectMarket('UPCOM:VEA')).toBe('VN');
  });

  test('returns US for non-.VN tickers', () => {
    expect(detectMarket('AAPL')).toBe('US');
    expect(detectMarket('MSFT')).toBe('US');
    expect(detectMarket('GOOGL')).toBe('US');
  });

  test('returns US for .US suffix', () => {
    expect(detectMarket('AAPL.US')).toBe('US');
  });

  test('returns US for NYSE: prefix', () => {
    expect(detectMarket('NYSE:AAPL')).toBe('US');
  });

  test('returns US for empty string', () => {
    expect(detectMarket('')).toBe('US');
  });
});

describe('extractBaseTicker', () => {
  test('removes .VN suffix', () => {
    expect(extractBaseTicker('FPT.VN')).toBe('FPT');
    expect(extractBaseTicker('VNM.vn')).toBe('VNM');
  });

  test('removes .US suffix', () => {
    expect(extractBaseTicker('AAPL.US')).toBe('AAPL');
  });

  test('returns unchanged for no suffix', () => {
    expect(extractBaseTicker('AAPL')).toBe('AAPL');
    expect(extractBaseTicker('FPT')).toBe('FPT');
  });
});

describe('isVnTicker', () => {
  test('returns true for .VN tickers', () => {
    expect(isVnTicker('FPT.VN')).toBe(true);
    expect(isVnTicker('VNM.VN')).toBe(true);
  });

  test('returns true for HOSE: prefix', () => {
    expect(isVnTicker('HOSE:ACB')).toBe(true);
  });

  test('returns false for non-.VN tickers', () => {
    expect(isVnTicker('AAPL')).toBe(false);
    expect(isVnTicker('FPT')).toBe(false);
  });
});
