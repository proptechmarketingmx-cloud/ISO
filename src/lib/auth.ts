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