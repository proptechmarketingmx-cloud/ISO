"""
Módulo de compatibilidad para esquemas Pydantic de Usuario y Autenticación.
Re-exporta y mapea los schemas de backend.schemas.auth.
"""

from backend.schemas.auth import (
    Token as TokenResponse,
    LoginRequest as UsuarioLogin,
    UserCreate as UsuarioCreate,
    UserUpdate as UsuarioUpdate,
    UserProfile,
    RolSchema,
    PermisoSchema,
)

__all__ = [
    "TokenResponse",
    "UsuarioLogin",
    "UsuarioCreate",
    "UsuarioUpdate",
    "UserProfile",
    "RolSchema",
    "PermisoSchema",
]
