import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models import models
from backend.schemas import schemas
from backend.services.delete_validations import validate_asesor_delete

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/asesores", tags=["Asesores"])

@router.get("", response_model=List[schemas.AsesorResponse])
def read_asesores(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Asesor)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.Asesor.nombre.like(search_filter)) |
            (models.Asesor.apellidos.like(search_filter)) |
            (models.Asesor.correo.like(search_filter)) |
            (models.Asesor.telefono.like(search_filter))
        )
    return query.offset(skip).limit(limit).all()

@router.get("/{id_asesor}", response_model=schemas.AsesorResponse)
def read_asesor(id_asesor: int, db: Session = Depends(get_db)):
    db_asesor = db.query(models.Asesor).filter(models.Asesor.id_asesor == id_asesor).first()
    if not db_asesor:
        raise HTTPException(status_code=404, detail="Asesor no encontrado")
    return db_asesor

@router.post("", response_model=schemas.AsesorResponse, status_code=status.HTTP_201_CREATED)
def create_asesor(asesor: schemas.AsesorCreate, db: Session = Depends(get_db)):
    db_asesor = models.Asesor(**asesor.model_dump())
    db.add(db_asesor)
    db.commit()
    db.refresh(db_asesor)
    return db_asesor

@router.put("/{id_asesor}", response_model=schemas.AsesorResponse)
def update_asesor(id_asesor: int, asesor: schemas.AsesorUpdate, db: Session = Depends(get_db)):
    db_asesor = db.query(models.Asesor).filter(models.Asesor.id_asesor == id_asesor).first()
    if not db_asesor:
        raise HTTPException(status_code=404, detail="Asesor no encontrado")
    
    for key, value in asesor.model_dump(exclude_unset=True).items():
        setattr(db_asesor, key, value)
        
    db.commit()
    db.refresh(db_asesor)
    return db_asesor

@router.delete("/{id_asesor}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asesor(id_asesor: int, db: Session = Depends(get_db)):
    can_delete, reason = validate_asesor_delete(db, id_asesor)
    if not can_delete:
        if reason == "Asesor no encontrado":
            raise HTTPException(status_code=404, detail=reason)
        raise HTTPException(status_code=409, detail=reason)

    db_asesor = db.query(models.Asesor).filter(models.Asesor.id_asesor == id_asesor).first()
    db.delete(db_asesor)
    db.commit()
    logger.info("Asesor eliminado: id=%s", id_asesor)
    return None
