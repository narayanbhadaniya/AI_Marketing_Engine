from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class BrandCreate(BaseModel):
    name: str
    industry: str = ""
    target_audience: Dict[str, Any] = {}
    tone: List[str] = []
    keywords_include: List[str] = []
    keywords_avoid: List[str] = []

class BrandOut(BrandCreate):
    id: int
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class CampaignCreate(BaseModel):
    brand_id: int
    name: str
    goal: str = ""
    duration: str = ""
    platforms: List[str] = []

class CampaignOut(CampaignCreate):
    id: int
    ai_validation: Optional[str] = None
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class ContentCreate(BaseModel):
    campaign_id: int
    topic: str
    extra_instructions: Optional[str] = None

class RefineInput(BaseModel):
    content_id: int
    instruction: str

class RepurposeInput(BaseModel):
    campaign_id: int
    asset_name: str
    asset_type: str
    content: str

class AdCopyInput(BaseModel):
    campaign_id: Optional[int] = None
    product: str
    audience: str
    platform: str
    goal: str

class SentimentInput(BaseModel):
    campaign_id: Optional[int] = None
    data: List[str]

class CalendarUpdate(BaseModel):
    content_id: int
    scheduled_date: str
    status: Optional[str] = None

class StatusUpdate(BaseModel):
    status: str

class CompetitorInput(BaseModel):
    campaign_id: Optional[int] = None
    competitor_post: str

class ContentOut(BaseModel):
    id: int
    campaign_id: int
    content_type: str
    platform: str
    title: str
    body: str
    status: str
    scheduled_date: Optional[str] = None
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class AdVariantOut(BaseModel):
    id: int
    campaign_id: Optional[int] = None
    platform: str
    headline: str
    description: str
    tone_label: str
    status: str
    created_at: Optional[datetime] = None
    class Config:
        from_attributes = True
