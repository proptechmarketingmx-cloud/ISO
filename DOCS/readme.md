# Nombre del proyecto

Iso

# contexto

Crm web 


# Objetivo del proyecto

- Gestiónar  clientes
- Gestiónar  leads
- Gestiónar propiedades
- Gestiónar  asesores
- Analizar métricas e indicadores

# Caracteristicas principales

1. Gestión de clientes
2. Gestión de leads
3. Gestión de propiedades
4. Gestión de asesores
5. Métricas e indicadores
6. Customer network analysis


## Base de Datos ( enlazar a documentacion de database )

 

**Motor:** MySQL en la nube (instancia gestionada, sin Docker).

**Arquitectura:** Base de datos centralizada que actúa como única fuente de verdad para todos los usuarios (20 usuarios distribuidos en distintos estados y 1 en el extranjero).

**Control de concurrencia:** Implementación de mecanismos de bloqueo para prevenir el *Lost Update* y garantizar la integridad de los datos cuando varios usuarios operan sobre el mismo registro. Estrategias adoptadas:
- Bloqueo optimista (campo `version`) para edición de fichas (Clientes, Propiedades, Asesores).
- Bloqueo pesimista (`SELECT ... FOR UPDATE`) para acciones críticas (asignación de leads, cambio de estado de propiedades).
- Actualizaciones atómicas (`increment` / `decrement`) para contadores.

**Referencia técnica:** [Concurrency & Locking — sql-mastery-notes](https://github.com/Niranjan-Kumar-Singh/sql-mastery-notes/blob/main/Phase_15_Transactions_Admin_Security/03_Concurrency_and_Locking.md#1)