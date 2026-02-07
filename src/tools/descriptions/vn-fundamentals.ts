export const VN_FUNDAMENTALS_DESCRIPTION = `
## When to use
- User asks about Vietnam stocks (tickers ending in .VN like FPT.VN, VNM.VN, VIC.VN)
- User wants income statements for VN companies
- User asks about Vietnamese company financials

## When NOT to use
- User asks about US stocks (AAPL, MSFT, etc.) - use regular financial tools
- Ticker does not have .VN suffix

## Input format
- Ticker MUST end with .VN suffix (e.g., FPT.VN, not FPT)
- Period: 'year' for annual, 'quarter' for quarterly
- Limit: number of periods (default 4, max 8 for Community tier)

## Data Source
Uses KBS (KB Securities) as default source.
Rate limits: Guest 20 req/min, Community 60 req/min.

## Examples
- "Get FPT.VN income statements" -> get_vn_income_statements
`;
