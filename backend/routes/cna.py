from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.database import get_db
from backend.models import models
from collections import defaultdict
import datetime

router = APIRouter(prefix="/cna", tags=["CNA"])

# ── Helpers de Cálculo CNA para Clientes ──────────────────────────────────

def calcular_scores_clientes(db: Session) -> List[Dict[str, Any]]:
    clientes = db.query(models.Cliente).all()
    relaciones = db.query(models.RelacionCliente).all()
    leads = db.query(models.Lead).all()
    
    # 1. Mapeos de relaciones
    # Adyacencia y tipos de relaciones por cliente
    rel_por_cliente = defaultdict(list)
    refs_directas = defaultdict(int)
    refs_indirectas = defaultdict(int)
    conexiones_count = defaultdict(int)
    
    for r in relaciones:
        rel_por_cliente[r.cliente_origen_id].append(r)
        rel_por_cliente[r.cliente_destino_id].append(r)
        conexiones_count[r.cliente_origen_id] += 1
        conexiones_count[r.cliente_destino_id] += 1
        if r.tipo_relacion == "REFERENCIA":
            refs_directas[r.cliente_origen_id] += 1
            
    # Calcular referencias indirectas (nivel 2)
    # Si A refiere a B (A->B es REFERENCIA) y B refiere a C (B->C es REFERENCIA), entonces A tiene una indirecta
    referidos_de = defaultdict(list)
    for r in relaciones:
        if r.tipo_relacion == "REFERENCIA":
            referidos_de[r.cliente_origen_id].append(r.cliente_destino_id)
            
    for origen, destinos in referidos_de.items():
        visitados = set(destinos)
        for d in destinos:
            for sub_d in referidos_de.get(d, []):
                if sub_d not in visitados and sub_d != origen:
                    refs_indirectas[origen] += 1
                    visitados.add(sub_d)

    # 2. Mapeos de Leads para volumen, comisión y conversión
    # Un lead exitoso es el que está en etapa 'cerrado'
    # Agrupamos leads por cliente
    leads_por_cliente = defaultdict(list)
    for l in leads:
        leads_por_cliente[l.id_cliente].append(l)
        
    # Agrupamos leads referidos por el cliente origen
    # Un lead se considera referido por A si el cliente del lead fue referido por A
    leads_referidos_por = defaultdict(list)
    # Mapeamos cliente -> quién lo refirió
    referido_por = {}
    for r in relaciones:
        if r.tipo_relacion == "REFERENCIA":
            referido_por[r.cliente_destino_id] = r.cliente_origen_id
            
    for l in leads:
        ref_id = referido_por.get(l.id_cliente)
        if ref_id:
            leads_referidos_por[ref_id].append(l)

    # 3. Construir scores por cliente
    scores = []
    max_refs_dir = max(refs_directas.values()) if refs_directas else 1
    max_refs_ind = max(refs_indirectas.values()) if refs_indirectas else 1
    max_conex = max(conexiones_count.values()) if conexiones_count else 1
    
    for c in clientes:
        cid = c.id_cliente
        
        # Referencias
        r_dir = refs_directas[cid]
        r_ind = refs_indirectas[cid]
        conn = conexiones_count[cid]
        
        # Leads referidos por este cliente
        ref_leads = leads_referidos_por[cid]
        leads_totales_ref = len(ref_leads)
        leads_cerrados_ref = sum(1 for l in ref_leads if l.etapa == "cerrado")
        
        # Conversión del cliente = % de leads referidos que cerraron
        conversion = (leads_cerrados_ref / leads_totales_ref * 100) if leads_totales_ref > 0 else 0.0
        
        # Volumen y Comisión Generada
        volumen = sum(float(l.valor_cierre or 0.0) for l in ref_leads if l.etapa == "cerrado")
        comision = sum(float(l.comision_cierre or 0.0) for l in ref_leads if l.etapa == "cerrado")
        
        # Actividad reciente (leads referidos o creados en los últimos 30 días)
        limite_actividad = datetime.datetime.now() - datetime.timedelta(days=30)
        actividad_reciente = sum(
            1 for l in (leads_por_cliente[cid] + ref_leads)
            if l.fecha_registro >= limite_actividad
        )
        
        # Normalizaciones para los scores (0-100)
        # Componentes Influence Score
        comp_dir = (r_dir / max_refs_dir * 100) if max_refs_dir > 0 else 0.0
        comp_ind = (r_ind / max_refs_ind * 100) if max_refs_ind > 0 else 0.0
        comp_conn = (conn / max_conex * 100) if max_conex > 0 else 0.0
        comp_conv = conversion
        
        influence_score = (comp_dir * 0.3) + (comp_ind * 0.2) + (comp_conn * 0.2) + (comp_conv * 0.3)
        influence_score = min(max(influence_score, 0.0), 100.0)
        
        # Componentes Provider Score
        # Encontramos valores máximos para normalizar volumen, comisión y actividad
        # (Para no complicar, usamos escalas razonables o relativas)
        max_vol = max([sum(float(l.valor_cierre or 0.0) for l in leads_referidos_por[x.id_cliente] if l.etapa == "cerrado") for x in clientes] or [1.0])
        max_vol = max_vol if max_vol > 0 else 1.0
        
        max_com = max([sum(float(l.comision_cierre or 0.0) for l in leads_referidos_por[x.id_cliente] if l.etapa == "cerrado") for x in clientes] or [1.0])
        max_com = max_com if max_com > 0 else 1.0
        
        comp_vol = (volumen / max_vol * 100)
        comp_com = (comision / max_com * 100)
        comp_act = min(actividad_reciente * 20.0, 100.0) # 5 interacciones = 100%
        
        provider_score = (comp_dir * 0.2) + (comp_conv * 0.2) + (comp_vol * 0.3) + (comp_com * 0.2) + (comp_act * 0.1)
        provider_score = min(max(provider_score, 0.0), 100.0)
        
        scores.append({
            "id_cliente": cid,
            "id": cid, # Para D3 network compatibilidad
            "nombre": c.nombre,
            "apellido_paterno": c.apellido_paterno,
            "apellido_materno": c.apellido_materno,
            "telefono": c.telefono,
            "correo": c.correo,
            "ciudad": c.ciudad,
            "profesion": c.profesion,
            "referencias_directas": r_dir,
            "referencias_indirectas": r_ind,
            "referencias_totales": r_dir + r_ind,
            "conexiones": conn,
            "conversion": conversion,
            "volumen_generado": volumen,
            "comision_generada": comision,
            "actividad_reciente": actividad_reciente,
            "influence_score": influence_score,
            "provider_score": provider_score
        })
        
    return scores

