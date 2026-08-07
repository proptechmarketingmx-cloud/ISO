# Migración a PostgreSQL

La aplicación usa una sola variable `DATABASE_URL` y el datasource PostgreSQL de Prisma. La URL debe apuntar al proveedor PostgreSQL elegido por el entorno.

## Preparación

1. Configurar `DATABASE_URL` en `.env.local`, sin subir ese archivo al repositorio.
2. Validar y regenerar el cliente:

```powershell
cmd /c "npx prisma validate"
cmd /c "npx prisma generate"
```

3. Aplicar migraciones en un entorno controlado:

```powershell
cmd /c "npx prisma migrate deploy"
```

La migración inicial histórica del repositorio crea el modelo P2P anterior (`Usuario`, `Cliente`, `Propiedad`, `Nota`). Antes de aplicarla sobre una base con datos existentes hay que confirmar la fuente de verdad y preparar un plan de preservación.

## Datos legacy

La carga desde MySQL debe ejecutarse como un proceso separado y controlado: primero tenants/asesores, después clientes/propiedades y finalmente tablas satélite, relaciones CNA y compatibilidades.
