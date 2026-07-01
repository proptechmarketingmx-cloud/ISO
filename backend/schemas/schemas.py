import re
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List
from decimal import Decimal
from datetime import datetime, date

_RE_EMAIL = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')

# ── Asesores ────────────────────────────────────────

class AsesorBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    apellidos: str = Field(..., max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)
    correo: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = Field("activo", max_length=20)

class AsesorCreate(AsesorBase):
    pass

class AsesorUpdate(BaseModel):
    nombre: Optional[str] = Field(None, max_length=100)
    apellidos: Optional[str] = Field(None, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)
    correo: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = Field(None, max_length=20)

class AsesorResponse(AsesorBase):
    id_asesor: int
    fecha_ingreso: datetime

    class Config:
        from_attributes = True


# ── Clientes ────────────────────────────────────────

class ClienteBase(BaseModel):
    # Dato Único
    referenciado: Optional[str] = Field(None, max_length=255)
    
    # Personal
    nombre: str = Field(..., max_length=100)
    apellido_paterno: str
    apellido_materno: Optional[str] = None
    fecha_nacimiento: Optional[int] = None
    edad: Optional[int] = None
    estado_civil: Optional[str] = Field(None, max_length=50)
    
    # Contacto
    whatsapp: Optional[str] = Field(None, max_length=20)
    correo: Optional[str] = Field(None, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20) # Mantenido por compatibilidad
    
    # Laboral
    ingreso_mes: Optional[Decimal] = None
    nombre_empresa: Optional[str] = Field(None, max_length=200)
    antiguedad_laboral: Optional[str] = Field(None, max_length=100)
    tipo_credito: Optional[str] = Field(None, max_length=100)
    
    # Datos familiares
    conyuge: Optional[str] = Field(None, max_length=200)
    conyuge_whatsapp: Optional[str] = Field(None, max_length=20)
    hijos: Optional[str] = Field(None, max_length=255)
    mascotas: Optional[str] = Field(None, max_length=255)
    integrantes_hogar: Optional[int] = None
    
    # Inmobiliaria
    operacion: Optional[str] = Field(None, max_length=50)
    tipo_propiedad: Optional[str] = Field(None, max_length=100)
    estado: Optional[str] = Field(None, max_length=100)
    ciudad: Optional[str] = Field(None, max_length=100)
    fraccionamiento_colonia: Optional[str] = Field(None, max_length=200)
    habitaciones_pa: Optional[int] = None
    habitaciones_pb: Optional[int] = None
    amenidades_deseadas: Optional[str] = None
    banos: Optional[Decimal] = Decimal("0.0")
    estacionamiento: Optional[int] = 0
    m2_terreno: Optional[Decimal] = Decimal("0.00")
    jardin: Optional[str] = Field(None, max_length=100)
    alberca: Optional[str] = Field(None, max_length=100)
    
    # Dinámicos
    campos_adicionales: Optional[str] = None

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    referenciado: Optional[str] = Field(None, max_length=255)
    nombre: Optional[str] = Field(None, max_length=100)
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    fecha_nacimiento: Optional[int] = None
    edad: Optional[int] = None
    estado_civil: Optional[str] = Field(None, max_length=50)
    whatsapp: Optional[str] = Field(None, max_length=20)
    correo: Optional[str] = Field(None, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)
    ingreso_mes: Optional[Decimal] = None
    nombre_empresa: Optional[str] = Field(None, max_length=200)
    antiguedad_laboral: Optional[str] = Field(None, max_length=100)
    tipo_credito: Optional[str] = Field(None, max_length=100)
    conyuge: Optional[str] = Field(None, max_length=200)
    conyuge_whatsapp: Optional[str] = Field(None, max_length=20)
    hijos: Optional[str] = Field(None, max_length=255)
    mascotas: Optional[str] = Field(None, max_length=255)
    integrantes_hogar: Optional[int] = None
    operacion: Optional[str] = Field(None, max_length=50)
    tipo_propiedad: Optional[str] = Field(None, max_length=100)
    estado: Optional[str] = Field(None, max_length=100)
    ciudad: Optional[str] = Field(None, max_length=100)
    fraccionamiento_colonia: Optional[str] = Field(None, max_length=200)
    habitaciones_pa: Optional[int] = None
    habitaciones_pb: Optional[int] = None
    amenidades_deseadas: Optional[str] = None
    banos: Optional[Decimal] = None
    estacionamiento: Optional[int] = None
    m2_terreno: Optional[Decimal] = None
    jardin: Optional[str] = Field(None, max_length=100)
    alberca: Optional[str] = Field(None, max_length=100)
    campos_adicionales: Optional[str] = None

