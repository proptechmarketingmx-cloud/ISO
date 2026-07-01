# Modelo de Datos — Plataforma ISO (Expediente Único v2.0)

Este documento detalla el esquema relacional de la base de datos de la plataforma ISO, reflejando la arquitectura donde los clientes centralizan su ciclo de vida en un **Expediente Único** y las propiedades incluyen detalles avanzados de ubicación, físicos, comerciales, legales, perfil ideal y multimedia.

---

## 1. Diagrama de Relaciones (MER)

```mermaid
erDiagram
    asesores ||--o{ propiedades : "gestiona"
    asesores ||--o{ clientes : "atiende"
    clientes ||--o{ clientes_actividades : "registra"
    clientes ||--o{ clientes_documentos : "posee"
    clientes ||--o{ clientes_notas : "tiene"
    clientes ||--o{ clientes_historial : "traza"
    asesores ||--o{ clientes_actividades : "ejecuta"
    clientes ||--o{ relaciones_clientes_cna : "origen/destino"
    asesores ||--o{ relaciones_asesores_cna : "origen/destino"
    propiedades ||--o{ propiedades_multimedia : "contiene"
    clientes ||--o{ compatibilidad_cliente_propiedad : "calcula"
    propiedades ||--o{ compatibilidad_cliente_propiedad : "calcula"

    asesores {
        int id_asesor PK
        varchar nombre
        varchar apellidos
        varchar telefono
        varchar correo
        varchar status
        timestamp fecha_ingreso
    }

    clientes {
        int id_cliente PK
        varchar nombre
        varchar apellido_paterno
        varchar apellido_materno
        varchar curp
        varchar rfc
        varchar fecha_nacimiento
        int edad
        varchar generacion
        varchar genero
        varchar estado_civil
        varchar nacionalidad
        varchar telefono_principal
        varchar whatsapp
        varchar lada
        varchar correo
        varchar pais
        varchar estado
        varchar municipio
        varchar colonia
        varchar codigo_postal
        varchar fraccionamiento
        text direccion
        varchar profesion
        varchar puesto
        varchar escolaridad
        varchar conyuge
        varchar conyuge_whatsapp
        int hijos
        int mascotas
        int integrantes_hogar
        int dependientes_eco
        int adultos_mayores_cargo
        varchar nombre_empresa
        varchar ocupacion
        varchar antiguedad_laboral
        decimal ingreso_mensual
        varchar tipo_credito
        decimal presupuesto_min
        decimal presupuesto_max
        decimal enganche_disponible
        decimal pago_mensual_objetivo
        decimal capacidad_credito_max
        varchar operacion
        varchar tipo_propiedad
        varchar estado_busqueda
        varchar ciudad_busqueda
        varchar fraccionamiento_colonia
        int habitaciones_pa
        int habitaciones_pb
        decimal banos
        int estacionamiento
        decimal m2_terreno_min
        decimal m2_terreno_max
        decimal m2_construccion_min
        decimal m2_construccion_max
        int niveles_max
        int antiguedad_max
        text amenidades_deseadas
        varchar motivacion
        varchar temporalidad
        int id_asesor FK
        varchar estado_cliente
        varchar referenciado
        varchar fuente_lead
        varchar campana
        varchar medio_adquisicion
        varchar utm_source
        varchar utm_medium
        varchar utm_campaign
        decimal score_cna
        decimal score_compatibilidad
        timestamp fecha_registro
    }

    propiedades {
        int id_propiedad PK
        varchar titulo
        text descripcion
        varchar tipo
        varchar tipo_operacion
        varchar status
        int id_asesor FK
        varchar propietario_nombre
        varchar propietario_whatsapp
        varchar pais
        varchar estado
        varchar municipio
        varchar ciudad
        varchar colonia
        varchar fraccionamiento
        varchar codigo_postal
        decimal precio
        tinyint exclusiva
        decimal comision
        decimal comision_compartida
        date fecha_captacion
        date fecha_publicacion
        text creditos_aceptados
        decimal m2_construccion
        decimal m2_terreno
        decimal frente
        decimal fondo
        int recamaras
        int recamaras_pb
        decimal banos
        int niveles
        int estacionamientos
        int antiguedad
        varchar orientacion
        varchar estado_conservacion
        tinyint remodelada
        int anio_construccion
        tinyint escrituras
        varchar regimen
        tinyint libre_gravamen
        tinyint predial
        tinyint adeudos
        tinyint hipoteca_vigente
        tinyint documentacion_completa
        decimal ingreso_recomendado
        varchar tipo_credito_ideal
        varchar estado_civil_ideal
        varchar genero_ideal
        int hijos_ideal
        int mascotas_ideal
        int integrantes_ideal
        text ideal_para
        text amenidades
        text servicios
        varchar uso_suelo
        decimal score_atractivo
        decimal score_compatibilidad
        timestamp fecha_registro
    }

    propiedades_multimedia {
        int id_media PK
        int id_propiedad FK
        varchar tipo
        text url
        varchar nombre
        varchar descripcion
        tinyint es_principal
        int orden
        timestamp fecha_subida
    }

    compatibilidad_cliente_propiedad {
        int id_compat PK
        int id_cliente FK
        int id_propiedad FK
        decimal score_total
        decimal score_geo
        decimal score_economico
        decimal score_fisico
        decimal score_familiar
        decimal score_demo
        varchar nivel
        json detalle_json
        timestamp fecha_calculo
    }

    auditoria_cambios {
        int id_auditoria PK
        varchar tabla
        int id_registro
        varchar campo
        text valor_anterior
        text valor_nuevo
        varchar usuario
        timestamp fecha
    }
```

---

## 2. Detalle de Tablas Nuevas y Modificadas

### 2.1. clientes (Ampliación)
Almacena todos los atributos personales, financieros, familiares y de requerimientos del cliente.
* Mantiene integridad de datos únicos como `curp`, `rfc`, `correo`, `whatsapp` con prevención de duplicados a nivel servicio.
* **Campos Calculados:** `edad`, `generacion` (a partir de la fecha de nacimiento), `lada` (a partir del teléfono/whatsapp).
* **Campos de Requerimiento:** `m2_construccion_min`, `presupuesto_max`, `amenidades_deseadas`, etc.

### 2.2. propiedades (Ampliación)
Almacena la ficha técnica física, legal, comercial y del perfil del comprador ideal.
* **Campos Calculados:** `ingreso_recomendado` (Venta = Precio/120, Renta = Precio/0.30), `score_atractivo` (de acuerdo al porcentaje de llenado físico/legal).

### 2.3. propiedades_multimedia
Permite relacionar múltiples archivos multimedia (fotografías, videos, planos, tours 3D, documentos) a una propiedad.
* `id_media` (INT, PK, Autoincrementable)
* `id_propiedad` (INT, FK a propiedades, ON DELETE CASCADE)
* `tipo` (VARCHAR: 'foto', 'video', 'virtual', 'plano', 'documento')
* `url` (TEXT, URL del CDN/alojamiento externo)

### 2.4. compatibilidad_cliente_propiedad
Almacena el índice de afinidad total y desglosado por las 5 dimensiones entre cada cliente y propiedad disponible.
* `score_total` = (Geo × 25%) + (Eco × 30%) + (Físico × 25%) + (Familiar × 10%) + (Demo × 10%)

### 2.5. auditoria_cambios
Registra cambios históricos a nivel columna de todas las tablas críticas para garantizar trazabilidad.
