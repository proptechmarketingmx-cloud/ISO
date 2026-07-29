from sqlalchemy import (
    Column, Integer, String, Text, ForeignKey, TIMESTAMP, Boolean, JSON, func, Table, UniqueConstraint
)
from sqlalchemy.orm import relationship
from backend.database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id_tenant  = Column(Integer, primary_key=True, index=True)
    nombre     = Column(String(100), nullable=False)
    slug       = Column(String(50),  nullable=False, unique=True, index=True)
    plan       = Column(String(50),  default="pro")
    activo     = Column(Boolean,     default=True)
    created_at = Column(TIMESTAMP,   server_default=func.now())

    usuarios   = relationship("Usuario", back_populates="tenant", cascade="all, delete-orphan")
    roles      = relationship("Rol", back_populates="tenant", cascade="all, delete-orphan")


class UsuarioRol(Base):
    __tablename__ = "usuario_roles"

    id_usuario  = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), primary_key=True)
    id_rol      = Column(Integer, ForeignKey("roles.id_rol", ondelete="CASCADE"), primary_key=True)
    assigned_at = Column(TIMESTAMP, server_default=func.now())
    assigned_by = Column(Integer, nullable=True)


class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario    = Column(Integer, primary_key=True, index=True)
    id_tenant     = Column(Integer, ForeignKey("tenants.id_tenant", ondelete="CASCADE"), nullable=True, index=True)
    id_asesor     = Column(Integer, ForeignKey("asesores.id_asesor", ondelete="SET NULL"), nullable=True, index=True)
    email         = Column(String(100), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    nombre        = Column(String(100), nullable=True)
    activo        = Column(Boolean,     default=True)
    ultimo_acceso = Column(TIMESTAMP,   nullable=True)
    created_at    = Column(TIMESTAMP,   server_default=func.now())

    tenant        = relationship("Tenant", back_populates="usuarios")
    asesor        = relationship("Asesor")
    roles         = relationship("Rol", secondary="usuario_roles", back_populates="usuarios")


class Rol(Base):
    __tablename__ = "roles"

    id_rol      = Column(Integer, primary_key=True, index=True)
    id_tenant   = Column(Integer, ForeignKey("tenants.id_tenant", ondelete="CASCADE"), nullable=True, index=True)
    nombre      = Column(String(50),  nullable=False)
    slug        = Column(String(50),  nullable=False)
    descripcion = Column(String(255), nullable=True)
    es_sistema  = Column(Boolean,     default=False)
    created_at  = Column(TIMESTAMP,   server_default=func.now())

    __table_args__ = (
        UniqueConstraint("id_tenant", "slug", name="unique_tenant_slug"),
    )

    tenant      = relationship("Tenant", back_populates="roles")
    permisos    = relationship("Permiso", back_populates="rol", cascade="all, delete-orphan")
    usuarios    = relationship("Usuario", secondary="usuario_roles", back_populates="roles")


class Permiso(Base):
    __tablename__ = "permisos"

    id_permiso    = Column(Integer, primary_key=True, index=True)
    id_rol        = Column(Integer, ForeignKey("roles.id_rol", ondelete="CASCADE"), nullable=False)
    modulo        = Column(String(50), nullable=False)
    puede_crear   = Column(Boolean, default=False)
    puede_leer    = Column(Boolean, default=False)
    puede_editar  = Column(Boolean, default=False)
    puede_eliminar = Column(Boolean, default=False)
    restricciones = Column(JSON, nullable=True)
    updated_at    = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    updated_by    = Column(Integer, nullable=True)

    __table_args__ = (
        UniqueConstraint("id_rol", "modulo", name="unique_rol_modulo"),
    )

    rol = relationship("Rol", back_populates="permisos")


class AuditoriaRoles(Base):
    __tablename__ = "auditoria_roles"

    id_audit         = Column(Integer, primary_key=True, index=True)
    id_usuario       = Column(Integer, nullable=True, index=True)
    id_tenant        = Column(Integer, nullable=True, index=True)
    entidad          = Column(String(50),  nullable=False)
    id_entidad       = Column(Integer,     nullable=False)
    accion           = Column(String(50),  nullable=False)
    snapshot_antes   = Column(JSON,        nullable=True)
    snapshot_despues = Column(JSON,        nullable=True)
    created_at       = Column(TIMESTAMP,   server_default=func.now())
