import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export default async function AsesoresPage() {
  const asesores = await prisma.asesor.findMany({
    where: { status: 'activo' },
    include: { _count: { select: { clientes: true, propiedades: true } } },
    orderBy: { nombre: 'asc' },
  });
  return <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-6"><div><h1 className="text-3xl font-extrabold">Asesores</h1><p className="text-slate-400 text-sm mt-1">Equipo comercial activo</p></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{asesores.map((a) => <article key={a.id_asesor} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"><h2 className="font-bold text-lg">{a.nombre} {a.apellidos}</h2><p className="text-slate-400 text-sm">{a.correo || 'Sin correo'} · {a.telefono || 'Sin teléfono'}</p><div className="mt-4 flex gap-4 text-sm"><span>{a._count.clientes} clientes</span><span>{a._count.propiedades} propiedades</span></div></article>)}</div></main>;
}
