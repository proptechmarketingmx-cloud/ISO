import logging
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models import models
from backend.schemas import schemas
from backend.services.delete_validations import validate_propiedad_delete
from backend.services.matching_service import matches_para_propiedad
from backend.services.kpis_service import get_kpis_propiedades

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/propiedades", tags=["Propiedades"])

@router.get("/kpis", tags=["KPIs"])
def get_kpis(db: Session = Depends(get_db)):
    """KPIs automáticos del módulo de propiedades."""
    return get_kpis_propiedades(db)

@router.get("", response_model=List[schemas.PropiedadResponse])
def read_propiedades(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    tipo: Optional[str] = None,
    tipo_operacion: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
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
    if status_filter:
        query = query.filter(models.Propiedad.status == status_filter)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{id_propiedad}", response_model=schemas.PropiedadResponse)
def read_propiedad(id_propiedad: int, db: Session = Depends(get_db)):
    db_prop = db.query(models.Propiedad).filter(models.Propiedad.id_propiedad == id_propiedad).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return db_prop

def calcular_campos_propiedad(prop: models.Propiedad):
    # 1. Ingreso recomendado
    precio = float(prop.precio) if prop.precio else 0.0
    if prop.tipo_operacion == "renta":
        prop.ingreso_recomendado = precio / 0.3
    else:
        # Para venta, factor estándar de capacidad de pago
        prop.ingreso_recomendado = precio / 120.0

    # 2. Score de atractivo (0-100)
    puntos = 0
    if prop.m2_construccion: puntos += 10
    if prop.recamaras and prop.recamaras > 0: puntos += 10
    if prop.banos and prop.banos > 0: puntos += 10
    if prop.estacionamientos and prop.estacionamientos > 0: puntos += 10
    if prop.exclusiva: puntos += 15
    if prop.documentacion_completa: puntos += 15
    if prop.precio_negociable: puntos += 10
    if prop.libre_gravamen: puntos += 10
    if prop.descripcion: puntos += 5
    if prop.titulo: puntos += 5
    prop.score_atractivo = min(puntos, 100)

@router.post("", response_model=schemas.PropiedadResponse, status_code=status.HTTP_201_CREATED)
def create_propiedad(propiedad: schemas.PropiedadCreate, db: Session = Depends(get_db)):
    db_prop = models.Propiedad(**propiedad.model_dump())
    calcular_campos_propiedad(db_prop)
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
        
    calcular_campos_propiedad(db_prop)
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

# --- Motor de Compatibilidad ---

@router.get("/{id_propiedad}/matches")
def get_matches_propiedad(
    id_propiedad: int,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retorna los clientes más compatibles con la propiedad, ordenados por score."""
    db_prop = db.query(models.Propiedad).filter(models.Propiedad.id_propiedad == id_propiedad).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return matches_para_propiedad(db, id_propiedad, limit=limit, persist=False)


@router.post("/{id_propiedad}/matches")
def calculate_matches_propiedad(
    id_propiedad: int,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Calcula y persiste los matches para la propiedad."""
    db_prop = db.query(models.Propiedad).filter(models.Propiedad.id_propiedad == id_propiedad).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return matches_para_propiedad(db, id_propiedad, limit=limit, persist=True)

# --- Multimedia ---

@router.get("/{id_propiedad}/multimedia", response_model=List[schemas.PropiedadMultimediaResponse])
def get_multimedia(id_propiedad: int, db: Session = Depends(get_db)):
    """Retorna la lista de archivos multimedia asociados a la propiedad."""
    db_prop = db.query(models.Propiedad).filter(models.Propiedad.id_propiedad == id_propiedad).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return db.query(models.PropiedadMultimedia).filter(models.PropiedadMultimedia.id_propiedad == id_propiedad).all()

@router.post("/{id_propiedad}/multimedia", response_model=schemas.PropiedadMultimediaResponse, status_code=status.HTTP_201_CREATED)
def add_multimedia(id_propiedad: int, media: schemas.PropiedadMultimediaCreate, db: Session = Depends(get_db)):
    """Asocia un nuevo archivo multimedia a la propiedad."""
    db_prop = db.query(models.Propiedad).filter(models.Propiedad.id_propiedad == id_propiedad).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    db_media = models.PropiedadMultimedia(id_propiedad=id_propiedad, **media.model_dump())
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    return db_media

