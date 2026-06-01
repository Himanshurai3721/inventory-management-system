from pydantic import BaseModel, ConfigDict


class LowStockProduct(BaseModel):
    id: int
    name: str
    sku: str
    quantity: int
    model_config = ConfigDict(from_attributes=True)


class DashboardResponse(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: list[LowStockProduct]
