// src/middleware.ts
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const RUTAS_PUBLICAS = ["/login"];
const RUTAS_ADMIN = ["/dashboard/admin"];
const RUTAS_GERENTE = ["/dashboard/reports", "/dashboard/cna"];

export default auth((req) => {
  const { nextUrl } = req;
  const estaAutenticado = !!req.auth;
  const esRutaPublica = RUTAS_PUBLICAS.some((ruta) =>
    nextUrl.pathname.startsWith(ruta)
  );

  // Si no está autenticado y no es ruta pública, redirigir a login
  if (!estaAutenticado && !esRutaPublica) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Si está autenticado y es ruta pública, redirigir a dashboard
  if (estaAutenticado && esRutaPublica) {
    return NextResponse.redirect(new URL("/dashboard/clients", nextUrl));
  }

  // Control de roles
  if (estaAutenticado) {
    const rol = req.auth?.user?.rol as string;

    // ADMIN: acceso total
    if (rol === "ADMIN") {
      return NextResponse.next();
    }

    // GERENTE: no puede acceder a rutas de admin
    if (rol === "GERENTE" && RUTAS_ADMIN.some((ruta) =>
      nextUrl.pathname.startsWith(ruta)
    )) {
      return NextResponse.redirect(new URL("/dashboard/clients", nextUrl));
    }

    // ASESOR: solo puede ver sus propios datos (filtrado en el backend)
    if (rol === "ASESOR") {
      if (
        RUTAS_ADMIN.some((ruta) => nextUrl.pathname.startsWith(ruta)) ||
        RUTAS_GERENTE.some((ruta) => nextUrl.pathname.startsWith(ruta))
      ) {
        return NextResponse.redirect(new URL("/dashboard/clients", nextUrl));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};