import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callVnstock } from './vn-bridge.js';
import { extractBaseTicker, normalizeVnTicker } from './market-router.js';
import { formatToolResult } from '../types.js';

const VnRatiosSchema = z.object({
  ticker: z.string().max(20).describe("Vietnam stock ticker with .VN suffix. Example: 'FPT.VN'"),
  period: z.enum(['year', 'quarter']).default('year'),
  limit: z.number().default(4),
});

export const getVnRatios = new DynamicStructuredTool({
  name: 'get_vn_ratios',
  description: 'Fetches financial ratios for Vietnam stocks. Returns ROE, ROA, P/E, P/B, debt ratios in English.',
  schema: VnRatiosSchema,
  func: async (input) => {
    const normalizedTicker = normalizeVnTicker(input.ticker);
    const ticker = extractBaseTicker(normalizedTicker);
    const result = await callVnstock<unknown[]>('ratios', [ticker, input.period, String(input.limit)]);
    return formatToolResult(result.data || [], [`vnstock:${ticker}`]);
  },
});
