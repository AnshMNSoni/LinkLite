import os
from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").strip("/")

from app.services.redirect_service import get_original_url, record_click_task
from app.db.session import get_db

router = APIRouter()

@router.get("/{short_code}")
async def redirect_to_url(
    short_code: str,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):

    ip_address = request.client.host
    user_agent = request.headers.get("user-agent")

    original_url, url_id = await get_original_url(
        db,
        short_code
    )
    
    if original_url == "EXPIRED":
        return RedirectResponse(f"{frontend_url}/?error=expired", status_code=302)
    
    if not original_url:
        return RedirectResponse(f"{frontend_url}/?error=not-found", status_code=302)

    referrer = request.headers.get("referer") or request.headers.get("referrer")
    # Log the click event asynchronously in the background to prevent blocking the redirect
    if url_id:
        background_tasks.add_task(
            record_click_task,
            url_id,
            ip_address,
            user_agent,
            referrer
        )

    return RedirectResponse(original_url, status_code=302)