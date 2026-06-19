from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.schemas.url import URLCreate, URLResponse
from app.services.url_service import (
    create_short_url,
    get_user_urls,
    update_url,
    delete_url
)
from app.utils.rate_limiter import check_rate_limit
from app.db.session import get_db
from app.api.deps import get_current_user, get_optional_user
from app.db.models.user import User

router = APIRouter(prefix="/urls", tags=["URLs"])


@router.post("/shorten", response_model=URLResponse)
async def shorten_url(
    payload: URLCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user)
):
    ip = request.client.host

    await check_rate_limit(ip)
    
    new_url = await create_short_url(
            db,
            str(payload.original_url),
            payload.custom_code,
            payload.expires_at,
            user.id if user else None
        )
    return new_url


@router.get("/my", response_model=list[URLResponse])
async def list_my_urls(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    urls = await get_user_urls(db, user.id)
    return urls


@router.put("/{short_code}", response_model=URLResponse)
async def update_my_url(
    short_code: str,
    payload: URLCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    updated = await update_url(
        db,
        short_code,
        user.id,
        str(payload.original_url),
        payload.expires_at
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="URL not found or unauthorized to edit"
        )
    return updated


@router.delete("/{short_code}")
async def delete_my_url(
    short_code: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user)
):
    deleted = await delete_url(db, short_code, user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="URL not found or unauthorized to delete"
        )
    return {"detail": "URL deleted successfully"}
