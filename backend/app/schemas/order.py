from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(ge=1)


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: Decimal
    created_at: datetime
    items: list[OrderItemResponse] = []
    model_config = ConfigDict(from_attributes=True)


class OrderSummaryResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: Decimal
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