# ── Endpoints CNA Clientes ─────────────────────────────────────────────

@router.get("/clientes/network")
def get_clientes_network(db: Session = Depends(get_db)):
    scores = calcular_scores_clientes(db)
    relaciones = db.query(models.RelacionCliente).all()
    
    # Crear listado de nodos mapeado
    nodes = []
    for s in scores:
        nodes.append({
            "id": s["id_cliente"],
            "nombre": s["nombre"],
            "apellido_paterno": s["apellido_paterno"],
            "influence_score": s["influence_score"],
            "provider_score": s["provider_score"],
            "referencias_totales": s["referencias_totales"],
            "conexiones": s["conexiones"]
        })
        
    edges = []
    for r in relaciones:
        edges.append({
            "id": r.id_relacion,
            "source": r.cliente_origen_id,
            "target": r.cliente_destino_id,
            "tipo_relacion": r.tipo_relacion,
            "peso": float(r.peso or 1.0)
        })
        
    return {"nodes": nodes, "edges": edges}

@router.get("/clientes/scores")
def get_clientes_scores(db: Session = Depends(get_db)):
    return calcular_scores_clientes(db)

@router.get("/clientes/rankings")
def get_clientes_rankings(db: Session = Depends(get_db)):
    scores = calcular_scores_clientes(db)
    
    rank_refs = sorted(scores, key=lambda x: x["referencias_totales"], reverse=True)
    rank_vol = sorted(scores, key=lambda x: x["volumen_generado"], reverse=True)
    rank_prov = sorted(scores, key=lambda x: x["provider_score"], reverse=True)
    rank_inf = sorted(scores, key=lambda x: x["influence_score"], reverse=True)
    
    return {
        "referencias_totales": rank_refs,
        "volumen_generado": rank_vol,
        "provider_score": rank_prov,
        "influence_score": rank_inf
    }

