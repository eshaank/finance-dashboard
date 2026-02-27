from dataclasses import dataclass
from datetime import date, timedelta

import httpx
from cachetools import TTLCache

from app.core.config import get_settings
from app.shared.http_client import fetch_with_retry

_cik_cache: TTLCache[str, str | None] = TTLCache(maxsize=256, ttl=86400)
_filings_cache: TTLCache[str, list["SecFiling"]] = TTLCache(maxsize=128, ttl=600)


@dataclass
class SecFiling:
    ticker: str
    cik: str
    filing_type: str
    filing_date: str
    period_of_report_date: str | None
    description: str | None
    link: str


async def fetch_ticker_cik(client: httpx.AsyncClient, ticker: str) -> str | None:
    """Fetch CIK for a ticker using Polygon.io."""
    settings = get_settings()
    if not settings.massive_api_key:
        raise ValueError("MASSIVE_API_KEY is not configured")

    ticker_upper = ticker.upper()
    if ticker_upper in _cik_cache:
        return _cik_cache[ticker_upper]

    url = f"https://api.polygon.io/v3/reference/tickers/{ticker_upper}"
    params = {"apiKey": settings.massive_api_key}

    try:
        response = await fetch_with_retry(client, "GET", url, params=params)
        data = response.json()
        results = data.get("results")
        if results:
            cik = results.get("cik")
            _cik_cache[ticker_upper] = cik
            return cik
    except Exception:
        pass

    _cik_cache[ticker_upper] = None
    return None


async def fetch_sec_filings(client: httpx.AsyncClient, ticker: str) -> tuple[str | None, list[SecFiling]]:
    """Fetch SEC filings using SEC EDGAR API (sec-api.io)."""
    settings = get_settings()

    ticker_upper = ticker.upper()
    cache_key = f"filings:{ticker_upper}"
    if cache_key in _filings_cache:
        cached = _filings_cache[cache_key]
        return cached[0], cached[1]

    cik = await fetch_ticker_cik(client, ticker)
    if not cik:
        return None, []

    to_date = date.today()
    from_date = to_date - timedelta(days=365 * 5)

    filings_list: list[SecFiling] = []

    if settings.sec_api_key:
        url = "https://api.sec-api.io"
        params = {
            "query": f'cik:"{cik}" AND filedAt:[{from_date.isoformat()} TO {to_date.isoformat()}]',
            "from": 0,
            "size": 100,
            "apikey": settings.sec_api_key,
        }

        try:
            response = await fetch_with_retry(client, "GET", url, params=params)
            data = response.json()
            filings = data.get("filings", [])

            for f in filings:
                filing = SecFiling(
                    ticker=ticker_upper,
                    cik=cik,
                    filing_type=f.get("formType", ""),
                    filing_date=f.get("filedAt", "").split("T")[0] if f.get("filedAt") else "",
                    period_of_report_date=f.get("periodOfReport"),
                    description=f.get("description"),
                    link=f.get("linkToFilingDetails")
                    or f"https://www.sec.gov/Archives/edgar/data/{cik}/{f.get('accessionNumber', '').replace('-', '')}/{f.get('primaryDocument', '')}",
                )
                filings_list.append(filing)
        except Exception:
            pass

    if not filings_list:
        sec_url = f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK={cik}&type=&dateb=&owner=include&count=100&output=atom"
        try:
            response = await client.get(sec_url)
            if response.status_code == 200:
                import xml.etree.ElementTree as ET

                root = ET.fromstring(response.text)
                ns = {"atom": "http://www.w3.org/2005/Atom"}
                entries = root.findall(".//atom:entry", ns)

                for entry in entries[:100]:
                    filing_date_elem = entry.find("atom:updated", ns)
                    filing_date = filing_date_elem.text.split("T")[0] if filing_date_elem is not None else ""

                    if filing_date and from_date <= date.fromisoformat(filing_date) <= to_date:
                        link_elem = entry.find("atom:link", ns)
                        link = link_elem.get("href") if link_elem is not None else ""

                        filing = SecFiling(
                            ticker=ticker_upper,
                            cik=cik,
                            filing_type="",
                            filing_date=filing_date,
                            period_of_report_date=None,
                            description=entry.find("atom:title", ns).text
                            if entry.find("atom:title", ns) is not None
                            else "",
                            link=link,
                        )
                        filings_list.append(filing)
        except Exception:
            pass

    _filings_cache[cache_key] = (cik, filings_list)
    return cik, filings_list
