from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session, joinedload
from typing import Callable, Optional, Dict, Any
from backend.database import get_db
from backend.auth.jwt import decode_token
from backend.models.auth import Usuario, Rol, Permiso
from backend.auth.constants import SystemRole

security = HTTPBearer(auto_error=False)


from fastapi import Depends, HTTPException, status, Request

def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Usuario:
    """Extrae y valida el JWT del header Authorization o Cookie HttpOnly. Retorna el modelo Usuario."""
    raw_token = None
    if credentials and credentials.credentials:
        raw_token = credentials.credentials
    else:
        raw_token = request.cookies.get("access_token")

    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se proporcionó un token de autenticación",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(raw_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido, revocado o expirado",
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

    # Almacenar payload y raw token en el request state para el logout
    request.state.jwt_payload = payload
    request.state.raw_token = raw_token

    return user


def require_permission(modulo: str, accion: str) -> Callable:
    """
    Factory de dependencia para verificar permisos en un módulo específico.
    Acciones válidas: 'crear', 'leer', 'editar', 'eliminar'.
    """
    def permission_checker(current_user: Usuario = Depends(get_current_user)) -> Dict[str, Any]:
        user_roles_slugs = [r.slug for r in current_user.roles]

        if SystemRole.ADMIN in user_roles_slugs:
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
    """Verifica que el usuario no acceda a datos de otro tenant a menos que sea Admin."""
    user_roles_slugs = [r.slug for r in current_user.roles]
    if SystemRole.ADMIN in user_roles_slugs:
        return  # Admin puede ver todo su tenant

    if target_tenant_id is not None and current_user.id_tenant != target_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: aislamiento multi-tenant violado"
        )


def get_data_scope(current_user: Usuario, db: Session) -> Dict[str, Any]:
    """
    Calcula el alcance de datos según el rol del usuario.
      - Admin  → scope 'all' (ve todo el tenant, sin filtro de asesor)
      - Asesor → scope 'own' (solo sus propios registros vía id_asesor)
    """
    user_roles_slugs = [r.slug for r in current_user.roles]

    if SystemRole.ADMIN in user_roles_slugs:
        return {"scope": "all", "allowed_asesores_ids": None, "id_tenant": current_user.id_tenant}

    # Asesor: solo ve sus propios registros asignados
    own_asesores_ids = [current_user.id_asesor] if current_user.id_asesor else []
    return {"scope": "own", "allowed_asesores_ids": own_asesores_ids, "id_tenant": current_user.id_tenant}

