from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.url import URL
from app.db.models.click import Click
from app.cache.redis_client import redis_client

CACHE_TTL = 3600


async def get_original_url(
    db: AsyncSession,
    short_code: str,
    ip_address: str | None = None,
    user_agent: str | None = None
):
    cached_url = await redis_client.get(short_code)

    if cached_url:
        result = await db.execute(
            select(URL.id).where(URL.short_code == short_code)
        )
        url_id = result.scalar_one_or_none()

        if url_id:
            click = Click(
                url_id=url_id,
                ip_address=ip_address,
                user_agent=user_agent
            )
            db.add(click)
            await db.commit()

        return cached_url

    result = await db.execute(
        select(URL).where(URL.short_code == short_code)
    )

    url = result.scalar_one_or_none()

    if not url:
        return None
    
    if url.expires_at and url.expires_at < datetime.utcnow():
        return "EXPIRED"
    
    await redis_client.set(short_code, url.original_url, ex=CACHE_TTL)

    click = Click(
        url_id=url.id,
        ip_address=ip_address,
        user_agent=user_agent
    )

    db.add(click)
    await db.commit()

    return url.original_url
