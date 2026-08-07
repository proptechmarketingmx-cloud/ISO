import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try { const token = request.cookies.get('iso_session')?.value; if (!token) return NextResponse.json({ user: null }, { status: 401 }); const { payload } = await verifySession(token); const user = await prisma.usuario.findUnique({ where: { id_usuario: Number(payload.sub) }, select: { id_usuario: true, email: true, nombre: true, activo: true } }); if (!user?.activo) return NextResponse.json({ user: null }, { status: 401 }); return NextResponse.json({ user }); } catch { return NextResponse.json({ user: null }, { status: 401 }); }
}
