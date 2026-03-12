from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.redirect_service import get_original_url
from app.db.session import get_db

router = APIRouter()

@router.get("/{short_code}")
async def redirect_to_url(
    short_code: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):

    ip_address = request.client.host
    user_agent = request.headers.get("user-agent")

    original_url = await get_original_url(
        db,
        short_code,
        ip_address,
        user_agent
    )
    
    if original_url == "EXPIRED":
        raise HTTPException(status_code=410, detail="URL expired")
    
    if not original_url:
        raise HTTPException(status_code=404, detail="URL NOT FOUND")

    return RedirectResponse(original_url, status_code=302)