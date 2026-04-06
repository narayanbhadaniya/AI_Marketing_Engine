from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session
from database import get_db
import models, schemas, csv, io
from ai_service import analyze_sentiment

router = APIRouter()

@router.post("/analyze")
def analyze(data: schemas.SentimentInput, db: Session = Depends(get_db)):
    brand = None
    if data.campaign_id:
        campaign = db.query(models.Campaign).filter(models.Campaign.id == data.campaign_id).first()
        if campaign:
            brand = db.query(models.Brand).filter(models.Brand.id == campaign.brand_id).first()
    return analyze_sentiment(data.data, brand)

@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    content = await file.read()
    try: text = content.decode("utf-8")
    except: text = content.decode("latin-1")
    reader = csv.reader(io.StringIO(text))
    reviews = []
    for i, row in enumerate(reader):
        if i == 0 and row and row[0].lower() in ("text","review","comment","feedback"): continue
        if row and row[0].strip(): reviews.append(row[0].strip())
    return {"reviews": reviews[:200], "count": len(reviews)}
