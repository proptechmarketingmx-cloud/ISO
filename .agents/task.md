# Tasks — Actualización Formularios CRM

## Capa 0 — Catálogos Maestros
- [x] Crear `/assets/js/catalogos.js`

## Capa 1 — Base de Datos
- [x] Ampliar `database/schema.sql` con campos nuevos (clientes + propiedades + tablas nuevas)
- [x] Crear `database/migration_v2.sql` (ALTER TABLE incremental)

## Capa 2 — Modelos ORM
- [x] Ampliar `backend/models/cliente.py`
- [x] Ampliar `backend/models/models.py` (Propiedad + nuevos modelos)

## Capa 3 — Schemas Pydantic
- [x] Ampliar `backend/schemas/schemas.py` (Propiedad)
- [x] Ampliar `backend/schemas/cliente.py` (Cliente + validaciones)

## Capa 4 — Servicios y Rutas
- [x] Crear `backend/services/matching_service.py`
- [x] Crear `backend/services/kpis_service.py`
- [x] Ampliar `backend/routes/cliente_routes.py` (matches + kpis)
- [x] Ampliar `backend/routes/propiedades.py` (matches + multimedia + kpis)

## Capa 5 — Frontend Propiedades
- [x] Reescribir `propiedades/index.html` con modal multi-sección (7 tabs)

## Capa 6 — Frontend Clientes
- [x] Actualizar formulario de clientes (8 secciones + campos calculados)

## Capa 7 — Documentación
- [x] Actualizar `docs/formularios.md`
- [x] Actualizar `docs/modelo_datos.md`
