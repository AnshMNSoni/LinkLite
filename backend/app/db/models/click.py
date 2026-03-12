from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Click(Base):
    __tablename__ = "clicks"
    
    id = Column(Integer, primary_key=True, index=True)
    
    url_id = Column(Integer, ForeignKey("urls.id"), index=True, nullable=False)
    
    clicked_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    ip_address = Column(String, nullable=True)
    
    user_agent = Column(String, nullable=True)
    
    url = relationship("URL", back_populates="clicks")

Index("idx_clicks_url_id", Click.url_id)
