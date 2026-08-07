'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NuevoClientePage() {
  const router = useRouter();
  const [form, setForm] = useState({ nombre: '', apellido_paterno: '', correo: '', whatsapp: '', presupuesto_max: '' });
  const [error, setError] = useState('');
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    const response = await fetch('/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, presupuesto_max: form.presupuesto_max ? Number(form.presupuesto_max) : null }) });
    if (!response.ok) { setError((await response.json()).error || 'No se pudo guardar'); return; }
    router.push('/clientes'); router.refresh();
  }
  return <main className="max-w-3xl mx-auto p-6 md:p-8"><h1 className="text-3xl font-extrabold">Nuevo cliente</h1><form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">{[['nombre','Nombre'],['apellido_paterno','Apellido paterno'],['correo','Correo'],['whatsapp','WhatsApp'],['presupuesto_max','Presupuesto máximo']].map(([key,label]) => <label key={key} className="grid gap-1 text-sm text-slate-300">{label}<input required={key === 'nombre' || key === 'apellido_paterno'} type={key === 'presupuesto_max' ? 'number' : key === 'correo' ? 'email' : 'text'} value={form[key as keyof typeof form]} onChange={(e) => update(key, e.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /></label>)}{error && <p className="text-sm text-red-400">{error}</p>}<button className="rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950">Guardar cliente</button></form></main>;
}
