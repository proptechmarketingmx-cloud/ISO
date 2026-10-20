# Reporte de diagnóstico (solo lectura)

## 1. Estado de Git

**Salida de `git status --short`:**

```text
(sin salida; árbol de trabajo limpio)
```

**Salida de `git branch --show-current`:**

```text
cleanup-legacy
```

**Salida de `git log --oneline -5`:**

```text
8024248 Actualización del proyecto
72adf52 Actualización del proyecto
fdc0bdd Actualización del proyecto
5edc7e8 Actualización del proyecto
54cfe91 Actualización del proyecto
```

**Salida de `git remote -v`** —sin credenciales en las URLs:

```text
origin	https://github.com/proptechmarketingmx-cloud/ISO.git (fetch)
origin	https://github.com/proptechmarketingmx-cloud/ISO.git (push)
```

**Salida de `git status -sb`:**

```text
## cleanup-legacy...origin/cleanup-legacy
```

La comparación con el upstream indicó `0  0`: no hay commits locales pendientes de push ni commits remotos pendientes de pull.

**Archivos nuevos o modificados que aún no están en el remoto:** ninguno. No había archivos sin seguimiento ni cambios locales durante el diagnóstico.

## 2. Archivos de auth (contenido completo, sin secretos)

### `src/lib/auth.ts`

```ts
// src/lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
        });

        if (!usuario || !usuario.activo || !usuario.passwordHash) {
          return null;
        }

        const passwordValido = await bcrypt.compare(
          credentials.password,
          usuario.passwordHash
        );

        if (!passwordValido) {
          return null;
        }

        // Actualizar último acceso
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { ultimoAcceso: new Date() },
        });

        return {
          id: usuario.id,
          name: usuario.nombre,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol.toUpperCase(),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = user.rol;
        token.nombre = user.nombre;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.rol = token.rol as string;
        session.user.nombre = token.nombre as string;
        session.user.name = token.nombre as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas
  },
});
```

### `src/app/api/auth/[...nextauth]/route.ts`

```ts
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";

// NextAuth exporta los manejadores GET y POST para el App Router
export const { GET, POST } = handlers;
```

### `src/middleware.ts`

```ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((request) => {
  if (!request.auth?.user) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

### `types/next-auth.d.ts`

```ts
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      rol: string;
      nombre: string;
    } & DefaultSession["user"];
  }

  interface User {
    rol: string;
    nombre: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    rol: string;
    nombre: string;
  }
}
```

### `src/app/login/page.tsx`

```tsx
﻿// src/app/login/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (process.env.NODE_ENV === "development") {
          console.error("NextAuth sign-in failed:", result.error);
        }
        setError("Credenciales inválidas");
        return;
      }

      if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("No fue posible iniciar sesión. Inténtalo de nuevo.");
      }
    } catch (signInError) {
      if (process.env.NODE_ENV === "development") {
        console.error("NextAuth sign-in request failed:", signInError);
      }
      setError("No fue posible iniciar sesión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">CRM PropTech</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="asesor@empresa.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

### `src/lib/prisma.ts`

```ts
﻿import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

`middleware.ts` en la raíz: **no**. `lib/auth.ts` en la raíz: **no**.

## 3. Prisma

### `prisma/seed.ts`

```ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL y ADMIN_PASSWORD deben estar configuradas");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.usuario.upsert({
    where: { email },
    update: {
      nombre: "Administrador",
      passwordHash,
      rol: "ADMIN",
      activo: true,
    },
    create: {
      nombre: "Administrador",
      email,
      passwordHash,
      rol: "ADMIN",
      activo: true,
    },
  });

  console.log(`Usuario administrador listo: ${admin.email}`);
}

