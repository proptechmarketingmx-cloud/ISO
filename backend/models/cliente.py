from sqlalchemy import Column, Integer, String, Text, DECIMAL, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from backend.database import Base

class Cliente(Base):
    __tablename__ = "clientes"

    id_cliente = Column(Integer, primary_key=True, index=True)
    
    # 1. Información Básica
    nombre = Column(String(100), nullable=False)
    apellido_paterno = Column(String(100), nullable=False)
    apellido_materno = Column(String(100), nullable=True)
    genero = Column(String(50), nullable=True)
    estado_civil = Column(String(50), nullable=True)
    fecha_nacimiento = Column(String(20), nullable=True) # YYYY-MM-DD
    edad = Column(Integer, nullable=True)
    curp = Column(String(18), nullable=True)
    rfc = Column(String(13), nullable=True)
    
    # 2. Información de Contacto
    telefono_principal = Column(String(20), nullable=True)
    whatsapp = Column(String(20), nullable=True)
    correo = Column(String(100), nullable=True)
    direccion = Column(Text, nullable=True)
    
    # 3. Información Comercial
    id_asesor = Column(Integer, ForeignKey("asesores.id_asesor", ondelete="SET NULL"), nullable=True)
    estado_cliente = Column(String(50), default="nuevo") # nuevo, interesado, cotizacion, cerrado, perdido
    fecha_registro = Column(TIMESTAMP, server_default=func.now())
    origen = Column(String(100), nullable=True)
    canal_captacion = Column(String(100), nullable=True)
    
    # 4. Información Familiar & Laboral
    hijos = Column(String(255), nullable=True)
    ocupacion = Column(String(100), nullable=True)
    empresa = Column(String(200), nullable=True)
    ingresos = Column(DECIMAL(15, 2), nullable=True)

    # Relaciones - Asesores (Backref)
    asesor = relationship("Asesor", back_populates="clientes_asignados", foreign_keys=[id_asesor])
    
    # Relaciones del Expediente
    actividades = relationship("ClienteActividad", back_populates="cliente", cascade="all, delete-orphan")
    documentos = relationship("ClienteDocumento", back_populates="cliente", cascade="all, delete-orphan")
    notas = relationship("ClienteNota", back_populates="cliente", cascade="all, delete-orphan")
    historial = relationship("ClienteHistorial", back_populates="cliente", cascade="all, delete-orphan")

class ClienteActividad(Base):
    __tablename__ = "clientes_actividades"
    id_actividad = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente", ondelete="CASCADE"))
    tipo = Column(String(50), nullable=False) # llamada, reunion, visita, correo
    descripcion = Column(Text, nullable=True)
    fecha = Column(TIMESTAMP, server_default=func.now())
    id_asesor = Column(Integer, ForeignKey("asesores.id_asesor", ondelete="SET NULL"), nullable=True)
    
    cliente = relationship("Cliente", back_populates="actividades")

class ClienteDocumento(Base):
    __tablename__ = "clientes_documentos"
    id_documento = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente", ondelete="CASCADE"))
    nombre_archivo = Column(String(255), nullable=False)
    tipo_documento = Column(String(100), nullable=True) # ine, comprobante_domicilio, contrato
    url = Column(Text, nullable=False)
    fecha_subida = Column(TIMESTAMP, server_default=func.now())
    
    cliente = relationship("Cliente", back_populates="documentos")

class ClienteNota(Base):
    __tablename__ = "clientes_notas"
    id_nota = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente", ondelete="CASCADE"))
    contenido = Column(Text, nullable=False)
    fecha = Column(TIMESTAMP, server_default=func.now())
    
    cliente = relationship("Cliente", back_populates="notas")

class ClienteHistorial(Base):
    __tablename__ = "clientes_historial"
    id_historial = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente", ondelete="CASCADE"))
    fecha = Column(TIMESTAMP, server_default=func.now())
    usuario = Column(String(100), nullable=True)
    accion = Column(String(100), nullable=False) # creado, actualizado, estado_cambiado, asesor_asignado
    descripcion = Column(Text, nullable=True)
    
    cliente = relationship("Cliente", back_populates="historial")
