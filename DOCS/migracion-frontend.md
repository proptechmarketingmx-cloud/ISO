# Migración del frontend ISO

## Decisión

El frontend canónico local es el CRM legacy servido por Live Server en `http://127.0.0.1:5500/`:

- `dashboard/`
- `clientes/`
- `propiedades/`
- `usuarios/`
- `cna_asesores/`
- `cna_clientes/`

Next.js (`localhost:3000`) queda fuera del flujo oficial por ser una versión experimental/corrupta. Sus rutas no deben recibir nuevas funcionalidades.

La aplicación oficial consume FastAPI en `http://localhost:8000`.

## Estado anterior de la migración

Next.js había sido definido provisionalmente como frontend canónico para las áreas que ya contaban con rutas en `app/`:

- autenticación
- dashboard
- clientes
- propiedades
- asesores
- matching
- KPIs
- usuarios

FastAPI se mantiene como backend de datos, RBAC y CNA durante la transición.

## Frontera temporal

Las pantallas legacy se mantienen como aplicación oficial; las pantallas Next equivalentes se consideran experimentales:

- `cna_asesores/`
- `cna_clientes/`
- `cna/` estático
- expedientes y vistas avanzadas legacy de Clientes y Propiedades

Las nuevas funcionalidades deben implementarse en el frontend de `127.0.0.1:5500` y consumir FastAPI mediante `assets/js/api.js` o `clientes/js/components/api.js`.

## Orden de migración

1. Consolidar autenticación y sesión en el frontend legacy.
2. Corregir Clientes y Propiedades, incluyendo expedientes y multimedia.
3. Completar Usuarios, roles y matriz de permisos.
4. Corregir CNA de clientes y asesores.
5. Validar KPIs, rankings, comunidades y redes interactivas.
6. Retirar la versión Next experimental.

## Reglas de convivencia

- PostgreSQL/Prisma es la fuente de datos principal del frontend Next.js.
- FastAPI conserva compatibilidad con las sesiones `iso_session` y `access_token` mientras dure la migración.
- No se eliminan módulos legacy hasta que exista paridad funcional y una prueba de navegación equivalente.
- Antes de retirar un módulo se valida: login, carga de datos, altas, edición, eliminación, permisos y navegación.
