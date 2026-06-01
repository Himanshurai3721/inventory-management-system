import os
import sys
import logging

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    logging.error("DATABASE_URL environment variable is not set. Exiting.")
    sys.exit(1)

engine = create_async_engine(DATABASE_URL, echo=False)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db():
    """FastAPI dependency that yields an async database session."""
    async with AsyncSessionLocal() as session:
        yield session
