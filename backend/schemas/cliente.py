import re
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List, Any
from decimal import Decimal
from datetime import datetime, date

# ── Regex de validación ──────────────────────────────────────────────────────
_RE_CURP  = re.compile(r'^[A-Z]{1}[AEIOU]{1}[A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM]{1}(AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}\d{1}$', re.IGNORECASE)
_RE_RFC   = re.compile(r'^[A-ZÑ&]{3,4}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[A-Z0-9]{3}$', re.IGNORECASE)
_RE_EMAIL = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')
_RE_WA    = re.compile(r'^\+?[1-9]\d{7,14}$')


# ── Actividades ───────────────────────────────────────────────────────────────

class ClienteActividadBase(BaseModel):
    tipo: str = Field(..., max_length=50)
    descripcion: Optional[str] = None
    id_asesor: Optional[int] = None

class ClienteActividadCreate(ClienteActividadBase):
    pass

class ClienteActividadResponse(ClienteActividadBase):
    id_actividad: int
    id_cliente: int
    fecha: datetime
    class Config:
        from_attributes = True


# ── Documentos ────────────────────────────────────────────────────────────────

class ClienteDocumentoBase(BaseModel):
    nombre_archivo: str = Field(..., max_length=255)
    tipo_documento: Optional[str] = Field(None, max_length=100)
    url: str

class ClienteDocumentoCreate(ClienteDocumentoBase):
    pass

class ClienteDocumentoResponse(ClienteDocumentoBase):
    id_documento: int
    id_cliente: int
    fecha_subida: datetime
    class Config:
        from_attributes = True


# ── Notas ─────────────────────────────────────────────────────────────────────

class ClienteNotaBase(BaseModel):
    contenido: str

class ClienteNotaCreate(ClienteNotaBase):
    pass

class ClienteNotaResponse(ClienteNotaBase):
    id_nota: int
    id_cliente: int
    fecha: datetime
    class Config:
        from_attributes = True


# ── Historial ─────────────────────────────────────────────────────────────────

class ClienteHistorialResponse(BaseModel):
    id_historial: int
    id_cliente: int
    fecha: datetime
    usuario: Optional[str] = None
    accion: str = Field(..., max_length=100)
    descripcion: Optional[str] = None
    campo: Optional[str] = None
    valor_anterior: Optional[str] = None
    valor_nuevo: Optional[str] = None
    class Config:
        from_attributes = True


# ── Cliente Base ──────────────────────────────────────────────────────────────

