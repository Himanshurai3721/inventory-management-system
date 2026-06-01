from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.customer import CustomerCreate, CustomerResponse
from app.services import customer_service

router = APIRouter()


@router.post("/", response_model=CustomerResponse, status_code=201)
async def create_customer(data: CustomerCreate, db: AsyncSession = Depends(get_db)):
    return await customer_service.create_customer(db, data)


@router.get("/", response_model=list[CustomerResponse])
async def list_customers(db: AsyncSession = Depends(get_db)):
    return await customer_service.list_customers(db)


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: int, db: AsyncSession = Depends(get_db)):
    return await customer_service.get_customer(db, customer_id)


@router.delete("/{customer_id}", status_code=204)
async def delete_customer(customer_id: int, db: AsyncSession = Depends(get_db)):
    await customer_service.delete_customer(db, customer_id)
    return Response(status_code=204)
