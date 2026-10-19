# Nombre del proyecto

Iso

# Objetivo del proyecto

- Gestiónar clientes
- Gestiónar leads
- Gestiónar propiedades
- Gestiónar asesores
- Analizar métricas e indicadores

## Base de Datos ( enlazar a documentacion de database )

 

**Motor:** MySQL en la nube (instancia gestionada, sin Docker).

**Arquitectura:** Base de datos centralizada que actúa como única fuente de verdad para todos los usuarios.

**Control de concurrencia:** Implementación de mecanismos de bloqueo para prevenir el *Lost Update* y garantizar la integridad de los datos cuando varios usuarios operan sobre el mismo registro. Estrategias adoptadas:
- Bloqueo optimista (campo `version`) para edición de fichas (Clientes, Propiedades, Asesores).
- Bloqueo pesimista (`SELECT ... FOR UPDATE`) para acciones críticas (asignación de leads, cambio de estado de propiedades).
- Actualizaciones atómicas (`increment` / `decrement`) para contadores.

**Referencia técnica:** [Concurrency & Locking — sql-mastery-notes](https://github.com/Niranjan-Kumar-Singh/sql-mastery-notes/blob/main/Phase_15_Transactions_Admin_Security/03_Concurrency_and_Locking.md#1)