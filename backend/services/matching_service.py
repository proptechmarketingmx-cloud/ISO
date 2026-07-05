"""
matching_service.py — Motor de Compatibilidad Cliente ↔ Propiedad
ISO Plataforma Inmobiliaria

Calcula un score de compatibilidad 0–100 ponderado por cinco dimensiones:
  - Geográfica       25 %
  - Económica        30 %
  - Física           25 %
  - Familiar         10 %
  - Demográfica      10 %
"""

import json
from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session
from backend.models.cliente import Cliente
from backend.models.models   import Propiedad, CompatibilidadClientePropiedad

# ── Pesos de las dimensiones ──────────────────────────────────────────────────
W_GEO       = 0.25
W_ECONOMICO = 0.30
W_FISICO    = 0.25
W_FAMILIAR  = 0.10
W_DEMO      = 0.10


def _nivel(score: float) -> str:
    if score >= 95:  return "excelente"
    if score >= 80:  return "alta"
    if score >= 60:  return "media"
    return "baja"


def _to_f(v) -> Optional[float]:
    """Convierte Decimal / None a float / None."""
    if v is None:
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def _parse_json_list(v: Optional[str]) -> list:
    """Parsea un campo JSON array almacenado como TEXT."""
    if not v:
        return []
    try:
        result = json.loads(v)
        return result if isinstance(result, list) else []
    except (json.JSONDecodeError, TypeError):
        return []


# ── Dimensión Geográfica (25 %) ───────────────────────────────────────────────

def _score_geografico(c: Cliente, p: Propiedad) -> tuple[float, dict]:
    """
    Evalúa coincidencia jerárquica País→Estado→Municipio→Colonia→Fraccionamiento.
    Cada nivel coincidente suma puntos acumulativos.
    """
    puntos = 0
    detalles = {}

    # Estado (peso mayor en la jerarquía)
    estado_c = (c.estado_busqueda or "").strip().lower()
    estado_p = (p.estado or "").strip().lower()
    if estado_c and estado_p:
        if estado_c == estado_p:
            puntos += 40
            detalles["estado"] = "✓"
        else:
            detalles["estado"] = "✗"

    # Municipio
    mun_c = (c.municipio or c.fraccionamiento_colonia or "").strip().lower()
    mun_p = (p.municipio or "").strip().lower()
    if mun_p and mun_c and mun_p in mun_c:
        puntos += 25
        detalles["municipio"] = "✓"

    # Colonia / Fraccionamiento
    frac_c = (c.colonia or c.fraccionamiento or c.fraccionamiento_colonia or "").strip().lower()
    frac_p = (p.fraccionamiento or p.colonia or "").strip().lower()
    if frac_p and frac_c and frac_p in frac_c:
        puntos += 20
        detalles["colonia_fraccionamiento"] = "✓"

    # Ciudad
    ciu_c = (c.ciudad_busqueda or "").strip().lower()
    ciu_p = (p.ciudad or "").strip().lower()
    if ciu_c and ciu_p and ciu_c == ciu_p:
        puntos += 15
        detalles["ciudad"] = "✓"

    # Si no hay datos geográficos del cliente, 50 por defecto
    if not estado_c and not mun_c and not ciu_c:
        return 50.0, {"nota": "sin_datos_cliente"}

    return min(puntos, 100.0), detalles


# ── Dimensión Económica (30 %) ────────────────────────────────────────────────

