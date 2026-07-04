"""
kpis_service.py — KPIs Automáticos de Clientes y Propiedades
ISO Plataforma Inmobiliaria
"""

from datetime import datetime, timedelta, timezone
from collections import defaultdict
from typing import Any
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from backend.models.cliente import Cliente
from backend.models.models  import Propiedad


# ── Helpers ───────────────────────────────────────────────────────────────────

def _safe_avg(values: list) -> float | None:
    nums = [v for v in values if v is not None]
    return round(sum(nums) / len(nums), 2) if nums else None


def _distribution(items: list) -> dict:
    """Retorna distribución de frecuencias (conteo) de una lista de valores."""
    counts: dict[str, int] = defaultdict(int)
    for v in items:
        counts[str(v) if v is not None else "Sin dato"] += 1
    return dict(sorted(counts.items(), key=lambda x: x[1], reverse=True))


# ── KPIs de Clientes ─────────────────────────────────────────────────────────

def get_kpis_clientes(db: Session) -> dict[str, Any]:
    clientes = db.query(Cliente).all()
    total = len(clientes)

    if total == 0:
        return {
            "total_clientes": 0,
            "clientes_activos": 0,
            "leads_activos": 0,
            "tasa_conversion": 0.0,
            "pct_referidos": 0.0,
            "clientes_semana": 0,
            "leads_semana": 0,
            "clientes_por_etapa": [],
            "leads_por_etapa": [],
            "clientes_por_fuente": [],
            "tiempo_promedio_cierre": None,
            "mensaje": "Sin registros",
        }

    ahora = datetime.now(timezone.utc)

    # Resumen ejecutivo
    clientes_activos = sum(1 for c in clientes if c.estado_cliente not in {"cerrado", "perdido", "cancelado", "inactivo"})
    clientes_cerrados = sum(1 for c in clientes if c.estado_cliente == "cerrado")
    tasa_conversion = round((clientes_cerrados / total * 100), 2) if total else 0.0

    referidos_destino = db.query(Cliente).filter(Cliente.referenciado.isnot(None)).count()
    pct_referidos = round((referidos_destino / total * 100), 2) if total else 0.0

    hace_una_semana = datetime.now() - timedelta(days=7)
    clientes_semana = db.query(Cliente).filter(Cliente.fecha_registro >= hace_una_semana).count()

    dias_cierre = []
    for c in clientes:
        if c.estado_cliente == "cerrado" and c.fecha_registro:
            fr = c.fecha_registro
            if fr.tzinfo is None:
                fr = fr.replace(tzinfo=timezone.utc)
            dias_cierre.append((ahora - fr).days)

    # Presupuesto
    presup_max = [float(c.presupuesto_max) for c in clientes if c.presupuesto_max]
    presup_min = [float(c.presupuesto_min) for c in clientes if c.presupuesto_min]

    # Ingreso mensual
    ingresos = [float(c.ingreso_mensual) for c in clientes if c.ingreso_mensual]

    # Edad
    edades = [c.edad for c in clientes if c.edad]

    # Tiempo hasta primer contacto (días desde registro)
    dias_reg = []
    for c in clientes:
        if c.fecha_registro:
            fr = c.fecha_registro
            if fr.tzinfo is None:
                fr = fr.replace(tzinfo=timezone.utc)
            dias_reg.append((ahora - fr).days)

    # Distribuciones
    dist_generacion = _distribution([c.generacion for c in clientes])
    dist_ciudad = _distribution([c.ciudad_busqueda or c.estado_busqueda for c in clientes])
    dist_tipo_credito = _distribution([c.tipo_credito for c in clientes])
    dist_estado_cli = _distribution([c.estado_cliente for c in clientes])
    dist_operacion = _distribution([c.operacion for c in clientes])
    dist_motivacion = _distribution([c.motivacion for c in clientes])
    dist_fuente = _distribution([c.fuente_lead for c in clientes])
    dist_asesor = _distribution([c.id_asesor for c in clientes])
    dist_temporalidad = _distribution([c.temporalidad for c in clientes])

    # Conversión por asesor
    por_asesor: dict[int, dict] = defaultdict(lambda: {"total": 0, "cerrados": 0})
    for c in clientes:
        if c.id_asesor:
            por_asesor[c.id_asesor]["total"] += 1
            if c.estado_cliente == "cerrado":
                por_asesor[c.id_asesor]["cerrados"] += 1
    conversion_asesor = {
        str(aid): {
            "total": d["total"],
            "cerrados": d["cerrados"],
            "tasa": round(d["cerrados"] / d["total"] * 100, 1) if d["total"] else 0,
        }
        for aid, d in por_asesor.items()
    }

    # Conversión por campaña
    por_campana: dict[str, dict] = defaultdict(lambda: {"total": 0, "cerrados": 0})
    for c in clientes:
        key = c.campana or "Sin campaña"
        por_campana[key]["total"] += 1
        if c.estado_cliente == "cerrado":
            por_campana[key]["cerrados"] += 1
    conversion_campana = {
        k: {
            "total": d["total"],
            "cerrados": d["cerrados"],
            "tasa": round(d["cerrados"] / d["total"] * 100, 1) if d["total"] else 0,
        }
        for k, d in por_campana.items()
    }

    estados_data = db.query(Cliente.estado_cliente, func.count(Cliente.id_cliente).label("cantidad")).group_by(Cliente.estado_cliente).all()
    clientes_por_etapa = [{"estado": e.estado_cliente, "cantidad": e.cantidad} for e in estados_data]
    leads_por_etapa = [{"etapa": e.estado_cliente, "cantidad": e.cantidad} for e in estados_data]

    fuentes_data = db.query(Cliente.fuente_lead, func.count(Cliente.id_cliente).label("cantidad")).filter(Cliente.fuente_lead.isnot(None)).group_by(Cliente.fuente_lead).all()
    clientes_por_fuente = [{"fuente": f.fuente_lead, "cantidad": f.cantidad} for f in fuentes_data]

    return {
        "total_clientes": total,
        "clientes_activos": clientes_activos,
        "leads_activos": clientes_activos,
        "tasa_conversion": tasa_conversion,
        "pct_referidos": pct_referidos,
        "clientes_semana": clientes_semana,
        "leads_semana": clientes_semana,
        "clientes_por_etapa": clientes_por_etapa,
        "leads_por_etapa": leads_por_etapa,
        "clientes_por_fuente": clientes_por_fuente,
        "tiempo_promedio_cierre": _safe_avg(dias_cierre),
        "presupuesto_promedio_max": _safe_avg(presup_max),
        "presupuesto_promedio_min": _safe_avg(presup_min),
        "ingreso_promedio": _safe_avg(ingresos),
        "edad_promedio": _safe_avg(edades),
        "tiempo_promedio_dias_reg": _safe_avg(dias_reg),
        "distribucion_generacion": dist_generacion,
        "distribucion_ciudad": dict(list(dist_ciudad.items())[:15]),
        "distribucion_tipo_credito": dist_tipo_credito,
        "distribucion_estado_cliente": dist_estado_cli,
        "distribucion_operacion": dist_operacion,
        "distribucion_motivacion": dist_motivacion,
        "distribucion_fuente_lead": dist_fuente,
        "distribucion_temporalidad": dist_temporalidad,
        "conversion_por_asesor": conversion_asesor,
        "conversion_por_campana": conversion_campana,
        "distribucion_asesor": dist_asesor,
    }


