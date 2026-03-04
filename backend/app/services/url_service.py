from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.url import URL
from app.utils.base62 import encode_base62

async def create_short_url(db: AsyncSession, original_url: str) -> URL:
    new_url = URL(original_url=original_url)
    
    db.add(new_url)
    await db.flush()
    
    short_code = encode_base62(new_url)
    
    new_url.short_code = short_code
    
    db.commit()
    db.refresh(new_url)
    
    return new_url
