import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const revalidate = 0;

export default async function DashboardPage() {
  const [totalClientes, totalLeads, totalPropiedades, totalAsesores, clientesRecientes, propiedadesRecientes] = await Promise.all([
    prisma.cliente.count({ where: { deletedAt: null } }),
    prisma.cliente.count({ where: { deletedAt: null, estado_cliente: 'nuevo' } }),
    prisma.propiedad.count({ where: { deletedAt: null, status: 'disponible' } }),
    prisma.asesor.count({ where: { status: 'activo' } }),
    prisma.cliente.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { asesor: true },
    }),
    prisma.propiedad.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { asesor: true },
    }),
  ]);

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Panel Principal</h1>
          <p className="text-slate-400 text-sm mt-1">Resumen general de clientes, propiedades y desempeño</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/clientes"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg transition-colors shadow-lg shadow-amber-500/20"
          >
            + Nuevo Cliente
          </Link>
          <Link
            href="/propiedades"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-lg border border-slate-700 transition-colors"
          >
            + Nueva Propiedad
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Clientes</div>
          <div className="text-4xl font-black text-white mt-2">{totalClientes}</div>
          <div className="text-xs text-emerald-400 mt-2 font-medium">Registrados en PostgreSQL</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Leads Nuevos</div>
          <div className="text-4xl font-black text-amber-400 mt-2">{totalLeads}</div>
          <div className="text-xs text-amber-400/80 mt-2 font-medium">En seguimiento activo</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Propiedades Disponibles</div>
          <div className="text-4xl font-black text-white mt-2">{totalPropiedades}</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">En catálogo comercial</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Asesores Activos</div>
          <div className="text-4xl font-black text-white mt-2">{totalAsesores}</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">En la red</div>
        </div>
      </div>

      {/* Main Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clientes Recientes */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-slate-200">Clientes Recientes</h2>
            <Link href="/clientes" className="text-xs text-amber-400 hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-slate-800/60">
            {clientesRecientes.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No hay clientes registrados aún.</div>
            ) : (
              clientesRecientes.map((c) => (
                <div key={c.id_cliente} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div>
                    <div className="font-semibold text-slate-200">{c.nombre} {c.apellido_paterno}</div>
                    <div className="text-xs text-slate-500">{c.correo || c.whatsapp || 'Sin contacto directo'}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {c.estado_cliente || 'nuevo'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Propiedades Recientes */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-slate-200">Propiedades Recientes</h2>
            <Link href="/propiedades" className="text-xs text-amber-400 hover:underline">
              Ver catálogo →
            </Link>
          </div>
          <div className="divide-y divide-slate-800/60">
            {propiedadesRecientes.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No hay propiedades registradas aún.</div>
            ) : (
              propiedadesRecientes.map((p) => (
                <div key={p.id_propiedad} className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div>
                    <div className="font-semibold text-slate-200">{p.titulo}</div>
                    <div className="text-xs text-slate-500">{p.ciudad || 'Ubicación no especificada'} • {p.tipo}</div>
                  </div>
                  <div className="text-right font-mono font-semibold text-emerald-400 text-sm">
                    ${p.precio.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
