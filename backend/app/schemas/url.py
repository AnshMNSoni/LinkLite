from pydantic import BaseModel, HttpUrl
from datetime import datetime
from typing import Optional


class URLCreate(BaseModel):
    original_url:HttpUrl
    custom_code: Optional[str] = None
    expires_at: Optional[datetime] = None
    

class URLResponse(BaseModel):
    id: int
    original_url: HttpUrl
    short_code: str
    created_at: datetime
    
    class Config:
        from_attributes = True
