import logging

from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth import get_current_user
from app.schemas.models import (
    BalanceSheetEntry,
    CashFlowEntry,
    FloatData,
    IncomeStatementEntry,
    RatiosEntry,
    ShortInterestEntry,
    ShortVolumeEntry,
)
from app.services import massive

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/fundamentals/balance-sheet", response_model=list[BalanceSheetEntry])
def get_balance_sheet(ticker: str = Query(..., min_length=1, max_length=10), _user: dict = Depends(get_current_user)) -> list[BalanceSheetEntry]:
    try:
        rows = massive.get_balance_sheet(ticker)
        logger.debug("balance-sheet raw rows for %s: %s", ticker, rows[:2])
        return [BalanceSheetEntry(**r) for r in rows]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("balance-sheet failed for %s", ticker)
        raise HTTPException(status_code=500, detail=f"{type(exc).__name__}: {exc}") from exc


@router.get("/fundamentals/cash-flow", response_model=list[CashFlowEntry])
def get_cash_flow(ticker: str = Query(..., min_length=1, max_length=10), _user: dict = Depends(get_current_user)) -> list[CashFlowEntry]:
    try:
        rows = massive.get_cash_flow(ticker)
        logger.debug("cash-flow raw rows for %s: %s", ticker, rows[:2])
        return [CashFlowEntry(**r) for r in rows]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("cash-flow failed for %s", ticker)
        raise HTTPException(status_code=500, detail=f"{type(exc).__name__}: {exc}") from exc


@router.get("/fundamentals/income-statement", response_model=list[IncomeStatementEntry])
def get_income_statement(ticker: str = Query(..., min_length=1, max_length=10), _user: dict = Depends(get_current_user)) -> list[IncomeStatementEntry]:
    try:
        rows = massive.get_income_statement(ticker)
        logger.debug("income-statement raw rows for %s: %s", ticker, rows[:2])
        return [IncomeStatementEntry(**r) for r in rows]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("income-statement failed for %s", ticker)
        raise HTTPException(status_code=500, detail=f"{type(exc).__name__}: {exc}") from exc


@router.get("/fundamentals/ratios", response_model=list[RatiosEntry])
def get_ratios(ticker: str = Query(..., min_length=1, max_length=10), _user: dict = Depends(get_current_user)) -> list[RatiosEntry]:
    try:
        rows = massive.get_ratios(ticker)
        logger.debug("ratios raw rows for %s: %s", ticker, rows[:2])
        return [RatiosEntry(**r) for r in rows]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("ratios failed for %s", ticker)
        raise HTTPException(status_code=500, detail=f"{type(exc).__name__}: {exc}") from exc


@router.get("/fundamentals/short-interest", response_model=list[ShortInterestEntry])
def get_short_interest(ticker: str = Query(..., min_length=1, max_length=10), _user: dict = Depends(get_current_user)) -> list[ShortInterestEntry]:
    try:
        rows = massive.get_short_interest(ticker)
        logger.debug("short-interest raw rows for %s: %s", ticker, rows[:2])
        return [ShortInterestEntry(**r) for r in rows]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("short-interest failed for %s", ticker)
        raise HTTPException(status_code=500, detail=f"{type(exc).__name__}: {exc}") from exc


@router.get("/fundamentals/short-volume", response_model=list[ShortVolumeEntry])
def get_short_volume(ticker: str = Query(..., min_length=1, max_length=10), _user: dict = Depends(get_current_user)) -> list[ShortVolumeEntry]:
    try:
        rows = massive.get_short_volume(ticker)
        logger.debug("short-volume raw rows for %s: %s", ticker, rows[:2])
        return [ShortVolumeEntry(**r) for r in rows]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("short-volume failed for %s", ticker)
        raise HTTPException(status_code=500, detail=f"{type(exc).__name__}: {exc}") from exc


@router.get("/fundamentals/float", response_model=FloatData)
def get_float(ticker: str = Query(..., min_length=1, max_length=10), _user: dict = Depends(get_current_user)) -> FloatData:
    try:
        data = massive.get_float(ticker)
        logger.debug("float raw data for %s: %s", ticker, data)
        if not data:
            raise HTTPException(status_code=404, detail=f"No float data found for '{ticker}'")
        return FloatData(**data)
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("float failed for %s", ticker)
        raise HTTPException(status_code=500, detail=f"{type(exc).__name__}: {exc}") from exc
