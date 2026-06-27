from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import models

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_clientes = db.query(models.Cliente).count()
    
    # Leads activos
    total_leads = db.query(models.Lead).filter(
        ~models.Lead.etapa.in_(["cerrado", "perdido"])
    ).count()
    
    total_propiedades = db.query(models.Propiedad).count()
    total_asesores = db.query(models.Asesor).count()
    
    return {
        "total_clientes": total_clientes,
        "total_leads": total_leads,
        "total_propiedades": total_propiedades,
        "total_asesores": total_asesores
    }
