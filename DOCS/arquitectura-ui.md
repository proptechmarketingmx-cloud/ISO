# Arquitectura de interfaz

Next.js (`app/`) es la única interfaz activa del producto. Las carpetas HTML/JS legacy se conservan temporalmente como referencia de migración y no forman parte del flujo de ejecución de `npm run dev` ni de los scripts de build actuales.

Las nuevas pantallas deben implementarse en App Router, reutilizar componentes React/Tailwind y añadir su API o Server Action correspondiente. No se deben agregar enlaces desde Next.js hacia las carpetas HTML legacy.

La autenticación se valida antes de entrar al CRM mediante `middleware.ts`; la raíz redirige a `/login`. Los errores de infraestructura se muestran como indisponibilidad temporal, sin revelar detalles técnicos al usuario final.