@router.get("/clientes/communities")
def get_clientes_communities(db: Session = Depends(get_db)):
    clientes = db.query(models.Cliente).all()
    relaciones = db.query(models.RelacionCliente).all()
    
    # Agrupación por componente conexo por tipo de relación
    # Retornamos comunidades identificadas por tipo de relación familiar, profesional, geográfica o empresarial
    adj = defaultdict(list)
    rel_tipo = {}
    
    for r in relaciones:
        adj[r.cliente_origen_id].append(r.cliente_destino_id)
        adj[r.cliente_destino_id].append(r.cliente_origen_id)
        rel_tipo[(min(r.cliente_origen_id, r.cliente_destino_id), max(r.cliente_origen_id, r.cliente_destino_id))] = r.tipo_relacion

    # Detección de comunidades por componentes conexos en tipos específicos
    visitados = set()
    comunidades = []
    comm_id = 1
    
    # 1. Agrupaciones Familiares (mismo apellido o relación familiar directa)
    apellido_grupos = defaultdict(list)
    for c in clientes:
        ap = (c.apellido_paterno or "").strip().upper()
        if ap:
            apellido_grupos[ap].append(c)
            
    for ap, miembros in apellido_grupos.items():
        if len(miembros) > 1:
            comunidades.append({
                "id": comm_id,
                "nombre": f"Familia {ap.capitalize()}",
                "tipo": "FAMILIAR",
                "total_miembros": len(miembros),
                "miembros": [{"nombre": m.nombre, "apellido_paterno": m.apellido_paterno} for m in miembros],
                "descripcion": f"Grupo familiar detectado por apellido coincidente '{ap.capitalize()}'"
            })
            comm_id += 1

    # 2. Agrupaciones Profesionales (misma profesión / empresa)
    profesion_grupos = defaultdict(list)
    for c in clientes:
        prof = (c.profesion or "").strip().upper()
        if prof and len(prof) > 3: # Ignorar campos vacíos o muy cortos
            profesion_grupos[prof].append(c)
            
    for prof, miembros in profesion_grupos.items():
        if len(miembros) > 1:
            comunidades.append({
                "id": comm_id,
                "nombre": f"Gremio {prof.capitalize()}",
                "tipo": "PROFESIONAL",
                "total_miembros": len(miembros),
                "miembros": [{"nombre": m.nombre, "apellido_paterno": m.apellido_paterno} for m in miembros],
                "descripcion": f"Cluster profesional detectado por profesión '{prof.capitalize()}'"
            })
            comm_id += 1
            
    # 3. Agrupaciones Geográficas (misma ciudad)
    ciudad_grupos = defaultdict(list)
    for c in clientes:
        cd = (c.ciudad or "").strip().upper()
        if cd:
            ciudad_grupos[cd].append(c)
            
    for cd, miembros in ciudad_grupos.items():
        if len(miembros) > 1:
            comunidades.append({
                "id": comm_id,
                "nombre": f"Zona {cd.capitalize()}",
                "tipo": "GEOGRAFICA",
                "total_miembros": len(miembros),
                "miembros": [{"nombre": m.nombre, "apellido_paterno": m.apellido_paterno} for m in miembros],
                "descripcion": f"Comunidad ubicada geográficamente en la ciudad de {cd.capitalize()}"
            })
            comm_id += 1

    return {"communities": comunidades}


# ── Helpers de Cálculo CNA para Asesores ──────────────────────────────────

def calcular_scores_asesores(db: Session) -> List[Dict[str, Any]]:
    asesores = db.query(models.Asesor).all()
    relaciones = db.query(models.RelacionAsesor).all()
    leads = db.query(models.Lead).all()
    propiedades = db.query(models.Propiedad).all()
    
    # 1. Relaciones de asesores
    conexiones_count = defaultdict(int)
    refs_directas = defaultdict(int)
    
    for r in relaciones:
        conexiones_count[r.asesor_origen_id] += 1
        conexiones_count[r.asesor_destino_id] += 1
        if r.tipo_relacion == "REFERENCIA":
            refs_directas[r.asesor_origen_id] += 1
            
    # 2. Leads por asesor
    leads_por_asesor = defaultdict(list)
    for l in leads:
        if l.id_asesor:
            leads_por_asesor[l.id_asesor].append(l)
            
    # Propiedades por asesor
    props_por_asesor = defaultdict(list)
    for p in propiedades:
        if p.id_asesor:
            props_por_asesor[p.id_asesor].append(p)
            
    # 3. Construir scores
    scores = []
    max_conex = max(conexiones_count.values()) if conexiones_count else 1
    max_refs = max(refs_directas.values()) if refs_directas else 1
    
    for a in asesores:
        aid = a.id_asesor
        
        r_dir = refs_directas[aid]
        conn = conexiones_count[aid]
        
        # Leads asignados
        a_leads = leads_por_asesor[aid]
        leads_totales = len(a_leads)
        leads_cerrados = sum(1 for l in a_leads if l.etapa == "cerrado")
        
        # Conversión del asesor = leads cerrados / leads asignados
        conversion = (leads_cerrados / leads_totales * 100) if leads_totales > 0 else 0.0
        
        # Volumen y Comisión Generada
        volumen = sum(float(l.valor_cierre or 0.0) for l in a_leads if l.etapa == "cerrado")
        comision = sum(float(l.comision_cierre or 0.0) for l in a_leads if l.etapa == "cerrado")
        
        # Propiedades captadas
        total_propiedades = len(props_por_asesor[aid])
        
        # Scores (normalizados 0-100)
        comp_refs = (r_dir / max_refs * 100) if max_refs > 0 else 0.0
        comp_conn = (conn / max_conex * 100) if max_conex > 0 else 0.0
        
        # Influence Score del asesor
        influence_score = (comp_refs * 0.4) + (comp_conn * 0.3) + (conversion * 0.3)
        influence_score = min(max(influence_score, 0.0), 100.0)
        
        # Provider Score del asesor (generador de inventario y cierres)
        max_vol = max([sum(float(l.valor_cierre or 0.0) for l in leads_por_asesor[x.id_asesor] if l.etapa == "cerrado") for x in asesores] or [1.0])
        max_vol = max_vol if max_vol > 0 else 1.0
        comp_vol = (volumen / max_vol * 100)
        
        provider_score = (conversion * 0.3) + (comp_vol * 0.4) + (min(total_propiedades * 10.0, 100.0) * 0.3)
        provider_score = min(max(provider_score, 0.0), 100.0)
        
        scores.append({
            "id_asesor": aid,
            "id": aid,
            "nombre": a.nombre,
            "apellidos": a.apellidos,
            "apellido_paterno": a.apellidos, # Para compatibilidad en UI con apellido_paterno
            "telefono": a.telefono,
            "correo": a.correo,
            "status": a.status,
            "referencias_directas": r_dir,
            "referencias_totales": r_dir,
            "conexiones": conn,
            "conversion": conversion,
            "volumen_generado": volumen,
            "comision_generada": comision,
            "total_propiedades": total_propiedades,
            "influence_score": influence_score,
            "provider_score": provider_score
        })
        
    return scores