class ClienteResponse(ClienteBase):
    id_cliente: int
    fecha_registro: datetime

    class Config:
        from_attributes = True


# ── Propiedades ─────────────────────────────────────────────────────────────

class PropiedadBase(BaseModel):
    # General
    titulo:          str           = Field(..., max_length=200)
    descripcion:     Optional[str] = None
    tipo:            str           = Field(..., max_length=50)
    tipo_operacion:  str           = Field(..., max_length=20)  # venta, renta, preventa
    status:          Optional[str] = Field("disponible", max_length=20)
    id_asesor:       Optional[int] = None

    # Propietario
    propietario_nombre:   Optional[str] = Field(None, max_length=200)
    propietario_whatsapp: Optional[str] = Field(None, max_length=20)

    # Ubicación jerárquica
    pais:            Optional[str] = Field("MX",  max_length=100)
    estado:          Optional[str] = Field(None,  max_length=100)
    municipio:       Optional[str] = Field(None,  max_length=100)
    ciudad:          Optional[str] = Field(None,  max_length=100)
    colonia:         Optional[str] = Field(None,  max_length=100)
    fraccionamiento: Optional[str] = Field(None,  max_length=100)
    codigo_postal:   Optional[str] = Field(None,  max_length=10)

    # Comercial
    precio:              Decimal
    precio_negociable:   Optional[bool]    = False
    creditos_aceptados:  Optional[str]     = None  # JSON array
    comision:            Optional[Decimal] = Field(None, ge=0, le=100)
    comision_compartida: Optional[Decimal] = Field(None, ge=0, le=100)
    exclusiva:           Optional[bool]    = False
    fecha_captacion:     Optional[date]    = None
    fecha_publicacion:   Optional[date]    = None

    # Física
    m2_construccion:     Optional[Decimal] = None
    m2_terreno:          Optional[Decimal] = None
    frente:              Optional[Decimal] = None
    fondo:               Optional[Decimal] = None
    recamaras:           Optional[int]     = 0
    recamaras_pb:        Optional[int]     = 0
    banos:               Optional[Decimal] = Decimal("0.0")
    niveles:             Optional[int]     = 1
    estacionamientos:    Optional[int]     = 0
    antiguedad:          Optional[int]     = None
    orientacion:         Optional[str]     = Field(None, max_length=50)
    estado_conservacion: Optional[str]     = Field(None, max_length=50)
    remodelada:          Optional[bool]    = False
    anio_construccion:   Optional[int]     = None

    # Legal
    escrituras:             Optional[bool] = False
    regimen:                Optional[str]  = Field(None, max_length=100)
    libre_gravamen:         Optional[bool] = False
    predial:                Optional[bool] = False
    adeudos:                Optional[bool] = False
    hipoteca_vigente:       Optional[bool] = False
    documentacion_completa: Optional[bool] = False

    # Perfil ideal (para matching)
    ingreso_recomendado: Optional[Decimal] = None
    tipo_credito_ideal:  Optional[str]     = Field(None, max_length=100)
    estado_civil_ideal:  Optional[str]     = Field(None, max_length=50)
    genero_ideal:        Optional[str]     = Field(None, max_length=50)
    hijos_ideal:         Optional[int]     = None
    mascotas_ideal:      Optional[int]     = None
    integrantes_ideal:   Optional[int]     = None
    ideal_para:          Optional[str]     = None  # JSON array
    amenidades:          Optional[str]     = None  # JSON array
    servicios:           Optional[str]     = None  # JSON array
    uso_suelo:           Optional[str]     = Field(None, max_length=50)

    # Scores
    score_atractivo:      Optional[Decimal] = None
    score_compatibilidad: Optional[Decimal] = None


class PropiedadCreate(PropiedadBase):
    pass