# ── KPIs de Propiedades ───────────────────────────────────────────────────────

def get_kpis_propiedades(db: Session) -> dict[str, Any]:
    propiedades = db.query(Propiedad).all()
    total       = len(propiedades)

    if total == 0:
        return {"total": 0, "mensaje": "Sin registros"}

    ahora = datetime.now(timezone.utc)

    # Precios
    precios = [float(p.precio) for p in propiedades if p.precio]

    # Precio por m²
    precios_m2 = []
    for p in propiedades:
        if p.precio and p.m2_construccion and float(p.m2_construccion) > 0:
            precios_m2.append(float(p.precio) / float(p.m2_construccion))

    # Días en inventario
    dias_inventario = []
    for p in propiedades:
        if p.fecha_registro:
            fr = p.fecha_registro
            if fr.tzinfo is None:
                fr = fr.replace(tzinfo=timezone.utc)
            dias_inventario.append((ahora - fr).days)

    # Días desde captación
    dias_captacion = []
    for p in propiedades:
        if p.fecha_captacion:
            fc = datetime(p.fecha_captacion.year, p.fecha_captacion.month, p.fecha_captacion.day, tzinfo=timezone.utc)
            dias_captacion.append((ahora - fc).days)

    # Propiedades vendidas/rentadas (tiempo promedio de venta)
    # Como proxy usamos dias_inventario de las vendidas
    dias_venta = []
    for p in propiedades:
        if p.status in ("vendida", "rentada") and p.fecha_registro:
            fr = p.fecha_registro
            if fr.tzinfo is None:
                fr = fr.replace(tzinfo=timezone.utc)
            dias_venta.append((ahora - fr).days)

    # Distribuciones
    dist_tipo      = _distribution([p.tipo           for p in propiedades])
    dist_operacion = _distribution([p.tipo_operacion for p in propiedades])
    dist_status    = _distribution([p.status         for p in propiedades])
    dist_ciudad    = _distribution([p.ciudad or p.estado for p in propiedades])
    dist_asesor    = _distribution([p.id_asesor      for p in propiedades])
    dist_uso_suelo = _distribution([p.uso_suelo      for p in propiedades])

    # Inventario por rango de precio
    rangos = {"<500k": 0, "500k-1M": 0, "1M-2.5M": 0, "2.5M-5M": 0, ">5M": 0}
    for p in propiedades:
        pr = float(p.precio) if p.precio else 0
        if   pr < 500_000:     rangos["<500k"]    += 1
        elif pr < 1_000_000:   rangos["500k-1M"]  += 1
        elif pr < 2_500_000:   rangos["1M-2.5M"]  += 1
        elif pr < 5_000_000:   rangos["2.5M-5M"]  += 1
        else:                  rangos[">5M"]       += 1

    # Conversión por asesor
    por_asesor: dict = defaultdict(lambda: {"total": 0, "vendidas": 0})
    for p in propiedades:
        if p.id_asesor:
            por_asesor[p.id_asesor]["total"] += 1
            if p.status in ("vendida", "rentada"):
                por_asesor[p.id_asesor]["vendidas"] += 1
    conversion_asesor = {
        str(aid): {
            "total": d["total"],
            "vendidas": d["vendidas"],
            "tasa": round(d["vendidas"] / d["total"] * 100, 1) if d["total"] else 0,
        }
        for aid, d in por_asesor.items()
    }

    return {
        "total_propiedades":        total,
        "precio_promedio":          _safe_avg(precios),
        "precio_min":               min(precios) if precios else None,
        "precio_max":               max(precios) if precios else None,
        "precio_promedio_m2":       _safe_avg(precios_m2),
        "dias_promedio_inventario": _safe_avg(dias_inventario),
        "dias_promedio_captacion":  _safe_avg(dias_captacion),
        "dias_promedio_venta":      _safe_avg(dias_venta),
        "distribucion_tipo":        dist_tipo,
        "distribucion_operacion":   dist_operacion,
        "distribucion_status":      dist_status,
        "distribucion_ciudad":      dict(list(dist_ciudad.items())[:15]),
        "distribucion_uso_suelo":   dist_uso_suelo,
        "inventario_por_precio":    rangos,
        "conversion_por_asesor":    conversion_asesor,
        "disponibles":              sum(1 for p in propiedades if p.status == "disponible"),
        "vendidas":                 sum(1 for p in propiedades if p.status == "vendida"),
        "rentadas":                 sum(1 for p in propiedades if p.status == "rentada"),
        "reservadas":               sum(1 for p in propiedades if p.status == "reservada"),
    }
