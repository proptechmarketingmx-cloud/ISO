'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [
  ['/dashboard', 'Dashboard'], ['/clientes', 'Clientes & Leads'], ['/propiedades', 'Propiedades'],
  ['/matching', 'Matching'], ['/asesores', 'Asesores'], ['/cna', 'CNA'], ['/kpis', 'KPIs'], ['/usuarios', 'Usuarios'],
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ nombre: string | null; email: string } | null>(null);
  useEffect(() => { if (pathname !== '/login') fetch('/api/auth/me').then((r) => r.ok ? r.json() : null).then((data) => data?.user && setUser(data.user)).catch(() => undefined); }, [pathname]);
  if (pathname === '/login') return null;
  const linkClass = (href: string) => `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === href || pathname.startsWith(`${href}/`) ? 'bg-amber-400/10 text-amber-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'}`;

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-3 group" onClick={() => setOpen(false)}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">ISO</div>
            <div><span className="font-extrabold text-lg text-white tracking-tight">ISO</span><span className="text-xs block text-slate-400 font-medium -mt-1">Plataforma Inmobiliaria</span></div>
          </Link>
          <button type="button" className="md:hidden rounded-lg border border-slate-700 p-2 text-slate-300" aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen(!open)}><span className="text-xl">☰</span></button>
          <nav className="hidden md:flex items-center gap-1">{links.map(([href, label]) => <Link key={href} href={href} className={linkClass(href)}>{label}</Link>)}</nav>
          <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">{user && <span>{user.nombre || user.email}</span>}<button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); location.href = '/login'; }} className="text-slate-300 hover:text-amber-400">Salir</button></div>
        </div>
        {open && <nav className="md:hidden border-t border-slate-800 py-3 grid gap-1">{links.map(([href, label]) => <Link key={href} href={href} className={linkClass(href)} onClick={() => setOpen(false)}>{label}</Link>)}</nav>}
      </div>
    </header>
  );
}
