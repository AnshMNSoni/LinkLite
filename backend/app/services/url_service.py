from datetime import datetime
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.models.url import URL
from app.db.models.click import Click
from app.utils.base62 import encode_base62
from app.cache.redis_client import redis_client


async def create_short_url(
    db: AsyncSession,
    original_url: str,
    custom_code: str | None = None,
    expires_at: datetime | None = None,
    user_id: int | None = None
):

    if custom_code:

        result = await db.execute(
            select(URL).where(URL.short_code == custom_code)
        )

        existing = result.scalar_one_or_none()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Custom code already in use"
            )

        new_url = URL(
            original_url=original_url,
            short_code=custom_code,
            expires_at=expires_at,
            user_id=user_id
        )

        db.add(new_url)
        await db.commit()
        await db.refresh(new_url)

        return new_url

    new_url = URL(
        original_url=original_url,
        expires_at=expires_at,
        user_id=user_id
    )

    db.add(new_url)
    await db.flush()

    short_code = encode_base62(new_url.id)

    new_url.short_code = short_code

    await db.commit()
    await db.refresh(new_url)

    return new_url

async def get_url_by_short_code(db: AsyncSession, short_code: str) -> URL | None:

    result = await db.execute(
        select(URL).where(URL.short_code == short_code)
    )

    return result.scalar_one_or_none()


async def get_user_urls(db: AsyncSession, user_id: int):
    query = (
        select(URL, func.count(Click.id).label("click_count"))
        .outerjoin(Click, URL.id == Click.url_id)
        .where(URL.user_id == user_id)
        .group_by(URL.id)
        .order_by(URL.created_at.desc())
    )
    result = await db.execute(query)
    urls_with_clicks = []
    for row in result.all():
        url_obj = row.URL
        # Set transient click_count attribute for schema response
        url_obj.click_count = row.click_count
        urls_with_clicks.append(url_obj)
    return urls_with_clicks


async def update_url(
    db: AsyncSession,
    short_code: str,
    user_id: int,
    original_url: str | None = None,
    expires_at: datetime | None = None
) -> URL | None:
    result = await db.execute(
        select(URL).where(URL.short_code == short_code, URL.user_id == user_id)
    )
    url = result.scalar_one_or_none()
    if not url:
        return None

    if original_url is not None:
        url.original_url = original_url
    
    url.expires_at = expires_at

    await db.commit()
    await db.refresh(url)

    # Invalidate cache key in Redis
    await redis_client.delete(short_code)
    
    # Pre-populate click count attribute to avoid pydantic schema warnings
    url.click_count = 0
    return url


async def delete_url(db: AsyncSession, short_code: str, user_id: int) -> bool:
    result = await db.execute(
        select(URL).where(URL.short_code == short_code, URL.user_id == user_id)
    )
    url = result.scalar_one_or_none()
    if not url:
        return False

    await db.delete(url)
    await db.commit()

    # Evict cache key in Redis
    await redis_client.delete(short_code)
    return True

