import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function requireAdmin(_request: NextRequest) {
  const session = await auth();
  return session?.user && 'rol' in session.user && session.user.rol === 'ADMIN'
    ? session.user
    : null;
}
