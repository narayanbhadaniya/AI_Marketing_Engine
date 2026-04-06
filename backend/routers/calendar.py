from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from ai_service import suggest_posting_schedule, analyze_competitor

router = APIRouter()

@router.get("/{campaign_id}")
def get_calendar(campaign_id: int, db: Session = Depends(get_db)):
    contents = db.query(models.Content).filter(models.Content.campaign_id == campaign_id).all()
    campaign = db.query(models.Campaign).filter(models.Campaign.id == campaign_id).first()
    suggestion = suggest_posting_schedule(campaign, contents) if campaign else ""
    return {"contents": [{"id":c.id,"title":c.title,"body":c.body,"platform":c.platform,"content_type":c.content_type,"status":c.status,"scheduled_date":c.scheduled_date,"created_at":str(c.created_at)} for c in contents], "schedule_suggestion": suggestion}

@router.put("/schedule")
def schedule_content(data: schemas.CalendarUpdate, db: Session = Depends(get_db)):
    c = db.query(models.Content).filter(models.Content.id == data.content_id).first()
    if not c: raise HTTPException(404, "Not found")
    c.scheduled_date = data.scheduled_date
    if data.status: c.status = data.status
    db.commit()
    return {"id": c.id, "scheduled_date": c.scheduled_date, "status": c.status}

@router.post("/competitor-analysis")
def competitor_analysis(data: schemas.CompetitorInput, db: Session = Depends(get_db)):
    brand, campaign = None, None
    if data.campaign_id:
        campaign = db.query(models.Campaign).filter(models.Campaign.id == data.campaign_id).first()
        if campaign: brand = db.query(models.Brand).filter(models.Brand.id == campaign.brand_id).first()
    return analyze_competitor(data.competitor_post, brand, campaign)
