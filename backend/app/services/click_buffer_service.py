import json
import logging
import asyncio
from datetime import datetime, timezone
from sqlalchemy import insert

from app.db.session import AsyncSessionLocal
from app.cache.redis_client import redis_client
from app.db.models.click import Click

logger = logging.getLogger("uvicorn.error")


async def flush_clicks_to_db():
    """
    Retrieves buffered click events from Redis and bulk-inserts them into PostgreSQL.
    Trims the Redis queue only if the DB insert succeeds.
    """
    batch_size = 500
    
    # Retrieve a slice of clicks from the queue (left-most / oldest)
    clicks_raw = await redis_client.lrange("clicks_queue", 0, batch_size - 1)
    if not clicks_raw:
        return
        
    clicks_to_insert = []
    for item in clicks_raw:
        try:
            data = json.loads(item)
            clicked_at = datetime.fromisoformat(data["clicked_at"])
            clicks_to_insert.append({
                "url_id": data["url_id"],
                "ip_address": data.get("ip_address"),
                "user_agent": data.get("user_agent"),
                "referrer": data.get("referrer"),
                "clicked_at": clicked_at
            })
        except Exception as e:
            logger.error(f"Error parsing click item from Redis: {e}")
            
    if not clicks_to_insert:
        # If all items failed parsing, trim them to avoid getting stuck in a loop
        await redis_client.ltrim("clicks_queue", len(clicks_raw), -1)
        return
        
    async with AsyncSessionLocal() as db:
        try:
            # Perform bulk insert using SQLAlchemy core insert() for maximum efficiency
            await db.execute(
                insert(Click),
                clicks_to_insert
            )
            await db.commit()
            
            # Trim the processed items from the Redis list
            await redis_client.ltrim("clicks_queue", len(clicks_raw), -1)
            logger.info(f"Successfully flushed {len(clicks_to_insert)} clicks from Redis queue to PostgreSQL.")
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to flush clicks batch to database: {e}")


async def click_flusher_worker():
    """
    Infinite loop running as a FastAPI background task to periodically drain the Redis click queue.
    """
    logger.info("Starting click flusher background worker...")
    while True:
        try:
            await asyncio.sleep(5)
            await flush_clicks_to_db()
        except asyncio.CancelledError:
            logger.info("Click flusher background task cancelled. Performing final database flush...")
            try:
                await flush_clicks_to_db()
            except Exception as e:
                logger.error(f"Error during final click flush: {e}")
            break
        except Exception as e:
            logger.error(f"Unhandled error in click flusher worker loop: {e}")
