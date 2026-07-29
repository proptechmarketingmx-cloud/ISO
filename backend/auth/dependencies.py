from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session, joinedload
from typing import Callable, Optional, Dict, Any
from backend.database import get_db
from backend.auth.jwt import decode_token
from backend.models.auth import Usuario, Rol, Permiso

security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Usuario:
    """Extrae y valida el JWT del header Authorization. Retorna el modelo Usuario."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se proporcionó un token de autenticación",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no contiene sujeto válido",
        )

    user = (
        db.query(Usuario)
        .options(joinedload(Usuario.roles).joinedload(Rol.permisos))
        .filter(Usuario.id_usuario == int(user_id), Usuario.activo == True)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o inactivo",
        )

    return user


def require_permission(modulo: str, accion: str) -> Callable:
    """
    Factory de dependencia para verificar permisos en un módulo específico.
    Acciones válidas: 'crear', 'leer', 'editar', 'eliminar'.
    """
    def permission_checker(current_user: Usuario = Depends(get_current_user)) -> Dict[str, Any]:
        # Verificar si es Super Admin (rol slug: 'super_admin') o Admin de Agencia ('admin')
        user_roles_slugs = [r.slug for r in current_user.roles]

        if "super_admin" in user_roles_slugs or "admin" in user_roles_slugs:
            return {"permitido": True, "restricciones": None, "es_admin": True}

        # Buscar permisos para el módulo solicitado en los roles del usuario
        permiso_concedido = False
        restricciones_combinadas: Dict[str, Any] = {}

        for rol in current_user.roles:
            for p in rol.permisos:
                if p.modulo == modulo:
                    val = getattr(p, f"puede_{accion}", False)
                    if val:
                        permiso_concedido = True
                        if p.restricciones:
                            restricciones_combinadas.update(p.restricciones)

        if not permiso_concedido:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tienes permiso para {accion} en el módulo '{modulo}'"
            )

        return {
            "permitido": True,
            "restricciones": restricciones_combinadas,
            "es_admin": False
        }

    return permission_checker


def check_tenant_isolation(current_user: Usuario, target_tenant_id: Optional[int]):
    """Verifica que el usuario no acceda a datos de otro tenant a menos que sea Super Admin."""
    user_roles_slugs = [r.slug for r in current_user.roles]
    if "super_admin" in user_roles_slugs:
        return  # Super admin puede ver todo

    if target_tenant_id is not None and current_user.id_tenant != target_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: aislamiento multi-tenant violado"
        )