class ClienteBase(BaseModel):

    # ── Identificación ────────────────────────────────────────────────────────
    nombre:              str            = Field(..., max_length=100)
    apellido_paterno:    str            = Field(..., max_length=100)
    apellido_materno:    Optional[str]  = Field(None, max_length=100)
    curp:                Optional[str]  = Field(None, max_length=18)
    rfc:                 Optional[str]  = Field(None, max_length=13)
    fecha_nacimiento:    Optional[str]  = Field(None, max_length=20, description="YYYY-MM-DD")
    edad:                Optional[int]  = Field(None, ge=0, le=120, description="Calculado automáticamente")
    generacion:          Optional[str]  = Field(None, max_length=50,  description="Calculado automáticamente")
    genero:              Optional[str]  = Field(None, max_length=50)
    estado_civil:        Optional[str]  = Field(None, max_length=50)
    nacionalidad:        Optional[str]  = Field(None, max_length=100)

    # ── Contacto ──────────────────────────────────────────────────────────────
    telefono_principal:  Optional[str]  = Field(None, max_length=20)
    whatsapp:            Optional[str]  = Field(None, max_length=20)
    lada:                Optional[str]  = Field(None, max_length=10, description="Calculado automáticamente")
    correo:              Optional[str]  = Field(None, max_length=100)

    # ── Ubicación ─────────────────────────────────────────────────────────────
    pais:                Optional[str]  = Field("MX", max_length=100)
    estado:              Optional[str]  = Field(None, max_length=100)
    municipio:           Optional[str]  = Field(None, max_length=100)
    colonia:             Optional[str]  = Field(None, max_length=100)
    codigo_postal:       Optional[str]  = Field(None, max_length=10)
    fraccionamiento:     Optional[str]  = Field(None, max_length=100)
    direccion:           Optional[str]  = None

    # ── Perfil Demográfico ────────────────────────────────────────────────────
    profesion:           Optional[str]  = Field(None, max_length=100)
    puesto:              Optional[str]  = Field(None, max_length=100)
    escolaridad:         Optional[str]  = Field(None, max_length=50)

    # ── Perfil Familiar ───────────────────────────────────────────────────────
    conyuge:             Optional[str]  = Field(None, max_length=200)
    conyuge_whatsapp:    Optional[str]  = Field(None, max_length=20)
    hijos:               Optional[int]  = Field(None, ge=0)
    mascotas:            Optional[int]  = Field(None, ge=0)
    integrantes_hogar:   Optional[int]  = Field(None, ge=0)
    dependientes_eco:    Optional[int]  = Field(None, ge=0)
    adultos_mayores_cargo: Optional[int] = Field(None, ge=0)

    # ── Perfil Financiero ─────────────────────────────────────────────────────
    nombre_empresa:        Optional[str]     = Field(None, max_length=200)
    ocupacion:             Optional[str]     = Field(None, max_length=100)
    antiguedad_laboral:    Optional[str]     = Field(None, max_length=100)
    ingreso_mensual:       Optional[Decimal] = Field(None, ge=0)
    tipo_credito:          Optional[str]     = Field(None, max_length=100)
    presupuesto_min:       Optional[Decimal] = Field(None, ge=0)
    presupuesto_max:       Optional[Decimal] = Field(None, ge=0)
    enganche_disponible:   Optional[Decimal] = Field(None, ge=0)
    pago_mensual_objetivo: Optional[Decimal] = Field(None, ge=0)
    capacidad_credito_max: Optional[Decimal] = Field(None, ge=0)

    # ── Preferencias del Inmueble ─────────────────────────────────────────────
    operacion:               Optional[str]     = Field(None, max_length=50)
    tipo_propiedad:          Optional[str]     = Field(None, max_length=100)
    estado_busqueda:         Optional[str]     = Field(None, max_length=100)
    ciudad_busqueda:         Optional[str]     = Field(None, max_length=100)
    fraccionamiento_colonia: Optional[str]     = Field(None, max_length=200)
    habitaciones_pa:         Optional[int]     = Field(None, ge=0)
    habitaciones_pb:         Optional[int]     = Field(None, ge=0)
    banos:                   Optional[Decimal] = Field(None, ge=0)
    estacionamiento:         Optional[int]     = Field(None, ge=0)
    m2_terreno_min:          Optional[Decimal] = Field(None, ge=0)
    m2_terreno_max:          Optional[Decimal] = Field(None, ge=0)
    m2_construccion_min:     Optional[Decimal] = Field(None, ge=0)
    m2_construccion_max:     Optional[Decimal] = Field(None, ge=0)
    niveles_max:             Optional[int]     = Field(None, ge=1)
    antiguedad_max:          Optional[int]     = Field(None, ge=0)
    amenidades_deseadas:     Optional[str]     = None  # JSON array como string

    # ── Motivación y Temporalidad ─────────────────────────────────────────────
    motivacion:              Optional[str]     = Field(None, max_length=100)
    temporalidad:            Optional[str]     = Field(None, max_length=50)

    # ── Seguimiento Comercial ─────────────────────────────────────────────────
    id_asesor:               Optional[int]     = None
    estado_cliente:          Optional[str]     = Field("nuevo", max_length=50)
    referenciado:            Optional[str]     = Field(None, max_length=255)
    fuente_lead:             Optional[str]     = Field(None, max_length=100)
    campana:                 Optional[str]     = Field(None, max_length=200)
    medio_adquisicion:       Optional[str]     = Field(None, max_length=100)
    utm_source:              Optional[str]     = Field(None, max_length=200)
    utm_medium:              Optional[str]     = Field(None, max_length=100)
    utm_campaign:            Optional[str]     = Field(None, max_length=200)
    origen:                  Optional[str]     = Field(None, max_length=100)
    canal_captacion:         Optional[str]     = Field(None, max_length=100)

    # ── Scores (solo lectura, calculados por el sistema) ─────────────────────
    score_cna:               Optional[Decimal] = None
    score_compatibilidad:    Optional[Decimal] = None

    # ── Validaciones ─────────────────────────────────────────────────────────

    @field_validator("curp")
    @classmethod
    def validar_curp(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        v_clean = v.strip().upper()
        if not _RE_CURP.match(v_clean):
            raise ValueError("CURP inválido. Verifica el formato (18 caracteres).")
        return v_clean

    @field_validator("rfc")
    @classmethod
    def validar_rfc(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        v_clean = v.strip().upper()
        if not _RE_RFC.match(v_clean):
            raise ValueError("RFC inválido. Verifica el formato (12–13 caracteres).")
        return v_clean

    @field_validator("correo")
    @classmethod
    def validar_correo(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        v_clean = v.strip().lower()
        if not _RE_EMAIL.match(v_clean):
            raise ValueError("Correo electrónico inválido.")
        return v_clean

    @field_validator("whatsapp", "conyuge_whatsapp")
    @classmethod
    def validar_whatsapp(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        v_clean = v.replace(" ", "")
        if not _RE_WA.match(v_clean):
            raise ValueError("Número de WhatsApp inválido. Incluye la lada (ej. +521XXXXXXXXXX).")
        return v

    @model_validator(mode="after")
    def validar_presupuesto(self) -> "ClienteBase":
        pmin = self.presupuesto_min
        pmax = self.presupuesto_max
        if pmin is not None and pmax is not None and pmin > pmax:
            raise ValueError("El presupuesto mínimo no puede ser mayor al presupuesto máximo.")
        return self

    @model_validator(mode="after")
    def validar_terreno(self) -> "ClienteBase":
        tmin = self.m2_terreno_min
        tmax = self.m2_terreno_max
        if tmin is not None and tmax is not None and tmin > tmax:
            raise ValueError("El terreno mínimo no puede ser mayor al terreno máximo.")
        return self

    @model_validator(mode="after")
    def validar_construccion(self) -> "ClienteBase":
        cmin = self.m2_construccion_min
        cmax = self.m2_construccion_max
        if cmin is not None and cmax is not None and cmin > cmax:
            raise ValueError("La construcción mínima no puede ser mayor a la construcción máxima.")
        return self


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    """Todos los campos son opcionales para PATCH parcial."""
    nombre:              Optional[str]     = Field(None, max_length=100)
    apellido_paterno:    Optional[str]     = Field(None, max_length=100)
    apellido_materno:    Optional[str]     = Field(None, max_length=100)
    curp:                Optional[str]     = Field(None, max_length=18)
    rfc:                 Optional[str]     = Field(None, max_length=13)
    fecha_nacimiento:    Optional[str]     = Field(None, max_length=20)
    edad:                Optional[int]     = None
    generacion:          Optional[str]     = Field(None, max_length=50)
    genero:              Optional[str]     = Field(None, max_length=50)
    estado_civil:        Optional[str]     = Field(None, max_length=50)
    nacionalidad:        Optional[str]     = Field(None, max_length=100)
    telefono_principal:  Optional[str]     = Field(None, max_length=20)
    whatsapp:            Optional[str]     = Field(None, max_length=20)
    lada:                Optional[str]     = Field(None, max_length=10)
    correo:              Optional[str]     = Field(None, max_length=100)
    pais:                Optional[str]     = Field(None, max_length=100)
    estado:              Optional[str]     = Field(None, max_length=100)
    municipio:           Optional[str]     = Field(None, max_length=100)
    colonia:             Optional[str]     = Field(None, max_length=100)
    codigo_postal:       Optional[str]     = Field(None, max_length=10)
    fraccionamiento:     Optional[str]     = Field(None, max_length=100)
    direccion:           Optional[str]     = None
    profesion:           Optional[str]     = Field(None, max_length=100)
    puesto:              Optional[str]     = Field(None, max_length=100)
    escolaridad:         Optional[str]     = Field(None, max_length=50)
    conyuge:             Optional[str]     = Field(None, max_length=200)
    conyuge_whatsapp:    Optional[str]     = Field(None, max_length=20)
    hijos:               Optional[int]     = None
    mascotas:            Optional[int]     = None
    integrantes_hogar:   Optional[int]     = None
    dependientes_eco:    Optional[int]     = None
    adultos_mayores_cargo: Optional[int]   = None
    nombre_empresa:      Optional[str]     = Field(None, max_length=200)
    ocupacion:           Optional[str]     = Field(None, max_length=100)
    antiguedad_laboral:  Optional[str]     = Field(None, max_length=100)
    ingreso_mensual:     Optional[Decimal] = None
    tipo_credito:        Optional[str]     = Field(None, max_length=100)
    presupuesto_min:     Optional[Decimal] = None
    presupuesto_max:     Optional[Decimal] = None
    enganche_disponible: Optional[Decimal] = None
    pago_mensual_objetivo: Optional[Decimal] = None
    capacidad_credito_max: Optional[Decimal] = None
    operacion:               Optional[str]     = Field(None, max_length=50)
    tipo_propiedad:          Optional[str]     = Field(None, max_length=100)
    estado_busqueda:         Optional[str]     = Field(None, max_length=100)
    ciudad_busqueda:         Optional[str]     = Field(None, max_length=100)
    fraccionamiento_colonia: Optional[str]     = Field(None, max_length=200)
    habitaciones_pa:         Optional[int]     = None
    habitaciones_pb:         Optional[int]     = None
    banos:                   Optional[Decimal] = None
    estacionamiento:         Optional[int]     = None
    m2_terreno_min:          Optional[Decimal] = None
    m2_terreno_max:          Optional[Decimal] = None
    m2_construccion_min:     Optional[Decimal] = None
    m2_construccion_max:     Optional[Decimal] = None
    niveles_max:             Optional[int]     = None
    antiguedad_max:          Optional[int]     = None
    amenidades_deseadas:     Optional[str]     = None
    motivacion:              Optional[str]     = Field(None, max_length=100)
    temporalidad:            Optional[str]     = Field(None, max_length=50)
    id_asesor:               Optional[int]     = None
    estado_cliente:          Optional[str]     = Field(None, max_length=50)
    referenciado:            Optional[str]     = Field(None, max_length=255)
    fuente_lead:             Optional[str]     = Field(None, max_length=100)
    campana:                 Optional[str]     = Field(None, max_length=200)
    medio_adquisicion:       Optional[str]     = Field(None, max_length=100)
    utm_source:              Optional[str]     = Field(None, max_length=200)
    utm_medium:              Optional[str]     = Field(None, max_length=100)
    utm_campaign:            Optional[str]     = Field(None, max_length=200)
    origen:                  Optional[str]     = Field(None, max_length=100)
    canal_captacion:         Optional[str]     = Field(None, max_length=100)

    @field_validator("curp")
    @classmethod
    def validar_curp(cls, v):
        if not v or not v.strip():
            return None
        v_clean = v.strip().upper()
        if not _RE_CURP.match(v_clean):
            raise ValueError("CURP inválido.")
        return v_clean

    @field_validator("rfc")
    @classmethod
    def validar_rfc(cls, v):
        if not v or not v.strip():
            return None
        v_clean = v.strip().upper()
        if not _RE_RFC.match(v_clean):
            raise ValueError("RFC inválido.")
        return v_clean

    @field_validator("correo")
    @classmethod
    def validar_correo(cls, v):
        if not v or not v.strip():
            return None
        v_clean = v.strip().lower()
        if not _RE_EMAIL.match(v_clean):
            raise ValueError("Correo inválido.")
        return v_clean

    @field_validator("whatsapp")
    @classmethod
    def validar_whatsapp(cls, v):
        if not v or not v.strip():
            return None
        v_clean = v.replace(" ", "")
        if not _RE_WA.match(v_clean):
            raise ValueError("WhatsApp inválido.")
        return v


class ClienteResponse(ClienteBase):
    id_cliente: int
    fecha_registro: datetime
    # Sobreescribir edad sin restricciones ge/le para tolerar datos históricos
    # corruptos en la BD (ej. edad=1510 por fecha '0516-05-15').
    # Un field_validator sanea el valor a None si está fuera del rango válido.
    edad: Optional[int] = Field(None, description="Calculado automáticamente")

    @field_validator("edad", mode="before")
    @classmethod
    def sanear_edad_respuesta(cls, v: Optional[int]) -> Optional[int]:
        if v is None:
            return None
        try:
            v_int = int(v)
        except (TypeError, ValueError):
            return None
        return v_int if 0 <= v_int <= 120 else None

    class Config:
        from_attributes = True


class ExpedienteResponse(ClienteResponse):
    actividades: List[ClienteActividadResponse] = []
    documentos:  List[ClienteDocumentoResponse] = []
    notas:       List[ClienteNotaResponse]      = []
    historial:   List[ClienteHistorialResponse] = []
