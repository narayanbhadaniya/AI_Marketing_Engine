from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, json
from ai_service import generate_all_content, refine_content

router = APIRouter()

@router.post("/generate")
def generate_content(data: schemas.ContentCreate, db: Session = Depends(get_db)):
    campaign = db.query(models.Campaign).filter(models.Campaign.id == data.campaign_id).first()
    if not campaign: raise HTTPException(404, "Campaign not found")
    brand = db.query(models.Brand).filter(models.Brand.id == campaign.brand_id).first()
    result = generate_all_content(brand, campaign, data.topic, data.extra_instructions or "")
    if "error" not in result:
        items = []
        li = result.get("linkedin", {})
        for k, v in li.items(): items.append(("linkedin_"+k, "linkedin", v))
        ig = result.get("instagram", {})
        if ig.get("with_emojis"): items.append(("instagram_emojis", "instagram", ig["with_emojis"]))
        if ig.get("without_emojis"): items.append(("instagram_plain", "instagram", ig["without_emojis"]))
        if ig.get("hashtags"): items.append(("instagram_hashtags", "instagram", " ".join(ig["hashtags"])))
        tw = result.get("twitter", {})
        for k, v in tw.items(): items.append(("twitter_"+k, "twitter", v))
        em = result.get("email", {})
        if em: items.append(("email", "email", f"Subject: {em.get('subject_line','')}\n\n{em.get('body','')}\n\nCTA: {em.get('cta','')}"))
        bl = result.get("blog_outline")
        if bl: items.append(("blog_outline", "blog", json.dumps(bl)))
        seo = result.get("seo")
        if seo: items.append(("seo", "seo", f"Title: {seo.get('meta_title','')}\n\nDescription: {seo.get('meta_description','')}"))
        ads = result.get("google_ads", [])
        for i, ad in enumerate(ads): items.append((f"google_ad_{i+1}", "google_ads", f"Headline: {ad.get('headline','')}\n\nDescription: {ad.get('description','')}"))
        vs = result.get("video_scripts", {})
        for k, v in vs.items(): items.append((f"video_{k}", "video", f"HOOK: {v.get('hook','')}\n\nBODY: {v.get('body','')}\n\nCTA: {v.get('cta','')}"))
        for ctype, platform, body in items:
            db.add(models.Content(campaign_id=data.campaign_id, content_type=ctype, platform=platform, title=data.topic[:120], body=body))
        db.commit()
    return result

@router.post("/refine")
def refine(data: schemas.RefineInput, db: Session = Depends(get_db)):
    item = db.query(models.Content).filter(models.Content.id == data.content_id).first()
    if not item: raise HTTPException(404, "Content not found")
    campaign = db.query(models.Campaign).filter(models.Campaign.id == item.campaign_id).first()
    brand = db.query(models.Brand).filter(models.Brand.id == campaign.brand_id).first() if campaign else None
    refined = refine_content(item.body, data.instruction, brand)
    item.body = refined; db.commit()
    return {"refined": refined, "content_id": data.content_id}

@router.get("/campaign/{campaign_id}", response_model=list[schemas.ContentOut])
def get_campaign_content(campaign_id: int, db: Session = Depends(get_db)):
    return db.query(models.Content).filter(models.Content.campaign_id == campaign_id).all()

@router.put("/{content_id}/status")
def update_status(content_id: int, status: str, db: Session = Depends(get_db)):
    c = db.query(models.Content).filter(models.Content.id == content_id).first()
    if not c: raise HTTPException(404, "Not found")
    c.status = status; db.commit()
    return {"id": c.id, "status": c.status}

@router.delete("/{content_id}")
def delete_content(content_id: int, db: Session = Depends(get_db)):
    c = db.query(models.Content).filter(models.Content.id == content_id).first()
    if not c: raise HTTPException(404, "Not found")
    db.delete(c); db.commit()
    return {"message": "Deleted"}
