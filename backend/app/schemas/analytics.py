from pydantic import BaseModel
from datetime import date


class DailyClick(BaseModel):
    date: date
    clicks: int


class BrowserStats(BaseModel):
    name: str
    clicks: int


class OSStats(BaseModel):
    name: str
    clicks: int


class ReferrerStats(BaseModel):
    name: str
    clicks: int


class AnalyticsResponse(BaseModel):
    total_clicks: int
    daily_clicks: list[DailyClick]
    browsers: list[BrowserStats]
    os: list[OSStats]
    referrers: list[ReferrerStats]
