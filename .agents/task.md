# Tasks — Actualización Formularios CRM

## Capa 0 — Catálogos Maestros
- [x] Crear `/assets/js/catalogos.js`

## Capa 1 — Base de Datos
- [x] Ampliar `database/schema.sql` con campos nuevos (clientes + propiedades + tablas nuevas)
- [x] Crear `database/migration_v2.sql` (ALTER TABLE incremental)

## Capa 2 — Modelos ORM (SQLAlchemy)
- [x] Definir los nuevos modelos en `backend/models/models.py` (`PropiedadActividad`, `PropiedadNota`, `PropiedadDocumento`, `PropiedadHistorial`)
- [x] Añadir las relaciones inversas en el modelo `Propiedad`

## Capa 3 — Schemas Pydantic
- [x] Definir esquemas para actividades, notas, documentos e historial de propiedades en `backend/schemas/schemas.py`
- [x] Crear el esquema `PropiedadExpedienteResponse` que combine el modelo base de propiedad con sus listas satélite

## Capa 4 — Servicios y Rutas
- [x] Crear `backend/services/matching_service.py`
- [x] Crear `backend/services/kpis_service.py`
- [x] Ampliar `backend/routes/cliente_routes.py` (matches + kpis)
- [x] Ampliar `backend/routes/propiedades.py` (matches + multimedia + kpis)

## Capa 5 — Frontend Propiedades
- [x] Reescribir `propiedades/index.html` con modal multi-sección (7 tabs)

## Capa 6 — Frontend Clientes
- [x] Actualizar formulario de clientes (8 secciones + campos calculados)

## Capa 7 — Notificaciones de Cumpleaños
- [x] Crear el endpoint `GET /api/clientes/cumpleanos` en FastAPI para filtrar por cumpleaños del día y próximos 30 días
- [x] Exponer la función `cumpleanos` en el frontend dentro de `clientesApi` en `assets/js/api.js`
- [x] Diseñar e implementar el banner dinámico (dismissible con localStorage) para los cumpleaños de hoy en `dashboard/index.html`
- [x] Diseñar e implementar el panel widget con la lista de próximos cumpleaños en `dashboard/index.html`

## Capa 8 — Documentación
- [x] Actualizar `docs/formularios.md`
- [x] Actualizar `docs/modelo_datos.md`
