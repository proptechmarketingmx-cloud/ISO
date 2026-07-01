# Especificación de Formularios CRM Inmobiliario v2.0

Este documento especifica de manera exhaustiva todos los campos que componen los formularios de **Clientes** y **Propiedades** de la plataforma ISO, detallando su tipo de datos, su participación en el **CNA (Customer Needs Analysis)**, y si constituyen dimensiones analíticas (**KPI**).

---

## 1. Formulario de Clientes (Expediente Único)

El expediente único de clientes recopila información distribuida en 8 dimensiones lógicas para habilitar el perfilado integral y la compatibilidad con propiedades.

| Dimensión | Campo | Tipo | Catálogo Origen / Formato | CNA | KPI |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Identificación** | ID Cliente | Sistema | Autoincrementable | | |
| | Nombre | Texto | Captura libre | ✓ | |
| | Apellido Paterno | Texto | Captura libre | ✓ | |
| | Apellido Materno | Texto | Captura libre | ✓ | |
| | Fecha de Nacimiento | Fecha | `YYYY-MM-DD` | | |
| | Edad | Número | Calculado automáticamente | | ✓ |
| | Generación | Catálogo | Calculado (Baby Boomer, X, Millennial, Z, Alpha) | | ✓ |
| | Género | Catálogo | `CATALOGOS.generos` | | ✓ |
| | Estado Civil | Catálogo | `CATALOGOS.estadosCiviles` | | ✓ |
| | Nacionalidad | Texto | Captura libre | | |
| | CURP | Texto | Regex (18 caracteres) | ✓ | |
| | RFC | Texto | Regex (13 caracteres) | ✓ | |
| **Contacto** | Teléfono Principal | Texto | Formato numérico | | |
| | WhatsApp | Texto | Regex + Formato numérico | ✓ | |
| | Lada Internacional | Texto | Inferred automatically (ej. `+52`) | | ✓ |
| | Correo Electrónico | Texto | Formato de email | ✓ | |
| | País | Catálogo | `CATALOGOS.paises` | | ✓ |
| | Estado | Catálogo | `CATALOGOS.estados` | | ✓ |
| | Municipio | Texto | Captura libre | | ✓ |
| | Colonia | Texto | Captura libre | | ✓ |
| | Fraccionamiento | Texto | Captura libre | | ✓ |
| | Código Postal | Texto | 5 dígitos | | |
| | Dirección Física | Texto | Libre | | |
| **Demografía** | Profesión | Texto | Captura libre | | |
| | Puesto / Cargo | Texto | Captura libre | | |
| | Escolaridad | Catálogo | `CATALOGOS.escolaridades` | | ✓ |
| **Familiar** | Cónyuge | Texto | Captura libre | | |
| | WhatsApp Cónyuge | Texto | Formato numérico | | |
| | Hijos | Número | Cantidad | ✓ | ✓ |
| | Mascotas | Número | Cantidad | ✓ | ✓ |
| | Integrantes Hogar | Número | Cantidad | ✓ | ✓ |
| | Dependientes Económicos | Número | Cantidad | ✓ | |
| | Adultos Mayores a Cargo | Número | Cantidad | ✓ | |
| **Financiero** | Empresa | Texto | Captura libre | | |
| | Ocupación | Texto | Captura libre | | |
| | Antigüedad Laboral | Texto | Captura libre | | |
| | Ingreso Mensual | Moneda | Decimal | | ✓ |
| | Tipo de Crédito | Catálogo | `CATALOGOS.tiposCredito` | | ✓ |
| | Presupuesto Mínimo | Moneda | Decimal | | ✓ |
| | Presupuesto Máximo | Moneda | Decimal | | ✓ |
| | Enganche Disponible | Moneda | Decimal | | |
| | Pago Mensual Objetivo | Moneda | Decimal | | |
| | Capacidad Máxima de Crédito | Moneda | Decimal | | |
| **Necesidad** | Operación | Catálogo | `CATALOGOS.operaciones` | | ✓ |
| | Tipo de Propiedad | Catálogo | `CATALOGOS.tiposPropiedad` | | ✓ |
| | Estado (Búsqueda) | Catálogo | `CATALOGOS.estados` | | ✓ |
| | Ciudad (Búsqueda) | Texto | Captura libre | | ✓ |
| | Zonas Deseadas | Texto | Captura libre | | ✓ |
| | Recámaras PA Mínimas | Número | Cantidad | | ✓ |
| | Recámaras PB Mínimas | Número | Cantidad | | ✓ |
| | Baños Mínimos | Número | Cantidad (con medios baños) | | ✓ |
| | Estacionamientos Mínimos | Número | Cantidad | | ✓ |
| | Terreno Mínimo (m²) | Número | Decimal | | ✓ |
| | Terreno Máximo (m²) | Número | Decimal | | ✓ |
| | Construcción Mínima (m²) | Número | Decimal | | ✓ |
| | Construcción Máxima (m²) | Número | Decimal | | ✓ |
| | Niveles Máximos | Número | Cantidad | | ✓ |
| | Antigüedad Máxima | Número | Años | | ✓ |
| | Motivación | Catálogo | `CATALOGOS.motivaciones` | | ✓ |
| | Amenidades Deseadas | Catálogo Múltiple| `CATALOGOS.amenidades` (JSON string) | | ✓ |
| **Seguimiento** | Asesor Comercial | Catálogo | ID de Asesor | | ✓ |
| | Estatus del Lead | Catálogo | nuevo, contactado, cotizacion, negociacion, cerrado, perdido | | ✓ |
| | Temporalidad de Compra | Catálogo | `CATALOGOS.temporalidades` | | ✓ |
| | Referenciado por | Texto | Captura libre | | ✓ |
| | Origen / Fuente | Catálogo | `CATALOGOS.fuentesLead` | | ✓ |
| | Campaña | Texto | Captura libre | | ✓ |
| | Medio de Adquisición | Catálogo | `CATALOGOS.mediosAdquisicion` | | ✓ |
| | UTM Source | Texto | UTM Tracking | | ✓ |
| | UTM Medium | Texto | UTM Tracking | | ✓ |
| | UTM Campaign | Texto | UTM Tracking | | ✓ |
| **Scores** | Score CNA | Decimal | Calculado automáticamente | | ✓ |
| | Score Compatibilidad | Decimal | Calculado automáticamente | | ✓ |

