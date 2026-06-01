from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from app.models.models import Customer, Order
from app.schemas.customer import CustomerCreate


async def create_customer(db: AsyncSession, data: CustomerCreate) -> Customer:
    customer = Customer(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
    )
    db.add(customer)
    try:
        await db.commit()
        await db.refresh(customer)
        return customer
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail=f"Email '{data.email}' already exists")


async def list_customers(db: AsyncSession) -> list[Customer]:
    result = await db.execute(select(Customer).order_by(Customer.created_at.asc()))
    return result.scalars().all()


async def get_customer(db: AsyncSession, customer_id: int) -> Customer:
    result = await db.execute(select(Customer).where(Customer.id == customer_id))
    customer = result.scalar_one_or_none()
    if customer is None:
        raise HTTPException(status_code=404, detail=f"Customer {customer_id} not found")
    return customer


async def delete_customer(db: AsyncSession, customer_id: int) -> None:
    customer = await get_customer(db, customer_id)
    # Check for associated orders
    order_count_result = await db.execute(
        select(func.count()).select_from(Order).where(Order.customer_id == customer_id)
    )
    order_count = order_count_result.scalar_one()
    if order_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot delete customer {customer_id}: {order_count} order(s) exist"
        )
    await db.delete(customer)
    await db.commit()
