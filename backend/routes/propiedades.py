import logging
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from backend.database import get_db
from backend.models import models
from backend.schemas import schemas
from backend.services.delete_validations import validate_propiedad_delete
from backend.services.matching_service import matches_para_propiedad
from backend.services.cliente_service import _values_equivalent

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/propiedades", tags=["Propiedades"])

def registrar_historial_propiedad(
    db: Session,
    id_propiedad: int,
    accion: str,
    descripcion: Optional[str] = None,
    campo: Optional[str] = None,
    valor_anterior: Optional[str] = None,
    valor_nuevo: Optional[str] = None,
    usuario: Optional[str] = "Sistema"
):
    historial = models.PropiedadHistorial(
        id_propiedad=id_propiedad,
        accion=accion,
        descripcion=descripcion,
        campo=campo,
        valor_anterior=valor_anterior,
        valor_nuevo=valor_nuevo,
        usuario=usuario
    )
    db.add(historial)


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
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error de integridad en base de datos al crear propiedad. Verifique los campos obligatorios. Detalle: {str(e.orig or e)}"
        )
    db.refresh(db_prop)
    
    # Registrar en el historial de la propiedad
    registrar_historial_propiedad(
        db,
        id_propiedad=db_prop.id_propiedad,
        accion="creado",
        descripcion=f"Propiedad creada en estado: {db_prop.status}"
    )
    db.commit()
    db.refresh(db_prop)
    return db_prop


@router.put("/{id_propiedad}", response_model=schemas.PropiedadResponse)
def update_propiedad(id_propiedad: int, propiedad: schemas.PropiedadUpdate, db: Session = Depends(get_db)):
    db_prop = db.query(models.Propiedad).filter(models.Propiedad.id_propiedad == id_propiedad).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    
    update_data = propiedad.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        prev_value = getattr(db_prop, key)
        if prev_value != value:
            if _values_equivalent(prev_value, value):
                continue
                
            setattr(db_prop, key, value)
            
            # Registrar en el historial de la propiedad
            registrar_historial_propiedad(
                db,
                id_propiedad=id_propiedad,
                accion="actualizado",
                descripcion=f"Campo '{key}' modificado",
                campo=key,
                valor_anterior=str(prev_value) if prev_value is not None else None,
                valor_nuevo=str(value) if value is not None else None
            )
        
    calcular_campos_propiedad(db_prop)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error de integridad en base de datos al actualizar propiedad. Verifique los campos obligatorios. Detalle: {str(e.orig or e)}"
        )
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


@router.delete("/{id_propiedad}/multimedia/{id_media}", status_code=status.HTTP_204_NO_CONTENT)
def delete_multimedia(id_propiedad: int, id_media: int, db: Session = Depends(get_db)):
    """Elimina un archivo multimedia de la propiedad de forma permanente."""
    db_prop = db.query(models.Propiedad).filter(models.Propiedad.id_propiedad == id_propiedad).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    db_media = db.query(models.PropiedadMultimedia).filter(
        models.PropiedadMultimedia.id_media == id_media,
        models.PropiedadMultimedia.id_propiedad == id_propiedad
    ).first()
    if not db_media:
        raise HTTPException(status_code=404, detail="Archivo multimedia no encontrado")
    db.delete(db_media)
    db.commit()
    logger.info("Multimedia eliminado: id_media=%s de propiedad id=%s", id_media, id_propiedad)
    return None


# --- Rutas del Expediente ---

@router.get("/{id_propiedad}/expediente", response_model=schemas.PropiedadExpedienteResponse)
def get_expediente(id_propiedad: int, db: Session = Depends(get_db)):
    """Retorna la información consolidada del expediente de la propiedad."""
    db_prop = db.query(models.Propiedad).filter(models.Propiedad.id_propiedad == id_propiedad).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    return db_prop


@router.post("/{id_propiedad}/notas", response_model=schemas.PropiedadNotaResponse, status_code=status.HTTP_201_CREATED)
def add_nota(id_propiedad: int, nota: schemas.PropiedadNotaCreate, db: Session = Depends(get_db)):
    """Agrega una nota al expediente de la propiedad."""
    db_prop = db.query(models.Propiedad).filter(models.Propiedad.id_propiedad == id_propiedad).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    
    db_nota = models.PropiedadNota(id_propiedad=id_propiedad, **nota.model_dump())
    db.add(db_nota)
    
    registrar_historial_propiedad(
        db,
        id_propiedad=id_propiedad,
        accion="nota_agregada",
        descripcion="Se ha agregado una nota al expediente."
    )
    db.commit()
    db.refresh(db_nota)
    return db_nota


@router.post("/{id_propiedad}/actividades", response_model=schemas.PropiedadActividadResponse, status_code=status.HTTP_201_CREATED)
def add_actividad(id_propiedad: int, actividad: schemas.PropiedadActividadCreate, db: Session = Depends(get_db)):
    """Registra una actividad en el expediente de la propiedad."""
    db_prop = db.query(models.Propiedad).filter(models.Propiedad.id_propiedad == id_propiedad).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    
    db_act = models.PropiedadActividad(id_propiedad=id_propiedad, **actividad.model_dump())
    db.add(db_act)
    
    registrar_historial_propiedad(
        db,
        id_propiedad=id_propiedad,
        accion="actividad_registrada",
        descripcion=f"Se registró una actividad: {db_act.tipo}."
    )
    db.commit()
    db.refresh(db_act)
    return db_act


@router.post("/{id_propiedad}/documentos", response_model=schemas.PropiedadDocumentoResponse, status_code=status.HTTP_201_CREATED)
def add_documento(id_propiedad: int, documento: schemas.PropiedadDocumentoCreate, db: Session = Depends(get_db)):
    """Asocia un documento legal/técnico al expediente de la propiedad."""
    db_prop = db.query(models.Propiedad).filter(models.Propiedad.id_propiedad == id_propiedad).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    
    db_doc = models.PropiedadDocumento(id_propiedad=id_propiedad, **documento.model_dump())
    db.add(db_doc)
    
    registrar_historial_propiedad(
        db,
        id_propiedad=id_propiedad,
        accion="documento_agregado",
        descripcion=f"Documento subido: {db_doc.nombre_archivo}."
    )
    db.commit()
    db.refresh(db_doc)
    return db_doc


@router.delete("/{id_propiedad}/documentos/{id_documento}", status_code=status.HTTP_204_NO_CONTENT)
def delete_documento(id_propiedad: int, id_documento: int, db: Session = Depends(get_db)):
    """Elimina un documento del expediente de la propiedad."""
    db_prop = db.query(models.Propiedad).filter(models.Propiedad.id_propiedad == id_propiedad).first()
    if not db_prop:
        raise HTTPException(status_code=404, detail="Propiedad no encontrada")
    
    db_doc = db.query(models.PropiedadDocumento).filter(
        models.PropiedadDocumento.id_documento == id_documento,
        models.PropiedadDocumento.id_propiedad == id_propiedad
    ).first()
    if not db_doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    db.delete(db_doc)
    
    registrar_historial_propiedad(
        db,
        id_propiedad=id_propiedad,
        accion="documento_eliminado",
        descripcion=f"Documento eliminado: {db_doc.nombre_archivo}."
    )
    db.commit()
    return None


