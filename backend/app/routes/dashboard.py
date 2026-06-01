from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.dashboard import DashboardResponse
from app.services import dashboard_service

router = APIRouter()


@router.get("/", response_model=DashboardResponse)
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    return await dashboard_service.get_dashboard(db)