# ── Endpoints CNA Asesores ─────────────────────────────────────────────

@router.get("/asesores/network")
def get_asesores_network(db: Session = Depends(get_db)):
    scores = calcular_scores_asesores(db)
    relaciones = db.query(models.RelacionAsesor).all()
    
    nodes = []
    for s in scores:
        nodes.append({
            "id": s["id_asesor"],
            "nombre": s["nombre"],
            "apellido_paterno": s["apellidos"],
            "influence_score": s["influence_score"],
            "provider_score": s["provider_score"],
            "referencias_totales": s["referencias_totales"],
            "conexiones": s["conexiones"]
        })
        
    edges = []
    for r in relaciones:
        edges.append({
            "id": r.id_relacion,
            "source": r.asesor_origen_id,
            "target": r.asesor_destino_id,
            "tipo_relacion": r.tipo_relacion,
            "peso": float(r.peso or 1.0)
        })
        
    return {"nodes": nodes, "edges": edges}

@router.get("/asesores/scores")
def get_asesores_scores(db: Session = Depends(get_db)):
    return calcular_scores_asesores(db)

@router.get("/asesores/rankings")
def get_asesores_rankings(db: Session = Depends(get_db)):
    scores = calcular_scores_asesores(db)
    
    rank_refs = sorted(scores, key=lambda x: x["referencias_totales"], reverse=True)
    rank_vol = sorted(scores, key=lambda x: x["volumen_generado"], reverse=True)
    rank_prov = sorted(scores, key=lambda x: x["provider_score"], reverse=True)
    rank_inf = sorted(scores, key=lambda x: x["influence_score"], reverse=True)
    
    return {
        "referencias_totales": rank_refs,
        "volumen_generado": rank_vol,
        "provider_score": rank_prov,
        "influence_score": rank_inf
    }

@router.get("/asesores/communities")
def get_asesores_communities(db: Session = Depends(get_db)):
    # Comunidades de asesores (por ejemplo, organizadas por estatus de actividad o relaciones directas)
    asesores = db.query(models.Asesor).all()
    relaciones = db.query(models.RelacionAsesor).all()
    
    comunidades = []
    comm_id = 1
    
    # 1. Agrupación por Status
    status_grupos = defaultdict(list)
    for a in asesores:
        status_grupos[a.status].append(a)
        
    for st, miembros in status_grupos.items():
        if len(miembros) > 1:
            comunidades.append({
                "id": comm_id,
                "nombre": f"Equipo {st.capitalize()}",
                "tipo": "PROFESIONAL",
                "total_miembros": len(miembros),
                "miembros": [{"nombre": m.nombre, "apellido_paterno": m.apellidos} for m in miembros],
                "descripcion": f"Grupo de asesores con estatus '{st.capitalize()}'"
            })
            comm_id += 1
            
    return {"communities": comunidades}
