from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
