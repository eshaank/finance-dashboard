from app.domains.market.schemas import MarketIndex

MARKET_INDICES: list[MarketIndex] = [
    MarketIndex(
        id="dax",
        ticker="DAX",
        name="DAX",
        price=22_014.47,
        change=+244.34,
        changePercent=+1.12,
        exchange="XETRA",
        trend="up",
    ),
    MarketIndex(
        id="nikkei",
        ticker="NKY",
        name="Nikkei 225",
        price=39_568.86,
        change=-124.49,
        changePercent=-0.31,
        exchange="TSE",
        trend="down",
    ),
    MarketIndex(
        id="hangseng",
        ticker="HSI",
        name="Hang Seng",
        price=21_814.37,
        change=+248.02,
        changePercent=+1.15,
        exchange="HKEX",
        trend="up",
    ),
    MarketIndex(
        id="shanghai",
        ticker="SHCOMP",
        name="Shanghai Composite",
        price=3_350.73,
        change=+27.41,
        changePercent=+0.82,
        exchange="SSE",
        trend="up",
    ),
]
