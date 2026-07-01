from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from typing import Dict, Any
from backend.database import get_db
from backend.models import models
from collections import defaultdict
import datetime

router = APIRouter(prefix="/kpis", tags=["KPIs"])

@router.get("/clientes")
def get_kpis_clientes(db: Session = Depends(get_db)):
    # 1. Total Clientes
    total_clientes = db.query(models.Cliente).count()
    
    # 2. Leads Activos (etapa diferente a 'cerrado' y 'perdido')
    leads_activos = db.query(models.Lead).filter(
        ~models.Lead.etapa.in_(["cerrado", "perdido"])
    ).count()
    
    # 3. Conversión General (leads cerrados / leads totales * 100)
    total_leads = db.query(models.Lead).count()
    leads_cerrados = db.query(models.Lead).filter(models.Lead.etapa == "cerrado").count()
    tasa_conversion = (leads_cerrados / total_leads * 100) if total_leads > 0 else 0.0
    
    # 4. Tiempo promedio de cierre (en días)
    # Diferencia entre fecha_actualizacion (cuando se cerró) y fecha_registro de leads cerrados
    leads_cerrados_data = db.query(models.Lead.fecha_registro, models.Lead.fecha_actualizacion).filter(models.Lead.etapa == "cerrado").all()
    tiempos = []
    for reg, act in leads_cerrados_data:
        if reg and act:
            diferencia = (act - reg).days
            tiempos.append(max(diferencia, 0)) # Evitar negativos por errores de reloj
    tiempo_promedio_cierre = sum(tiempos) / len(tiempos) if tiempos else 0.0
    
    # 5. Clientes por Referido (% de clientes que tienen al menos una relación de origen REFERENCIA hacia ellos)
    referidos_destino = db.query(models.RelacionCliente.cliente_destino_id).filter(
        models.RelacionCliente.tipo_relacion == "REFERENCIA"
    ).distinct().count()
    pct_referidos = (referidos_destino / total_clientes * 100) if total_clientes > 0 else 0.0
    
    # 6. Leads esta semana (últimos 7 días)
    hace_una_semana = datetime.datetime.now() - datetime.timedelta(days=7)
    leads_semana = db.query(models.Lead).filter(models.Lead.fecha_registro >= hace_una_semana).count()
    
    # 7. Leads por etapa
    etapas_data = db.query(
        models.Lead.etapa,
        func.count(models.Lead.id_lead).label("cantidad")
    ).group_by(models.Lead.etapa).all()
    leads_por_etapa = [{"etapa": e.etapa, "cantidad": e.cantidad} for e in etapas_data]
    
    # 8. Clientes por fuente (origen de sus leads asociados)
    # Como la fuente está en la tabla leads, contamos leads por origen
    fuentes_data = db.query(
        models.Lead.origen,
        func.count(models.Lead.id_lead).label("cantidad")
    ).filter(models.Lead.origen.isnot(None)).group_by(models.Lead.origen).all()
    clientes_por_fuente = [{"fuente": f.origen, "cantidad": f.cantidad} for f in fuentes_data]
    
    return {
        "total_clientes": total_clientes,
        "leads_activos": leads_activos,
        "tasa_conversion": tasa_conversion,
        "tiempo_promedio_cierre": round(tiempo_promedio_cierre, 1),
        "pct_referidos": pct_referidos,
        "leads_semana": leads_semana,
        "leads_por_etapa": leads_por_etapa,
        "clientes_por_fuente": clientes_por_fuente
    }

