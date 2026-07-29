from sqlalchemy import (
    Column, Integer, String, Text, DECIMAL, ForeignKey,
    TIMESTAMP, Date, Boolean, JSON, func
)
from sqlalchemy.orm import relationship
from backend.database import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id_cliente = Column(Integer, primary_key=True, index=True)
    id_tenant  = Column(Integer, ForeignKey("tenants.id_tenant", ondelete="CASCADE"), nullable=True, index=True)

    # ── Identificación ───────────────────────────────────────────────────────
    nombre              = Column(String(100),  nullable=False)
    apellido_paterno    = Column(String(100),  nullable=False)
    apellido_materno    = Column(String(100),  nullable=True)
    curp                = Column(String(18),   nullable=True, index=True)
    rfc                 = Column(String(13),   nullable=True)
    fecha_nacimiento    = Column(String(20),   nullable=True)  # YYYY-MM-DD
    edad                = Column(Integer,      nullable=True)   # Calculado
    generacion          = Column(String(50),   nullable=True)   # Calculado
    genero              = Column(String(50),   nullable=True)
    estado_civil        = Column(String(50),   nullable=True)
    nacionalidad        = Column(String(100),  nullable=True)

    # ── Contacto ─────────────────────────────────────────────────────────────
    telefono_principal  = Column(String(20),   nullable=True)
    whatsapp            = Column(String(20),   nullable=True, index=True)
    lada                = Column(String(10),   nullable=True)   # Calculado
    correo              = Column(String(100),  nullable=True, index=True)

    # ── Ubicación ────────────────────────────────────────────────────────────
    pais                = Column(String(100),  default="MX")
    estado              = Column(String(100),  nullable=True)
    municipio           = Column(String(100),  nullable=True)
    colonia             = Column(String(100),  nullable=True)
    codigo_postal       = Column(String(10),   nullable=True)
    fraccionamiento     = Column(String(100),  nullable=True)
    direccion           = Column(Text,         nullable=True)

    # ── Perfil Demográfico ───────────────────────────────────────────────────
    profesion           = Column(String(100),  nullable=True)
    puesto              = Column(String(100),  nullable=True)
    escolaridad         = Column(String(50),   nullable=True)

    # ── Perfil Familiar ───────────────────────────────────────────────────────
    conyuge             = Column(String(200),  nullable=True)
    conyuge_whatsapp    = Column(String(20),   nullable=True)
    hijos               = Column(Integer,      nullable=True)
    mascotas            = Column(Integer,      nullable=True)
    integrantes_hogar   = Column(Integer,      nullable=True)
    dependientes_eco    = Column(Integer,      nullable=True)
    adultos_mayores_cargo = Column(Integer,    nullable=True)

    # ── Perfil Financiero ─────────────────────────────────────────────────────
    nombre_empresa       = Column(String(200),   nullable=True)
    ocupacion            = Column(String(100),   nullable=True)
    antiguedad_laboral   = Column(String(100),   nullable=True)
    ingreso_mensual      = Column(DECIMAL(15, 2), nullable=True)
    tipo_credito         = Column(String(100),   nullable=True)
    presupuesto_min      = Column(DECIMAL(15, 2), nullable=True)
    presupuesto_max      = Column(DECIMAL(15, 2), nullable=True)
    enganche_disponible  = Column(DECIMAL(15, 2), nullable=True)
    pago_mensual_objetivo = Column(DECIMAL(15, 2), nullable=True)
    capacidad_credito_max = Column(DECIMAL(15, 2), nullable=True)

    # ── Preferencias del Inmueble ─────────────────────────────────────────────
    operacion               = Column(String(50),    nullable=True)
    tipo_propiedad          = Column(String(100),   nullable=True)
    estado_busqueda         = Column(String(100),   nullable=True)
    ciudad_busqueda         = Column(String(100),   nullable=True)
    fraccionamiento_colonia = Column(String(200),   nullable=True)
    habitaciones_pa         = Column(Integer,       nullable=True)
    habitaciones_pb         = Column(Integer,       nullable=True)
    banos                   = Column(DECIMAL(3, 1), nullable=True)
    estacionamiento         = Column(Integer,       nullable=True)
    m2_terreno_min          = Column(DECIMAL(10, 2), nullable=True)
    m2_terreno_max          = Column(DECIMAL(10, 2), nullable=True)
    m2_construccion_min     = Column(DECIMAL(10, 2), nullable=True)
    m2_construccion_max     = Column(DECIMAL(10, 2), nullable=True)
    niveles_max             = Column(Integer,        nullable=True)
    antiguedad_max          = Column(Integer,        nullable=True)
    amenidades_deseadas     = Column(Text,           nullable=True)  # JSON array

    # ── Motivación y Temporalidad ─────────────────────────────────────────────
    motivacion          = Column(String(100), nullable=True)
    temporalidad        = Column(String(50),  nullable=True)

    # ── Seguimiento Comercial ─────────────────────────────────────────────────
    id_asesor           = Column(Integer, ForeignKey("asesores.id_asesor", ondelete="SET NULL"), nullable=True)
    estado_cliente      = Column(String(50), default="nuevo")
    referenciado        = Column(String(255), nullable=True)
    fuente_lead         = Column(String(100), nullable=True)
    campana             = Column(String(200), nullable=True)
    medio_adquisicion   = Column(String(100), nullable=True)
    utm_source          = Column(String(200), nullable=True)
    utm_medium          = Column(String(100), nullable=True)
    utm_campaign        = Column(String(200), nullable=True)
    origen              = Column(String(100), nullable=True)
    canal_captacion     = Column(String(100), nullable=True)

    # ── Scores ────────────────────────────────────────────────────────────────
    score_cna            = Column(DECIMAL(5, 2), nullable=True)
    score_compatibilidad = Column(DECIMAL(5, 2), nullable=True)

    # ── Sistema ───────────────────────────────────────────────────────────────
    fecha_registro = Column(TIMESTAMP, server_default=func.now())

    # ── Relaciones ────────────────────────────────────────────────────────────
    asesor      = relationship("Asesor", back_populates="clientes_asignados", foreign_keys=[id_asesor])
    actividades = relationship("ClienteActividad", back_populates="cliente", cascade="all, delete-orphan")
    documentos  = relationship("ClienteDocumento", back_populates="cliente", cascade="all, delete-orphan")
    notas       = relationship("ClienteNota",      back_populates="cliente", cascade="all, delete-orphan")
    historial   = relationship("ClienteHistorial", back_populates="cliente", cascade="all, delete-orphan")
    compatibilidades = relationship("CompatibilidadClientePropiedad", back_populates="cliente", cascade="all, delete-orphan")


