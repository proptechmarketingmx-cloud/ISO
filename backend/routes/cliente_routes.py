from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.services.cliente_service import ClienteService
from backend.services.matching_service import matches_para_cliente
from backend.services.kpis_service import get_kpis_clientes
from backend.schemas.cliente import (
    ClienteCreate, ClienteUpdate, ClienteResponse, ExpedienteResponse,
    ClienteNotaCreate, ClienteNotaResponse,
    ClienteActividadCreate, ClienteActividadResponse,
    ClienteDocumentoCreate, ClienteDocumentoResponse
)

router = APIRouter(prefix="/clientes", tags=["Clientes"])

@router.get("/kpis", tags=["KPIs"])
def get_kpis(db: Session = Depends(get_db)):
    """KPIs automáticos del módulo de clientes."""
    return get_kpis_clientes(db)

@router.get("", response_model=List[ClienteResponse])
def get_clientes(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    estado: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return ClienteService.get_clientes(db, skip=skip, limit=limit, search=search, estado=estado)

@router.post("", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
def create_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    return ClienteService.create_cliente(db, cliente)

@router.get("/{id_cliente}/expediente", response_model=ExpedienteResponse)
def get_expediente(id_cliente: int, db: Session = Depends(get_db)):
    cliente = ClienteService.get_cliente_by_id(db, id_cliente)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente

@router.get("/{id_cliente}", response_model=ClienteResponse)
def get_cliente(id_cliente: int, db: Session = Depends(get_db)):
    cliente = ClienteService.get_cliente_by_id(db, id_cliente)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente

@router.put("/{id_cliente}", response_model=ClienteResponse)
def update_cliente(id_cliente: int, cliente: ClienteUpdate, db: Session = Depends(get_db)):
    db_cliente = ClienteService.update_cliente(db, id_cliente, cliente)
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return db_cliente

@router.delete("/{id_cliente}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cliente(id_cliente: int, db: Session = Depends(get_db)):
    success, reason = ClienteService.delete_cliente(db, id_cliente)
    if not success:
        if reason == "Cliente no encontrado":
            raise HTTPException(status_code=404, detail=reason)
        raise HTTPException(status_code=409, detail=reason)
    return None

# --- Rutas del Expediente ---

@router.post("/{id_cliente}/notas", response_model=ClienteNotaResponse, status_code=status.HTTP_201_CREATED)
def add_nota(id_cliente: int, nota: ClienteNotaCreate, db: Session = Depends(get_db)):
    if not ClienteService.get_cliente_by_id(db, id_cliente):
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return ClienteService.add_nota(db, id_cliente, nota)

@router.post("/{id_cliente}/actividades", response_model=ClienteActividadResponse, status_code=status.HTTP_201_CREATED)
def add_actividad(id_cliente: int, actividad: ClienteActividadCreate, db: Session = Depends(get_db)):
    if not ClienteService.get_cliente_by_id(db, id_cliente):
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return ClienteService.add_actividad(db, id_cliente, actividad)

@router.post("/{id_cliente}/documentos", response_model=ClienteDocumentoResponse, status_code=status.HTTP_201_CREATED)
def add_documento(id_cliente: int, documento: ClienteDocumentoCreate, db: Session = Depends(get_db)):
    if not ClienteService.get_cliente_by_id(db, id_cliente):
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return ClienteService.add_documento(db, id_cliente, documento)

# --- Motor de Compatibilidad ---

@router.get("/{id_cliente}/matches")
def get_matches_cliente(
    id_cliente: int,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Retorna las propiedades más compatibles con el cliente, ordenadas por score."""
    if not ClienteService.get_cliente_by_id(db, id_cliente):
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return matches_para_cliente(db, id_cliente, limit=limit)
