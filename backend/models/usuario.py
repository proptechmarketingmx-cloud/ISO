"""
Módulo de compatibilidad para modelos de Usuario.
Re-exporta los modelos SQLAlchemy de autenticación y RBAC definidos en backend.models.auth.
"""

from backend.models.auth import (
    Usuario,
    Tenant,
    Rol,
    Permiso,
    UsuarioRol,
    AuditoriaRoles,
)

__all__ = [
    "Usuario",
    "Tenant",
    "Rol",
    "Permiso",
    "UsuarioRol",
    "AuditoriaRoles",
]
