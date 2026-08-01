from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from backend.database import get_db
from backend.models.auth import Rol, Permiso, AuditoriaRoles, Usuario
from backend.schemas.auth import RolSchema, RolCreate, RolUpdate, PermisoSchema, AuditoriaRolSchema
from backend.auth.dependencies import get_current_user, require_permission
from backend.auth.constants import SystemRole

router = APIRouter(prefix="/roles", tags=["Gestión de Roles y Permisos"])


def _is_admin(user: Usuario) -> bool:
    return SystemRole.ADMIN in [r.slug for r in user.roles]


def _permiso_to_dict(p: Permiso) -> dict:
    return {
        "id_permiso": p.id_permiso,
        "modulo": p.modulo,
        "puede_crear": p.puede_crear,
        "puede_leer": p.puede_leer,
        "puede_editar": p.puede_editar,
        "puede_eliminar": p.puede_eliminar,
        "restricciones": p.restricciones,
    }


@router.get("", response_model=List[RolSchema])
def list_roles(
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(50, ge=1, le=200, description="Máximo de registros a devolver"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _perm=Depends(require_permission("usuarios", "leer"))
):
    """Lista todos los roles disponibles para el tenant actual con paginación."""
    roles = (
        db.query(Rol)
        .options(joinedload(Rol.permisos))
        .filter((Rol.id_tenant == current_user.id_tenant) | (Rol.id_tenant == None))
        .offset(skip)
        .limit(limit)
        .all()
    )
    return roles


@router.get("/auditoria", response_model=List[AuditoriaRolSchema])
def get_auditoria_roles(
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(50, ge=1, le=200, description="Máximo de registros a devolver"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _perm=Depends(require_permission("usuarios", "leer"))
):
    """Obtiene el historial de auditoría de cambios en roles y permisos con paginación."""
    logs = (
        db.query(AuditoriaRoles)
        .filter((AuditoriaRoles.id_tenant == current_user.id_tenant) | (AuditoriaRoles.id_tenant == None))
        .order_by(AuditoriaRoles.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return logs


@router.get("/{id_rol}", response_model=RolSchema)
def get_rol(
    id_rol: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _perm=Depends(require_permission("usuarios", "leer"))
):
    """Obtiene un rol por su ID con su matriz de permisos."""
    rol = db.query(Rol).options(joinedload(Rol.permisos)).filter(Rol.id_rol == id_rol).first()
    if not rol:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol no encontrado")
    return rol


@router.post("", response_model=RolSchema, status_code=status.HTTP_201_CREATED)
def create_rol(
    data: RolCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _perm=Depends(require_permission("usuarios", "crear"))
):
    """Crea un rol personalizado para el tenant actual."""
    existing = db.query(Rol).filter(Rol.id_tenant == current_user.id_tenant, Rol.slug == data.slug).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Ya existe un rol con slug '{data.slug}'")

    rol = Rol(
        id_tenant=current_user.id_tenant,
        nombre=data.nombre,
        slug=data.slug,
        descripcion=data.descripcion,
        es_sistema=False
    )
    db.add(rol)
    db.commit()
    db.refresh(rol)

    # Crear y persistir permisos
    for p in data.permisos:
        permiso = Permiso(
            id_rol=rol.id_rol,
            modulo=p.modulo,
            puede_crear=p.puede_crear,
            puede_leer=p.puede_leer,
            puede_editar=p.puede_editar,
            puede_eliminar=p.puede_eliminar,
            restricciones=p.restricciones,
            updated_by=current_user.id_usuario
        )
        db.add(permiso)

    db.commit()

    # Recargar para obtener los permisos con sus id_permiso reales (post-persistencia)
    db.refresh(rol)
    rol_con_permisos = db.query(Rol).options(joinedload(Rol.permisos)).filter(Rol.id_rol == rol.id_rol).first()

    # Registro de Auditoría con snapshot basado en los registros ya persistidos
    auditoria = AuditoriaRoles(
        id_usuario=current_user.id_usuario,
        id_tenant=current_user.id_tenant,
        entidad="rol",
        id_entidad=rol.id_rol,
        accion="create",
        snapshot_despues={
            "nombre": rol_con_permisos.nombre,
            "slug": rol_con_permisos.slug,
            "permisos": [_permiso_to_dict(p) for p in rol_con_permisos.permisos]
        }
    )
    db.add(auditoria)
    db.commit()

    return rol_con_permisos


@router.put("/{id_rol}", response_model=RolSchema)
def update_rol(
    id_rol: int,
    data: RolUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _perm=Depends(require_permission("usuarios", "editar"))
):
    """Actualiza un rol y/o su matriz de permisos con auditoría.

    Roles de sistema (es_sistema=True):
    - Ningún usuario puede cambiar el nombre ni el slug.
    - Solo el Super Admin puede reemplazar la matriz de permisos.
    - El Admin de agencia puede ajustar permisos individuales dentro de los roles de sistema de su tenant.
    """
    rol = db.query(Rol).options(joinedload(Rol.permisos)).filter(Rol.id_rol == id_rol).first()
    if not rol:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol no encontrado")

    # Protección de nombre/slug en roles de sistema (ningún rol puede cambiarlos)
    if rol.es_sistema and data.nombre:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede cambiar el nombre de un rol de sistema"
        )

    # Protección de permisos en roles de sistema: solo Admin puede reemplazar la matriz completa
    if rol.es_sistema and data.permisos is not None and not _is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo el Admin puede reemplazar la matriz de permisos de un rol de sistema."
        )

    # Snapshot anterior (basado en objetos persistidos con id_permiso reales)
    before_snapshot = {
        "nombre": rol.nombre,
        "descripcion": rol.descripcion,
        "permisos": [_permiso_to_dict(p) for p in rol.permisos]
    }

    if data.nombre:
        rol.nombre = data.nombre
    if data.descripcion is not None:
        rol.descripcion = data.descripcion

    # Actualizar o reemplazar permisos
    if data.permisos is not None:
        db.query(Permiso).filter(Permiso.id_rol == id_rol).delete()
        for p in data.permisos:
            nuevo_p = Permiso(
                id_rol=id_rol,
                modulo=p.modulo,
                puede_crear=p.puede_crear,
                puede_leer=p.puede_leer,
                puede_editar=p.puede_editar,
                puede_eliminar=p.puede_eliminar,
                restricciones=p.restricciones,
                updated_by=current_user.id_usuario
            )
            db.add(nuevo_p)

    db.commit()

    # Recargar para snapshot post-persistencia con id_permiso reales
    rol_actualizado = db.query(Rol).options(joinedload(Rol.permisos)).filter(Rol.id_rol == id_rol).first()

    after_snapshot = {
        "nombre": rol_actualizado.nombre,
        "descripcion": rol_actualizado.descripcion,
        "permisos": [_permiso_to_dict(p) for p in rol_actualizado.permisos]
    }

    auditoria = AuditoriaRoles(
        id_usuario=current_user.id_usuario,
        id_tenant=current_user.id_tenant,
        entidad="rol",
        id_entidad=id_rol,
        accion="update",
        snapshot_antes=before_snapshot,
        snapshot_despues=after_snapshot
    )
    db.add(auditoria)
    db.commit()

    return rol_actualizado


@router.delete("/{id_rol}")
def delete_rol(
    id_rol: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _perm=Depends(require_permission("usuarios", "eliminar"))
):
    """Elimina un rol personalizado (los roles de sistema no pueden eliminarse)."""
    rol = db.query(Rol).options(joinedload(Rol.permisos)).filter(Rol.id_rol == id_rol).first()
    if not rol:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol no encontrado")

    if rol.es_sistema:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pueden eliminar roles de sistema"
        )

    auditoria = AuditoriaRoles(
        id_usuario=current_user.id_usuario,
        id_tenant=current_user.id_tenant,
        entidad="rol",
        id_entidad=id_rol,
        accion="delete",
        snapshot_antes={"nombre": rol.nombre, "slug": rol.slug, "permisos": [_permiso_to_dict(p) for p in rol.permisos]}
    )
    db.add(auditoria)

    db.delete(rol)
    db.commit()

    return {"message": f"Rol '{rol.nombre}' eliminado correctamente"}
