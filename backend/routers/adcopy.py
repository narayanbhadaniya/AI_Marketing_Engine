from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from ai_service import generate_ad_variants

router = APIRouter()

@router.post("/generate")
def generate_ads(data: schemas.AdCopyInput, db: Session = Depends(get_db)):
    brand = None
    if data.campaign_id:
        campaign = db.query(models.Campaign).filter(models.Campaign.id == data.campaign_id).first()
        if campaign:
            brand = db.query(models.Brand).filter(models.Brand.id == campaign.brand_id).first()
    result = generate_ad_variants(data.product, data.audience, data.platform, data.goal, brand)
    if data.campaign_id and "variants" in result:
        for v in result["variants"]:
            db.add(models.AdVariant(campaign_id=data.campaign_id, platform=data.platform, headline=v.get("headline",""), description=v.get("description",""), tone_label=v.get("tone_label","")))
        db.commit()
    return result

@router.put("/{variant_id}/status")
def update_status(variant_id: int, data: schemas.StatusUpdate, db: Session = Depends(get_db)):
    v = db.query(models.AdVariant).filter(models.AdVariant.id == variant_id).first()
    if not v: raise HTTPException(404, "Not found")
    v.status = data.status; db.commit()
    return {"id": v.id, "status": v.status}

@router.get("/campaign/{campaign_id}", response_model=list[schemas.AdVariantOut])
def get_variants(campaign_id: int, db: Session = Depends(get_db)):
    return db.query(models.AdVariant).filter(models.AdVariant.campaign_id == campaign_id).all()

@router.get("/export/{campaign_id}")
def export_variants(campaign_id: int, db: Session = Depends(get_db)):
    variants = db.query(models.AdVariant).filter(models.AdVariant.campaign_id == campaign_id).all()
    rows = ["headline,description,tone_label,platform,status"]
    for v in variants: rows.append(f'"{v.headline}","{v.description}",{v.tone_label},{v.platform},{v.status}')
    return {"csv": "\n".join(rows)}
