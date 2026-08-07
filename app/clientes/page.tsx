import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const revalidate = 0;

export default async function ClientesPage({ searchParams }: { searchParams: { busqueda?: string } }) {
  const busqueda = searchParams.busqueda || '';

  const clientes = await prisma.cliente.findMany({
    where: {
      deletedAt: null,
      ...(busqueda
        ? {
            OR: [
              { nombre: { contains: busqueda, mode: 'insensitive' } },
              { apellido_paterno: { contains: busqueda, mode: 'insensitive' } },
              { correo: { contains: busqueda, mode: 'insensitive' } },
              { whatsapp: { contains: busqueda, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { asesor: true },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Clientes & Prospectos</h1>
          <p className="text-slate-400 text-sm mt-1">Gestión de cartera de compradores, inquilinos e inversionistas</p>
        </div>
        <form method="GET" className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            name="busqueda"
            defaultValue={busqueda}
            placeholder="Buscar por nombre, correo, whatsapp..."
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-full sm:w-80"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-lg border border-slate-700 transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Presupuesto Max</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Asesor</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No se encontraron clientes registrados.
                  </td>
                </tr>
              ) : (
                clientes.map((c) => (
                  <tr key={c.id_cliente} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {c.nombre} {c.apellido_paterno} {c.apellido_materno || ''}
                      {c.generacion && (
                        <span className="block text-xs font-normal text-slate-500 mt-0.5">{c.generacion} • {c.edad || '?'} años</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div>{c.correo || 'Sin correo'}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{c.whatsapp || c.telefono_principal || 'Sin teléfono'}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-emerald-400">
                      {c.presupuesto_max ? `$${c.presupuesto_max.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 capitalize">
                        {c.estado_cliente || 'nuevo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {c.asesor ? `${c.asesor.nombre} ${c.asesor.apellidos}` : 'Sin asignar'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/matching?cliente_id=${c.id_cliente}`}
                        className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline"
                      >
                        Matching →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
