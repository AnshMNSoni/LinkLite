import json
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.url import URL
from app.db.models.click import Click
from app.cache.redis_client import redis_client
from app.db.session import AsyncSessionLocal

CACHE_TTL = 3600


async def get_original_url(
    db: AsyncSession,
    short_code: str
) -> tuple[str | None, int | None]:
    cached_data = await redis_client.get(short_code)

    if cached_data:
        try:
            data = json.loads(cached_data)
            return data["original_url"], data["id"]
        except (json.JSONDecodeError, KeyError, TypeError):
            # If the cached data format is invalid (e.g. legacy plain string format),
            # fall through to query PostgreSQL and update the cache.
            pass

    result = await db.execute(
        select(URL).where(URL.short_code == short_code)
    )

    url = result.scalar_one_or_none()

    if not url:
        return None, None
    
    from datetime import timezone
    if url.expires_at and url.expires_at < datetime.now(timezone.utc):
        return "EXPIRED", None
    
    # Store both the URL and its database ID as a JSON string in Redis
    cache_payload = json.dumps({"id": url.id, "original_url": url.original_url})
    await redis_client.set(short_code, cache_payload, ex=CACHE_TTL)

    return url.original_url, url.id


async def record_click_task(
    url_id: int,
    ip_address: str | None = None,
    user_agent: str | None = None,
    referrer: str | None = None
):
    """
    Buffer click events in Redis List queue to be batched and saved to DB by flusher worker.
    """
    from datetime import timezone
    click_data = {
        "url_id": url_id,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "referrer": referrer,
        "clicked_at": datetime.now(timezone.utc).isoformat()
    }
    await redis_client.rpush("clicks_queue", json.dumps(click_data))