class PropiedadUpdate(BaseModel):
    """Todos los campos opcionales para actualizaciones parciales."""
    titulo:          Optional[str]     = Field(None, max_length=200)
    descripcion:     Optional[str]     = None
    tipo:            Optional[str]     = Field(None, max_length=50)
    tipo_operacion:  Optional[str]     = Field(None, max_length=20)
    status:          Optional[str]     = Field(None, max_length=20)
    id_asesor:       Optional[int]     = None
    propietario_nombre:   Optional[str] = Field(None, max_length=200)
    propietario_whatsapp: Optional[str] = Field(None, max_length=20)
    pais:            Optional[str]     = Field(None, max_length=100)
    estado:          Optional[str]     = Field(None, max_length=100)
    municipio:       Optional[str]     = Field(None, max_length=100)
    ciudad:          Optional[str]     = Field(None, max_length=100)
    colonia:         Optional[str]     = Field(None, max_length=100)
    fraccionamiento: Optional[str]     = Field(None, max_length=100)
    codigo_postal:   Optional[str]     = Field(None, max_length=10)
    precio:              Optional[Decimal] = None
    precio_negociable:   Optional[bool]    = None
    creditos_aceptados:  Optional[str]     = None
    comision:            Optional[Decimal] = None
    comision_compartida: Optional[Decimal] = None
    exclusiva:           Optional[bool]    = None
    fecha_captacion:     Optional[date]    = None
    fecha_publicacion:   Optional[date]    = None
    m2_construccion:     Optional[Decimal] = None
    m2_terreno:          Optional[Decimal] = None
    frente:              Optional[Decimal] = None
    fondo:               Optional[Decimal] = None
    recamaras:           Optional[int]     = None
    recamaras_pb:        Optional[int]     = None
    banos:               Optional[Decimal] = None
    niveles:             Optional[int]     = None
    estacionamientos:    Optional[int]     = None
    antiguedad:          Optional[int]     = None
    orientacion:         Optional[str]     = Field(None, max_length=50)
    estado_conservacion: Optional[str]     = Field(None, max_length=50)
    remodelada:          Optional[bool]    = None
    anio_construccion:   Optional[int]     = None
    escrituras:             Optional[bool] = None
    regimen:                Optional[str]  = Field(None, max_length=100)
    libre_gravamen:         Optional[bool] = None
    predial:                Optional[bool] = None
    adeudos:                Optional[bool] = None
    hipoteca_vigente:       Optional[bool] = None
    documentacion_completa: Optional[bool] = None
    ingreso_recomendado: Optional[Decimal] = None
    tipo_credito_ideal:  Optional[str]     = Field(None, max_length=100)
    estado_civil_ideal:  Optional[str]     = Field(None, max_length=50)
    genero_ideal:        Optional[str]     = Field(None, max_length=50)
    hijos_ideal:         Optional[int]     = None
    mascotas_ideal:      Optional[int]     = None
    integrantes_ideal:   Optional[int]     = None
    ideal_para:          Optional[str]     = None
    amenidades:          Optional[str]     = None
    servicios:           Optional[str]     = None
    uso_suelo:           Optional[str]     = Field(None, max_length=50)


class PropiedadResponse(PropiedadBase):
    id_propiedad: int
    fecha_registro: datetime

    class Config:
        from_attributes = True


# --- Propiedad Multimedia ---

class PropiedadMultimediaBase(BaseModel):
    tipo: str = Field(..., max_length=20)
    url: str
    nombre: Optional[str] = Field(None, max_length=255)
    descripcion: Optional[str] = Field(None, max_length=500)
    es_principal: Optional[bool] = False
    orden: Optional[int] = 0

class PropiedadMultimediaCreate(PropiedadMultimediaBase):
    pass

class PropiedadMultimediaResponse(PropiedadMultimediaBase):
    id_media: int
    id_propiedad: int
    fecha_subida: datetime

    class Config:
        from_attributes = True


# ── Leads ───────────────────────────────────────────

