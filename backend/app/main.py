from fastapi import FastAPI
from app.db.base import Base
from app.db.session import engine
from app.api.routes import url_routes

app = FastAPI()

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


app.include_router(url_routes.router)
