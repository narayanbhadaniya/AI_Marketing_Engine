from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from ai_service import validate_campaign

router = APIRouter()

@router.post("/", response_model=schemas.CampaignOut)
def create_campaign(campaign: schemas.CampaignCreate, db: Session = Depends(get_db)):
    brand = db.query(models.Brand).filter(models.Brand.id == campaign.brand_id).first()
    if not brand: raise HTTPException(404, "Brand not found")
    c = models.Campaign(**campaign.model_dump())
    c.ai_validation = validate_campaign(brand, c)
    db.add(c); db.commit(); db.refresh(c)
    return c

@router.get("/", response_model=list[schemas.CampaignOut])
def list_campaigns(db: Session = Depends(get_db)):
    return db.query(models.Campaign).all()

@router.get("/{campaign_id}", response_model=schemas.CampaignOut)
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    c = db.query(models.Campaign).filter(models.Campaign.id == campaign_id).first()
    if not c: raise HTTPException(404, "Campaign not found")
    return c

@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
    c = db.query(models.Campaign).filter(models.Campaign.id == campaign_id).first()
    if not c: raise HTTPException(404, "Campaign not found")
    db.delete(c); db.commit()
    return {"message": "Deleted"}
