import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { callVnstock } from './vn-bridge.js';
import { extractBaseTicker, normalizeVnTicker } from './market-router.js';
import { formatToolResult } from '../types.js';

const VnFinancialStatementsSchema = z.object({
  ticker: z.string().max(20).describe("Vietnam stock ticker with .VN suffix. Example: 'FPT.VN', 'VNM.VN'"),
  period: z.enum(['year', 'quarter']).default('year').describe("Reporting period: 'year' for annual, 'quarter' for quarterly"),
  limit: z.number().default(4).describe('Maximum number of periods to return (default: 4, max: 8 for Community tier)'),
});

export const getVnIncomeStatements = new DynamicStructuredTool({
  name: 'get_vn_income_statements',
  description:
    'Fetches Vietnam company income statements. Use for VN tickers ending in .VN (e.g., FPT.VN, VNM.VN). Returns revenue, expenses, net income. Note: Guest tier limited to 4 periods.',
  schema: VnFinancialStatementsSchema,
  func: async (input) => {
    const normalizedTicker = normalizeVnTicker(input.ticker);
    const ticker = extractBaseTicker(normalizedTicker);
    const result = await callVnstock<unknown[]>('income_statement', [ticker, input.period, String(input.limit)]);
    return formatToolResult(result.data || [], [`vnstock:${ticker}`]);
  },
});

export const getVnBalanceSheets = new DynamicStructuredTool({
  name: 'get_vn_balance_sheets',
  description:
    'Fetches Vietnam company balance sheets. Use for VN tickers ending in .VN. Returns assets, liabilities, equity.',
  schema: VnFinancialStatementsSchema,
  func: async (input) => {
    const normalizedTicker = normalizeVnTicker(input.ticker);
    const ticker = extractBaseTicker(normalizedTicker);
    const result = await callVnstock<unknown[]>('balance_sheet', [ticker, input.period, String(input.limit)]);
    return formatToolResult(result.data || [], [`vnstock:${ticker}`]);
  },
});

export const getVnCashFlowStatements = new DynamicStructuredTool({
  name: 'get_vn_cash_flow_statements',
  description:
    'Fetches Vietnam company cash flow statements. Use for VN tickers ending in .VN. Returns operating, investing, financing activities.',
  schema: VnFinancialStatementsSchema,
  func: async (input) => {
    const normalizedTicker = normalizeVnTicker(input.ticker);
    const ticker = extractBaseTicker(normalizedTicker);
    const result = await callVnstock<unknown[]>('cash_flow', [ticker, input.period, String(input.limit)]);
    return formatToolResult(result.data || [], [`vnstock:${ticker}`]);
  },
});