main()
  .catch((error: unknown) => {
    console.error("Error durante el seed del administrador:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Bloque `datasource` y modelo `Usuario` de `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Usuario {
  id            String     @id @default(uuid())
  nombre        String
  email         String     @unique
  passwordHash  String?
  rol           String     @default("asesor") @map("role")
  activo        Boolean    @default(true)
  ultimoAcceso  DateTime?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  @@map("Usuario")
}
```

### Migración aditiva `prisma/migrations/20261020150000_add_credentials_to_usuario/migration.sql`

```sql
ALTER TABLE "Usuario"
ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;

ALTER TABLE "Usuario"
ADD COLUMN IF NOT EXISTS "ultimoAcceso" TIMESTAMP(3);
```

### Parte `CREATE TABLE "Usuario"` de `prisma/migrations/20260804000000_init/migration.sql`

```sql
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'asesor',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);
```

**Carpetas dentro de `prisma/migrations`:**

```text
20260804000000_init
20260804000001_add_deleted_at
20261020150000_add_credentials_to_usuario
```

**Salida de `npx prisma validate`:**

```text
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
The schema at prisma/schema.prisma is valid 🚀
```

La validación no ejecutó consultas ni escribió en la base de datos.

## 4. package.json

Contenido completo de `package.json`:

```json
{
  "name": "crm-proptech",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:seed": "prisma db seed",
    "lint": "eslint .",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@prisma/client": "^5.22.0",
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-toast": "^1.2.2",
    "@supabase/server": "^1.9.2",
    "@supabase/ssr": "^0.12.7",
    "@supabase/supabase-js": "^2.109.0",
    "@tanstack/react-table": "^8.20.0",
    "bcryptjs": "^2.4.3",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.454.0",
    "next": "^16.4.2",
    "next-auth": "^5.0.0-beta.25",
    "next-themes": "^0.4.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.0",
    "recharts": "^2.13.0",
    "sonner": "^1.7.0",
    "tailwind-merge": "^2.5.4",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.23.8",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.16.11",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "eslint": "^9.39.5",
    "eslint-config-next": "^16.4.2",
    "postcss": "^8.4.47",
    "prisma": "^5.22.0",
    "tailwindcss": "^3.4.14",
    "tsx": "^4.19.1",
    "typescript": "^5.6.3"
  },
  "overrides": {
    "postcss-selector-parser": "^7.1.6"
  }
}
```

La clave `"prisma": { "seed": ... }` existe: **sí**. Valor: `"tsx prisma/seed.ts"`.

Salida de `npm ls next-auth bcryptjs @prisma/client next --depth=0`:

```text
crm-proptech@0.1.0 /home/valentina/ISO/ISO-1
├── @prisma/client@5.22.0
├── bcryptjs@2.4.3
├── next-auth@5.0.0-beta.32
└── next@16.4.2
```

## 5. Variables de entorno (solo nombres)

| Variable | Definida | Archivo(s) |
|---|---|---|
| `DATABASE_URL` | sí | `.env` |
| `DIRECT_URL` | sí | `.env` |
| `AUTH_SECRET` | sí | `.env` |
| `AUTH_URL` | no | ninguno |
| `NEXTAUTH_URL` | sí | `.env` |
| `ADMIN_EMAIL` | no | ninguno |
| `ADMIN_PASSWORD` | no | ninguno |

`.env.local` existe, pero ninguna de las variables solicitadas está definida allí.

Hosts y puertos, sin usuario ni contraseña:

- `DATABASE_URL`: `db.gvydioydhdzxbeplflmt.supabase.co:5432`
- `DIRECT_URL`: `aws-0-us-east-1.pooler.supabase.com:6543`

El host de `DATABASE_URL` es el endpoint directo y `DIRECT_URL` apunta al pooler. Esto refleja la configuración leída; no se intentó conectar ni cambiarla.

## 6. Prueba de arranque

Se intentó ejecutar `npm run dev` en un puerto alternativo para no interferir con procesos existentes. El comando detectó un servidor Next.js ya ejecutándose en el puerto 3000 y no arrancó un segundo servidor:

```text
▲ Next.js 16.4.2 (Turbopack)
- Local:         http://127.0.0.1:4317
✓ Ready in 554ms
⚠ Warning: Next.js ignored package-lock.json in /home/valentina/ISO because it is outside the current Git repository (/home/valentina/ISO/ISO-1).
⚠ React 18 support is deprecated in Next.js 16 and will be removed in Next.js 17.
⨯ Another next dev server is already running.
- Local:         http://localhost:3000
- PID:           2867765
```

Se hicieron las solicitudes GET al servidor preexistente:

```text
GET /login
HTTP 200