def _score_economico(c: Cliente, p: Propiedad) -> tuple[float, dict]:
    puntos = 0
    detalles = {}

    precio  = _to_f(p.precio)
    pmin    = _to_f(c.presupuesto_min)
    pmax    = _to_f(c.presupuesto_max)

    if precio is not None:
        if pmin is not None and pmax is not None:
            if pmin <= precio <= pmax:
                puntos += 60
                detalles["precio_en_presupuesto"] = "✓"
            elif precio < pmin:
                # Bug 8: Guard de precio anómalmente bajo (< 1% del presupuesto mínimo)
                if pmin > 0 and precio < pmin * 0.01:
                    detalles["precio_anomalo"] = f"precio sospechoso ({precio:,.0f}), sin puntos"
                else:
                    ratio = min(1.0, pmin / precio)
                    puntos += int(60 * ratio)
                    detalles["precio_por_debajo"] = f"{precio:,.0f} < {pmin:,.0f}"
            else:
                # propiedad más cara que el máximo
                exceso = (precio - pmax) / pmax if pmax > 0 else 1
                puntos += max(0, int(40 * (1 - exceso * 2)))
                detalles["precio_sobre_presupuesto"] = f"exceso {exceso:.0%}"
        elif pmax is not None:
            # Bug 7: gradualidad simétrica cuando solo existe pmax
            if precio <= pmax:
                puntos += 50
                detalles["precio_dentro_max"] = "✓"
            else:
                exceso = (precio - pmax) / pmax if pmax > 0 else 1
                puntos += max(0, int(40 * (1 - exceso * 2)))
                detalles["precio_sobre_max"] = f"exceso {exceso:.0%}"
        elif pmin is not None:
            # Solo tiene mínimo definido
            if precio >= pmin:
                puntos += 40
                detalles["precio_sobre_min"] = "✓"

    # Tipo de crédito
    credito_c  = (c.tipo_credito or "").lower()
    creditos_p = [x.lower() for x in _parse_json_list(p.creditos_aceptados)]
    if credito_c and creditos_p:
        if credito_c in creditos_p or "contado" in creditos_p:
            puntos += 25
            detalles["credito"] = "✓"
        else:
            detalles["credito"] = "✗"

    # Ingreso recomendado vs ingreso mensual del cliente
    ing_rec = _to_f(p.ingreso_recomendado)
    ing_c   = _to_f(c.ingreso_mensual)
    if ing_rec and ing_c:
        if ing_c >= ing_rec:
            puntos += 15
            detalles["ingreso"] = "✓"
        else:
            ratio = ing_c / ing_rec
            puntos += int(15 * ratio)
            detalles["ingreso"] = f"déficit {(1 - ratio):.0%}"

    return min(puntos, 100.0), detalles


# ── Dimensión Física (25 %) ───────────────────────────────────────────────────

def _score_fisico(c: Cliente, p: Propiedad) -> tuple[float, dict]:
    puntos  = 0
    checks  = 0
    detalles = {}

    # Tipo de propiedad
    if c.tipo_propiedad and p.tipo:
        checks += 1
        if c.tipo_propiedad.lower() == p.tipo.lower():
            puntos += 1
            detalles["tipo_propiedad"] = "✓"
        else:
            detalles["tipo_propiedad"] = "✗"

    # Recámaras planta alta
    rec_c = c.habitaciones_pa
    rec_p = p.recamaras
    if rec_c is not None and rec_p is not None:
        checks += 1
        if rec_p >= rec_c:
            puntos += 1
            detalles["recamaras_pa"] = "✓"
        else:
            detalles["recamaras_pa"] = f"✗ ({rec_p}/{rec_c})"

    # Bug 4: Recámaras planta baja
    rec_pb_c = c.habitaciones_pb
    rec_pb_p = p.recamaras_pb
    if rec_pb_c is not None and rec_pb_p is not None:
        checks += 1
        if rec_pb_p >= rec_pb_c:
            puntos += 1
            detalles["recamaras_pb"] = "✓"
        else:
            detalles["recamaras_pb"] = f"✗ ({rec_pb_p}/{rec_pb_c})"

    # Baños
    ban_c = _to_f(c.banos)
    ban_p = _to_f(p.banos)
    if ban_c is not None and ban_p is not None:
        checks += 1
        if ban_p >= ban_c:
            puntos += 1
            detalles["banos"] = "✓"

    # Estacionamientos
    est_c = c.estacionamiento
    est_p = p.estacionamientos
    if est_c is not None and est_p is not None:
        checks += 1
        if est_p >= est_c:
            puntos += 1
            detalles["estacionamientos"] = "✓"

    # Terreno mínimo
    ter_min = _to_f(c.m2_terreno_min)
    ter_p   = _to_f(p.m2_terreno)
    if ter_min and ter_p:
        checks += 1
        if ter_p >= ter_min:
            puntos += 1
            detalles["terreno_min"] = "✓"

    # Bug 4: Terreno máximo — exceder el máximo deseado penaliza
    ter_max = _to_f(c.m2_terreno_max)
    if ter_max and ter_p and ter_p > ter_max:
        checks += 1
        detalles["terreno_max"] = f"✗ ({ter_p:,.0f} > {ter_max:,.0f})"
    elif ter_max and ter_p and ter_p <= ter_max:
        checks += 1
        puntos += 1
        detalles["terreno_max"] = "✓"

    # Construcción mínima
    con_min = _to_f(c.m2_construccion_min)
    con_p   = _to_f(p.m2_construccion)
    if con_min and con_p:
        checks += 1
        if con_p >= con_min:
            puntos += 1
            detalles["construccion_min"] = "✓"

    # Bug 4: Construcción máxima — exceder penaliza
    con_max = _to_f(c.m2_construccion_max)
    if con_max and con_p and con_p > con_max:
        checks += 1
        detalles["construccion_max"] = f"✗ ({con_p:,.0f} > {con_max:,.0f})"
    elif con_max and con_p and con_p <= con_max:
        checks += 1
        puntos += 1
        detalles["construccion_max"] = "✓"

    # Antigüedad máxima
    ant_max = c.antiguedad_max
    ant_p   = p.antiguedad
    if ant_max is not None and ant_p is not None:
        checks += 1
        if ant_p <= ant_max:
            puntos += 1
            detalles["antiguedad"] = "✓"

    # Bug 4: Niveles máximos
    niv_max = c.niveles_max
    niv_p   = p.niveles
    if niv_max is not None and niv_p is not None:
        checks += 1
        if niv_p <= niv_max:
            puntos += 1
            detalles["niveles"] = "✓"
        else:
            detalles["niveles"] = f"✗ ({niv_p} > {niv_max})"

    # Amenidades deseadas vs disponibles
    am_c = set(_parse_json_list(c.amenidades_deseadas))
    am_p = set(_parse_json_list(p.amenidades))
    if am_c and am_p:
        checks += 1
        match_ratio = len(am_c & am_p) / len(am_c)
        puntos += match_ratio
        detalles["amenidades"] = f"{len(am_c & am_p)}/{len(am_c)}"

    # Bug 4: ideal_para de la propiedad vs motivacion del cliente (boost si coincide)
    ideal_para_p = set(_parse_json_list(p.ideal_para))
    motivacion_c = (c.motivacion or "").lower().strip()
    if ideal_para_p and motivacion_c:
        checks += 1
        if motivacion_c in {v.lower() for v in ideal_para_p}:
            puntos += 1
            detalles["ideal_para"] = "✓"
        else:
            detalles["ideal_para"] = "no prioritario"

    if checks == 0:
        return 50.0, {"nota": "sin_datos_fisicos"}

    return round((puntos / checks) * 100, 2), detalles


