Customer Network Analysis (CNA)
Sistema de Análisis de Redes de Clientes para Inmobiliarias
Versión 1.0

## Introducción

El Customer Network Analysis (CNA) es un sistema diseñado para analizar las relaciones existentes entre los clientes de una inmobiliaria mediante la construcción de una red de conexiones (grafo).
El objetivo principal es identificar:
Clientes influyentes.
Generadores de prospectos.
Proveedores de clientes.
Familias con alta actividad inmobiliaria.
Comunidades de clientes relacionadas.
Oportunidades de negocio ocultas dentro de la base de datos.
A diferencia de un CRM tradicional, el CNA no analiza únicamente clientes individuales, sino también las relaciones que existen entre ellos.

## Objetivos del Sistema

Objetivo General
Transformar una base de datos de clientes en una red de relaciones que permita identificar las fuentes de negocio más valiosas.
Objetivos Específicos
Detectar clientes con alta capacidad de referencia.
Identificar grupos familiares.
Medir la influencia de cada cliente.
Analizar la calidad de las referencias.
Calcular el impacto económico generado por cada cliente.
Visualizar comunidades y clusters.
Facilitar estrategias de fidelización y recompensas.
Incrementar la captación de clientes por recomendación.

## Arquitectura Conceptual

El CNA está basado en teoría de grafos.
Nodo
Cada cliente representa un nodo.
Ejemplo:

ID 1001
Nombre Juan Pérez
Teléfono 9211111111

## Relación

Una relación representa una conexión entre dos clientes.
Ejemplo:
Cliente A | Cliente B |Tipo
Juan | María | Familiar
Juan | Pedro | Referencia

Grafo
          Pedro
            |
            |
María ---- Juan ---- Carlos
            |
            |
          Ana
Cada línea representa una conexión dentro de la red.

## Modelo de Datos

Entidad Cliente

Campo               | Tipo
ID Cliente          | Entero
Nombre              | Texto
Apellido Paterno    | Texto
Apellido Materno    | Texto
Teléfono            | Texto
Correo              | Texto
Ciudad              | Texto
Profesión           | Texto
Fecha Registro      | Fecha

## Entidad Relación

Campo               | Tipo
ID Relación         | Entero
Cliente Origen      | Entero
Cliente Destino     | Entero
Tipo Relación       | Texto
Fecha Relación      | Fecha
Peso                | Decimal

## Tipos de Relaciones

Familiar
Se genera cuando dos clientes comparten apellidos.
Ejemplo:
Juan Pérez
María Pérez
Relación:
FAMILIAR

Referencia
Se genera cuando un cliente recomienda a otro.
Ejemplo:
Juan → María
Relación:
REFERENCIA

Profesional
Clientes vinculados por:
Empresa
Organización
Asociación
Colegio profesional

Geográfica
Clientes ubicados en:
Misma colonia, fraccionamiento, sección.
Misma ciudad.
Mismo estado.

## Sistema de Puntuación

Referencias Directas
Cada referencia exitosa otorga:
+1 punto
Ejemplo:
Juan → María
Resultado:
Juan = 1 punto

Referencias Indirectas
Ejemplo:
Juan → María → Carlos
Puntuación:
Juan = 0.5 puntos
María = 1 punto

Conexiones Familiares
Cada conexión familiar:
+0.2 puntos

Conexiones Profesionales
Cada conexión profesional:
+0.3 puntos

## Volumen Generado

Definición
Representa el valor económico total originado por un cliente dentro de la red.
Incluye:
Compras
Ventas
Operaciones referidas

Ejemplo
Juan refiere:
Cliente
Valor
María
$2,000,000
Pedro
$3,000,000

Resultado:
Volumen generado:
$5,000,000

Fórmula
Volumen Generado =
Σ Valor de Operaciones Referidas

## Comisión Generada