GET /api/auth/providers
{"credentials":{"id":"credentials","name":"credentials","type":"credentials","signinUrl":"http://localhost:3000/api/auth/signin/credentials","callbackUrl":"http://localhost:3000/api/auth/callback/credentials"}}
HTTP 200

GET /api/auth/session
null
HTTP 200
```

Los GET no generaron una autenticación con credenciales. El log existente contenía un error de un intento de inicio de sesión anterior, no causado por esos GET:

```text
[auth][cause]: "PrismaClientInitializationError:
Invalid `prisma.usuario.findUnique()` invocation:

Authentication failed against database server at `db.gvydioydhdzxbeplflmt.supabase.co`, the provided database credentials for `postgres` are not valid.

Please make sure to provide valid database credentials for the database server at `db.gvydioydhdzxbeplflmt.supabase.co`.
    at $n.handleRequestError (.../node_modules/@prisma/client/runtime/library.js:121:7615)
    at $n.handleAndLogRequestError (.../node_modules/@prisma/client/runtime/library.js:121:6623)
    at $n.request (.../node_modules/@prisma/client/runtime/library.js:121:6307)
    at async l (.../node_modules/@prisma/client/runtime/library.js:130:9633)
    at async Object.authorize (.../src/lib/auth.ts:42:33)
    at async Module.callback (.../node_modules/@auth/core/...)
    at async AuthInternal (.../node_modules/@auth/core/...)
    at async Auth (.../node_modules/@auth/core/...)
    ...
"
```

No fue posible detener el servidor del puerto 3000 porque ya estaba activo antes de la prueba y no fue iniciado por ella. Se dejó intacto para no interrumpir un proceso preexistente. El intento de servidor en el puerto 4317 terminó tras detectar el conflicto.

## 7. Errores de TypeScript

`npx tsc --noEmit` reportó **229 errores**. Conteo agrupado por archivo:

```text
97  lib/services/matchingService.ts
68  src/app/dashboard/clientes/[id]/page.tsx
12  src/app/dashboard/clientes/actions.ts
 9  src/app/dashboard/propiedades/page.tsx
 8  src/app/dashboard/pipeline/actions.ts
 8  src/app/dashboard/propiedades/[id]/editar/page.tsx
 7  src/app/dashboard/clientes/[id]/editar/page.tsx
 6  src/app/dashboard/pipeline/_components/kanban-board.tsx
 4  src/app/dashboard/pipeline/page.tsx
 4  src/app/dashboard/propiedades/actions.ts
 2  src/utils/supabase/server.ts
 1  src/app/dashboard/clientes/nueva/page.tsx
 1  src/app/dashboard/propiedades/nueva/page.tsx
 1  src/components/header.tsx
 1  src/components/tables/cliente-table.tsx
