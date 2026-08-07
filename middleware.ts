import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/login' || pathname.startsWith('/api/auth') || pathname.startsWith('/_next') || pathname.includes('.')) return NextResponse.next();
  const token = request.cookies.get('iso_session')?.value;
  if (!token) return NextResponse.redirect(new URL('/login', request.url));
  try { await verifySession(token); return NextResponse.next(); } catch { return NextResponse.redirect(new URL('/login', request.url)); }
}

export const config = { matcher: ['/((?!api/auth).*)'] };
