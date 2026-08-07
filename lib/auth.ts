import { jwtVerify, SignJWT } from 'jose';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'iso-local-development-secret-change-me');

export async function createSession(user: { id_usuario: number; email: string; id_tenant: number | null }) {
  return new SignJWT({ email: user.email, tenantId: user.id_tenant }).setProtectedHeader({ alg: 'HS256' }).setSubject(String(user.id_usuario)).setIssuedAt().setExpirationTime('8h').sign(secret);
}

export async function verifySession(token: string) { return jwtVerify(token, secret); }
