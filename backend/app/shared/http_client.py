import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type


def create_async_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(timeout=15.0)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=0.5, min=0.5, max=4),
    retry=retry_if_exception_type((httpx.TransportError, httpx.TimeoutException)),
    reraise=True,
)
async def fetch_with_retry(client: httpx.AsyncClient, method: str, url: str, **kwargs: object) -> httpx.Response:
    response = await client.request(method, url, **kwargs)
    response.raise_for_status()
    return response
