from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models.cliente import Cliente
from backend.models.models import Propiedad, Asesor, RelacionCliente, CompatibilidadClientePropiedad
import datetime

router = APIRouter(prefix="/kpis", tags=["KPIs"])


def _clientes_activos_count(db: Session) -> int:
    return db.query(Cliente).filter(
        Cliente.estado_cliente.notin_(["cerrado", "perdido", "cancelado", "inactivo"])
    ).count()


@router.get("/clientes")
def get_kpis_clientes(db: Session = Depends(get_db)):
    total_clientes = db.query(Cliente).count()
    clientes_activos = _clientes_activos_count(db)
    clientes_cerrados = db.query(Cliente).filter(Cliente.estado_cliente == "cerrado").count()
    tasa_conversion = round((clientes_cerrados / total_clientes * 100), 2) if total_clientes else 0.0

    referidos_destino = db.query(RelacionCliente.cliente_destino_id).filter(
        RelacionCliente.tipo_relacion == "REFERENCIA"
    ).distinct().count()
    pct_referidos = round((referidos_destino / total_clientes * 100), 2) if total_clientes else 0.0

    hace_una_semana = datetime.datetime.now() - datetime.timedelta(days=7)
    clientes_semana = db.query(Cliente).filter(Cliente.fecha_registro >= hace_una_semana).count()

    estados_data = db.query(
        Cliente.estado_cliente,
        func.count(Cliente.id_cliente).label("cantidad")
    ).group_by(Cliente.estado_cliente).all()
    clientes_por_etapa = [{"estado": e.estado_cliente, "cantidad": e.cantidad} for e in estados_data]

    fuentes_data = db.query(
        Cliente.fuente_lead,
        func.count(Cliente.id_cliente).label("cantidad")
    ).filter(Cliente.fuente_lead.isnot(None)).group_by(Cliente.fuente_lead).all()
    clientes_por_fuente = [{"fuente": f.fuente_lead, "cantidad": f.cantidad} for f in fuentes_data]

    return {
        "total_clientes": total_clientes,
        "clientes_activos": clientes_activos,
        "tasa_conversion": tasa_conversion,
        "pct_referidos": pct_referidos,
        "clientes_semana": clientes_semana,
        "clientes_por_etapa": clientes_por_etapa,
        "clientes_por_fuente": clientes_por_fuente,
    }


@router.get("/propiedades")
def get_kpis_propiedades(db: Session = Depends(get_db)):
    total_propiedades = db.query(Propiedad).count()
    disponibles = db.query(Propiedad).filter(Propiedad.status == "disponible").count()

    precio_prom_venta = db.query(func.avg(Propiedad.precio)).filter(
        Propiedad.tipo_operacion == "venta"
    ).scalar() or 0.0
    precio_prom_renta = db.query(func.avg(Propiedad.precio)).filter(
        Propiedad.tipo_operacion == "renta"
    ).scalar() or 0.0

    tipos_data = db.query(
        Propiedad.tipo,
        func.count(Propiedad.id_propiedad).label("total"),
        func.avg(Propiedad.precio).label("precio_promedio")
    ).group_by(Propiedad.tipo).all()

    por_tipo = []
    for t in tipos_data:
        disp_tipo = db.query(Propiedad).filter(
            Propiedad.tipo == t.tipo,
            Propiedad.status == "disponible"
        ).count()
        por_tipo.append({
            "tipo": t.tipo,
            "total": t.total,
            "disponibles": disp_tipo,
            "precio_promedio": float(t.precio_promedio or 0.0),
        })

    status_data = db.query(
        Propiedad.status,
        func.count(Propiedad.id_propiedad).label("cantidad")
    ).group_by(Propiedad.status).all()
    por_status = [{"status": s.status, "cantidad": s.cantidad} for s in status_data]

    return {
        "total_propiedades": total_propiedades,
        "disponibles": disponibles,
        "precio_prom_venta": float(precio_prom_venta),
        "precio_prom_renta": float(precio_prom_renta),
        "por_tipo": por_tipo,
        "por_status": por_status,
    }


