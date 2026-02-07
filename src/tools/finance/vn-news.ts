import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callVnstock } from './vn-bridge.js';
import { extractBaseTicker, normalizeVnTicker } from './market-router.js';
import { formatToolResult } from '../types.js';

const VnNewsSchema = z.object({
  ticker: z.string().max(20).describe("Vietnam stock ticker with .VN suffix. Example: 'FPT.VN'"),
  limit: z.number().default(10).describe('Number of news articles to return (default: 10)'),
});

export const getVnNews = new DynamicStructuredTool({
  name: 'get_vn_news',
  description:
    'Fetches recent news for Vietnam stocks. Returns headlines, dates, sources. Use for tickers ending in .VN. Falls back to web search if not available.',
  schema: VnNewsSchema,
  func: async (input) => {
    const normalizedTicker = normalizeVnTicker(input.ticker);
    const ticker = extractBaseTicker(normalizedTicker);
    try {
      const result = await callVnstock<unknown[]>('news', [ticker, String(input.limit)]);
      return formatToolResult(result.data || [], [`vnstock:${ticker}`]);
    } catch {
      return formatToolResult(
        { error: 'VN news not available via vnstock. Use web_search for Vietnam stock news.' },
        [`vnstock:${ticker}`]
      );
    }
  },
});
