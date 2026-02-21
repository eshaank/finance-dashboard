from datetime import datetime, timezone
from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class Meta(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    request_id: str = ""


class ApiResponse(BaseModel, Generic[T]):
    data: T
    meta: Meta = Field(default_factory=Meta)


class PaginationMeta(Meta):
    total: int = 0
    page: int = 1
    per_page: int = 50
    has_next: bool = False


class PaginatedResponse(BaseModel, Generic[T]):
    data: T
    meta: PaginationMeta = Field(default_factory=PaginationMeta)