@router.get("/propiedades")
def get_kpis_propiedades(db: Session = Depends(get_db)):
    # 1. Total Propiedades
    total_propiedades = db.query(models.Propiedad).count()
    
    # 2. Disponibles
    disponibles = db.query(models.Propiedad).filter(models.Propiedad.status == "disponible").count()
    
    # 3. Precio promedio venta
    precio_prom_venta = db.query(func.avg(models.Propiedad.precio)).filter(
        models.Propiedad.tipo_operacion == "venta"
    ).scalar() or 0.0
    
    # 4. Precio promedio renta
    precio_prom_renta = db.query(func.avg(models.Propiedad.precio)).filter(
        models.Propiedad.tipo_operacion == "renta"
    ).scalar() or 0.0
    
    # 5. Por tipo (total, disponibles, precio promedio)
    tipos_data = db.query(
        models.Propiedad.tipo,
        func.count(models.Propiedad.id_propiedad).label("total"),
        func.avg(models.Propiedad.precio).label("precio_promedio")
    ).group_by(models.Propiedad.tipo).all()
    
    por_tipo = []
    for t in tipos_data:
        disp_tipo = db.query(models.Propiedad).filter(
            models.Propiedad.tipo == t.tipo,
            models.Propiedad.status == "disponible"
        ).count()
        
        por_tipo.append({
            "tipo": t.tipo,
            "total": t.total,
            "disponibles": disp_tipo,
            "precio_promedio": float(t.precio_promedio or 0.0)
        })
        
    # 6. Por status (cantidad)
    status_data = db.query(
        models.Propiedad.status,
        func.count(models.Propiedad.id_propiedad).label("cantidad")
    ).group_by(models.Propiedad.status).all()
    por_status = [{"status": s.status, "cantidad": s.cantidad} for s in status_data]
    
    return {
        "total_propiedades": total_propiedades,
        "disponibles": disponibles,
        "precio_prom_venta": float(precio_prom_venta),
        "precio_prom_renta": float(precio_prom_renta),
        "por_tipo": por_tipo,
        "por_status": por_status
    }

@router.get("/asesores")
def get_kpis_asesores(db: Session = Depends(get_db)):
    # 1. Asesores activos
    asesores_activos = db.query(models.Asesor).filter(models.Asesor.status == "activo").count()
    total_asesores = db.query(models.Asesor).count() or 1
    
    # 2. Promedio clientes por asesor (total clientes / total asesores)
    total_clientes = db.query(models.Cliente).count()
    prom_clientes = total_clientes / total_asesores
    
    # 3. Promedio leads por asesor
    total_leads = db.query(models.Lead).count()
    prom_leads = total_leads / total_asesores
    
    # 4. Rendimiento por asesor (por_asesor)
    asesores = db.query(models.Asesor).all()
    por_asesor = []
    mejor_conversion = 0.0
    
    for a in asesores:
        # Clientes del asesor (a través de leads asignados)
        clientes_asig = db.query(models.Lead.id_cliente).filter(
            models.Lead.id_asesor == a.id_asesor
        ).distinct().count()
        
        # Leads asignados
        leads_asig = db.query(models.Lead).filter(models.Lead.id_asesor == a.id_asesor).all()
        total_leads_a = len(leads_asig)
        cerrados_a = sum(1 for l in leads_asig if l.etapa == "cerrado")
        
        conversion_a = (cerrados_a / total_leads_a * 100) if total_leads_a > 0 else 0.0
        if conversion_a > mejor_conversion:
            mejor_conversion = conversion_a
            
        # Propiedades del asesor
        total_props_a = db.query(models.Propiedad).filter(models.Propiedad.id_asesor == a.id_asesor).count()
        
        por_asesor.append({
            "nombre": a.nombre,
            "apellidos": a.apellidos,
            "total_clientes": clientes_asig,
            "total_leads": total_leads_a,
            "leads_cerrados": cerrados_a,
            "conversion": conversion_a,
            "total_propiedades": total_props_a,
            "status": a.status
        })
        
    return {
        "asesores_activos": asesores_activos,
        "prom_clientes": round(prom_clientes, 1),
        "mejor_conversion": mejor_conversion,
        "prom_leads": round(prom_leads, 1),
        "por_asesor": por_asesor
    }


