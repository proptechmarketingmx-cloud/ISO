from sqlalchemy import (
    Column, Integer, String, Text, DECIMAL, ForeignKey,
    TIMESTAMP, Date, Boolean, JSON, func, UniqueConstraint
)
from sqlalchemy.orm import relationship
from backend.database import Base


class Asesor(Base):
    __tablename__ = "asesores"

    id_asesor     = Column(Integer, primary_key=True, index=True)
    id_tenant     = Column(Integer, ForeignKey("tenants.id_tenant", ondelete="CASCADE"), nullable=True, index=True)
    nombre        = Column(String(100), nullable=False)
    apellidos     = Column(String(100), nullable=False)
    telefono      = Column(String(20),  nullable=True)
    correo        = Column(String(100), nullable=True)
    status        = Column(String(20),  default="activo")
    fecha_ingreso = Column(TIMESTAMP,   server_default=func.now())

    propiedades        = relationship("Propiedad", back_populates="asesor")
    clientes_asignados = relationship("Cliente",   back_populates="asesor",
                                      foreign_keys="Cliente.id_asesor")


class Propiedad(Base):
    __tablename__ = "propiedades"

    id_propiedad = Column(Integer, primary_key=True, index=True)
    id_tenant    = Column(Integer, ForeignKey("tenants.id_tenant", ondelete="CASCADE"), nullable=True, index=True)

    # ── General ───────────────────────────────────────────────────────────────
    titulo          = Column(String(200), nullable=False)
    descripcion     = Column(Text,        nullable=True)
    tipo            = Column(String(50),  nullable=False)
    tipo_operacion  = Column(String(20),  nullable=False)   # venta, renta, preventa
    status          = Column(String(20),  default="disponible")
    id_asesor       = Column(Integer, ForeignKey("asesores.id_asesor", ondelete="SET NULL"), nullable=True)

    # ── Propietario ───────────────────────────────────────────────────────────
    propietario_nombre   = Column(String(200), nullable=True)
    propietario_whatsapp = Column(String(20),  nullable=True)

    # ── Ubicación jerárquica ──────────────────────────────────────────────────
    pais            = Column(String(100), default="MX")
    estado          = Column(String(100), nullable=True)
    municipio       = Column(String(100), nullable=True)
    ciudad          = Column(String(100), nullable=True)
    colonia         = Column(String(100), nullable=True)
    fraccionamiento = Column(String(100), nullable=True)
    codigo_postal   = Column(String(10),  nullable=True)

    # ── Comercial ─────────────────────────────────────────────────────────────
    precio              = Column(DECIMAL(15, 2), nullable=False)
    precio_negociable   = Column(Boolean,        default=False)
    creditos_aceptados  = Column(Text,           nullable=True)   # JSON array
    comision            = Column(DECIMAL(5, 2),  nullable=True)
    comision_compartida = Column(DECIMAL(5, 2),  nullable=True)
    exclusiva           = Column(Boolean,        default=False)
    fecha_captacion     = Column(Date,           nullable=True)
    fecha_publicacion   = Column(Date,           nullable=True)

    # ── Física ────────────────────────────────────────────────────────────────
    m2_construccion     = Column(DECIMAL(10, 2), nullable=True)
    m2_terreno          = Column(DECIMAL(10, 2), nullable=True)
    frente              = Column(DECIMAL(8, 2),  nullable=True)
    fondo               = Column(DECIMAL(8, 2),  nullable=True)
    recamaras           = Column(Integer,        default=0)
    recamaras_pb        = Column(Integer,        default=0)
    banos               = Column(DECIMAL(3, 1),  default=0.0)
    niveles             = Column(Integer,        default=1)
    estacionamientos    = Column(Integer,        default=0)
    antiguedad          = Column(Integer,        nullable=True)
    orientacion         = Column(String(50),     nullable=True)
    estado_conservacion = Column(String(50),     nullable=True)
    remodelada          = Column(Boolean,        default=False)
    anio_construccion   = Column(Integer,        nullable=True)

    # ── Legal ─────────────────────────────────────────────────────────────────
    escrituras             = Column(Boolean, default=False)
    regimen                = Column(String(100), nullable=True)
    libre_gravamen         = Column(Boolean, default=False)
    predial                = Column(Boolean, default=False)
    adeudos                = Column(Boolean, default=False)
    hipoteca_vigente       = Column(Boolean, default=False)
    documentacion_completa = Column(Boolean, default=False)

    # ── Perfil ideal (para matching) ──────────────────────────────────────────
    ingreso_recomendado = Column(DECIMAL(15, 2), nullable=True)
    tipo_credito_ideal  = Column(String(100),    nullable=True)
    estado_civil_ideal  = Column(String(50),     nullable=True)
    genero_ideal        = Column(String(50),     nullable=True)
    hijos_ideal         = Column(Integer,        nullable=True)
    mascotas_ideal      = Column(Integer,        nullable=True)
    integrantes_ideal   = Column(Integer,        nullable=True)
    ideal_para          = Column(Text,           nullable=True)  # JSON array
    amenidades          = Column(Text,           nullable=True)  # JSON array
    servicios           = Column(Text,           nullable=True)  # JSON array
    uso_suelo           = Column(String(50),     nullable=True)

    # ── Scores ────────────────────────────────────────────────────────────────
    score_atractivo      = Column(DECIMAL(5, 2), nullable=True)
    score_compatibilidad = Column(DECIMAL(5, 2), nullable=True)

    # ── Sistema ───────────────────────────────────────────────────────────────
    fecha_registro = Column(TIMESTAMP, server_default=func.now())

    # ── Relaciones ────────────────────────────────────────────────────────────
    asesor       = relationship("Asesor", back_populates="propiedades")
    multimedia   = relationship("PropiedadMultimedia",            back_populates="propiedad", cascade="all, delete-orphan")
    compatibilidades = relationship("CompatibilidadClientePropiedad", back_populates="propiedad", cascade="all, delete-orphan")
    actividades  = relationship("PropiedadActividad", back_populates="propiedad", cascade="all, delete-orphan")
    documentos   = relationship("PropiedadDocumento", back_populates="propiedad", cascade="all, delete-orphan")
    notas        = relationship("PropiedadNota",      back_populates="propiedad", cascade="all, delete-orphan")
    historial    = relationship("PropiedadHistorial", back_populates="propiedad", cascade="all, delete-orphan")



