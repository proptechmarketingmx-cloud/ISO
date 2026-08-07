import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                ISO
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">ISO</span>
                <span className="text-xs block text-slate-400 font-medium -mt-1">Plataforma Inmobiliaria</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/clientes"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Clientes & Leads
              </Link>
              <Link
                href="/propiedades"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Propiedades
              </Link>
              <Link
                href="/matching"
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-amber-400 hover:bg-amber-400/10 transition-colors"
              >
                Matching
              </Link>
              <Link href="/asesores" className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors">Asesores</Link>
              <Link href="/cna" className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors">CNA</Link>
              <Link href="/kpis" className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors">KPIs</Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ● Supabase Cloud
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
