export const VN_NEWS_DESCRIPTION = `
## When to use
- User asks about Vietnam stock news (tickers ending in .VN)
- User wants recent headlines for VN companies
- User asks "what's happening with FPT.VN"

## When NOT to use
- User asks about US stock news - use regular news tool
- Ticker does not have .VN suffix

## Fallback
If vnstock news is unavailable, use web_search with query like "FPT stock news Vietnam"

## Input format
- Ticker MUST end with .VN suffix (e.g., FPT.VN)
- Limit: number of articles to return

## Examples
- "FPT.VN news" -> get_vn_news
- "Latest VNM.VN headlines" -> get_vn_news
`;
