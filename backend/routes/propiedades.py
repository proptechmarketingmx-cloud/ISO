import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models import models
from backend.schemas import schemas
from backend.services.delete_validations import validate_propiedad_delete

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/propiedades", tags=["Propiedades"])

@router.get("", response_model=List[schemas.PropiedadResponse])
def read_propiedades(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    tipo: Optional[str] = None,
    tipo_operacion: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Propiedad)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.Propiedad.titulo.like(search_filter)) |
            (models.Propiedad.descripcion.like(search_filter)) |
            (models.Propiedad.ciudad.like(search_filter)) |
            (models.Propiedad.colonia.like(search_filter))
        )
    if tipo:
        query = query.filter(models.Propiedad.tipo == tipo)
    if tipo_operacion:
        query = query.filter(models.Propiedad.tipo_operacion == tipo_operacion)
    if status:
        query = query.filter(models.Propiedad.status == status)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{id_propiedad}", response_model=schemas.PropiedadResponse)
def read_propiedad(id_propiedad: int, db: Session = Depends(get_db)):
    db_prop = db.query(models.Propiedad).filter(models.Propiedad.id_propiedad == id_propiedad).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return db_prop

@router.post("", response_model=schemas.PropiedadResponse, status_code=status.HTTP_201_CREATED)
def create_propiedad(propiedad: schemas.PropiedadCreate, db: Session = Depends(get_db)):
    db_prop = models.Propiedad(**propiedad.model_dump())
    db.add(db_prop)
    db.commit()
    db.refresh(db_prop)
    return db_prop

@router.put("/{id_propiedad}", response_model=schemas.PropiedadResponse)
def update_propiedad(id_propiedad: int, propiedad: schemas.PropiedadUpdate, db: Session = Depends(get_db)):
    db_prop = db.query(models.Propiedad).filter(models.Propiedad.id_propiedad == id_propiedad).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    
    for key, value in propiedad.model_dump(exclude_unset=True).items():
        setattr(db_prop, key, value)
        
    db.commit()
    db.refresh(db_prop)
    return db_prop

@router.delete("/{id_propiedad}", status_code=status.HTTP_204_NO_CONTENT)
def delete_propiedad(id_propiedad: int, db: Session = Depends(get_db)):
    can_delete, reason = validate_propiedad_delete(db, id_propiedad)
    if not can_delete:
        if reason == "Propiedad no encontrada":
            raise HTTPException(status_code=404, detail=reason)
        raise HTTPException(status_code=409, detail=reason)

    db_prop = db.query(models.Propiedad).filter(models.Propiedad.id_propiedad == id_propiedad).first()
    db.delete(db_prop)
    db.commit()
    logger.info("Propiedad eliminada: id=%s", id_propiedad)
    return None
