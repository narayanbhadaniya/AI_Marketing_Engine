from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import brand, campaign, content, repurpose, adcopy, sentiment, calendar
import os
from dotenv import load_dotenv

load_dotenv()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Marketing Engine", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(brand.router, prefix="/api/brand", tags=["Brand"])
app.include_router(campaign.router, prefix="/api/campaign", tags=["Campaign"])
app.include_router(content.router, prefix="/api/content", tags=["Content"])
app.include_router(repurpose.router, prefix="/api/repurpose", tags=["Repurpose"])
app.include_router(adcopy.router, prefix="/api/adcopy", tags=["AdCopy"])
app.include_router(sentiment.router, prefix="/api/sentiment", tags=["Sentiment"])
app.include_router(calendar.router, prefix="/api/calendar", tags=["Calendar"])

@app.get("/")
def root(): return {"status": "AI Marketing Engine running"}

@app.get("/health")
def health(): return {"status": "ok"}
