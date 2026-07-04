from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.cliente import Cliente
from backend.models.models import Propiedad, Asesor

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_clientes = db.query(Cliente).count()
    clientes_activos = db.query(Cliente).filter(
        Cliente.estado_cliente.notin_(["cerrado", "perdido", "cancelado", "inactivo"])
    ).count()
    total_propiedades = db.query(Propiedad).count()
    total_asesores = db.query(Asesor).count()

    return {
        "total_clientes": total_clientes,
        "clientes_activos": clientes_activos,
        "total_propiedades": total_propiedades,
        "total_asesores": total_asesores,
    }