# ── Tablas Satélite ───────────────────────────────────────────────────────────

class ClienteActividad(Base):
    __tablename__ = "clientes_actividades"
    id_actividad = Column(Integer, primary_key=True, index=True)
    id_cliente   = Column(Integer, ForeignKey("clientes.id_cliente", ondelete="CASCADE"))
    tipo         = Column(String(50), nullable=False)
    descripcion  = Column(Text, nullable=True)
    fecha        = Column(TIMESTAMP, server_default=func.now())
    id_asesor    = Column(Integer, ForeignKey("asesores.id_asesor", ondelete="SET NULL"), nullable=True)
    cliente      = relationship("Cliente", back_populates="actividades")


class ClienteDocumento(Base):
    __tablename__ = "clientes_documentos"
    id_documento   = Column(Integer, primary_key=True, index=True)
    id_cliente     = Column(Integer, ForeignKey("clientes.id_cliente", ondelete="CASCADE"))
    nombre_archivo = Column(String(255), nullable=False)
    tipo_documento = Column(String(100), nullable=True)
    url            = Column(Text, nullable=False)
    fecha_subida   = Column(TIMESTAMP, server_default=func.now())
    cliente        = relationship("Cliente", back_populates="documentos")


class ClienteNota(Base):
    __tablename__ = "clientes_notas"
    id_nota    = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente", ondelete="CASCADE"))
    contenido  = Column(Text, nullable=False)
    fecha      = Column(TIMESTAMP, server_default=func.now())
    cliente    = relationship("Cliente", back_populates="notas")


class ClienteHistorial(Base):
    __tablename__ = "clientes_historial"
    id_historial   = Column(Integer, primary_key=True, index=True)
    id_cliente     = Column(Integer, ForeignKey("clientes.id_cliente", ondelete="CASCADE"))
    fecha          = Column(TIMESTAMP, server_default=func.now())
    usuario        = Column(String(100), nullable=True)
    accion         = Column(String(100), nullable=False)
    descripcion    = Column(Text, nullable=True)
    campo          = Column(String(100), nullable=True)
    valor_anterior = Column(Text, nullable=True)
    valor_nuevo    = Column(Text, nullable=True)
    cliente        = relationship("Cliente", back_populates="historial")
