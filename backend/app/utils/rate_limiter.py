from fastapi import HTTPException
from app.cache.redis_client import redis_client

RATE_LIMIT = 10
WINDOW = 60


async def check_rate_limit(ip: str):

    key = f"rate_limit:{ip}"

    requests = await redis_client.incr(key)

    if requests == 1:
        await redis_client.expire(key, WINDOW)

    if requests > RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        )