# ── Dimensión Familiar (10 %) ─────────────────────────────────────────────────

def _score_familiar(c: Cliente, p: Propiedad) -> tuple[float, dict]:
    puntos = 0
    checks = 0
    detalles = {}

    # Hijos
    if c.hijos is not None and p.hijos_ideal is not None:
        checks += 1
        if p.hijos_ideal == 0:
            if c.hijos == 0:
                puntos += 1
                detalles["hijos"] = "✓"
            else:
                detalles["hijos"] = "✗"
        elif c.hijos <= p.hijos_ideal:
            puntos += 1
            detalles["hijos"] = "✓"
        else:
            detalles["hijos"] = "✗"

    # Mascotas
    if c.mascotas is not None and p.mascotas_ideal is not None:
        checks += 1
        if c.mascotas == 0:
            puntos += 1
            detalles["mascotas"] = "✓"
        elif p.mascotas_ideal > 0:
            puntos += 1
            detalles["mascotas"] = "✓"
        else:
            detalles["mascotas"] = "✗"

    # Integrantes del hogar
    if c.integrantes_hogar is not None and p.integrantes_ideal is not None:
        checks += 1
        if c.integrantes_hogar <= p.integrantes_ideal:
            puntos += 1
            detalles["integrantes"] = "✓"

    if checks == 0:
        return 50.0, {"nota": "sin_datos_familiares"}
    return round((puntos / checks) * 100, 2), detalles


# ── Dimensión Demográfica (10 %) ──────────────────────────────────────────────

def _score_demografico(c: Cliente, p: Propiedad) -> tuple[float, dict]:
    puntos = 0
    checks = 0
    detalles = {}

    # Estado civil ideal
    if p.estado_civil_ideal and c.estado_civil:
        checks += 1
        if p.estado_civil_ideal.lower() == c.estado_civil.lower():
            puntos += 1
            detalles["estado_civil"] = "✓"

    # Género ideal
    if p.genero_ideal and c.genero:
        checks += 1
        if p.genero_ideal.lower() in (c.genero.lower(), "cualquiera"):
            puntos += 1
            detalles["genero"] = "✓"

    # Ingreso recomendado vs ingreso mensual (ya evaluado en económico, aquí solo demográfico)
    ing_rec = _to_f(p.ingreso_recomendado)
    ing_c   = _to_f(c.ingreso_mensual)
    if ing_rec and ing_c:
        checks += 1
        if ing_c >= ing_rec * 0.9:   # 10 % de tolerancia
            puntos += 1
            detalles["ingreso_demo"] = "✓"

    if checks == 0:
        return 50.0, {"nota": "sin_datos_demo"}
    return round((puntos / checks) * 100, 2), detalles


# ── Función principal ─────────────────────────────────────────────────────────

