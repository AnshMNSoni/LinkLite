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


from collections import Counter
from urllib.parse import urlparse

def parse_browser(ua: str) -> str:
    if not ua:
        return "Unknown"
    ua = ua.lower()
    if "chrome" in ua or "chromium" in ua:
        if "edg" in ua:
            return "Edge"
        if "opr" in ua or "opera" in ua:
            return "Opera"
        return "Chrome"
    elif "safari" in ua:
        return "Safari"
    elif "firefox" in ua:
        return "Firefox"
    elif "msie" in ua or "trident" in ua:
        return "IE"
    elif "curl" in ua:
        return "Curl (CLI)"
    elif "postman" in ua:
        return "Postman Client"
    elif "python" in ua or "requests" in ua:
        return "Python Script"
    return "Other"


def parse_os(ua: str) -> str:
    if not ua:
        return "Unknown"
    ua = ua.lower()
    if "windows" in ua:
        return "Windows"
    elif "macintosh" in ua or "mac os x" in ua:
        if "ipad" in ua or "iphone" in ua or "ipod" in ua:
            return "iOS"
        return "macOS"
    elif "android" in ua:
        return "Android"
    elif "iphone" in ua or "ipad" in ua or "ipod" in ua:
        return "iOS"
    elif "linux" in ua:
        if "curl" in ua:
            return "CLI Client"
        return "Linux"
    elif "curl" in ua or "postman" in ua or "python" in ua or "requests" in ua:
        return "CLI / API Client"
    return "Other"


def parse_referrer(ref: str) -> str:
    if not ref:
        return "Direct / Email"
    
    ref = ref.lower()
    
    # Keyword-based normalization for app packages and domain strings
    if "linkedin" in ref:
        return "LinkedIn"
    if "twitter" in ref or "t.co" in ref or "x.com" in ref:
        return "Twitter / X"
    if "facebook" in ref or "fb.me" in ref:
        return "Facebook"
    if "instagram" in ref:
        return "Instagram"
    if "peerlist" in ref:
        return "Peerlist"
    if "github" in ref:
        return "GitHub"
    if "youtube" in ref:
        return "YouTube"
    if "reddit" in ref:
        return "Reddit"
    if "whatsapp" in ref:
        return "WhatsApp"
    if "google" in ref:
        return "Google"
        
    try:
        parsed = urlparse(ref)
        domain = parsed.netloc or parsed.path
        clean_domain = domain.replace("www.", "")
        return clean_domain if clean_domain else "Direct / Email"
    except Exception:
        return "Other"


async def get_clicks_breakdown(db: AsyncSession, url_id: int):
    query = select(Click.user_agent, Click.referrer).where(Click.url_id == url_id)
    result = await db.execute(query)
    rows = result.all()
    
    browsers = Counter()
    os_systems = Counter()
    referrers = Counter()
    
    for row in rows:
        ua = row.user_agent
        ref = row.referrer
        
        browsers[parse_browser(ua)] += 1
        os_systems[parse_os(ua)] += 1
        referrers[parse_referrer(ref)] += 1
        
    return {
        "browsers": [{"name": k, "clicks": v} for k, v in browsers.items()],
        "os": [{"name": k, "clicks": v} for k, v in os_systems.items()],
        "referrers": [{"name": k, "clicks": v} for k, v in referrers.items()]
    }