@router.get("/matching")
def get_kpis_matching(db: Session = Depends(get_db)):
    """KPIs del motor de compatibilidad CNA (Customer Needs Analysis)."""

    Compat = models.CompatibilidadClientePropiedad

    # 1. Totales generales
    total_clientes = db.query(models.Cliente).count()
    total_propiedades = db.query(models.Propiedad).count()

    # 2. Clientes y propiedades que ya tienen al menos un cálculo
    clientes_analizados = db.query(func.count(distinct(Compat.id_cliente))).scalar() or 0
    propiedades_analizadas = db.query(func.count(distinct(Compat.id_propiedad))).scalar() or 0

    # 3. Clientes / propiedades sin ningún match en la tabla
    clientes_sin_match = total_clientes - clientes_analizados
    propiedades_sin_match = total_propiedades - propiedades_analizadas

    # 4. Distribución por nivel de score
    total_registros = db.query(Compat).count()
    excelentes = db.query(Compat).filter(Compat.score_total >= 95).count()
    altos      = db.query(Compat).filter(Compat.score_total >= 80, Compat.score_total < 95).count()
    medios     = db.query(Compat).filter(Compat.score_total >= 70, Compat.score_total < 80).count()
    bajos      = db.query(Compat).filter(Compat.score_total < 70).count()

    # 5. Compatibilidad promedio global
    avg_score = db.query(func.avg(Compat.score_total)).scalar()
    compat_promedio = round(float(avg_score), 2) if avg_score else 0.0

    # 6. Mejor match por dimensión (promedios de factores)
    avg_geo = db.query(func.avg(Compat.score_geo)).scalar()
    avg_eco = db.query(func.avg(Compat.score_economico)).scalar()
    avg_fis = db.query(func.avg(Compat.score_fisico)).scalar()
    avg_fam = db.query(func.avg(Compat.score_familiar)).scalar()
    avg_dem = db.query(func.avg(Compat.score_demo)).scalar()

    # 7. Matches por rango de score (para el dashboard)
    matches_90_plus = db.query(Compat).filter(Compat.score_total >= 90).count()
    matches_80_90   = db.query(Compat).filter(Compat.score_total >= 80, Compat.score_total < 90).count()
    matches_70_80   = db.query(Compat).filter(Compat.score_total >= 70, Compat.score_total < 80).count()

    # 8. KPIs de conversión (desde módulo leads)
    total_leads = db.query(models.Lead).count()
    leads_cerrados = db.query(models.Lead).filter(models.Lead.etapa == "cerrado").count()
    conversion_general = round((leads_cerrados / total_leads * 100), 2) if total_leads > 0 else 0.0

    # Tiempo promedio de cierre
    leads_cerrados_data = db.query(
        models.Lead.fecha_registro, models.Lead.fecha_actualizacion
    ).filter(models.Lead.etapa == "cerrado").all()
    tiempos = []
    for reg, act in leads_cerrados_data:
        if reg and act:
            diff = (act - reg).days
            tiempos.append(max(diff, 0))
    tiempo_promedio_cierre = round(sum(tiempos) / len(tiempos), 1) if tiempos else 0.0

    return {
        # Totales
        "total_clientes": total_clientes,
        "total_propiedades": total_propiedades,
        "clientes_analizados": clientes_analizados,
        "propiedades_analizadas": propiedades_analizadas,
        "clientes_sin_match": clientes_sin_match,
        "propiedades_sin_match": propiedades_sin_match,
        "total_registros_compat": total_registros,
        # Distribución por nivel
        "matches_excelente": excelentes,
        "matches_alta": altos,
        "matches_media": medios,
        "matches_baja": bajos,
        # Rangos para el dashboard
        "matches_90_plus": matches_90_plus,
        "matches_80_90": matches_80_90,
        "matches_70_80": matches_70_80,
        # Promedios
        "compat_promedio": compat_promedio,
        "promedio_geo": round(float(avg_geo or 0), 2),
        "promedio_economico": round(float(avg_eco or 0), 2),
        "promedio_fisico": round(float(avg_fis or 0), 2),
        "promedio_familiar": round(float(avg_fam or 0), 2),
        "promedio_demo": round(float(avg_dem or 0), 2),
        # Conversión
        "conversion_general": conversion_general,
        "tiempo_promedio_cierre": tiempo_promedio_cierre,
    }
