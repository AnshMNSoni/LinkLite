from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.db.session import get_db
from app.services.url_service import get_url_by_short_code
from app.services.analytics_service import (
    get_total_clicks,
    get_daily_clicks,
    get_clicks_breakdown
)
from app.schemas.analytics import AnalyticsResponse
from app.api.deps import get_optional_user
from app.db.models.user import User


router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/{short_code}", response_model=AnalyticsResponse)
async def get_analytics(
    short_code: str,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):

    url = await get_url_by_short_code(db, short_code)

    if not url:
        raise HTTPException(status_code=404, detail="URL not found")

    # Access control: If the URL is owned by a registered user, only that owner can view its analytics
    if url.user_id is not None:
        if not user or user.id != url.user_id:
            raise HTTPException(
                status_code=403,
                detail="You do not have permission to view analytics for this link"
            )

    total_clicks = await get_total_clicks(db, url.id)
    daily_clicks = await get_daily_clicks(db, url.id)
    breakdown = await get_clicks_breakdown(db, url.id)

    return {
        "total_clicks": total_clicks,
        "daily_clicks": daily_clicks,
        **breakdown
    }
