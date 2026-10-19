# Contexto del Sistema para Agentes de IA: CRM PropTech


## 1. Arquitectura General

Este CRM está diseñado para gestionar leads, propiedades y oportunidades de venta en el sector inmobiliario mexicano. El sistema cuenta con dos motores inteligentes:

- **CNA (Customer Network Analysis)**: Detecta qué clientes y asesores generan más referidos y ventas.
- **Matching Bidireccional**: Calcula automáticamente la compatibilidad entre clientes y propiedades.

## 2. Entidades Principales y Relaciones

### 2.1 Cliente
Representa un lead o comprador potencial. Puede ser referido por otro cliente o por un asesor.

**Campos críticos para Matching:**
- `presupuestoMin`, `presupuestoMax`: Rango financiero del cliente.
- `tipoOperacionDeseada`, `tipoPropiedadDeseada`: Qué busca.
- `recamarasMin`, `banosMin`, `m2TerrenoMin`, `m2ConstruccionMin`: Requisitos mínimos.
- `ubicacionesPreferidas`: JSON con ciudades/colonias de interés.

**Campos críticos para CNA:**
- `referidoPorClienteId`: ID del cliente que lo refirió (obligatorio después de crear el lead).
- `referidoPorAsesorId`: ID del asesor que lo refirió.
- `scoreCna`: Puntuación calculada basada en referidos generados.
- `totalReferidosGenerados`: Cantidad de leads que este cliente ha referido.
- `valorVentasReferidos`: Suma del valor de ventas concretadas por sus referidos.

### 2.2 Asesor
Representa a un agente de ventas. También puede referir clientes y otros asesores.

**Campos críticos para CNA:**
- `scoreCna`: Puntuación basada en referidos generados.
- `totalReferidosGenerados`: Cantidad de leads/asesores que ha referido.
- `valorVentasReferidos`: Suma del valor de ventas concretadas por sus referidos.

### 2.3 Propiedad
Representa un inmueble en cartera.

**Campos críticos para Matching:**
- `tipoPropiedadId`, `tipoOperacionId`: Clasificación.
- `precio`: Valor de venta/renta.
- `m2Terreno`, `m2Construccion`, `recamaras`, `banos`: Características físicas.
- `amenidades`: JSON array con amenidades disponibles.
- `ubicacion`: Estado, municipio, ciudad, colonia.

### 2.4 CompatibilidadClientePropiedad
Tabla que almacena los scores de matching calculados automáticamente.

**Lógica de cálculo:**
- `scoreTotal`: Suma ponderada de todos los scores individuales.
- `scorePrecio`: Basado en qué tan cerca está el precio del presupuesto del cliente.
- `scoreUbicacion`: Basado en coincidencia de ubicaciones preferidas.
- `scoreCaracteristicas`: Basado en recámaras, baños, m2.
- `scoreAmenidades`: Basado en coincidencia de amenidades deseadas.

## 3. Reglas de Negocio

### 3.1 Sistema de Referidos (CNA)

**Regla 1: Referidos entre clientes**
- Cuando un cliente A refiere a un cliente B, se crea el cliente B con `referidoPorClienteId = A.id`.
- El campo `esReferidoObligatorio` debe ser `true` después de la creación inicial.
- El score de A se recalcula: `scoreCna = (totalReferidosGenerados * 10) + (valorVentasReferidos * 0.01)`.

**Regla 2: Referidos entre asesores**
- Cuando un asesor A refiere a un asesor B, se comparte el 50% de la comisión.
- El score de A se recalcula igual que con clientes.

**Regla 3: Recálculo automático**
- Cada vez que una oportunidad cambia a estado `CERRADO_GANADO`, se recalcula el score de todos los clientes/asesores en la cadena de referidos.

### 3.2 Matching Bidireccional

**Regla 1: Cálculo automático**
- Cuando se crea o modifica un cliente, se calcula su compatibilidad con TODAS las propiedades disponibles.
- Cuando se crea o modifica una propiedad, se calcula su compatibilidad con TODOS los clientes activos.
- Los resultados se guardan en `CompatibilidadClientePropiedad`.

**Regla 2: Filtros duros (con advertencia)**
- Si `propiedad.precio > cliente.presupuestoMax`, el score se reduce en 50 puntos, pero NO se excluye.
- El sistema muestra una advertencia: "Esta propiedad supera el presupuesto en $X".

**Regla 3: Filtros blandos (puntuación)**
- Cada amenidad que coincide suma +5 puntos al `scoreAmenidades`.
- Cada recámara adicional a la requerida suma +2 puntos al `scoreCaracteristicas`.
- Ubicación exacta (misma colonia) suma +20 puntos al `scoreUbicacion`.

**Regla 4: Umbral de visualización**
- Solo se muestran propiedades con `scoreTotal >= 50`.

### 3.3 Máquina de Estados de Leads

**Estados permitidos:**


## 4. Entidades Principales y Relaciones
- **Cliente**: Representa un lead o comprador. Se relaciona con `Propiedad` a través de `Compatibilidad` y con otros `Clientes` a través de `Referidos`.
- **Propiedad**: Inmueble en cartera. Contiene atributos físicos, financieros y legales.
- **Regla de Negocio #1**: Un cliente no puede tener dos oportunidades activas con la misma propiedad al mismo tiempo.
- **Regla de Negocio #2**: El campo `score_cna` se recalcula cada vez que un cliente referido cierra una venta.

## 5. Diccionario de Datos Crítico (Para Matching)
- `cliente.presupuesto_max`: Float. Límite superior financiero. El matching debe filtrar propiedades donde `propiedad.precio <= cliente.presupuesto_max * 1.10` (margen de negociación del 10%).
- `propiedad.amenidades`: Array de Strings. El matching otorga +5 puntos por cada amenidad que coincida con `cliente.amenidades_deseadas`.

## 6. Máquina de Estados
- **Estados de Propiedad**: `disponible` -> `en_negociacion` -> `reservada` -> `vendida`.
- **Transición permitida**: Solo un usuario con rol `admin` o el `asesor_asignado` puede cambiar el estado a `reservada`.
