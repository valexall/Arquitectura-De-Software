import uuid

from app.billing import invoice_payload
from app.models import Order, OrderItem


def test_invoice_payload_uses_persisted_snapshot_and_order_id() -> None:
    order_id = uuid.uuid4()
    order = Order(
        id=order_id,
        dataset_id="public",
        idempotency_key="checkout-key",
        request_hash="a" * 64,
        status="confirmed",
        notification_status="pending",
        total_cents=6000,
        snapshot={},
    )
    items = [
        OrderItem(order_id=order_id, product_id="b", name="B", quantity=1, unit_price_cents=4000),
        OrderItem(order_id=order_id, product_id="a", name="A", quantity=2, unit_price_cents=1000),
    ]

    payload = invoice_payload(order, items)

    assert payload == {
        "order_id": str(order_id),
        "currency": "PEN",
        "items": [
            {"product_id": "a", "name": "A", "quantity": 2, "unit_price_cents": 1000},
            {"product_id": "b", "name": "B", "quantity": 1, "unit_price_cents": 4000},
        ],
        "total_cents": 6000,
    }
