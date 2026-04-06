from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Brand(Base):
    __tablename__ = "brands"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    industry = Column(String, default="")
    target_audience = Column(JSON, default={})
    tone = Column(JSON, default=[])
    keywords_include = Column(JSON, default=[])
    keywords_avoid = Column(JSON, default=[])
    created_at = Column(DateTime, default=datetime.utcnow)
    campaigns = relationship("Campaign", back_populates="brand", cascade="all, delete")

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(Integer, primary_key=True, index=True)
    brand_id = Column(Integer, ForeignKey("brands.id"))
    name = Column(String, nullable=False)
    goal = Column(String, default="")
    duration = Column(String, default="")
    platforms = Column(JSON, default=[])
    ai_validation = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    brand = relationship("Brand", back_populates="campaigns")
    contents = relationship("Content", back_populates="campaign", cascade="all, delete")
    ad_variants = relationship("AdVariant", back_populates="campaign", cascade="all, delete")

class Content(Base):
    __tablename__ = "contents"
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"))
    content_type = Column(String, default="")
    platform = Column(String, default="")
    title = Column(String, default="")
    body = Column(Text, default="")
    status = Column(String, default="Draft")
    scheduled_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    campaign = relationship("Campaign", back_populates="contents")

class AdVariant(Base):
    __tablename__ = "ad_variants"
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=True)
    platform = Column(String, default="")
    headline = Column(String, default="")
    description = Column(Text, default="")
    tone_label = Column(String, default="")
    status = Column(String, default="Testing")
    created_at = Column(DateTime, default=datetime.utcnow)
    campaign = relationship("Campaign", back_populates="ad_variants")
