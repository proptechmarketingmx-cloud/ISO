import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const revalidate = 0;

export default async function PropiedadesPage({ searchParams }: { searchParams: { busqueda?: string; tipo?: string } }) {
  const busqueda = searchParams.busqueda || '';
  const tipo = searchParams.tipo || '';

  const propiedades = await prisma.propiedad.findMany({
    where: {
      deletedAt: null,
      ...(tipo ? { tipo } : {}),
      ...(busqueda
        ? {
            OR: [
              { titulo: { contains: busqueda, mode: 'insensitive' } },
              { ciudad: { contains: busqueda, mode: 'insensitive' } },
              { colonia: { contains: busqueda, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { asesor: true, multimedia: true },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Catálogo de Propiedades</h1>
          <p className="text-slate-400 text-sm mt-1">Inmuebles disponibles en venta, renta y preventa</p>
        </div>
        <form method="GET" className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            name="busqueda"
            defaultValue={busqueda}
            placeholder="Buscar por título, ciudad, colonia..."
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {propiedades.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
            No se encontraron propiedades en el catálogo.
          </div>
        ) : (
          propiedades.map((p) => (
            <div key={p.id_propiedad} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between group">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                    {p.tipo_operacion}
                  </span>
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">{p.tipo}</span>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-white group-hover:text-amber-400 transition-colors line-clamp-1">{p.titulo}</h3>
                  <p className="text-xs text-slate-400 mt-1">{p.ciudad || 'Sin ubicación'}, {p.colonia || ''}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 text-center text-xs text-slate-300">
                  <div>
                    <span className="block font-bold text-white text-sm">{p.recamaras || 0}</span>
                    <span className="text-slate-500 text-[10px] uppercase">Recámaras</span>
                  </div>
                  <div>
                    <span className="block font-bold text-white text-sm">{p.banos || 0}</span>
                    <span className="text-slate-500 text-[10px] uppercase">Baños</span>
                  </div>
                  <div>
                    <span className="block font-bold text-white text-sm">{p.m2_construccion ? `${p.m2_construccion}m²` : 'N/A'}</span>
                    <span className="text-slate-500 text-[10px] uppercase">Construcción</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between">
                <div className="font-mono font-extrabold text-emerald-400 text-lg">
                  ${p.precio.toLocaleString()}
                </div>
                <Link
                  href={`/matching?propiedad_id=${p.id_propiedad}`}
                  className="text-xs font-bold text-amber-400 hover:underline"
                >
                  Buscar Matches →
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
