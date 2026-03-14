from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.db.base import Base
from app.db.session import engine
from app.api.routes import url_routes
from app.api.routes import redirect_routes
from app.api.routes import analytics_routes

app = FastAPI()

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").strip("/")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


app.include_router(url_routes.router)
app.include_router(redirect_routes.router)
app.include_router(analytics_routes.router)
