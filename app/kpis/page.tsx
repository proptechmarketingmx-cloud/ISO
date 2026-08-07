import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export default async function KpisPage() {
  const [clientes, propiedades, asesores, compatibilidades] = await Promise.all([prisma.cliente.count({ where: { deletedAt: null } }), prisma.propiedad.count({ where: { deletedAt: null } }), prisma.asesor.count({ where: { status: 'activo' } }), prisma.compatibilidadClientePropiedad.count()]);
  const cards = [['Clientes', clientes], ['Propiedades', propiedades], ['Asesores activos', asesores], ['Matches calculados', compatibilidades]];
  return <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-6"><div><h1 className="text-3xl font-extrabold">KPIs</h1><p className="text-slate-400 text-sm mt-1">Indicadores operativos calculados desde Supabase</p></div><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{cards.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"><p className="text-xs uppercase tracking-wider text-slate-400">{label}</p><p className="text-4xl font-black text-amber-400 mt-2">{value}</p></div>)}</div></main>;
}
