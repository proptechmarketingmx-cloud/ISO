# Customer Network Analysis (CNA) y Modelo Dimensional

**Sistema de Análisis de Redes de Clientes e Inteligencia Comercial para Inmobiliarias**
Versión 1.0

> **Nota de nomenclatura:** este documento usa **CNA** exclusivamente para *Customer Network Analysis* (la red de relaciones entre clientes). Los campos de identificación que en versiones previas se llamaban "Campos No Analíticos" se renombran aquí **CDI (Campos de Identificación)** para evitar la confusión con la sigla CNA.

---

## Tabla de Contenidos

1. [Parte I — CNA: Red de Relaciones de Clientes](#parte-i--cna-red-de-relaciones-de-clientes)
   - Introducción y objetivos
   - Arquitectura conceptual (grafo)
   - Modelo de datos del CNA
   - Tipos de relaciones
   - Sistema de puntuación
   - Volumen y comisión generada
   - Métricas principales
   - Influence Score y Provider Score
   - Análisis de comunidades
   - Rankings de clientes
   - Visualización de red
   - Casos de uso y beneficios
   - Evolución 2.0 (IA / Machine Learning)
2. [Parte II — Modelo Dimensional (BI: Clientes vs Propiedades)](#parte-ii--modelo-dimensional-bi-clientes-vs-propiedades)
   - Objetivo
   - Clasificación de campos (CDI vs KPI)
   - Dimensiones compartidas
   - Generaciones (cálculo automático)
   - Catálogos compartidos
   - Modelo analítico (esquema general)
   - Jerarquías analíticas (drill down / roll up)
   - KPIs estratégicos por área
   - Motor de segmentación
   - Preguntas estratégicas que responde el modelo
3. [Referencia rápida de fórmulas](#referencia-rápida-de-fórmulas)

---

# Parte I — CNA: Red de Relaciones de Clientes

## 1. Introducción

El **Customer Network Analysis (CNA)** es un sistema diseñado para analizar las relaciones existentes entre los clientes de una inmobiliaria mediante la construcción de una red de conexiones (grafo).

A diferencia de un CRM tradicional, el CNA no analiza únicamente clientes individuales, sino también las **relaciones que existen entre ellos**.

El objetivo principal es identificar:

- Clientes influyentes
- Generadores de prospectos
- Proveedores de clientes
- Familias con alta actividad inmobiliaria
- Comunidades de clientes relacionadas
- Oportunidades de negocio ocultas dentro de la base de datos

## 2. Objetivos del Sistema

### Objetivo general

Transformar una base de datos de clientes en una red de relaciones que permita identificar las fuentes de negocio más valiosas.

### Objetivos específicos

- Detectar clientes con alta capacidad de referencia.
- Identificar grupos familiares.
- Medir la influencia de cada cliente.
- Analizar la calidad de las referencias.
- Calcular el impacto económico generado por cada cliente.
- Visualizar comunidades y clusters.
- Facilitar estrategias de fidelización y recompensas.
- Incrementar la captación de clientes por recomendación.

## 3. Arquitectura Conceptual

El CNA está basado en **teoría de grafos**.

### Nodo

Cada cliente representa un nodo.

| Campo    | Ejemplo       |
| -------- | ------------- |
| ID       | 1001          |
| Nombre   | Juan Pérez    |
| Teléfono | 9211111111    |

### Relación

Una relación representa una conexión entre dos clientes.

| Cliente A | Cliente B | Tipo        |
| --------- | --------- | ----------- |
| Juan      | María     | Familiar    |
| Juan      | Pedro     | Referencia  |

### Grafo (ejemplo ilustrativo)

```text
          Pedro
            |
            |
María ---- Juan ---- Carlos
            |
            |
          Ana
```

Cada línea representa una conexión dentro de la red.

## 4. Modelo de Datos del CNA

### Entidad Cliente

| Campo              | Tipo   |
| -----------------  | ------ |
| ID Cliente         | Entero |
| Nombre             | Texto  |
| Apellido Paterno   | Texto  |
| Apellido Materno   | Texto  |
| Teléfono           | Texto  |
| Correo             | Texto  |
| Ciudad             | Texto  |
| Profesión          | Texto  |
| Fecha Registro     | Fecha  |

### Entidad Relación

| Campo              | Tipo    |
| ----------------   | ------- |
| ID Relación        | Entero  |
| Cliente Origen     | Entero  |
| Cliente Destino    | Entero  |
| Tipo Relación      | Texto   |
| Fecha Relación     | Fecha   |
| Peso               | Decimal |

## 5. Tipos de Relaciones

### Familiar

Se genera cuando dos clientes comparten apellidos.

> Ejemplo: Juan Pérez — María Pérez → Relación: **FAMILIAR**

### Referencia

Se genera cuando un cliente recomienda a otro.

> Ejemplo: Juan → María → Relación: **REFERENCIA**

### Profesional

Clientes vinculados por:

- Empresa
- Organización
- Asociación
- Colegio profesional

### Geográfica

Clientes ubicados en:

- Misma colonia, fraccionamiento o sección
- Misma ciudad
- Mismo estado

## 6. Sistema de Puntuación

### Referencias directas

Cada referencia exitosa otorga **+1 punto**.

> Ejemplo: Juan → María → Juan = 1 punto

### Referencias indirectas

> Ejemplo: Juan → María → Carlos
> Resultado: Juan = 0.5 puntos · María = 1 punto

### Conexiones familiares

Cada conexión familiar: **+0.2 puntos**

### Conexiones profesionales

Cada conexión profesional: **+0.3 puntos**

## 7. Volumen Generado

**Definición:** representa el valor económico total originado por un cliente dentro de la red. Incluye compras, ventas y operaciones referidas.

> Ejemplo — Juan refiere:
>
> | Cliente | Valor       |
> | ------- | ----------- |
> | María   | $2,000,000  |
> | Pedro   | $3,000,000  |
>
> **Volumen generado: $5,000,000**

**Fórmula:**

```text
Volumen Generado = Σ Valor de Operaciones Referidas
```

## 8. Comisión Generada

**Definición:** ingreso real obtenido por la inmobiliaria.

> Ejemplo: Volumen = $5,000,000 · Comisión = 5% → Resultado = **$250,000**

**Fórmula:**

```text
Comisión Generada = Volumen Generado × % Comisión
```

## 9. Métricas Principales

| Métrica               | Descripción                                                                  |
| --------------------- | ---------------------------------------------------------------------------- |
| Referencias Totales   | Número total de clientes referidos.                                          |
| Conversión            | % de referencias que concluyen una operación. Ver fórmula abajo.             |
| Actividad             | Número de interacciones del cliente (referencias, compras, ventas).          |
| Antigüedad            | Tiempo que el cliente ha permanecido dentro de la red.                       |

**Fórmula de conversión:**

```text
Conversión = (Clientes Convertidos ÷ Clientes Referidos) × 100
```

## 10. Influence Score

Mide la influencia general del cliente.

```text
Influence Score = (Referencias Directas × 30%) + (Referencias Indirectas × 20%)
                 + (Conexiones × 20%) + (Conversión × 30%)
```

| Puntuación | Nivel      |
| ---------- | ---------- |
| 0–20       | Baja       |
| 21–40      | Media      |
| 41–60      | Alta       |
| 61–80      | Muy Alta   |
| 81–100     | Líder      |

## 11. Provider Score

Mide la capacidad del cliente para generar negocio.

```text
Provider Score = (Referencias × 20%) + (Conversión × 20%) + (Volumen Generado × 30%)
                + (Comisión Generada × 20%) + (Actividad Reciente × 10%)
```

| Score   | Clasificación            |
| ------- | -----------------------  |
| 0–20    | Cliente Normal           |
| 21–40   | Cliente Activo           |
| 41–60   | Influenciador            |
| 61–80   | Generador de Negocio     |
| 81–100  | Proveedor Estratégico    |

## 12. Análisis de Comunidades

El CNA agrupa automáticamente clientes relacionados.

| Tipo de Cluster   | Ejemplo                    |
| ----------------- | ---------------------------|
| Familiar          | Familia Pérez              |
| Empresarial       | Grupo Empresarial ABC      |
| Profesional       | Médicos                    |
| Geográfico        | Fraccionamiento Paraíso    |

## 13. Rankings de Clientes

El sistema genera rankings automáticos.

**Top Referidores**

| Posición | Cliente | Referencias |
| -------- | ------- | ----------- |
| 1        | Juan    | 35          |
| 2        | María   | 28          |
| 3        | Pedro   | 22          |

**Top Volumen**

| Posición | Cliente | Volumen |
| -------- | ------- | ------- |
| 1        | Juan    | $35M    |
| 2        | Pedro   | $28M    |

**Top Provider Score** (clientes con mayor potencial comercial)

| Posición | Cliente | Score |
| -------- | ------- | ----- |
| 1        | Juan    | 92    |
| 2        | Pedro   | 85    |
| 3        | María   | 78    |

## 14. Visualización de Red

La red debe mostrar:

- Tamaño del nodo según influencia.
- Color según tipo de cliente.
- Líneas según tipo de relación.
- Comunidades agrupadas automáticamente.

```text
         Pedro
            |
            |
Ana ---- Juan ---- María
            |
            |
         Carlos
```

## 15. Casos de Uso

| Caso de uso                | Descripción                                                      |
| -------------------------- | ---------------------------------------------------------------  |
| Programa de Referidos      | Identificar clientes con alta capacidad de recomendación.        |
| Embajadores de Marca       | Seleccionar clientes líderes dentro de la red.                   |
| Alianzas Estratégicas      | Detectar proveedores recurrentes de clientes.                    |
| Ventas Cruzadas            | Identificar familias y comunidades relacionadas.                 |
| Expansión Comercial        | Detectar zonas geográficas con alta densidad de clientes.        |

## 16. Beneficios Esperados

- Incremento de prospectos por recomendación.
- Mayor conocimiento de la red de clientes.
- Identificación de líderes e influenciadores.
- Reducción del costo de adquisición.
- Mejor segmentación comercial.
- Incremento en conversiones.
- Desarrollo de programas de fidelización.
- Creación de alianzas estratégicas basadas en datos.

## 17. Resultado Final

El CNA convierte una base de datos de clientes en una **Red de Inteligencia Comercial**, permitiendo identificar quién genera negocio, cuánto valor aporta, cómo se relaciona con otros clientes y qué oportunidades comerciales existen dentro de la red.

---

# Parte II — Modelo Dimensional (BI: Clientes vs Propiedades)

## 1. Objetivo

El CRM está diseñado para administrar **Clientes (Leads/Compradores)** y **Propiedades** utilizando un modelo de datos orientado al análisis (Business Intelligence).

El objetivo es que ambos módulos compartan las mismas dimensiones de información para poder comparar la **demanda** (clientes) contra la **oferta** (propiedades) y generar indicadores estratégicos.

## 2. Clasificación de Campos

Todos los campos del sistema se clasifican en dos categorías:

### CDI — Campos de Identificación

Campos utilizados únicamente para identificar registros. **No participan en estadísticas ni dashboards.**

> Ejemplos: Nombre, Apellido Paterno, Apellido Materno, CURP, RFC, Correo electrónico, WhatsApp, Nombre del propietario, Número de escritura.

### KPI — Campos Analíticos

Campos utilizados para filtros, segmentación, reportes y análisis. **Todos pueden usarse para construir indicadores y dashboards.**

> Ejemplos: País, Estado, Municipio, Ciudad, Colonia, Fraccionamiento, Tipo de propiedad, Tipo de operación, Precio, Presupuesto, Estado civil, Género, Edad, Generación, Tipo de crédito, Amenidades, Servicios, Asesor, Estatus.

## 3. Dimensiones Compartidas

Clientes y Propiedades comparten exactamente las mismas dimensiones para permitir análisis cruzados.

### Dimensión Tiempo

- Fecha de registro
- Año / Trimestre / Mes / Semana

### Dimensión Geográfica

```text
País
 └── Estado
      └── Municipio
           └── Ciudad
                └── Fraccionamiento
                     └── Colonia
```

> Ejemplos: México → Veracruz → Coatzacoalcos → Puerto Esmeralda → Manzana 8

### Dimensión Propiedad

Tipo de propiedad · Tipo de operación · Precio · Terreno · Construcción · Habitaciones · Baños · Estacionamientos · Amenidades · Servicios · Uso de suelo

### Dimensión Cliente

Edad · Generación · Estado civil · Género · Ingreso mensual · Tipo de crédito · Hijos · Mascotas · Integrantes del hogar

### Dimensión Comercial

Asesor · Fecha de registro · Método de captación · Referido · Estatus · Campaña

## 4. Generaciones

La generación **no debe capturarse manualmente**: debe calcularse automáticamente a partir de la fecha de nacimiento. La edad también se calcula automáticamente.

| Año de nacimiento    | Generación                  |
| -------------------- | --------------------------  |
| ≤ 1945               | Generación Silenciosa       |
| 1946 – 1964          | Baby Boomers                |
| 1965 – 1980          | Generación X                |
| 1981 – 1996          | Millennials                 |
| 1997 – 2012          | Generación Z                |
| ≥ 2013               | Generación Alfa             |

## 5. Catálogos Compartidos

Para evitar duplicidad de información, ambos módulos utilizan los mismos catálogos.

| Categoría           | Catálogos                                                                |
| -----------------   | --------------------------------------------------------------------     |
| Ubicación           | País, Estado, Municipio, Ciudad, Fraccionamiento, Colonia                |
| Propiedad           | Tipo de propiedad, Tipo de operación, Uso de suelo, Estatus de propiedad |
| Financiero          | Tipo de crédito, Forma de pago, Créditos aceptados                       |
| Comercial           | Asesores, Métodos de captación, Campañas                                 |
| Características     | Amenidades, Servicios                                                    |

## 6. Modelo Analítico (esquema general)

```text
                 Dimensión Tiempo
                        │
        ┌───────────────┼───────────────┐
        │                               │
 Clientes (Demanda)              Propiedades (Oferta)
        │                               │
        ├───────────┐          ┌────────┤
        │           │          │        │
 Dimensión      Dimensión  Dimensión  Dimensión
 Cliente       Geográfica  Propiedad  Comercial
```

Este modelo permite analizar la relación entre la demanda y la oferta inmobiliaria.

## 7. Jerarquías Analíticas

El sistema soporta navegación jerárquica (**Drill Down / Roll Up**) en todas las dimensiones.

**Ubicación**

```text
País
 └── Estado
      └── Municipio
           └── Ciudad
                └── Fraccionamiento
                     └── Colonia
```

**Tiempo**

```text
Año
 └── Trimestre
      └── Mes
           └── Semana
                └── Día
```

**Demografía**

```text
Generación
 └── Edad
      └── Estado Civil
           └── Género
```

**Propiedad**

```text
Tipo
 └── Operación
      └── Precio
           └── Habitaciones
                └── Amenidades
```

## 8. KPIs Estratégicos

### Clientes

Leads registrados · Compradores · No compradores · Edad promedio · Generación · Estado civil · Género · Tipo de crédito · Ingreso promedio · Hijos · Mascotas · Integrantes del hogar

### Propiedades

Inventario disponible · Inventario vendido · Precio promedio · Precio por m² · Tipo de propiedad · Habitaciones · Baños · Amenidades · Uso de suelo · Créditos aceptados

### Comerciales

Leads por asesor · Ventas por asesor · Conversión Lead → Cliente · Conversión Cliente → Compra · Tiempo promedio de cierre · Método de captación más efectivo

### Geográficos

Todos los KPIs deben poder filtrarse por: País · Estado · Municipio · Ciudad · Fraccionamiento · Colonia

### Segmentación demográfica

Todos los KPIs deben poder segmentarse por: Generación · Edad · Género · Estado civil · Tipo de crédito · Ingreso mensual · Hijos · Mascotas · Integrantes del hogar

## 9. Motor de Segmentación

Todos los módulos permiten combinar filtros utilizando cualquier dimensión del sistema.

**Ejemplo 1**

```text
Generación = Millennials
AND Estado = Veracruz
AND Ciudad = Coatzacoalcos
AND Tipo Propiedad = Casa
AND Presupuesto <= $2,500,000
AND Habitaciones >= 3
AND Amenidad = Alberca
```

→ Resultado: lista de clientes compatibles.

**Ejemplo 2**

```text
Generación = Baby Boomers
AND Tipo Crédito = Contado
AND Estado = Veracruz
```

→ Resultado: clientes con alta probabilidad de adquirir propiedades premium.

**Ejemplo 3**

```text
Estado = Veracruz
Ciudad = Coatzacoalcos
Fraccionamiento = Puerto Esmeralda
Tipo Propiedad = Casa
```

→ Resultado: oferta disponible vs. demanda registrada.

## 10. Objetivo Final del Modelo

El modelo de datos permite responder preguntas estratégicas como:

- ¿Qué generación compra más casas?
- ¿Qué tipo de propiedad buscan los Millennials?
- ¿Cuál es el presupuesto promedio por ciudad?
- ¿Qué colonias tienen mayor demanda y menor oferta?
- ¿Qué amenidades incrementan la probabilidad de venta?
- ¿Qué asesor tiene la mejor tasa de conversión?
- ¿Qué tipos de crédito predominan por región?
- ¿Cuál es el perfil ideal para cada propiedad?

Gracias a este modelo dimensional, el CRM puede realizar búsquedas, segmentaciones y análisis cruzados entre Clientes y Propiedades sin duplicar información, facilitando la construcción de dashboards y reportes en herramientas de BI como **Power BI, Metabase, Looker Studio o Tableau**.

---

# Referencia Rápida de Fórmulas

| Métrica               | Fórmula                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------   |
| Conversión            | (Clientes Convertidos ÷ Clientes Referidos) × 100                                                                              |
| Volumen Generado      | Σ Valor de Operaciones Referidas                                                                                               |
| Comisión Generada     | Volumen Generado × % Comisión                                                                                                  |
| Influence Score       | (Referencias Directas × 30%) + (Referencias Indirectas × 20%) + (Conexiones × 20%) + (Conversión × 30%)                        |
| Provider Score        | (Referencias × 20%) + (Conversión × 20%) + (Volumen Generado × 30%) + (Comisión Generada × 20%) + (Actividad Reciente × 10%)   |
