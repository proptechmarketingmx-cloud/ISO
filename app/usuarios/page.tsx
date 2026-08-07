import { prisma } from '@/lib/prisma';

export const revalidate = 0;

export default async function UsuariosPage() {
  const usuarios = await prisma.usuario.findMany({ include: { tenant: true, asesor: true }, orderBy: { created_at: 'desc' } });
  return <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-6"><div><h1 className="text-3xl font-extrabold">Usuarios</h1><p className="text-slate-400 text-sm mt-1">Accesos y cuentas del sistema</p></div><div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60"><table className="w-full text-sm"><thead className="bg-slate-800 text-slate-400"><tr><th className="p-4 text-left">Usuario</th><th className="p-4 text-left">Tenant</th><th className="p-4 text-left">Asesor</th><th className="p-4 text-left">Estado</th></tr></thead><tbody className="divide-y divide-slate-800">{usuarios.map((u) => <tr key={u.id_usuario}><td className="p-4">{u.nombre || u.email}<div className="text-xs text-slate-500">{u.email}</div></td><td className="p-4 text-slate-400">{u.tenant?.nombre || 'Global'}</td><td className="p-4 text-slate-400">{u.asesor ? `${u.asesor.nombre} ${u.asesor.apellidos}` : '—'}</td><td className="p-4"><span className={u.activo ? 'text-emerald-400' : 'text-red-400'}>{u.activo ? 'Activo' : 'Inactivo'}</span></td></tr>)}</tbody></table></div></main>;
}
