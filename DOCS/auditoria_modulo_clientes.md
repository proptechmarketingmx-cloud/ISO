# Auditoría del Módulo de Clientes (Pre-Reconstrucción)

## 1. Análisis del Módulo Actual

El módulo actual de Clientes (`clientes/index.html` y `backend/routes/clientes.py`) fue construido con una arquitectura monolítica donde toda la lógica de Clientes y Leads se combinó en grandes archivos.

### Frontend (`clientes/index.html`)
- **Estructura:** Un solo archivo HTML de ~1,600 líneas (75 KB) que contiene todo el marcado de la tabla, Kanban, y modales complejos para altas/ediciones.
- **Lógica JS:** Todo el comportamiento (manejo de estado, renderizado de tablas, llamadas a API, validaciones, Kanban) está embebido en una sola etiqueta `<script type="module">` al final del archivo.
- **Acoplamiento:** Fuerte acoplamiento entre el DOM y la lógica. Las vistas de "Leads" y "Clientes" están anidadas de forma artificial y forzada.

### Backend (`backend/routes/clientes.py` & `backend/models/models.py`)
- **Controladores:** Un solo router que expone los endpoints CRUD básicos, mezclado con otro router secundario para leads. Falta separación en capas (servicios).
- **Modelo de Datos:** La tabla `clientes` actualmente almacena de forma plana no solo datos personales, sino también preferencias inmobiliarias (habitaciones, amenidades, operación) y datos laborales. Esto rompe la normalización de la base de datos (Primera y Segunda Forma Normal).

## 2. Detección de Componentes Reutilizables

A pesar de la reestructuración requerida, existen elementos de la plataforma que **SÍ** se pueden y deben reutilizar para mantener la coherencia del sistema:

- **Componentes Compartidos:**
  - `assets/css/estilo.css` (Sistema de diseño base, botones, inputs, utilidades).
  - `assets/js/nav.js` (Barra de navegación principal inyectada).
  - `assets/js/api.js` (Cliente HTTP estándar de la plataforma).
  - `assets/js/utils.js` (Utilidades genéricas como `formatDate`, `toast`, modales genéricos).
- **Infraestructura Backend:**
  - `database.py` (Configuración y manejo de sesiones de BD PostgreSQL/MySQL).
  - Configuración de FastAPI en `main.py`.

## 3. Elementos a Eliminar (Eliminación Controlada)

- **Frontend:** 
  - Todo el contenido específico de lógica e interfaz embebido en `clientes/index.html`.
- **Backend:** 
  - Los endpoints de `/clientes` y `/leads` en `routes/clientes.py` (serán reescritos para usar el patrón controlador-servicio).
  - Los esquemas actuales en `schemas.py` referidos a `Cliente` (serán reemplazados).
- **Base de Datos:**
  - La definición monolítica de la tabla `clientes` en `schema.sql` y `models.py`.

## 4. Elementos a Desarrollar Nuevamente

- **Base de Datos (Diseño del Dominio):**
  - **`clientes`**: Rediseñado para almacenar únicamente información general (básica, contacto, laboral, origen).
  - **Nuevas Tablas del Expediente**: `clientes_historial`, `clientes_documentos`, `clientes_notas`, `clientes_actividades`.
- **Backend (Arquitectura en Capas):**
  - `models/cliente.py`, `schemas/cliente.py`, `routes/cliente_routes.py`, `services/cliente_service.py`.
- **Frontend (Componentización Modular):**
  - Separación en módulos JS limpios y clases: `ClienteCard.js`, `ClienteForm.js`, `ClienteTable.js`, `ExpedienteView.js`.
  - Archivos HTML limpios que solo actúan como contenedores base, mientras la interfaz se renderiza vía componentes JS.
