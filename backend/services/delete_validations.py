from typing import Optional, Tuple
from sqlalchemy.orm import Session
from backend.models.cliente import Cliente, ClienteActividad
from backend.models.models import Propiedad, Asesor, RelacionCliente

ESTADOS_CLIENTE_BLOQUEADOS = frozenset({"negociacion", "cotizacion", "cerrado"})
STATUS_PROPIEDAD_BLOQUEADOS = frozenset({"reservada", "vendida", "rentada"})


def validate_cliente_delete(db: Session, id_cliente: int) -> Tuple[bool, Optional[str]]:
    cliente = db.query(Cliente).filter(Cliente.id_cliente == id_cliente).first()
    if not cliente:
        return False, "Cliente no encontrado"

    if cliente.estado_cliente in ESTADOS_CLIENTE_BLOQUEADOS:
        return False, (
            f"No se puede eliminar el cliente porque tiene una operación activa "
            f"(estado: {cliente.estado_cliente})."
        )

    relaciones = db.query(RelacionCliente).filter(
        (RelacionCliente.cliente_origen_id == id_cliente)
        | (RelacionCliente.cliente_destino_id == id_cliente)
    ).count()
    if relaciones > 0:
        return False, (
            "No se puede eliminar el cliente porque tiene relaciones CNA con otros clientes. "
            "Elimine las relaciones primero."
        )

    return True, None


def validate_propiedad_delete(db: Session, id_propiedad: int) -> Tuple[bool, Optional[str]]:
    propiedad = db.query(Propiedad).filter(Propiedad.id_propiedad == id_propiedad).first()
    if not propiedad:
        return False, "Propiedad no encontrada"

    if propiedad.status in STATUS_PROPIEDAD_BLOQUEADOS:
        return False, (
            f"No se puede eliminar la propiedad porque tiene un status protegido "
            f"(status: {propiedad.status}). Eliminar esta propiedad borraría en cascada "
            f"toda su multimedia e historial de compatibilidad. "
            f"Cambie el status a 'inactiva' antes de eliminar."
        )

    return True, None


def validate_asesor_delete(db: Session, id_asesor: int) -> Tuple[bool, Optional[str]]:
    asesor = db.query(Asesor).filter(Asesor.id_asesor == id_asesor).first()
    if not asesor:
        return False, "Asesor no encontrado"

    clientes = db.query(Cliente).filter(Cliente.id_asesor == id_asesor).count()
    if clientes > 0:
        return False, (
            f"No se puede eliminar el asesor porque tiene {clientes} "
            f"cliente{'s' if clientes != 1 else ''} asignado{'s' if clientes != 1 else ''}."
        )

    propiedades = db.query(Propiedad).filter(Propiedad.id_asesor == id_asesor).count()
    if propiedades > 0:
        return False, (
            f"No se puede eliminar el asesor porque tiene {propiedades} "
            f"propiedad{'es' if propiedades != 1 else ''} asignada{'s' if propiedades != 1 else ''}."
        )

    actividades = db.query(ClienteActividad).filter(ClienteActividad.id_asesor == id_asesor).count()
    if actividades > 0:
        return False, (
            f"No se puede eliminar el asesor porque tiene {actividades} "
            f"actividad{'es' if actividades != 1 else ''} registrada{'s' if actividades != 1 else ''}."
        )

    return True, None
