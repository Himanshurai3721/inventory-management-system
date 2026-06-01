from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderSummaryResponse
from app.services import order_service

router = APIRouter()


@router.post("/", response_model=OrderResponse, status_code=201)
async def create_order(data: OrderCreate, db: AsyncSession = Depends(get_db)):
    return await order_service.create_order(db, data)


@router.get("/", response_model=list[OrderSummaryResponse])
async def list_orders(db: AsyncSession = Depends(get_db)):
    return await order_service.list_orders(db)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    return await order_service.get_order(db, order_id)


@router.delete("/{order_id}", status_code=204)
async def delete_order(order_id: int, db: AsyncSession = Depends(get_db)):
    await order_service.delete_order(db, order_id)
    return Response(status_code=204)
