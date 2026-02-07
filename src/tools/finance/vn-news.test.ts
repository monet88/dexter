import { describe, expect, test } from 'bun:test';
import { getVnNews } from './vn-news';

describe('vn-news', () => {
  describe('getVnNews', () => {
    test('returns fallback message when news unavailable', async () => {
      const result = await getVnNews.invoke({
        ticker: 'FPT.VN',
        limit: 5,
      });
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      // formatToolResult wraps data in { data: {...}, sourceUrls: [...] }
      const parsed = JSON.parse(result);
      // News fails gracefully with error in data.error
      expect(parsed.data.error).toBeDefined();
      expect(parsed.data.error).toContain('not available');
    });

    test('handles ticker without .VN suffix', async () => {
      const result = await getVnNews.invoke({
        ticker: 'VNM',
        limit: 3,
      });
      expect(result).toBeDefined();
    });
  });
});