---

## 2. Formulario de Propiedades

El inventario de propiedades almacena detalles estructurados para el motor de matching y reportes analíticos de inventario.

| Dimensión | Campo | Tipo | Catálogo Origen / Formato | CNA | KPI |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **General** | ID Propiedad | Sistema | Autoincrementable | ✓ | |
| | Título | Texto | Captura libre | | |
| | Descripción | Texto | Captura libre | | |
| | Tipo de Propiedad | Catálogo | `CATALOGOS.tiposPropiedad` | | ✓ |
| | Operación | Catálogo | `CATALOGOS.operaciones` (Venta, Renta, Preventa) | | ✓ |
| | Estatus | Catálogo | `CATALOGOS.estatusPropiedad` | | ✓ |
| | Asesor Responsable | Catálogo | ID de Asesor | | ✓ |
| **Propietario**| Nombre Propietario | Texto | Captura libre | | |
| | WhatsApp Propietario | Texto | Formato numérico | | |
| **Ubicación** | País | Catálogo | `CATALOGOS.paises` | | ✓ |
| | Estado | Catálogo | `CATALOGOS.estados` | | ✓ |
| | Municipio | Texto | Captura libre | | ✓ |
| | Ciudad | Texto | Captura libre | | ✓ |
| | Colonia | Texto | Captura libre | | ✓ |
| | Fraccionamiento | Texto | Captura libre | | ✓ |
| | Código Postal | Texto | 5 dígitos | | |
| **Comercial** | Precio | Moneda | Decimal | | ✓ |
| | Precio Negociable | Sí/No | Booleano | | ✓ |
| | Comisión | Porcentaje | Decimal | | ✓ |
| | Comisión Compartida | Porcentaje | Decimal | | ✓ |
| | Exclusiva | Sí/No | Booleano | | ✓ |
| | Fecha de Captación | Fecha | `YYYY-MM-DD` | | ✓ |
| | Fecha de Publicación | Fecha | `YYYY-MM-DD` | | ✓ |
| | Créditos Aceptados | Catálogo Múltiple| `CATALOGOS.tiposCredito` (JSON string) | | ✓ |
| **Física** | m² Construcción | Número | Decimal | | ✓ |
| | m² Terreno | Número | Decimal | | ✓ |
| | Frente (m) | Número | Decimal | | |
| | Fondo (m) | Número | Decimal | | |
| | Recámaras (Total) | Número | Cantidad | | ✓ |
| | Recámaras en PB | Número | Cantidad | | ✓ |
| | Baños | Número | Decimal | | ✓ |
| | Niveles / Pisos | Número | Cantidad | | ✓ |
| | Estacionamientos | Número | Cantidad | | ✓ |
| | Antigüedad | Número | Años | | ✓ |
| | Orientación | Catálogo | `CATALOGOS.orientaciones` | | ✓ |
| | Estado Conservación | Catálogo | `CATALOGOS.estadosConservacion` | | ✓ |
| | Remodelada | Sí/No | Booleano | | ✓ |
| | Año de Construcción | Número | Años | | |
| **Legal** | Tiene Escrituras | Sí/No | Booleano | | |
| | Régimen Legal | Catálogo | `CATALOGOS.regimenes` | | |
| | Libre de Gravamen | Sí/No | Booleano | | |
| | Predial al Corriente | Sí/No | Booleano | | |
| | Cero Adeudos | Sí/No | Booleano | | |
| | Hipoteca Vigente | Sí/No | Booleano | | |
| | Documentación Completa | Sí/No | Booleano | | |
| **Perfil Ideal**| Ingreso Recomendado | Moneda | Calculado automáticamente | | ✓ |
| | Tipo Crédito Ideal | Catálogo | `CATALOGOS.tiposCredito` | | ✓ |
| | Estado Civil Ideal | Catálogo | `CATALOGOS.estadosCiviles` | | ✓ |
| | Género Ideal | Catálogo | `CATALOGOS.generos` | | ✓ |
| | Hijos Ideal | Número | Cantidad | | ✓ |
| | Mascotas Ideal | Número | Cantidad | | ✓ |
| | Integrantes Ideal | Número | Cantidad | | ✓ |
| | Ideal Para | Catálogo Múltiple| `CATALOGOS.idealPara` (JSON string) | | ✓ |
| | Amenidades | Catálogo Múltiple| `CATALOGOS.amenidades` (JSON string) | | ✓ |
| | Servicios | Catálogo Múltiple| `CATALOGOS.servicios` (JSON string) | | ✓ |
| | Uso de Suelo | Catálogo | `CATALOGOS.usoDeSuelo` | | ✓ |
| **Scores** | Score de Atractivo | Decimal | Calculado automáticamente | | ✓ |
| | Score Compatibilidad | Decimal | Calculado automáticamente | | ✓ |
| **Multimedia**| Fotografías / Videos | Relación | Tabla `propiedades_multimedia` (Múltiple) | | |
