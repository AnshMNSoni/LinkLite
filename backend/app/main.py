from fastapi import FastAPI
from app.db.base import Base
from app.db.session import engine
from app.api.routes import url_routes

app = FastAPI()


app.include_router(url_routes.router)
