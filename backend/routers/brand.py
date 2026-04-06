from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter()

@router.post("/", response_model=schemas.BrandOut)
def create_brand(brand: schemas.BrandCreate, db: Session = Depends(get_db)):
    b = models.Brand(**brand.model_dump())
    db.add(b); db.commit(); db.refresh(b)
    return b

@router.get("/", response_model=list[schemas.BrandOut])
def list_brands(db: Session = Depends(get_db)):
    return db.query(models.Brand).all()

@router.get("/{brand_id}", response_model=schemas.BrandOut)
def get_brand(brand_id: int, db: Session = Depends(get_db)):
    b = db.query(models.Brand).filter(models.Brand.id == brand_id).first()
    if not b: raise HTTPException(404, "Brand not found")
    return b

@router.put("/{brand_id}", response_model=schemas.BrandOut)
def update_brand(brand_id: int, brand: schemas.BrandCreate, db: Session = Depends(get_db)):
    b = db.query(models.Brand).filter(models.Brand.id == brand_id).first()
    if not b: raise HTTPException(404, "Brand not found")
    for k, v in brand.model_dump().items(): setattr(b, k, v)
    db.commit(); db.refresh(b)
    return b

@router.delete("/{brand_id}")
def delete_brand(brand_id: int, db: Session = Depends(get_db)):
    b = db.query(models.Brand).filter(models.Brand.id == brand_id).first()
    if not b: raise HTTPException(404, "Brand not found")
    db.delete(b); db.commit()
    return {"message": "Deleted"}