class PropiedadMultimedia(Base):
    __tablename__ = "propiedades_multimedia"

    id_media     = Column(Integer, primary_key=True, index=True)
    id_propiedad = Column(Integer, ForeignKey("propiedades.id_propiedad", ondelete="CASCADE"), nullable=False)
    tipo         = Column(String(20), nullable=False)   # foto, video, virtual, plano, documento
    url          = Column(Text,       nullable=False)
    nombre       = Column(String(255), nullable=True)
    descripcion  = Column(String(500), nullable=True)
    es_principal = Column(Boolean,    default=False)
    orden        = Column(Integer,    default=0)
    fecha_subida = Column(TIMESTAMP,  server_default=func.now())

    propiedad = relationship("Propiedad", back_populates="multimedia")


class CompatibilidadClientePropiedad(Base):
    __tablename__ = "compatibilidad_cliente_propiedad"

    id_compat       = Column(Integer, primary_key=True, index=True)
    id_cliente      = Column(Integer, ForeignKey("clientes.id_cliente",      ondelete="CASCADE"), nullable=False)
    id_propiedad    = Column(Integer, ForeignKey("propiedades.id_propiedad", ondelete="CASCADE"), nullable=False)
    score_total     = Column(DECIMAL(5, 2), nullable=False)
    score_geo       = Column(DECIMAL(5, 2), nullable=True)
    score_economico = Column(DECIMAL(5, 2), nullable=True)
    score_fisico    = Column(DECIMAL(5, 2), nullable=True)
    score_familiar  = Column(DECIMAL(5, 2), nullable=True)
    score_demo      = Column(DECIMAL(5, 2), nullable=True)
    nivel           = Column(String(30),    nullable=True)
    detalle_json    = Column(JSON,          nullable=True)
    fecha_calculo   = Column(TIMESTAMP,     server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("id_cliente", "id_propiedad", name="unique_compat"),
    )

    cliente   = relationship("Cliente",   back_populates="compatibilidades")
    propiedad = relationship("Propiedad", back_populates="compatibilidades")


