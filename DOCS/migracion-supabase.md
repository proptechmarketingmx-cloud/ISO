# Migración a Supabase

El esquema Prisma ampliado vive en `prisma/schema.prisma` y conserva las tablas legacy con sus nombres SQLAlchemy (`tenants`, `clientes`, `propiedades`, `asesores`, tablas satélite, RBAC, matching y CNA).

## Preparación

1. Crear el proyecto Supabase y copiar desde Settings → Database la URL pooled del puerto `6543` a `DATABASE_URL` y la URL directa del puerto `5432` a `DIRECT_URL`.
2. Copiar `.env.example` como `.env.local`; nunca subir `.env.local`.
3. Generar/verificar el cliente:

```powershell
cmd /c "npx prisma validate"
cmd /c "npx prisma generate"
```

4. En un entorno controlado, con la base vacía o con un plan explícito de datos, generar la migración desde el schema actual:

```powershell
cmd /c "npx prisma migrate diff --from-empty --to-schema-datamodel prisma\schema.prisma --script > prisma\migrations\<timestamp>_consolidated_schema\migration.sql"
cmd /c "npx prisma migrate deploy"
```

La migración inicial histórica del repositorio crea el modelo P2P anterior (`Usuario`, `Cliente`, `Propiedad`, `Nota`); no debe ejecutarse sobre una base de producción que ya contenga datos sin una decisión explícita de preservación. El script de diff se deja como paso controlado porque no hay credenciales ni proyecto Supabase disponibles en este entorno.

## Datos MySQL

Antes de apagar MySQL se debe exportar cada tabla legacy, mapear sus claves a los IDs seriales y cargar primero `tenants`/`asesores`, después `clientes`/`propiedades` y finalmente tablas satélite, relaciones CNA y compatibilidades. No se ejecutó una carga automática para evitar pérdida de datos sin confirmar qué instancia es la fuente de verdad.

## Estado funcional

La app Next.js ya tiene rutas de dashboard, clientes, propiedades, matching, asesores, usuarios, CNA y KPIs. El motor P2P/Tailscale y su endpoint fueron retirados porque la arquitectura objetivo es un solo nodo en Vercel.
