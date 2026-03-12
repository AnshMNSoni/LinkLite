from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.url import URL
from app.utils.base62 import encode_base62


async def create_short_url(
    db: AsyncSession,
    original_url: str,
    custom_code: str | None = None
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
            short_code=custom_code
        )

        db.add(new_url)
        await db.commit()
        await db.refresh(new_url)

        return new_url

    new_url = URL(original_url=original_url)

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
