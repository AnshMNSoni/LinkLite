import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

connect_args = {}

if DATABASE_URL:
    # Render provides URLs starting with 'postgres://', but SQLAlchemy async needs 'postgresql+asyncpg://'
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+asyncpg://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    # Extract SSL requirements from the query string (e.g. sslmode=require or ssl=require)
    # and configure them explicitly in connect_args to support asyncpg.
    if "sslmode=" in DATABASE_URL or "ssl=" in DATABASE_URL:
        connect_args["ssl"] = "require"
        # Strip query parameters from the DSN string to prevent dialect parsing issues
        if "?" in DATABASE_URL:
            DATABASE_URL = DATABASE_URL.split("?")[0]

engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    connect_args=connect_args,
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_ = AsyncSession,
    expire_on_commit=False,
)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
