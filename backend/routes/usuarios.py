from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from backend.database import get_db
from backend.models.auth import Usuario, Rol, UsuarioRol, AuditoriaRoles
from backend.schemas.auth import UserProfile, UserCreate, UserUpdate
from backend.auth.jwt import get_password_hash
from backend.auth.dependencies import get_current_user, require_permission

router = APIRouter(prefix="/usuarios", tags=["Gestión de Usuarios"])


@router.get("", response_model=List[UserProfile])
def list_usuarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _perm=Depends(require_permission("usuarios", "leer"))
):
    """Lista todos los usuarios pertenecientes al tenant actual."""
    users = (
        db.query(Usuario)
        .options(joinedload(Usuario.roles).joinedload(Rol.permisos))
        .filter(Usuario.id_tenant == current_user.id_tenant)
        .all()
    )
    return users


@router.post("", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
def create_usuario(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _perm=Depends(require_permission("usuarios", "crear"))
):
    """Crea un usuario nuevo en el tenant actual y le asigna roles."""
    existing = db.query(Usuario).filter(Usuario.email == data.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El correo ya está registrado")

    user = Usuario(
        id_tenant=current_user.id_tenant,
        id_asesor=data.id_asesor,
        id_manager=data.id_manager,
        email=data.email,
        password_hash=get_password_hash(data.password),
        nombre=data.nombre,
        activo=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Asignar roles
    if data.roles_ids:
        for r_id in data.roles_ids:
            ur = UsuarioRol(id_usuario=user.id_usuario, id_rol=r_id, assigned_by=current_user.id_usuario)
            db.add(ur)
        db.commit()

    auditoria = AuditoriaRoles(
        id_usuario=current_user.id_usuario,
        id_tenant=current_user.id_tenant,
        entidad="usuario",
        id_entidad=user.id_usuario,
        accion="create",
        snapshot_despues={"email": user.email, "nombre": user.nombre, "id_manager": user.id_manager, "roles": data.roles_ids}
    )
    db.add(auditoria)
    db.commit()

    return db.query(Usuario).options(joinedload(Usuario.roles)).filter(Usuario.id_usuario == user.id_usuario).first()


@router.put("/{id_usuario}", response_model=UserProfile)
def update_usuario(
    id_usuario: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
    _perm=Depends(require_permission("usuarios", "editar"))
):
    """Actualiza datos de un usuario (nombre, contraseña, activo, id_asesor, id_manager, roles)."""
    user = db.query(Usuario).filter(Usuario.id_usuario == id_usuario, Usuario.id_tenant == current_user.id_tenant).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    if data.nombre:
        user.nombre = data.nombre
    if data.password:
        user.password_hash = get_password_hash(data.password)
    if data.activo is not None:
        user.activo = data.activo
    if data.id_asesor is not None:
        user.id_asesor = data.id_asesor
    if data.id_manager is not None:
        user.id_manager = data.id_manager

    if data.roles_ids is not None:
        # Reemplazar roles
        db.query(UsuarioRol).filter(UsuarioRol.id_usuario == id_usuario).delete()
        for r_id in data.roles_ids:
            ur = UsuarioRol(id_usuario=id_usuario, id_rol=r_id, assigned_by=current_user.id_usuario)
            db.add(ur)

    db.commit()

    auditoria = AuditoriaRoles(
        id_usuario=current_user.id_usuario,
        id_tenant=current_user.id_tenant,
        entidad="usuario",
        id_entidad=id_usuario,
        accion="update",
        snapshot_despues={"nombre": user.nombre, "activo": user.activo, "roles": data.roles_ids}
    )
    db.add(auditoria)
    db.commit()

    return db.query(Usuario).options(joinedload(Usuario.roles)).filter(Usuario.id_usuario == id_usuario).first()
