from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# --- Esquemas Base para Expediente ---

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

class ClienteHistorialResponse(BaseModel):
    id_historial: int
    id_cliente: int
    fecha: datetime
    usuario: Optional[str] = None
    accion: str = Field(..., max_length=100)
    descripcion: Optional[str] = None
    class Config:
        from_attributes = True


# --- Esquemas para Cliente ---

class ClienteBase(BaseModel):
    nombre: str = Field(..., max_length=100)
    apellido_paterno: str = Field(..., max_length=100)
    apellido_materno: Optional[str] = Field(None, max_length=100)
    genero: Optional[str] = Field(None, max_length=50)
    estado_civil: Optional[str] = Field(None, max_length=50)
    fecha_nacimiento: Optional[str] = Field(None, max_length=20)
    edad: Optional[int] = None
    curp: Optional[str] = Field(None, max_length=18)
    rfc: Optional[str] = Field(None, max_length=13)
    
    telefono_principal: Optional[str] = Field(None, max_length=20)
    whatsapp: Optional[str] = Field(None, max_length=20)
    correo: Optional[str] = Field(None, max_length=100)
    direccion: Optional[str] = None
    
    id_asesor: Optional[int] = None
    estado_cliente: Optional[str] = Field("nuevo", max_length=50)
    origen: Optional[str] = Field(None, max_length=100)
    canal_captacion: Optional[str] = Field(None, max_length=100)
    
    hijos: Optional[str] = Field(None, max_length=255)
    ocupacion: Optional[str] = Field(None, max_length=100)
    empresa: Optional[str] = Field(None, max_length=200)
    ingresos: Optional[float] = None

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    nombre: Optional[str] = Field(None, max_length=100)
    apellido_paterno: Optional[str] = Field(None, max_length=100)
    apellido_materno: Optional[str] = Field(None, max_length=100)
    genero: Optional[str] = Field(None, max_length=50)
    estado_civil: Optional[str] = Field(None, max_length=50)
    fecha_nacimiento: Optional[str] = Field(None, max_length=20)
    edad: Optional[int] = None
    curp: Optional[str] = Field(None, max_length=18)
    rfc: Optional[str] = Field(None, max_length=13)
    
    telefono_principal: Optional[str] = Field(None, max_length=20)
    whatsapp: Optional[str] = Field(None, max_length=20)
    correo: Optional[str] = Field(None, max_length=100)
    direccion: Optional[str] = None
    
    id_asesor: Optional[int] = None
    estado_cliente: Optional[str] = Field(None, max_length=50)
    origen: Optional[str] = Field(None, max_length=100)
    canal_captacion: Optional[str] = Field(None, max_length=100)
    
    hijos: Optional[str] = Field(None, max_length=255)
    ocupacion: Optional[str] = Field(None, max_length=100)
    empresa: Optional[str] = Field(None, max_length=200)
    ingresos: Optional[float] = None

class ClienteResponse(ClienteBase):
    id_cliente: int
    fecha_registro: datetime
    class Config:
        from_attributes = True

class ExpedienteResponse(ClienteResponse):
    actividades: List[ClienteActividadResponse] = []
    documentos: List[ClienteDocumentoResponse] = []
    notas: List[ClienteNotaResponse] = []
    historial: List[ClienteHistorialResponse] = []
