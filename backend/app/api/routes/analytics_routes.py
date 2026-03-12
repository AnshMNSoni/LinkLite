from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.url_service import get_url_by_short_code
from app.services.analytics_service import (
    get_total_clicks,
    get_daily_clicks
)
from app.schemas.analytics import AnalyticsResponse


router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/{short_code}", response_model=AnalyticsResponse)
async def get_analytics(
    short_code: str,
    db: AsyncSession = Depends(get_db)
):

    url = await get_url_by_short_code(db, short_code)

    if not url:
        raise HTTPException(status_code=404, detail="URL not found")

    total_clicks = await get_total_clicks(db, url.id)

    daily_clicks = await get_daily_clicks(db, url.id)

    return {
        "total_clicks": total_clicks,
        "daily_clicks": daily_clicks
    }
