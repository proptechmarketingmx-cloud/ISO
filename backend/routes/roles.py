from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from backend.database import get_db
from backend.models.auth import Rol, Permiso, AuditoriaRoles, Usuario
from backend.schemas.auth import RolSchema, RolCreate, RolUpdate, PermisoSchema, AuditoriaRolSchema
from backend.auth.dependencies import get_current_user, require_permission

router = APIRouter(prefix="/roles", tags=["Gestión de Roles y Permisos"])


@router.get("", response_model=List[RolSchema])
def list_roles(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _perm=Depends(require_permission("usuarios", "leer"))
):
    """Lista todos los roles disponibles para el tenant actual."""
    roles = (
        db.query(Rol)
        .options(joinedload(Rol.permisos))
        .filter((Rol.id_tenant == current_user.id_tenant) | (Rol.id_tenant == None))
        .all()
    )
    return roles


@router.get("/auditoria", response_model=List[AuditoriaRolSchema])
def get_auditoria_roles(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _perm=Depends(require_permission("usuarios", "leer"))
):
    """Obtiene el historial de auditoría de cambios en roles y permisos."""
    logs = (
        db.query(AuditoriaRoles)
        .filter((AuditoriaRoles.id_tenant == current_user.id_tenant) | (AuditoriaRoles.id_tenant == None))
        .order_by(AuditoriaRoles.created_at.desc())
        .limit(100)
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

    # Crear permisos
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

    # Registro de Auditoría
    auditoria = AuditoriaRoles(
        id_usuario=current_user.id_usuario,
        id_tenant=current_user.id_tenant,
        entidad="rol",
        id_entidad=rol.id_rol,
        accion="create",
        snapshot_despues={"nombre": rol.nombre, "slug": rol.slug, "permisos": [p.dict() for p in data.permisos]}
    )
    db.add(auditoria)
    db.commit()
    db.refresh(rol)

    return rol


@router.put("/{id_rol}", response_model=RolSchema)
def update_rol(
    id_rol: int,
    data: RolUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _perm=Depends(require_permission("usuarios", "editar"))
):
    """Actualiza un rol y/o su matriz de permisos con auditoría."""
    rol = db.query(Rol).options(joinedload(Rol.permisos)).filter(Rol.id_rol == id_rol).first()
    if not rol:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol no encontrado")

    if rol.es_sistema and data.nombre:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se puede cambiar el nombre de un rol de sistema")

    # Snapshot anterior para auditoría
    before_snapshot = {
        "nombre": rol.nombre,
        "descripcion": rol.descripcion,
        "permisos": [
            {
                "modulo": p.modulo,
                "puede_crear": p.puede_crear,
                "puede_leer": p.puede_leer,
                "puede_editar": p.puede_editar,
                "puede_eliminar": p.puede_eliminar,
                "restricciones": p.restricciones
            }
            for p in rol.permisos
        ]
    }

    if data.nombre:
        rol.nombre = data.nombre
    if data.descripcion is not None:
        rol.descripcion = data.descripcion

    # Actualizar o reemplazar permisos
    if data.permisos is not None:
        # Limpiar permisos previos
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
    db.refresh(rol)

    # Snapshot posterior
    after_snapshot = {
        "nombre": rol.nombre,
        "descripcion": rol.descripcion,
        "permisos": [p.dict() for p in (data.permisos or [])]
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

    return rol


@router.delete("/{id_rol}")
def delete_rol(
    id_rol: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _perm=Depends(require_permission("usuarios", "eliminar"))
):
    """Elimina un rol personalizado (los roles de sistema no pueden eliminarse)."""
    rol = db.query(Rol).filter(Rol.id_rol == id_rol).first()
    if not rol:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol no encontrado")

    if rol.es_sistema:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se pueden eliminar roles de sistema")

    auditoria = AuditoriaRoles(
        id_usuario=current_user.id_usuario,
        id_tenant=current_user.id_tenant,
        entidad="rol",
        id_entidad=id_rol,
        accion="delete",
        snapshot_antes={"nombre": rol.nombre, "slug": rol.slug}
    )
    db.add(auditoria)

    db.delete(rol)
    db.commit()

    return {"message": f"Rol '{rol.nombre}' eliminado correctamente"}
