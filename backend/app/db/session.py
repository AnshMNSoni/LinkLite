import os
import ssl
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

connect_args = {}

if DATABASE_URL:
    # Fix scheme for asyncpg
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+asyncpg://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

    # Detect local environment
    temp_url = DATABASE_URL.replace("[", "").replace("]", "")
    temp_url = temp_url.replace("postgresql+asyncpg://", "http://", 1).replace("postgresql://", "http://", 1)

    is_local = False
    try:
        parsed = urlparse(temp_url)
        hostname = parsed.hostname or ""
        if (
            hostname in ("localhost", "127.0.0.1", "postgres", "redis")
            or hostname.startswith("dpg-")  # Render internal DB
        ):
            is_local = True
    except Exception:
        pass

    # Strip query params (removes ?sslmode=require&channel_binding=require etc.)
    if "?" in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.split("?")[0]

    # SSL for production (Neon, Render external, etc.)
    if not is_local:
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        connect_args["ssl"] = ssl_context
        connect_args["server_settings"] = {
            "channel_binding": "disable"  # Needed for Neon compatibility with asyncpg
        }

engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10,
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session