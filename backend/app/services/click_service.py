from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.click import Click


async def log_click(
    db: AsyncSession,
    url_id: int,
    ip_address: str | None,
    user_agent: str | None
):
    click = Click(
        url_id=url_id,
        ip_address=ip_address,
        user_agent=user_agent
    )

    db.add(click)
    await db.commit()
