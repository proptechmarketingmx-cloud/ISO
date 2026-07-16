from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
from backend.database import get_db
from backend.services.cliente_service import ClienteService
from backend.services.matching_service import matches_para_cliente
from backend.services.kpis_service import get_kpis_clientes as get_kpis_clientes_service
from backend.models.cliente import Cliente
from backend.schemas.cliente import (
    ClienteCreate, ClienteUpdate, ClienteResponse, ExpedienteResponse,
    ClienteNotaCreate, ClienteNotaResponse,
    ClienteActividadCreate, ClienteActividadResponse,
    ClienteDocumentoCreate, ClienteDocumentoResponse
)

router = APIRouter(prefix="/clientes", tags=["Clientes"])


# ── Utilidades internas ─────────────────────────────────────────────────────

def _parse_fecha_nacimiento(raw: str) -> Optional[date]:
    """Intenta convertir el string de fecha_nacimiento a un objeto date.
    Soporta los formatos: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY.
    Devuelve None si el valor es inválido o vacío."""
    if not raw or not raw.strip():
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y"):
        try:
            return date.fromisoformat(raw.strip()) if fmt == "%Y-%m-%d" else \
                   __import__('datetime').datetime.strptime(raw.strip(), fmt).date()
        except ValueError:
            continue
    return None


def _dias_para_cumple(birth: date, hoy: date) -> int:
    """Días que faltan para el próximo cumpleaños (0 = hoy)."""
    this_year = birth.replace(year=hoy.year)
    if this_year < hoy:
        this_year = birth.replace(year=hoy.year + 1)
    return (this_year - hoy).days


# ── Rutas ───────────────────────────────────────────────────────────────────

@router.get("/kpis", tags=["KPIs"])
def get_kpis(db: Session = Depends(get_db)):
    """KPIs automáticos del módulo de clientes."""
    return get_kpis_clientes_service(db)


@router.get("/cumpleanos", tags=["Clientes"])
def get_cumpleanos(db: Session = Depends(get_db)):
    """Devuelve clientes que cumplen años hoy y en los próximos 30 días."""
    hoy = date.today()
    ventana = hoy + timedelta(days=30)

    clientes = db.query(Cliente).filter(
        Cliente.fecha_nacimiento.isnot(None),
        Cliente.fecha_nacimiento != ""
    ).all()

    resultado_hoy = []
    resultado_proximos = []

    for c in clientes:
        birth = _parse_fecha_nacimiento(c.fecha_nacimiento)
        if birth is None:
            continue

        dias = _dias_para_cumple(birth, hoy)

        item = {
            "id_cliente": c.id_cliente,
            "nombre_completo": f"{c.nombre} {c.apellido_paterno or ''} {c.apellido_materno or ''}".strip(),
            "fecha_nacimiento": c.fecha_nacimiento,
            "dias_para_cumple": dias,
            "edad_que_cumple": hoy.year - birth.year if dias == 0 else hoy.year - birth.year + 1,
        }

        if dias == 0:
            resultado_hoy.append(item)
        elif dias <= 30:
            resultado_proximos.append(item)

    resultado_proximos.sort(key=lambda x: x["dias_para_cumple"])

    return {
        "hoy": resultado_hoy,
        "proximos": resultado_proximos,
    }


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
    return matches_para_cliente(db, id_cliente, limit=limit, persist=False)


@router.post("/{id_cliente}/matches")
def calculate_matches_cliente(
    id_cliente: int,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Calcula y persiste los matches del cliente para la propiedad."""
    if not ClienteService.get_cliente_by_id(db, id_cliente):
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return matches_para_cliente(db, id_cliente, limit=limit, persist=True)
