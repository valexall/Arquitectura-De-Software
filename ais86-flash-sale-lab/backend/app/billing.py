from __future__ import annotations

import logging
import uuid
from typing import Any

import httpx
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from .config import Settings
from .db import utcnow
from .models import BillingRecord, Order, OrderItem
from .security import ApiError, DatasetContext, dataset_context, get_session

logger = logging.getLogger(__name__)
router = APIRouter()


def invoice_payload(order: Order, items: list[OrderItem]) -> dict[str, Any]:
    return {
        "order_id": str(order.id),
        "currency": "PEN",
        "items": [
            {
                "product_id": item.product_id,
                "name": item.name,
                "quantity": item.quantity,
                "unit_price_cents": item.unit_price_cents,
            }
            for item in sorted(items, key=lambda value: value.product_id)
        ],
        "total_cents": order.total_cents,
    }


async def issue_invoice(
    session_factory: async_sessionmaker[AsyncSession],
    order_id: uuid.UUID,
    settings: Settings,
) -> BillingRecord:
    async with session_factory() as session:
        order = await session.get(Order, order_id)
        if order is None:
            raise ValueError("order not found")
        items = (
            await session.execute(select(OrderItem).where(OrderItem.order_id == order_id))
        ).scalars().all()
        payload = invoice_payload(order, items)
        dataset_id = order.dataset_id

    if not settings.billing_enabled:
        status, invoice_id, error = "pending", None, "billing is not configured"
    else:
        try:
            async with httpx.AsyncClient(timeout=settings.billing_timeout_seconds) as client:
                response = await client.post(
                    settings.billing_base_url.rstrip("/") + "/invoices",
                    json=payload,
                    headers={
                        "X-Billing-Token": settings.billing_token_value(),
                        "Idempotency-Key": str(order_id),
                    },
                )
            if response.status_code not in (200, 201):
                raise RuntimeError(f"billing returned HTTP {response.status_code}")
            body = response.json()
            if body.get("order_id") != str(order_id):
                raise RuntimeError("billing response order_id mismatch")
            invoice_id = uuid.UUID(body["id"])
            status, error = "issued", None
        except (httpx.HTTPError, ValueError, KeyError, RuntimeError) as exc:
            logger.warning("billing failed order_id=%s type=%s", order_id, type(exc).__name__)
            status, invoice_id, error = "failed", None, str(exc)[:500]

    async with session_factory() as session:
        async with session.begin():
            statement = pg_insert(BillingRecord).values(
                order_id=order_id,
                dataset_id=dataset_id,
                status=status,
                invoice_id=invoice_id,
                attempts=1,
                last_error=error,
                updated_at=utcnow(),
            )
            statement = statement.on_conflict_do_update(
                index_elements=["order_id"],
                set_={
                    "status": status,
                    "invoice_id": invoice_id,
                    "attempts": BillingRecord.attempts + 1,
                    "last_error": error,
                    "updated_at": utcnow(),
                },
            )
            await session.execute(statement)
        return (await session.get(BillingRecord, order_id))  # type: ignore[return-value]


async def fetch_invoice_snapshot(
    record: BillingRecord | None,
    settings: Settings,
) -> dict[str, Any] | None:
    if record is None or record.invoice_id is None or not settings.billing_enabled:
        return None
    try:
        async with httpx.AsyncClient(timeout=settings.billing_timeout_seconds) as client:
            response = await client.get(
                settings.billing_base_url.rstrip("/") + f"/invoices/{record.invoice_id}",
                headers={"X-Billing-Token": settings.billing_token_value()},
            )
        if response.status_code != 200:
            return None
        body = response.json()
        if body.get("id") != str(record.invoice_id) or body.get("order_id") != str(record.order_id):
            return None
        return body
    except (httpx.HTTPError, ValueError, AttributeError):
        logger.warning("invoice lookup failed invoice_id=%s", record.invoice_id)
        return None


def billing_view(
    record: BillingRecord | None,
    invoice: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if record is None:
        return {"status": "pending", "invoice_id": None, "attempts": 0, "invoice": None}
    return {
        "status": record.status,
        "invoice_id": str(record.invoice_id) if record.invoice_id else None,
        "attempts": record.attempts,
        "invoice": invoice,
    }


@router.get("/api/v1/orders/{order_id}/billing")
async def get_billing(
    order_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
    context: DatasetContext = Depends(dataset_context),
) -> dict[str, Any]:
    order = await session.get(Order, order_id)
    if order is None or order.dataset_id != context.dataset_id:
        raise ApiError(404, "NOT_FOUND", "Order not found")
    record = await session.get(BillingRecord, order_id)
    invoice = await fetch_invoice_snapshot(record, request.app.state.settings)
    return billing_view(record, invoice)


@router.post("/api/v1/orders/{order_id}/billing/retry")
async def retry_billing(
    order_id: uuid.UUID,
    request: Request,
    session: AsyncSession = Depends(get_session),
    context: DatasetContext = Depends(dataset_context),
) -> JSONResponse:
    order = await session.get(Order, order_id)
    if order is None or order.dataset_id != context.dataset_id:
        raise ApiError(404, "NOT_FOUND", "Order not found")
    record = await issue_invoice(request.app.state.db.session_factory, order_id, request.app.state.settings)
    invoice = await fetch_invoice_snapshot(record, request.app.state.settings)
    return JSONResponse(status_code=200, content=billing_view(record, invoice))
