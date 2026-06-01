from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services import product_service

router = APIRouter()


@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(data: ProductCreate, db: AsyncSession = Depends(get_db)):
    return await product_service.create_product(db, data)


@router.get("/", response_model=list[ProductResponse])
async def list_products(db: AsyncSession = Depends(get_db)):
    return await product_service.list_products(db)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    return await product_service.get_product(db, product_id)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, data: ProductUpdate, db: AsyncSession = Depends(get_db)):
    return await product_service.update_product(db, product_id, data)


@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    await product_service.delete_product(db, product_id)
    return Response(status_code=204)
