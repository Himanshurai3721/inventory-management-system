from decimal import Decimal

from pydantic import BaseModel, Field, ConfigDict


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    sku: str = Field(min_length=1, max_length=100)
    price: Decimal = Field(gt=0, le=Decimal("999999999.99"))
    quantity: int = Field(ge=0, le=999999)


class ProductUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    sku: str = Field(min_length=1, max_length=100)
    price: Decimal = Field(gt=0, le=Decimal("999999999.99"))
    quantity: int = Field(ge=0, le=999999)


class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    price: Decimal
    quantity: int
    model_config = ConfigDict(from_attributes=True)
