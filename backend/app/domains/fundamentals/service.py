import logging
from typing import Any, Callable, Awaitable

import httpx
from pydantic import BaseModel

logger = logging.getLogger(__name__)


async def fetch_and_parse(
    fetcher: Callable[[httpx.AsyncClient, str], Awaitable[list[dict] | dict | None]],
    model: type[BaseModel],
    client: httpx.AsyncClient,
    ticker: str,
    is_list: bool = True,
) -> Any:
    """Generic helper: call a Massive API fetcher, parse into Pydantic models."""
    raw = await fetcher(client, ticker)
    if is_list:
        return [model(**r) for r in raw]  # type: ignore[arg-type]
    return model(**raw) if raw else None
