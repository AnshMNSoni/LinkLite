from fastapi import FastAPI

from app.db.base import Base
from app.db.session import engine
from app.api.routes import url_routes
from app.api.routes import redirect_routes
from app.api.routes import analytics_routes

app = FastAPI()

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


app.include_router(url_routes.router)
app.include_router(redirect_routes.router)
app.include_router(analytics_routes.router)
