import { describe, expect, test } from 'bun:test';
import { getVnIncomeStatements, getVnBalanceSheets, getVnCashFlowStatements } from './vn-fundamentals';

describe('vn-fundamentals', () => {
  describe('getVnIncomeStatements', () => {
    test('returns income data for valid VN ticker', async () => {
      const result = await getVnIncomeStatements.invoke({
        ticker: 'FPT.VN',
        period: 'year',
        limit: 2,
      });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      const parsed = JSON.parse(result);
      // formatToolResult wraps data in { data: [...], sourceUrls: [...] }
      expect(parsed.data).toBeDefined();
      expect(Array.isArray(parsed.data)).toBe(true);
    });

    test('handles ticker without .VN suffix', async () => {
      const result = await getVnIncomeStatements.invoke({
        ticker: 'FPT',
        period: 'year',
        limit: 1,
      });
      expect(result).toBeDefined();
    });
  });

  describe('getVnBalanceSheets', () => {
    test('returns balance sheet data for valid VN ticker', async () => {
      const result = await getVnBalanceSheets.invoke({
        ticker: 'VNM.VN',
        period: 'year',
        limit: 2,
      });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      const parsed = JSON.parse(result);
      expect(parsed.data).toBeDefined();
      expect(Array.isArray(parsed.data)).toBe(true);
    });
  });

  describe('getVnCashFlowStatements', () => {
    test('returns cash flow data for valid VN ticker', async () => {
      const result = await getVnCashFlowStatements.invoke({
        ticker: 'VIC.VN',
        period: 'year',
        limit: 2,
      });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      const parsed = JSON.parse(result);
      expect(parsed.data).toBeDefined();
      expect(Array.isArray(parsed.data)).toBe(true);
    });
  });
});