Definición
Ingreso real obtenido por la inmobiliaria.
Ejemplo:
Volumen = $5,000,000
Comisión = 5%
Resultado:
$250,000

Fórmula
Comisión Generada =
Volumen Generado × %
Comisión

## Métricas Principales

Referencias Totales
Número total de clientes referidos.

Conversión
Porcentaje de referencias que concluyen una operación.
Fórmula
Conversión =
Clientes Convertidos ÷ Clientes Referidos ×100

Actividad
Número de interacciones realizadas por el cliente.
Ejemplos:
Referencias
Compras
Ventas
Antigüedad
Tiempo que el cliente ha permanecido dentro de la red.

## Influence Score

Mide la influencia general del cliente.
Fórmula

Influence Score = (Referencias Directas × 30%) + (Referencias Indirectas × 20%) + (Conexiones × 20%) + (Conversión × 30%)

Escala:
Puntuación   | Nivel
0-20         | Baja
21-40        | Media
41-60        | Alta
61-80        | Muy Alta
81-100       | Líder

## Provider Score

Mide la capacidad del cliente para generar negocio.
Fórmula

Provider Score = (Referencias × 20%) + (Conversión × 20%) + (Volumen Generado × 30%) + (Comisión Generada × 20%) + (Actividad Reciente × 10%)

Escala:
Score           | Clasificación
0-20            | Cliente Normal
21-40           | Cliente Activo
41-60           | Influenciador
61-80           | Generador de Negocio
81-100          | Proveedor Estratégico

## Análisis de Comunidades

El CNA agrupa automáticamente clientes relacionados.
Tipos de Cluster
Familiar
Familia Pérez
Empresarial
Grupo Empresarial ABC
Profesional
Médicos
Geográfico
Fraccionamiento Paraíso

## Ranking de Clientes

El sistema genera rankings automáticos.
Top Referidores
Posición    |   Cliente   | Referencias
1           |   Juan      | 35
2           |   María     | 28
3           |   Pedro     | 22

Top Volumen
Posición    |   Cliente   | Volumen
1           |   Juan      | $35M
2           |   Pedro     | $28M

Top Provider Score
Posición    |   Cliente   | Score
1           |   Juan      | 92
2           |   Pedro     | 85
3           |   María     | 78
Pedro
$28M

Top Provider Score
Clientes con mayor potencial comercial.

1. Visualización de Red
La red debe mostrar:
Tamaño del nodo según influencia.
Color según tipo de cliente.
Líneas según relación.
Comunidades agrupadas automáticamente.
Ejemplo:
         Pedro
            |
            |
Ana ---- Juan ---- María
            |
            |
         Carlos

## Casos de Uso

Programa de Referidos
Identificar clientes con alta capacidad de recomendación.

Embajadores de Marca
Seleccionar clientes líderes dentro de la red.

Alianzas Estratégicas
Detectar proveedores recurrentes de clientes.

Ventas Cruzadas
Identificar familias y comunidades relacionadas.

Expansión Comercial
Detectar zonas geográficas con alta densidad de clientes.

## Beneficios Esperados

Incremento de prospectos por recomendación.
Mayor conocimiento de la red de clientes.
Identificación de líderes e influenciadores.
Reducción del costo de adquisición.
Mejor segmentación comercial.
Incremento en conversiones.
Desarrollo de programas de fidelización.
Creación de alianzas estratégicas basadas en datos.

## Evolución 2.0

Inteligencia Artificial
Predicción de referencias futuras.
Probabilidad de compra.
Probabilidad de venta.
Detección automática de comunidades.
Machine Learning
Clasificación automática de clientes.
Recomendación de campañas.
Identificación de clientes con alto potencial.

## Resultado Final

El CNA convierte una base de datos de clientes en una Red de Inteligencia Comercial, permitiendo identificar quién genera negocio, cuánto valor aporta, cómo se relaciona con otros clientes y qué oportunidades comerciales existen dentro de la red.
