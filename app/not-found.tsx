import Link from 'next/link';

export default function NotFound() {
  return <main className="mx-auto max-w-xl p-8 text-center"><h1 className="text-3xl font-extrabold">Registro no encontrado</h1><p className="mt-2 text-slate-400">El recurso solicitado no existe o ya no está disponible.</p><Link href="/dashboard" className="mt-6 inline-block rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950">Volver al dashboard</Link></main>;
}
