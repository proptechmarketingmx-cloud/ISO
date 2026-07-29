from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any, Dict
from datetime import datetime


# ── Tokens y Autenticación ───────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PermisoSchema(BaseModel):
    modulo: str
    puede_crear: bool = False
    puede_leer: bool = False
    puede_editar: bool = False
    puede_eliminar: bool = False
    restricciones: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class RolSchema(BaseModel):
    id_rol: int
    nombre: str
    slug: str
    descripcion: Optional[str] = None
    es_sistema: bool = False
    permisos: List[PermisoSchema] = []

    class Config:
        from_attributes = True


class RolCreate(BaseModel):
    nombre: str
    slug: str
    descripcion: Optional[str] = None
    permisos: List[PermisoSchema] = []


class RolUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    permisos: Optional[List[PermisoSchema]] = None


class UserProfile(BaseModel):
    id_usuario: int
    id_tenant: Optional[int] = None
    id_asesor: Optional[int] = None
    email: str
    nombre: Optional[str] = None
    activo: bool
    roles: List[RolSchema] = []

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    nombre: str
    id_tenant: Optional[int] = 1
    id_asesor: Optional[int] = None
    roles_ids: List[int] = []


class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    password: Optional[str] = None
    activo: Optional[bool] = None
    roles_ids: Optional[List[int]] = None


class AuditoriaRolSchema(BaseModel):
    id_audit: int
    id_usuario: Optional[int]
    id_tenant: Optional[int]
    entidad: str
    id_entidad: int
    accion: str
    snapshot_antes: Optional[Dict[str, Any]]
    snapshot_despues: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True
