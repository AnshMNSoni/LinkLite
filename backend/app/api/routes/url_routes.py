from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.url import URLCreate, URLResponse
from app.services.url_service import create_short_url
from app.utils.rate_limiter import check_rate_limit
from app.db.session import get_db

router = APIRouter(prefix="/urls", tags=["URLs"])


@router.post("/shorten", response_model=URLResponse)
async def shorten_url(
    payload: URLCreate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    ip = request.client.host

    await check_rate_limit(ip)
    
    new_url = await create_short_url(
            db,
            str(payload.original_url),
            payload.custom_code
        )
    return new_url
