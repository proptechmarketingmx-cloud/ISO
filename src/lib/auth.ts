// src/lib/auth.ts
// ⚠️ ARCHIVO TEMPORAL: Simula una sesión activa hasta que implementemos Supabase Auth oficialmente

export async function verifySession() {
  // Devolvemos una sesión "falsa" pero válida para que el middleware nos deje pasar
  // El tenantId: 1 coincide con el tenant "PropTech MX" que creamos en el seed
  return {
    userId: "temp-user-id-123",
    tenantId: 1, 
    role: "admin",
  };
}
