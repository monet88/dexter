#!/usr/bin/env python3
"""CLI wrapper for vnstock library (v3.4.0+). Returns JSON to stdout."""

import sys
import json
import os


def register_api_key():
    """Register API key if available for higher rate limits."""
    api_key = os.environ.get('VNSTOCK_API_KEY')
    if api_key:
        try:
            from vnstock import register_user
            # Suppress stdout from register_user (it prints success message)
            import io
            old_stdout = sys.stdout
            sys.stdout = io.StringIO()
            try:
                register_user(api_key=api_key)
            finally:
                sys.stdout = old_stdout
        except Exception:
            pass  # Silently fail - will use guest tier


def get_income_statement(ticker: str, period: str, limit: int) -> dict:
    """Fetch income statement for VN ticker."""
    try:
        from vnstock import Finance
        finance = Finance(symbol=ticker, source='KBS')
        df = finance.income_statement(period=period)
        if limit and len(df) > limit:
            df = df.head(limit)
        return {"success": True, "data": json.loads(df.to_json(orient="records"))}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_balance_sheet(ticker: str, period: str, limit: int) -> dict:
    """Fetch balance sheet for VN ticker."""
    try:
        from vnstock import Finance
        finance = Finance(symbol=ticker, source='KBS')
        df = finance.balance_sheet(period=period)
        if limit and len(df) > limit:
            df = df.head(limit)
        return {"success": True, "data": json.loads(df.to_json(orient="records"))}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_cash_flow(ticker: str, period: str, limit: int) -> dict:
    """Fetch cash flow statement for VN ticker."""
    try:
        from vnstock import Finance
        finance = Finance(symbol=ticker, source='KBS')
        df = finance.cash_flow(period=period)
        if limit and len(df) > limit:
            df = df.head(limit)
        return {"success": True, "data": json.loads(df.to_json(orient="records"))}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_ratios(ticker: str, period: str, limit: int) -> dict:
    """Fetch financial ratios for VN ticker."""
    try:
        from vnstock import Finance
        finance = Finance(symbol=ticker, source='KBS')
        df = finance.ratio(period=period, lang='en', dropna=True)
        if limit and len(df) > limit:
            df = df.head(limit)
        return {"success": True, "data": json.loads(df.to_json(orient="records"))}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_news(ticker: str, limit: int) -> dict:
    """Fetch news for VN ticker."""
    try:
        from vnstock import Quote
        quote = Quote(symbol=ticker, source='KBS')
        if hasattr(quote, 'news'):
            df = quote.news()
            if limit and len(df) > limit:
                df = df.head(limit)
            return {"success": True, "data": json.loads(df.to_json(orient="records"))}
        else:
            return {"success": False, "error": "News not available in current vnstock version"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No command provided"}))
        sys.exit(1)

    # Register API key on startup
    register_api_key()

    command = sys.argv[1]
    ticker = sys.argv[2] if len(sys.argv) > 2 else None
    period = sys.argv[3] if len(sys.argv) > 3 else "year"
    limit = int(sys.argv[4]) if len(sys.argv) > 4 else 10

    if not ticker:
        print(json.dumps({"success": False, "error": "Ticker required"}))
        sys.exit(1)

    commands = {
        "income_statement": get_income_statement,
        "balance_sheet": get_balance_sheet,
        "cash_flow": get_cash_flow,
        "ratios": get_ratios,
    }

    if command == "news":
        limit = int(sys.argv[3]) if len(sys.argv) > 3 else 10
        result = get_news(ticker, limit)
    elif command not in commands:
        print(json.dumps({"success": False, "error": f"Unknown command: {command}"}))
        sys.exit(1)
    else:
        result = commands[command](ticker, period, limit)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
