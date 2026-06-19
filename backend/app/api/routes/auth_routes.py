from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.db.models.user import User
from app.utils.auth import verify_google_token, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


class GoogleLoginRequest(BaseModel):
    id_token: str


@router.post("/google")
async def google_auth(
    payload: GoogleLoginRequest,
    db: AsyncSession = Depends(get_db)
):
    token_info = await verify_google_token(payload.id_token)
    
    email = token_info.get("email")
    name = token_info.get("name")
    picture = token_info.get("picture")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google credential token missing email claim"
        )
        
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(email=email, name=name, picture=picture)
        db.add(user)
    else:
        user.name = name
        user.picture = picture
        
    await db.commit()
    await db.refresh(user)
    
    # Sign session access token using subject (sub) as email
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "picture": user.picture
        }
    }
