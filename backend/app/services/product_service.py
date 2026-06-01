from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from app.models.models import Product
from app.schemas.product import ProductCreate, ProductUpdate


async def create_product(db: AsyncSession, data: ProductCreate) -> Product:
    product = Product(
        name=data.name,
        sku=data.sku,
        price=data.price,
        quantity=data.quantity,
    )
    db.add(product)
    try:
        await db.commit()
        await db.refresh(product)
        return product
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail=f"SKU '{data.sku}' already exists")


async def list_products(db: AsyncSession) -> list[Product]:
    result = await db.execute(select(Product))
    return result.scalars().all()


async def get_product(db: AsyncSession, product_id: int) -> Product:
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
    return product


async def update_product(db: AsyncSession, product_id: int, data: ProductUpdate) -> Product:
    product = await get_product(db, product_id)
    product.name = data.name
    product.sku = data.sku
    product.price = data.price
    product.quantity = data.quantity
    try:
        await db.commit()
        await db.refresh(product)
        return product
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=409, detail=f"SKU '{data.sku}' already exists")


async def delete_product(db: AsyncSession, product_id: int) -> None:
    product = await get_product(db, product_id)
    await db.delete(product)
    await db.commit()
