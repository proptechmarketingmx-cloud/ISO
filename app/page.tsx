import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const revalidate = 0;

export default async function HomePage() {
  const usuarios = await prisma.usuario.findMany({ orderBy: { updatedAt: 'desc' } });
  const clientes = await prisma.cliente.findMany({ orderBy: { updatedAt: 'desc' } });
  const propiedades = await prisma.propiedad.findMany({ orderBy: { updatedAt: 'desc' } });

  return (
    <main className="max-w-6xl mx-auto p-8 space-y-8">
      <header className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-amber-400">ISO — Sincronización P2P</h1>
          <p className="text-slate-400 text-sm mt-1">Nodo Activo en Tailscale Mesh Network</p>
        </div>
        <div className="flex gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ● P2P Engine Running
          </span>
        </div>
      </header>

      {/* Grid de Estado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6">
          <div className="text-slate-400 text-sm font-semibold uppercase">Usuarios Registrados</div>
          <div className="text-4xl font-extrabold text-white mt-2">{usuarios.length}</div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6">
          <div className="text-slate-400 text-sm font-semibold uppercase">Clientes / Leads</div>
          <div className="text-4xl font-extrabold text-white mt-2">{clientes.length}</div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6">
          <div className="text-slate-400 text-sm font-semibold uppercase">Propiedades</div>
          <div className="text-4xl font-extrabold text-white mt-2">{propiedades.length}</div>
        </div>
      </div>

      {/* Tablas de Registros */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-200">Registros Locales Sincronizados</h2>

        <div className="bg-slate-800/40 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 bg-slate-800/80 border-b border-slate-700/60 font-semibold text-slate-300">
            Clientes (Última actualización / UUID)
          </div>
          <div className="divide-y divide-slate-800">
            {clientes.length === 0 ? (
              <div className="p-6 text-slate-500 text-sm text-center">No hay clientes en esta base de datos local.</div>
            ) : (
              clientes.map((c) => (
                <div key={c.id} className="px-6 py-4 flex justify-between items-center text-sm">
                  <div>
                    <div className="font-semibold text-slate-200">{c.nombre}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {c.id}</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded text-xs bg-slate-700 text-amber-300 font-medium">
                      {c.estado}
                    </span>
                    <div className="text-xs text-slate-400 mt-1">
                      updatedAt: {new Date(c.updatedAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
