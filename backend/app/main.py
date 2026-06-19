from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import asyncio

from app.db.base import Base
from app.db.session import engine
# Explicitly import models so Base.metadata is aware of them on startup
from app.db.models.user import User
from app.db.models.url import URL
from app.db.models.click import Click

from app.api.routes import url_routes
from app.api.routes import redirect_routes
from app.api.routes import analytics_routes
from app.api.routes import auth_routes
from app.services.click_buffer_service import click_flusher_worker

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
    
    # Start the click flusher background worker
    app.state.click_flusher = asyncio.create_task(click_flusher_worker())


@app.on_event("shutdown")
async def shutdown():
    # Cleanly stop and flush click worker on shutdown
    if hasattr(app.state, "click_flusher"):
        app.state.click_flusher.cancel()
        try:
            await app.state.click_flusher
        except asyncio.CancelledError:
            pass


app.include_router(auth_routes.router)
app.include_router(url_routes.router)
app.include_router(redirect_routes.router)
app.include_router(analytics_routes.router)
