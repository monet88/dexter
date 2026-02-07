export type Market = 'US' | 'VN';

// Alphanumeric only, 1-10 chars — prevents flags/paths reaching spawn()
const TICKER_RE = /^[A-Z0-9]{1,10}$/;

/**
 * Validate extracted symbol against whitelist.
 * Throws on invalid format (empty, special chars, too long).
 */
function validateSymbol(symbol: string, original: string): void {
  if (!TICKER_RE.test(symbol)) {
    throw new Error(`Invalid ticker: ${original}`);
  }
}

/**
 * Normalize VN ticker to standard .VN format.
 * Accepts: ACB.VN, HOSE:ACB, HNX:SHB, UPCOM:VEA, ACB
 * Returns: ACB.VN, SHB.VN, VEA.VN, ACB.VN
 */
export function normalizeVnTicker(ticker: string): string {
  const upper = ticker.toUpperCase().trim();

  // Already correct format
  if (upper.endsWith('.VN')) {
    const symbol = upper.slice(0, -3);
    validateSymbol(symbol, ticker);
    return upper;
  }

  // TradingView format: HOSE:ACB, HNX:SHB, UPCOM:VEA
  if (/^(HOSE|HNX|UPCOM):/.test(upper)) {
    const symbol = upper.split(':')[1] ?? '';
    validateSymbol(symbol, ticker);
    return `${symbol}.VN`;
  }

  // Plain ticker - add .VN suffix
  validateSymbol(upper, ticker);
  return `${upper}.VN`;
}

/**
 * Check if ticker looks like VN market.
 * Detects: .VN suffix, HOSE:/HNX:/UPCOM: prefix
 */
export function looksLikeVnTicker(ticker: string): boolean {
  const upper = ticker.toUpperCase();
  return upper.endsWith('.VN') || /^(HOSE|HNX|UPCOM):/.test(upper);
}

/**
 * Detect market from ticker format.
 * - Tickers ending in .VN -> VN market
 * - All others -> US market (default)
 */
export function detectMarket(ticker: string): Market {
  if (looksLikeVnTicker(ticker)) {
    return 'VN';
  }
  return 'US';
}

/**
 * Extract base ticker without market suffix.
 */
export function extractBaseTicker(ticker: string): string {
  return ticker.replace(/\.(VN|US)$/i, '');
}

/**
 * Check if ticker is VN market.
 */
export function isVnTicker(ticker: string): boolean {
  return detectMarket(ticker) === 'VN';
}