def calcular_compatibilidad(c: Cliente, p: Propiedad) -> dict:
    """
    Calcula la compatibilidad entre un cliente y una propiedad.
    Devuelve un dict con todos los scores y el nivel de coincidencia.
    """
    s_geo,   d_geo   = _score_geografico(c, p)
    s_eco,   d_eco   = _score_economico(c, p)
    s_fis,   d_fis   = _score_fisico(c, p)
    s_fam,   d_fam   = _score_familiar(c, p)
    s_dem,   d_dem   = _score_demografico(c, p)

    total = round(
        s_geo   * W_GEO       +
        s_eco   * W_ECONOMICO +
        s_fis   * W_FISICO    +
        s_fam   * W_FAMILIAR  +
        s_dem   * W_DEMO,
        2
    )

    return {
        "score_total":     total,
        "score_geo":       round(s_geo, 2),
        "score_economico": round(s_eco, 2),
        "score_fisico":    round(s_fis, 2),
        "score_familiar":  round(s_fam, 2),
        "score_demo":      round(s_dem, 2),
        "nivel":           _nivel(total),
        "detalle_json": {
            "geografico":  d_geo,
            "economico":   d_eco,
            "fisico":      d_fis,
            "familiar":    d_fam,
            "demografico": d_dem,
        },
    }


def guardar_o_actualizar_compat(db: Session, id_cliente: int, id_propiedad: int, resultado: dict):
    """Persiste o actualiza el score de compatibilidad en la BD."""
    existente = db.query(CompatibilidadClientePropiedad).filter_by(
        id_cliente=id_cliente, id_propiedad=id_propiedad
    ).first()

    if existente:
        for k, v in resultado.items():
            setattr(existente, k, v)
    else:
        existente = CompatibilidadClientePropiedad(
            id_cliente=id_cliente,
            id_propiedad=id_propiedad,
            **resultado,
        )
        db.add(existente)
    db.commit()
    db.refresh(existente)
    return existente


def matches_para_cliente(db: Session, id_cliente: int, limit: int = 20, persist: bool = False) -> list:
    """
    Calcula y devuelve las propiedades más compatibles con un cliente.
    Solo evalúa propiedades disponibles.
    """
    from backend.models.models import Propiedad as Prop
    cliente = db.query(Cliente).filter_by(id_cliente=id_cliente).first()
    if not cliente:
        return []

    propiedades = db.query(Prop).filter(Prop.status == "disponible").all()
    resultados  = []
    for p in propiedades:
        r = calcular_compatibilidad(cliente, p)
        r["id_propiedad"] = p.id_propiedad
        r["titulo"]       = p.titulo
        r["precio"]       = float(p.precio) if p.precio else None
        r["ciudad"]       = p.ciudad
        r["tipo"]         = p.tipo
        resultados.append(r)
        if persist:
            guardar_o_actualizar_compat(db, id_cliente, p.id_propiedad, {
                k: v for k, v in r.items()
                if k in ("score_total","score_geo","score_economico","score_fisico","score_familiar","score_demo","nivel","detalle_json")
            })

    resultados.sort(key=lambda x: x["score_total"], reverse=True)
    return resultados[:limit]


def matches_para_propiedad(db: Session, id_propiedad: int, limit: int = 20, persist: bool = False) -> list:
    """
    Calcula y devuelve los clientes más compatibles con una propiedad.
    Bug 12: Si la propiedad no está disponible, añade campo 'advertencia' en el resultado.
    """
    propiedad = db.query(Propiedad).filter_by(id_propiedad=id_propiedad).first()
    if not propiedad:
        return []

    # Bug 12: advertencia si la propiedad no está activa
    advertencia = None
    if propiedad.status not in ("disponible", "reservada"):
        advertencia = (
            f"Esta propiedad tiene status '{propiedad.status}' y no está activamente "
            f"disponible. Los matches mostrados son informativos."
        )

    clientes  = db.query(Cliente).all()
    resultados = []
    for c in clientes:
        r = calcular_compatibilidad(c, propiedad)
        r["id_cliente"]      = c.id_cliente
        r["nombre_completo"] = f"{c.nombre} {c.apellido_paterno} {c.apellido_materno or ''}".strip()
        r["whatsapp"]        = c.whatsapp
        r["correo"]          = c.correo
        if advertencia:
            r["advertencia"] = advertencia
        resultados.append(r)
        if persist:
            guardar_o_actualizar_compat(db, c.id_cliente, id_propiedad, {
                k: v for k, v in r.items()
                if k in ("score_total","score_geo","score_economico","score_fisico","score_familiar","score_demo","nivel","detalle_json")
            })

    resultados.sort(key=lambda x: x["score_total"], reverse=True)
    return resultados[:limit]
