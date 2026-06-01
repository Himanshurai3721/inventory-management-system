from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.session import engine
from app.models.models import Base
from app.routes import customers, dashboard, orders, products


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup if they don't exist yet
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="Inventory & Order Management System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/products")
app.include_router(customers.router, prefix="/customers")
app.include_router(orders.router, prefix="/orders")
app.include_router(dashboard.router, prefix="/dashboard")
