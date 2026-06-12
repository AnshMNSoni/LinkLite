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
    
    # Check if we are running in a local environment (localhost, 127.0.0.1, or docker service postgres)
    is_local = False
    from urllib.parse import urlparse
    # Remove brackets to prevent urlparse ValueError when encountering non-IP bracketed hosts (e.g. [postgres])
    temp_url = DATABASE_URL.replace("[", "").replace("]", "")
    if temp_url.startswith("postgresql+asyncpg://"):
        temp_url = temp_url.replace("postgresql+asyncpg://", "http://", 1)
    elif temp_url.startswith("postgresql://"):
        temp_url = temp_url.replace("postgresql://", "http://", 1)
        
    try:
        parsed = urlparse(temp_url)
        hostname = parsed.hostname
        if hostname:
            if hostname in ("localhost", "127.0.0.1", "postgres", "redis"):
                is_local = True
    except Exception:
        pass

    # Enforce SSL for all cloud/production environments (e.g. Render)
    if not is_local:
        import ssl
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        connect_args["ssl"] = ssl_context
        # Strip query parameters from the DSN string to prevent dialect parsing issues in SQLAlchemy
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
