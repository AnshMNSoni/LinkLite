from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.db.models.click import Click
from datetime import datetime, timedelta


async def get_total_clicks(db: AsyncSession, url_id: int):
    result = await db.execute(select(func.count()).select_from(Click).where(Click.url_id == url_id))

    return result.scalar_one()


async def get_daily_clicks(db: AsyncSession, url_id: int):

    query = (
        select(
            func.date(Click.clicked_at).label("date"),
            func.count().label("clicks")
        )
        .where(Click.url_id == url_id)
        .group_by(func.date(Click.clicked_at))
        .order_by(func.date(Click.clicked_at))
    )

    result = await db.execute(query)

    return [
        {"date": row.date, "clicks": row.clicks}
        for row in result.all()
    ]
