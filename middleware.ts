import { NextRequest, NextResponse } from 'next/server';
import { auth as verifySession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // 1. Verificamos la sesión (por ahora, nuestro mock devolverá el usuario admin)
  const session = await verifySession();

  // 2. Si no hay sesión (en el futuro, cuando implementemos Supabase real), redirigimos al login
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Si hay sesión, permitimos que la solicitud continúe hacia el dashboard
  return NextResponse.next();
}

// Configuramos el middleware para que solo intercepte las rutas del dashboard
export const config = {
  matcher: ['/dashboard/:path*'],
};