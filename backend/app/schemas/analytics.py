from pydantic import BaseModel
from datetime import date


class DailyClick(BaseModel):
    date: date
    clicks: int


class AnalyticsResponse(BaseModel):
    total_clicks: int
    daily_clicks: list[DailyClick]
