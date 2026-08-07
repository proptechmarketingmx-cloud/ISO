import { prisma } from '@/lib/prisma';
import { calcularCompatibilidad } from '@/lib/services/matchingService';
import Link from 'next/link';

export const revalidate = 0;

export default async function MatchingPage({ searchParams }: { searchParams: { cliente_id?: string; propiedad_id?: string } }) {
  const clienteId = searchParams.cliente_id ? parseInt(searchParams.cliente_id) : undefined;
  const propiedadId = searchParams.propiedad_id ? parseInt(searchParams.propiedad_id) : undefined;

  const [clientes, propiedades] = await Promise.all([
    prisma.cliente.findMany({ where: { deletedAt: null }, orderBy: { nombre: 'asc' } }),
    prisma.propiedad.findMany({ where: { deletedAt: null, status: 'disponible' }, orderBy: { titulo: 'asc' } }),
  ]);

  let clienteSeleccionado = clienteId ? clientes.find((c) => c.id_cliente === clienteId) : null;
  let propiedadSeleccionada = propiedadId ? propiedades.find((p) => p.id_propiedad === propiedadId) : null;

  let matches: any[] = [];

  if (clienteSeleccionado) {
    matches = propiedades.map((p) => {
      const res = calcularCompatibilidad(clienteSeleccionado!, p);
      return {
        propiedad: p,
        ...res,
      };
    });
    matches.sort((a, b) => b.score_total - a.score_total);
  } else if (propiedadSeleccionada) {
    matches = clientes.map((c) => {
      const res = calcularCompatibilidad(c, propiedadSeleccionada!);
      return {
        cliente: c,
        ...res,
      };
    });
    matches.sort((a, b) => b.score_total - a.score_total);
  }

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Motor de Matching</h1>
        <p className="text-slate-400 text-sm mt-1">Cálculo algorítmico de compatibilidad entre compradores e inmuebles (Geográfica, Económica, Física, Familiar y Demográfica)</p>
      </div>

      {/* Selector de Cliente / Propiedad */}
      <form method="GET" className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Seleccionar Cliente Comprador</label>
          <select
            name="cliente_id"
            defaultValue={clienteId || ''}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">-- Seleccionar cliente para ver propiedades recomendadas --</option>
            {clientes.map((c) => (
              <option key={c.id_cliente} value={c.id_cliente}>
                {c.nombre} {c.apellido_paterno} ({c.estado_cliente})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">O Seleccionar Propiedad</label>
          <select
            name="propiedad_id"
            defaultValue={propiedadId || ''}
            className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">-- Seleccionar propiedad para ver compradores compatibles --</option>
            {propiedades.map((p) => (
              <option key={p.id_propiedad} value={p.id_propiedad}>
                {p.titulo} (${p.precio.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-amber-500/20"
          >
            Calcular Compatibilidad
          </button>
        </div>
      </form>

      {/* Resultados de Matching */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            Resultados de Compatibilidad ({matches.length} evaluados)
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {matches.map((m, idx) => {
              const item = m.propiedad || m.cliente;
              const isProp = !!m.propiedad;

              return (
                <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-slate-700 transition-colors">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white">
                        {isProp ? item.titulo : `${item.nombre} ${item.apellido_paterno}`}
                      </span>
                      <span className={`px-3 py-0.5 rounded-full text-xs font-extrabold uppercase border ${
                        m.nivel === 'excelente' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        m.nivel === 'alta' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        Nivel {m.nivel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      {isProp ? `${item.ciudad || ''} • ${item.tipo} • $${item.precio.toLocaleString()}` : `${item.correo || ''} • ${item.whatsapp || ''}`}
                    </p>

                    {/* Desglose de Scores */}
                    <div className="flex flex-wrap gap-4 pt-3 text-xs text-slate-300">
                      <div><span className="text-slate-500">Geo:</span> <strong className="text-amber-400">{m.score_geo}%</strong></div>
                      <div><span className="text-slate-500">Económico:</span> <strong className="text-emerald-400">{m.score_economico}%</strong></div>
                      <div><span className="text-slate-500">Físico:</span> <strong className="text-cyan-400">{m.score_fisico}%</strong></div>
                      <div><span className="text-slate-500">Familiar:</span> <strong className="text-purple-400">{m.score_familiar}%</strong></div>
                      <div><span className="text-slate-500">Demográfico:</span> <strong className="text-pink-400">{m.score_demo}%</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t md:border-t-0 border-slate-800 pt-4 md:pt-0 w-full md:w-auto justify-between">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-semibold uppercase">Score Total</div>
                      <div className="text-3xl font-black text-amber-400 font-mono">{m.score_total}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}
