import { describe, expect, test, mock, beforeEach } from 'bun:test';
import { callVnstock } from './vn-bridge';

describe('vn-bridge', () => {
  describe('callVnstock', () => {
    test('returns data for valid ticker', async () => {
      // This is an integration test - requires Python and vnstock installed
      const result = await callVnstock('income_statement', ['FPT', 'year', '1']);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    test('returns error for invalid ticker', async () => {
      try {
        await callVnstock('income_statement', ['INVALID_XYZ', 'year', '1']);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Invalid symbol');
      }
    });

    test('caches repeated requests', async () => {
      // First call
      const start1 = Date.now();
      const result1 = await callVnstock('ratios', ['HPG', 'year', '1']);
      const time1 = Date.now() - start1;

      // Second call (should be cached)
      const start2 = Date.now();
      const result2 = await callVnstock('ratios', ['HPG', 'year', '1']);
      const time2 = Date.now() - start2;

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(JSON.stringify(result1)).toBe(JSON.stringify(result2));
      // Cache should be significantly faster (< 10ms vs network call)
      expect(time2).toBeLessThan(100);
    });
  });
});
