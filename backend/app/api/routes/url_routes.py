from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.url import URLCreate, URLResponse
from app.services.url_service import create_short_url
from app.db.session import get_db

router = APIRouter(prefix="/urls", tags=["URLs"])


@router.post("/shorten", response_model=URLResponse)
async def shorten_url(
    payload: URLCreate,
    db: AsyncSession = Depends(get_db)
):
    new_url = await create_short_url(db, payload.original_url)
    return new_url
