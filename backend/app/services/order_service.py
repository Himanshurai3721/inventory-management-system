from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.models import Customer, Order, OrderItem, Product
from app.schemas.order import OrderCreate


async def create_order(db: AsyncSession, data: OrderCreate) -> Order:
    async with db.begin():
        # 1. Verify customer exists
        customer_result = await db.execute(
            select(Customer).where(Customer.id == data.customer_id)
        )
        customer = customer_result.scalar_one_or_none()
        if customer is None:
            raise HTTPException(
                status_code=404,
                detail=f"Customer {data.customer_id} not found",
            )

        # 2. Lock and validate each product
        products_map = {}
        for item in data.items:
            product_result = await db.execute(
                select(Product).where(Product.id == item.product_id).with_for_update()
            )
            product = product_result.scalar_one_or_none()
            if product is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product {item.product_id} not found",
                )
            if product.quantity < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Insufficient stock for '{product.name}': "
                        f"requested {item.quantity}, available {product.quantity}"
                    ),
                )
            products_map[item.product_id] = product

        # 3. Create order with placeholder total
        order = Order(customer_id=data.customer_id, total_amount=Decimal("0"))
        db.add(order)
        await db.flush()  # get order.id

        # 4. Create order items and deduct stock
        total = Decimal("0")
        for item in data.items:
            product = products_map[item.product_id]
            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=product.price,
            )
            db.add(order_item)
            product.quantity -= item.quantity
            total += product.price * item.quantity

        # 5. Update total
        order.total_amount = total
        await db.flush()

    # Reload with items (outside the transaction block)
    result = await db.execute(
        select(Order).where(Order.id == order.id).options(selectinload(Order.items))
    )
    return result.scalar_one()


async def list_orders(db: AsyncSession) -> list[Order]:
    result = await db.execute(select(Order))
    return result.scalars().all()


async def get_order(db: AsyncSession, order_id: int) -> Order:
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
    return order


async def delete_order(db: AsyncSession, order_id: int) -> None:
    order = await get_order(db, order_id)
    await db.delete(order)
    await db.commit()
