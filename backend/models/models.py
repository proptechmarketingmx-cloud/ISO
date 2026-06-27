from sqlalchemy import Column, Integer, String, Text, DECIMAL, ForeignKey, TIMESTAMP, func, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.database import Base

class Asesor(Base):
    __tablename__ = "asesores"

    id_asesor = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    telefono = Column(String(20), nullable=True)
    correo = Column(String(100), nullable=True)
    status = Column(String(20), default="activo")
    fecha_ingreso = Column(TIMESTAMP, server_default=func.now())

    # Relaciones
    propiedades = relationship("Propiedad", back_populates="asesor")
    clientes_asignados = relationship("Cliente", back_populates="asesor")





class Propiedad(Base):
    __tablename__ = "propiedades"

    id_propiedad = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    tipo = Column(String(50), nullable=False)
    tipo_operacion = Column(String(20), nullable=False)
    precio = Column(DECIMAL(15, 2), nullable=False)
    status = Column(String(20), default="disponible")
    ciudad = Column(String(100), nullable=True)
    colonia = Column(String(100), nullable=True)
    m2_construccion = Column(DECIMAL(10, 2), nullable=True)
    m2_terreno = Column(DECIMAL(10, 2), nullable=True)
    recamaras = Column(Integer, default=0)
    banos = Column(DECIMAL(3, 1), default=0.0)
    id_asesor = Column(Integer, ForeignKey("asesores.id_asesor", ondelete="SET NULL"), nullable=True)
    fecha_registro = Column(TIMESTAMP, server_default=func.now())

    # Relaciones
    asesor = relationship("Asesor", back_populates="propiedades")





class RelacionCliente(Base):
    __tablename__ = "relaciones_clientes_cna"

    id_relacion = Column(Integer, primary_key=True, index=True)
    cliente_origen_id = Column(Integer, ForeignKey("clientes.id_cliente", ondelete="CASCADE"), nullable=False)
    cliente_destino_id = Column(Integer, ForeignKey("clientes.id_cliente", ondelete="CASCADE"), nullable=False)
    tipo_relacion = Column(String(50), nullable=False)
    fecha_relacion = Column(TIMESTAMP, server_default=func.now())
    peso = Column(DECIMAL(3, 2), default=1.00)

    __table_args__ = (
        UniqueConstraint('cliente_origen_id', 'cliente_destino_id', 'tipo_relacion', name='unique_cliente_rel'),
    )


class RelacionAsesor(Base):
    __tablename__ = "relaciones_asesores_cna"

    id_relacion = Column(Integer, primary_key=True, index=True)
    asesor_origen_id = Column(Integer, ForeignKey("asesores.id_asesor", ondelete="CASCADE"), nullable=False)
    asesor_destino_id = Column(Integer, ForeignKey("asesores.id_asesor", ondelete="CASCADE"), nullable=False)
    tipo_relacion = Column(String(50), nullable=False)
    fecha_relacion = Column(TIMESTAMP, server_default=func.now())
    peso = Column(DECIMAL(3, 2), default=1.00)

    __table_args__ = (
        UniqueConstraint('asesor_origen_id', 'asesor_destino_id', 'tipo_relacion', name='unique_asesor_rel'),
    )
