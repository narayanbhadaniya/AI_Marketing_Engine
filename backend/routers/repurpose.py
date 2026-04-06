from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from ai_service import repurpose_content

router = APIRouter()

@router.post("/")
def repurpose(data: schemas.RepurposeInput, db: Session = Depends(get_db)):
    campaign = db.query(models.Campaign).filter(models.Campaign.id == data.campaign_id).first()
    if not campaign: raise HTTPException(404, "Campaign not found")
    brand = db.query(models.Brand).filter(models.Brand.id == campaign.brand_id).first()
    return repurpose_content(brand, campaign, data.asset_name, data.asset_type, data.content)
