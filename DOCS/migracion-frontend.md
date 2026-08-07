# Migración del frontend ISO

## Decisión

Next.js es el frontend canónico para las áreas que ya cuentan con rutas en `app/`:

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

Las pantallas legacy que todavía no tienen equivalente en Next.js se mantienen aisladas:

- `cna_asesores/`
- `cna_clientes/`
- `cna/` estático
- expedientes y vistas avanzadas legacy de Clientes y Propiedades

No deben añadirse nuevas pantallas HTML legacy. Las nuevas funcionalidades deben implementarse en `app/` y consumir las rutas de Next.js o servicios de FastAPI a través de una API definida.

## Orden de migración

1. Autenticación y sesión compartida.
2. Clientes y Propiedades, incluyendo expedientes y multimedia.
3. Usuarios, roles y matriz de permisos.
4. CNA de clientes y asesores.
5. KPIs, rankings, comunidades y redes interactivas.
6. Retiro de carpetas legacy y del pipeline Vite/Nginx.

## Reglas de convivencia

- PostgreSQL/Prisma es la fuente de datos principal del frontend Next.js.
- FastAPI conserva compatibilidad con las sesiones `iso_session` y `access_token` mientras dure la migración.
- No se eliminan módulos legacy hasta que exista paridad funcional y una prueba de navegación equivalente.
- Antes de retirar un módulo se valida: login, carga de datos, altas, edición, eliminación, permisos y navegación.