class AuditoriaCambios(Base):
    __tablename__ = "auditoria_cambios"

    id_auditoria   = Column(Integer, primary_key=True, index=True)
    tabla          = Column(String(100), nullable=False)
    id_registro    = Column(Integer,     nullable=False, index=True)
    campo          = Column(String(100), nullable=False)
    valor_anterior = Column(Text,        nullable=True)
    valor_nuevo    = Column(Text,        nullable=True)
    usuario        = Column(String(100), nullable=True)
    fecha          = Column(TIMESTAMP,   server_default=func.now())


class RelacionCliente(Base):
    __tablename__ = "relaciones_clientes_cna"

    id_relacion        = Column(Integer, primary_key=True, index=True)
    cliente_origen_id  = Column(Integer, ForeignKey("clientes.id_cliente", ondelete="CASCADE"), nullable=False)
    cliente_destino_id = Column(Integer, ForeignKey("clientes.id_cliente", ondelete="CASCADE"), nullable=False)
    tipo_relacion      = Column(String(50), nullable=False)
    fecha_relacion     = Column(TIMESTAMP,  server_default=func.now())
    peso               = Column(DECIMAL(3, 2), default=1.00)

    __table_args__ = (
        UniqueConstraint("cliente_origen_id", "cliente_destino_id", "tipo_relacion", name="unique_cliente_rel"),
    )


class RelacionAsesor(Base):
    __tablename__ = "relaciones_asesores_cna"

    id_relacion       = Column(Integer, primary_key=True, index=True)
    asesor_origen_id  = Column(Integer, ForeignKey("asesores.id_asesor", ondelete="CASCADE"), nullable=False)
    asesor_destino_id = Column(Integer, ForeignKey("asesores.id_asesor", ondelete="CASCADE"), nullable=False)
    tipo_relacion     = Column(String(50), nullable=False)
    fecha_relacion    = Column(TIMESTAMP,  server_default=func.now())
    peso              = Column(DECIMAL(3, 2), default=1.00)

    __table_args__ = (
        UniqueConstraint("asesor_origen_id", "asesor_destino_id", "tipo_relacion", name="unique_asesor_rel"),
    )


class PropiedadActividad(Base):
    __tablename__ = "propiedades_actividades"
    id_actividad = Column(Integer, primary_key=True, index=True)
    id_propiedad = Column(Integer, ForeignKey("propiedades.id_propiedad", ondelete="CASCADE"), nullable=False)
    tipo         = Column(String(50), nullable=False)
    descripcion  = Column(Text, nullable=True)
    fecha        = Column(TIMESTAMP, server_default=func.now())
    id_asesor    = Column(Integer, ForeignKey("asesores.id_asesor", ondelete="SET NULL"), nullable=True)
    propiedad    = relationship("Propiedad", back_populates="actividades")


class PropiedadDocumento(Base):
    __tablename__ = "propiedades_documentos"
    id_documento   = Column(Integer, primary_key=True, index=True)
    id_propiedad   = Column(Integer, ForeignKey("propiedades.id_propiedad", ondelete="CASCADE"), nullable=False)
    nombre_archivo = Column(String(255), nullable=False)
    tipo_documento = Column(String(100), nullable=True)
    url            = Column(Text, nullable=False)
    fecha_subida   = Column(TIMESTAMP, server_default=func.now())
    propiedad      = relationship("Propiedad", back_populates="documentos")


class PropiedadNota(Base):
    __tablename__ = "propiedades_notas"
    id_nota      = Column(Integer, primary_key=True, index=True)
    id_propiedad = Column(Integer, ForeignKey("propiedades.id_propiedad", ondelete="CASCADE"), nullable=False)
    contenido    = Column(Text, nullable=False)
    fecha        = Column(TIMESTAMP, server_default=func.now())
    propiedad    = relationship("Propiedad", back_populates="notas")


class PropiedadHistorial(Base):
    __tablename__ = "propiedades_historial"
    id_historial   = Column(Integer, primary_key=True, index=True)
    id_propiedad   = Column(Integer, ForeignKey("propiedades.id_propiedad", ondelete="CASCADE"), nullable=False)
    fecha          = Column(TIMESTAMP, server_default=func.now())
    usuario        = Column(String(100), nullable=True)
    accion         = Column(String(100), nullable=False)
    descripcion    = Column(Text, nullable=True)
    campo          = Column(String(100), nullable=True)
    valor_anterior = Column(Text, nullable=True)
    valor_nuevo    = Column(Text, nullable=True)
    propiedad      = relationship("Propiedad", back_populates="historial")

