from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException

from app.models.models import Product, Customer, Order
from app.schemas.dashboard import DashboardResponse, LowStockProduct


async def get_dashboard(db: AsyncSession) -> DashboardResponse:
    try:
        # Count products
        total_products_result = await db.execute(select(func.count()).select_from(Product))
        total_products = total_products_result.scalar_one()

        # Count customers
        total_customers_result = await db.execute(select(func.count()).select_from(Customer))
        total_customers = total_customers_result.scalar_one()

        # Count orders
        total_orders_result = await db.execute(select(func.count()).select_from(Order))
        total_orders = total_orders_result.scalar_one()

        # Low stock products: 0 < quantity <= 10, ordered by quantity asc, limit 100
        low_stock_result = await db.execute(
            select(Product)
            .where(Product.quantity > 0, Product.quantity <= 10)
            .order_by(Product.quantity.asc())
            .limit(100)
        )
        low_stock_products = [
            LowStockProduct(id=p.id, name=p.name, sku=p.sku, quantity=p.quantity)
            for p in low_stock_result.scalars().all()
        ]

        return DashboardResponse(
            total_products=total_products,
            total_customers=total_customers,
            total_orders=total_orders,
            low_stock_products=low_stock_products,
        )
    except SQLAlchemyError:
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")
