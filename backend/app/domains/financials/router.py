import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.core.security import get_current_user
from app.domains.financials import client
from app.domains.financials.schemas import (
    BalanceSheetEntry,
    CashFlowEntry,
    IncomeStatementEntry,
    RatiosEntry,
)
from app.domains.financials.service import fetch_and_parse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/financials")


async def _handle(  # type: ignore[no-untyped-def]
    request: Request, ticker: str, fetcher, model, is_list: bool = True, page: int = 1, per_page: int = 50,
):
    try:
        result = await fetch_and_parse(fetcher, model, request.app.state.http_client, ticker, is_list)
        if is_list and isinstance(result, list):
            start = (page - 1) * per_page
            return result[start:start + per_page]
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("%s failed for %s", model.__name__, ticker)
        raise HTTPException(status_code=502, detail="External API error") from exc


@router.get("/balance-sheet", response_model=list[BalanceSheetEntry])
async def get_balance_sheet(
    request: Request,
    ticker: str = Query(..., min_length=1, max_length=10),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    _user: dict = Depends(get_current_user),
) -> list[BalanceSheetEntry]:
    return await _handle(request, ticker, client.get_balance_sheet, BalanceSheetEntry, page=page, per_page=per_page)


@router.get("/cash-flow", response_model=list[CashFlowEntry])
async def get_cash_flow(
    request: Request,
    ticker: str = Query(..., min_length=1, max_length=10),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    _user: dict = Depends(get_current_user),
) -> list[CashFlowEntry]:
    return await _handle(request, ticker, client.get_cash_flow, CashFlowEntry, page=page, per_page=per_page)


@router.get("/income-statement", response_model=list[IncomeStatementEntry])
async def get_income_statement(
    request: Request,
    ticker: str = Query(..., min_length=1, max_length=10),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    _user: dict = Depends(get_current_user),
) -> list[IncomeStatementEntry]:
    return await _handle(
        request, ticker, client.get_income_statement, IncomeStatementEntry, page=page, per_page=per_page,
    )


@router.get("/ratios", response_model=list[RatiosEntry])
async def get_ratios(
    request: Request,
    ticker: str = Query(..., min_length=1, max_length=10),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    _user: dict = Depends(get_current_user),
) -> list[RatiosEntry]:
    return await _handle(request, ticker, client.get_ratios, RatiosEntry, page=page, per_page=per_page)