class LeadBase(BaseModel):
    id_cliente: Optional[int] = None
    
    # Dato Único
    referenciado: Optional[str] = Field(None, max_length=255)
    
    # Personal
    nombre: str = Field(..., max_length=100)
    apellido_paterno: str
    apellido_materno: Optional[str] = None
    fecha_nacimiento: Optional[int] = None
    edad: Optional[int] = None
    estado_civil: Optional[str] = Field(None, max_length=50)
    
    # Contacto
    whatsapp: Optional[str] = Field(None, max_length=20)
    correo: Optional[str] = Field(None, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)
    
    # Laboral
    ingreso_mes: Optional[Decimal] = None
    nombre_empresa: Optional[str] = Field(None, max_length=200)
    antiguedad_laboral: Optional[str] = Field(None, max_length=100)
    tipo_credito: Optional[str] = Field(None, max_length=100)
    
    # Datos familiares
    conyuge: Optional[str] = Field(None, max_length=200)
    conyuge_whatsapp: Optional[str] = Field(None, max_length=20)
    hijos: Optional[str] = Field(None, max_length=255)
    mascotas: Optional[str] = Field(None, max_length=255)
    integrantes_hogar: Optional[int] = None
    
    # Inmobiliaria
    operacion: Optional[str] = Field(None, max_length=50)
    tipo_propiedad: Optional[str] = Field(None, max_length=100)
    estado: Optional[str] = Field(None, max_length=100)
    ciudad: Optional[str] = Field(None, max_length=100)
    fraccionamiento_colonia: Optional[str] = Field(None, max_length=200)
    habitaciones_pa: Optional[int] = None
    habitaciones_pb: Optional[int] = None
    amenidades_deseadas: Optional[str] = None
    banos: Optional[Decimal] = Decimal("0.0")
    estacionamiento: Optional[int] = 0
    m2_terreno: Optional[Decimal] = Decimal("0.00")
    jardin: Optional[str] = Field(None, max_length=100)
    alberca: Optional[str] = Field(None, max_length=100)
    
    # Metadatos del lead
    id_propiedad: Optional[int] = None
    id_asesor: Optional[int] = None
    etapa: Optional[str] = Field("nuevo", max_length=50)
    origen: Optional[str] = Field(None, max_length=100)
    fuente: Optional[str] = Field(None, max_length=100)
    valor_cierre: Optional[Decimal] = None
    comision_cierre: Optional[Decimal] = None
    notas: Optional[str] = None
    
    # Dinámicos
    campos_adicionales: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    id_cliente: Optional[int] = None
    referenciado: Optional[str] = Field(None, max_length=255)
    nombre: Optional[str] = Field(None, max_length=100)
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    fecha_nacimiento: Optional[int] = None
    edad: Optional[int] = None
    estado_civil: Optional[str] = Field(None, max_length=50)
    whatsapp: Optional[str] = Field(None, max_length=20)
    correo: Optional[str] = Field(None, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)
    ingreso_mes: Optional[Decimal] = None
    nombre_empresa: Optional[str] = Field(None, max_length=200)
    antiguedad_laboral: Optional[str] = Field(None, max_length=100)
    tipo_credito: Optional[str] = Field(None, max_length=100)
    conyuge: Optional[str] = Field(None, max_length=200)
    conyuge_whatsapp: Optional[str] = Field(None, max_length=20)
    hijos: Optional[str] = Field(None, max_length=255)
    mascotas: Optional[str] = Field(None, max_length=255)
    integrantes_hogar: Optional[int] = None
    operacion: Optional[str] = Field(None, max_length=50)
    tipo_propiedad: Optional[str] = Field(None, max_length=100)
    estado: Optional[str] = Field(None, max_length=100)
    ciudad: Optional[str] = Field(None, max_length=100)
    fraccionamiento_colonia: Optional[str] = Field(None, max_length=200)
    habitaciones_pa: Optional[int] = None
    habitaciones_pb: Optional[int] = None
    amenidades_deseadas: Optional[str] = None
    banos: Optional[Decimal] = None
    estacionamiento: Optional[int] = None
    m2_terreno: Optional[Decimal] = None
    jardin: Optional[str] = Field(None, max_length=100)
    alberca: Optional[str] = Field(None, max_length=100)
    id_propiedad: Optional[int] = None
    id_asesor: Optional[int] = None
    etapa: Optional[str] = Field(None, max_length=50)
    origen: Optional[str] = Field(None, max_length=100)
    fuente: Optional[str] = Field(None, max_length=100)
    valor_cierre: Optional[Decimal] = None
    comision_cierre: Optional[Decimal] = None
    notas: Optional[str] = None
    campos_adicionales: Optional[str] = None

class LeadResponse(LeadBase):
    id_lead: int
    fecha_registro: datetime
    fecha_actualizacion: datetime

    class Config:
        from_attributes = True


# ── Relaciones CNA ──────────────────────────────────

class RelacionClienteBase(BaseModel):
    cliente_origen_id: int
    cliente_destino_id: int
    tipo_relacion: str = Field(..., max_length=50) # FAMILIAR, REFERENCIA, PROFESIONAL, GEOGRAFICA
    peso: Optional[Decimal] = Decimal("1.00")

class RelacionClienteCreate(RelacionClienteBase):
    pass

class RelacionClienteResponse(RelacionClienteBase):
    id_relacion: int
    fecha_relacion: datetime

    class Config:
        from_attributes = True


class RelacionAsesorBase(BaseModel):
    asesor_origen_id: int
    asesor_destino_id: int
    tipo_relacion: str = Field(..., max_length=50)
    peso: Optional[Decimal] = Decimal("1.00")

class RelacionAsesorCreate(RelacionAsesorBase):
    pass

class RelacionAsesorResponse(RelacionAsesorBase):
    id_relacion: int
    fecha_relacion: datetime

    class Config:
        from_attributes = True
