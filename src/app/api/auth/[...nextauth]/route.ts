// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";

// NextAuth exporta los manejadores GET y POST para el App Router
export const { GET, POST } = handlers;