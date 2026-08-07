'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NuevaPropiedadPage() {
  const router = useRouter();
  const [form, setForm] = useState({ titulo: '', tipo: 'casa', tipo_operacion: 'venta', precio: '', ciudad: '', colonia: '', descripcion: '' });
  const [error, setError] = useState('');
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    const response = await fetch('/api/propiedades', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, precio: Number(form.precio) }) });
    if (!response.ok) { setError((await response.json()).error || 'No se pudo guardar'); return; }
    router.push('/propiedades'); router.refresh();
  }
  return <main className="max-w-3xl mx-auto p-6 md:p-8"><h1 className="text-3xl font-extrabold">Nueva propiedad</h1><form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">{[['titulo','Título'],['precio','Precio'],['ciudad','Ciudad'],['colonia','Colonia']].map(([key,label]) => <label key={key} className="grid gap-1 text-sm text-slate-300">{label}<input required={key === 'titulo' || key === 'precio'} type={key === 'precio' ? 'number' : 'text'} value={form[key as keyof typeof form]} onChange={(e) => update(key, e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /></label>)}<label className="grid gap-1 text-sm text-slate-300">Tipo<select value={form.tipo} onChange={(e) => update('tipo', e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"><option>casa</option><option>departamento</option><option>terreno</option><option>local</option></select></label><label className="grid gap-1 text-sm text-slate-300">Operación<select value={form.tipo_operacion} onChange={(e) => update('tipo_operacion', e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"><option>venta</option><option>renta</option><option>preventa</option></select></label><label className="grid gap-1 text-sm text-slate-300">Descripción<textarea value={form.descripcion} onChange={(e) => update('descripcion', e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" rows={4} /></label>{error && <p className="text-sm text-red-400">{error}</p>}<button className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950">Guardar propiedad</button></form></main>;
}
