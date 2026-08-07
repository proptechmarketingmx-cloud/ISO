import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: 'Correo y contraseña son obligatorios' }, { status: 400 });
    const user = await prisma.usuario.findUnique({ where: { email: String(email).toLowerCase() } });
    if (!user || !user.activo || !(await bcrypt.compare(password, user.password_hash))) return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 });
    const response = NextResponse.json({ user: { id_usuario: user.id_usuario, email: user.email, nombre: user.nombre } });
    response.cookies.set('iso_session', await createSession(user), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 28800, path: '/' });
    return response;
  } catch (error) { console.error('[Auth] Login failed', error); return NextResponse.json({ error: 'No fue posible iniciar sesión' }, { status: 500 }); }
}