@router.get("/asesores")
def get_kpis_asesores(db: Session = Depends(get_db)):
    asesores_activos = db.query(Asesor).filter(Asesor.status == "activo").count()
    total_asesores = db.query(Asesor).count() or 1
    total_clientes = db.query(Cliente).count()
    prom_clientes = total_clientes / total_asesores
    prom_clientes_asesor = total_clientes / total_asesores

    asesores = db.query(Asesor).all()
    por_asesor = []
    mejor_conversion = 0.0

    for asesor in asesores:
        clientes_asig = db.query(Cliente.id_cliente).filter(Cliente.id_asesor == asesor.id_asesor).distinct().count()
        total_props_a = db.query(Propiedad).filter(Propiedad.id_asesor == asesor.id_asesor).count()
        conversion_a = 0.0
        if clientes_asig > 0:
            conversion_a = min(100.0, (clientes_asig / max(total_clientes, 1)) * 100)
        if conversion_a > mejor_conversion:
            mejor_conversion = conversion_a

        por_asesor.append({
            "nombre": asesor.nombre,
            "apellidos": asesor.apellidos,
            "total_clientes": clientes_asig,
            "total_leads": clientes_asig,
            "leads_cerrados": clientes_asig,
            "conversion": conversion_a,
            "total_propiedades": total_props_a,
            "status": asesor.status,
        })

    return {
        "asesores_activos": asesores_activos,
        "prom_clientes": round(prom_clientes, 1),
        "mejor_conversion": mejor_conversion,
        "prom_leads": round(prom_clientes_asesor, 1),
        "por_asesor": por_asesor,
    }


@router.get("/matching")
def get_kpis_matching(db: Session = Depends(get_db)):
    """KPIs del motor de compatibilidad CNA."""
    Compat = CompatibilidadClientePropiedad

    total_clientes = db.query(Cliente).count()
    total_propiedades = db.query(Propiedad).count()

    clientes_analizados = db.query(func.count(func.distinct(Compat.id_cliente))).scalar() or 0
    propiedades_analizadas = db.query(func.count(func.distinct(Compat.id_propiedad))).scalar() or 0

    clientes_sin_match = total_clientes - clientes_analizados
    propiedades_sin_match = total_propiedades - propiedades_analizadas

    total_registros = db.query(Compat).count()
    excelentes = db.query(Compat).filter(Compat.score_total >= 95).count()
    altos = db.query(Compat).filter(Compat.score_total >= 80, Compat.score_total < 95).count()
    medios = db.query(Compat).filter(Compat.score_total >= 70, Compat.score_total < 80).count()
    bajos = db.query(Compat).filter(Compat.score_total < 70).count()

    avg_score = db.query(func.avg(Compat.score_total)).scalar()
    compat_promedio = round(float(avg_score), 2) if avg_score else 0.0

    avg_geo = db.query(func.avg(Compat.score_geo)).scalar()
    avg_eco = db.query(func.avg(Compat.score_economico)).scalar()
    avg_fis = db.query(func.avg(Compat.score_fisico)).scalar()
    avg_fam = db.query(func.avg(Compat.score_familiar)).scalar()
    avg_dem = db.query(func.avg(Compat.score_demo)).scalar()

    matches_90_plus = db.query(Compat).filter(Compat.score_total >= 90).count()
    matches_80_90 = db.query(Compat).filter(Compat.score_total >= 80, Compat.score_total < 90).count()
    matches_70_80 = db.query(Compat).filter(Compat.score_total >= 70, Compat.score_total < 80).count()

    clientes_cerrados = db.query(Cliente).filter(Cliente.estado_cliente == "cerrado").count()
    conversion_general = round((clientes_cerrados / total_clientes * 100), 2) if total_clientes else 0.0

    return {
        "total_clientes": total_clientes,
        "total_propiedades": total_propiedades,
        "clientes_analizados": clientes_analizados,
        "propiedades_analizadas": propiedades_analizadas,
        "clientes_sin_match": clientes_sin_match,
        "propiedades_sin_match": propiedades_sin_match,
        "total_registros_compat": total_registros,
        "matches_excelente": excelentes,
        "matches_alta": altos,
        "matches_media": medios,
        "matches_baja": bajos,
        "matches_90_plus": matches_90_plus,
        "matches_80_90": matches_80_90,
        "matches_70_80": matches_70_80,
        "compat_promedio": compat_promedio,
        "promedio_geo": round(float(avg_geo or 0), 2),
        "promedio_economico": round(float(avg_eco or 0), 2),
        "promedio_fisico": round(float(avg_fis or 0), 2),
        "promedio_familiar": round(float(avg_fam or 0), 2),
        "promedio_demo": round(float(avg_dem or 0), 2),
        "conversion_general": conversion_general,
    }