```

Primeros 3 errores completos de cada uno de los cinco archivos con más errores:

### `lib/services/matchingService.ts` — 97 errores

```text
lib/services/matchingService.ts(31,22): error TS2339: Property 'estado_busqueda' does not exist on type '{ id: number; version: number; nombre: string; apellidoPaterno: string | null; apellidoMaterno: string | null; telefono: string | null; email: string | null; curp: string | null; rfc: string | null; ... 26 more ...; updatedAt: Date; }'.
lib/services/matchingService.ts(42,34): error TS2339: Property 'fraccionamiento_colonia' does not exist on type '{ id: number; version: number; nombre: string; apellidoPaterno: string | null; apellidoMaterno: string | null; telefono: string | null; email: string | null; curp: string | null; rfc: string | null; ... 26 more ...; updatedAt: Date; }'.
lib/services/matchingService.ts(49,33): error TS2339: Property 'fraccionamiento' does not exist on type '{ id: number; version: number; nombre: string; apellidoPaterno: string | null; apellidoMaterno: string | null; telefono: string | null; email: string | null; curp: string | null; rfc: string | null; ... 26 more ...; updatedAt: Date; }'.
```

### `src/app/dashboard/clientes/[id]/page.tsx` — 68 errores

```text
src/app/dashboard/clientes/[id]/page.tsx(56,7): error TS2353: Object literal may only specify known properties, and 'id_cliente' does not exist in type 'ClienteWhereInput'.
src/app/dashboard/clientes/[id]/page.tsx(61,7): error TS2353: Object literal may only specify known properties, and 'asesor' does not exist in type 'ClienteInclude<DefaultArgs>'.
src/app/dashboard/clientes/[id]/page.tsx(114,14): error TS2353: Object literal may only specify known properties, and 'id_tenant' does not exist in type 'AsesorWhereInput'.
```

### `src/app/dashboard/clientes/actions.ts` — 12 errores

```text
src/app/dashboard/clientes/actions.ts(109,9): error TS2353: Object literal may only specify known properties, and 'id_tenant' does not exist in type '(Without<ClienteCreateInput, ClienteUncheckedCreateInput> & ClienteUncheckedCreateInput) | (Without<...> & ClienteCreateInput)'.
src/app/dashboard/clientes/actions.ts(205,9): error TS2353: Object literal may only specify known properties, and 'id_cliente' does not exist in type 'ClienteWhereInput'.
src/app/dashboard/clientes/actions.ts(217,98): error TS2551: Property 'apellido_paterno' does not exist on type '{ id: number; version: number; nombre: string; apellidoPaterno: string | null; apellidoMaterno: string | null; telefono: string | null; email: string | null; curp: string | null; rfc: string | null; ... 26 more ...; updatedAt: Date; }'. Did you mean 'apellidoPaterno'?
```

### `src/app/dashboard/propiedades/page.tsx` — 9 errores

```text
src/app/dashboard/propiedades/page.tsx(35,7): error TS2353: Object literal may only specify known properties, and 'id_tenant' does not exist in type 'PropiedadWhereInput'.
src/app/dashboard/propiedades/page.tsx(39,7): error TS2353: Object literal may only specify known properties, and 'fecha_registro' does not exist in type 'PropiedadOrderByWithRelationInput | PropiedadOrderByWithRelationInput[]'.
src/app/dashboard/propiedades/page.tsx(92,34): error TS2339: Property 'id_propiedad' does not exist on type '{ id: number; version: number; pais: string | null; estado: string | null; municipio: string | null; ciudad: string | null; colonia: string | null; codigoPostal: string | null; fechaRegistro: Date; ... 20 more ...; asesorId: string | null; }'.
```

### `src/app/dashboard/pipeline/actions.ts` — 8 errores

```text
src/app/dashboard/pipeline/actions.ts(7,10): error TS2305: Module '"@prisma/client"' has no exported member 'EstadoOportunidad'.
src/app/dashboard/pipeline/actions.ts(58,16): error TS2353: Object literal may only specify known properties, and 'id_cliente' does not exist in type 'ClienteWhereInput'.
src/app/dashboard/pipeline/actions.ts(66,9): error TS2353: Object literal may only specify known properties, and 'id_tenant' does not exist in type '(Without<OportunidadCreateInput, OportunidadUncheckedCreateInput> & OportunidadUncheckedCreateInput) | (Without<...> & OportunidadCreateInput)'.
```

En `next.config.mjs`, `typescript.ignoreBuildErrors`: **no**; `eslint.ignoreDuringBuilds`: **no**.

## 8. Resumen

- No se consultó ni modificó la base de datos; no se ejecutaron migraciones, seed ni `prisma db push`.
- No se incluyeron valores de secretos o contraseñas.
- No se pudo iniciar un nuevo servidor porque ya había uno activo en el puerto 3000. Se probaron los GET solicitados en ese proceso preexistente, que no se detuvo.
- La sesión GET responde `null`. En el log preexistente consta un error de autenticación de PostgreSQL de un intento anterior.
- Prisma valida correctamente. El chequeo de TypeScript reportó 229 errores, principalmente por diferencias entre los nombres de campos del código y los del cliente Prisma generado.
- Git permaneció limpio tras el diagnóstico.
