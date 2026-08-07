'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Field = { key: string; label: string; type?: 'number' | 'date' | 'select' | 'textarea' | 'multi' | 'tel'; options?: string[] };
const sections: { title: string; fields: Field[] }[] = [
  { title: 'General', fields: [
    { key: 'titulo', label: 'Título' }, { key: 'descripcion', label: 'Descripción', type: 'textarea' }, { key: 'tipo', label: 'Tipo de propiedad', type: 'select', options: ['casa', 'departamento', 'terreno', 'local', 'oficina', 'bodega'] },
    { key: 'tipo_operacion', label: 'Operación', type: 'select', options: ['venta', 'renta', 'preventa'] }, { key: 'status', label: 'Estatus', type: 'select', options: ['disponible', 'reservada', 'vendida', 'rentada', 'inactiva'] }, { key: 'id_asesor', label: 'ID asesor responsable', type: 'number' },
  ] },
  { title: 'Propietario', fields: [{ key: 'propietario_nombre', label: 'Nombre del propietario' }, { key: 'propietario_whatsapp', label: 'WhatsApp del propietario', type: 'tel' }] },
  { title: 'Ubicación', fields: [
    { key: 'pais', label: 'País' }, { key: 'estado', label: 'Estado' }, { key: 'municipio', label: 'Municipio' }, { key: 'ciudad', label: 'Ciudad' }, { key: 'colonia', label: 'Colonia' }, { key: 'fraccionamiento', label: 'Fraccionamiento' }, { key: 'codigo_postal', label: 'Código postal' },
  ] },
  { title: 'Información comercial', fields: [
    { key: 'precio', label: 'Precio', type: 'number' }, { key: 'precio_negociable', label: 'Precio negociable', type: 'select', options: ['false', 'true'] }, { key: 'creditos_aceptados', label: 'Créditos aceptados', type: 'multi' },
    { key: 'comision', label: 'Comisión (%)', type: 'number' }, { key: 'comision_compartida', label: 'Comisión compartida (%)', type: 'number' }, { key: 'exclusiva', label: 'Exclusiva', type: 'select', options: ['false', 'true'] },
    { key: 'fecha_captacion', label: 'Fecha de captación', type: 'date' }, { key: 'fecha_publicacion', label: 'Fecha de publicación', type: 'date' },
  ] },
  { title: 'Características físicas', fields: [
    { key: 'm2_construccion', label: 'm² de construcción', type: 'number' }, { key: 'm2_terreno', label: 'm² de terreno', type: 'number' }, { key: 'frente', label: 'Frente (m)', type: 'number' }, { key: 'fondo', label: 'Fondo (m)', type: 'number' },
    { key: 'recamaras', label: 'Recámaras totales', type: 'number' }, { key: 'recamaras_pb', label: 'Recámaras en PB', type: 'number' }, { key: 'banos', label: 'Baños', type: 'number' }, { key: 'niveles', label: 'Niveles / pisos', type: 'number' }, { key: 'estacionamientos', label: 'Estacionamientos', type: 'number' }, { key: 'antiguedad', label: 'Antigüedad (años)', type: 'number' },
    { key: 'orientacion', label: 'Orientación', type: 'select', options: ['norte', 'sur', 'oriente', 'poniente', 'noreste', 'noroeste', 'sureste', 'suroeste'] }, { key: 'estado_conservacion', label: 'Estado de conservación', type: 'select', options: ['nuevo', 'excelente', 'bueno', 'regular', 'requiere_remodelacion'] }, { key: 'remodelada', label: 'Remodelada', type: 'select', options: ['false', 'true'] }, { key: 'anio_construccion', label: 'Año de construcción', type: 'number' },
  ] },
  { title: 'Situación legal', fields: [
    { key: 'escrituras', label: 'Tiene escrituras', type: 'select', options: ['false', 'true'] }, { key: 'regimen', label: 'Régimen legal', type: 'select', options: ['individual', 'copropiedad', 'condominio', 'ejidal', 'otro'] }, { key: 'libre_gravamen', label: 'Libre de gravamen', type: 'select', options: ['false', 'true'] }, { key: 'predial', label: 'Predial al corriente', type: 'select', options: ['false', 'true'] }, { key: 'adeudos', label: 'Cero adeudos', type: 'select', options: ['false', 'true'] }, { key: 'hipoteca_vigente', label: 'Hipoteca vigente', type: 'select', options: ['false', 'true'] }, { key: 'documentacion_completa', label: 'Documentación completa', type: 'select', options: ['false', 'true'] },
  ] },
  { title: 'Perfil ideal del comprador', fields: [
    { key: 'ingreso_recomendado', label: 'Ingreso recomendado', type: 'number' }, { key: 'tipo_credito_ideal', label: 'Tipo de crédito ideal', type: 'select', options: ['contado', 'infonavit', 'fovissste', 'bancario', 'cofinavit', 'otro'] }, { key: 'estado_civil_ideal', label: 'Estado civil ideal', type: 'select', options: ['soltero', 'casado', 'union_libre', 'divorciado', 'viudo'] }, { key: 'genero_ideal', label: 'Género ideal', type: 'select', options: ['femenino', 'masculino', 'no_binario', 'indistinto'] },
    { key: 'hijos_ideal', label: 'Hijos ideales', type: 'number' }, { key: 'mascotas_ideal', label: 'Mascotas ideales', type: 'number' }, { key: 'integrantes_ideal', label: 'Integrantes ideales', type: 'number' }, { key: 'ideal_para', label: 'Ideal para', type: 'multi' }, { key: 'amenidades', label: 'Amenidades', type: 'multi' }, { key: 'servicios', label: 'Servicios', type: 'multi' }, { key: 'uso_suelo', label: 'Uso de suelo', type: 'select', options: ['habitacional', 'comercial', 'mixto', 'industrial', 'oficinas'] },
  ] },
];
const numeric = new Set(sections.flatMap((s) => s.fields.filter((f) => f.type === 'number').map((f) => f.key)));
const booleans = new Set(['precio_negociable', 'exclusiva', 'remodelada', 'escrituras', 'libre_gravamen', 'predial', 'adeudos', 'hipoteca_vigente', 'documentacion_completa']);
const initial = Object.fromEntries(sections.flatMap((s) => s.fields.map((f) => [f.key, f.key === 'tipo' ? 'casa' : f.key === 'tipo_operacion' ? 'venta' : f.key === 'status' ? 'disponible' : '']))) as Record<string, string>;

function FieldControl({ field, value, onChange }: { field: Field; value: string; onChange: (value: string) => void }) {
  const common = { value, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(e.target.value), className: 'rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white' };
  if (field.type === 'select') return <select {...common}><option value="">Seleccionar…</option>{field.options?.map((o) => <option key={o} value={o}>{o.replaceAll('_', ' ')}</option>)}</select>;
  if (field.type === 'textarea') return <textarea {...common} rows={4} />;
  return <input {...common} type={field.type === 'multi' ? 'text' : field.type || 'text'} placeholder={field.type === 'multi' ? 'Separar con comas' : undefined} />;
}

export default function NuevaPropiedadPage() {
  const router = useRouter(); const [form, setForm] = useState(initial); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSaving(true);
    const body = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim() === '' ? null : numeric.has(key) ? Number(value) : booleans.has(key) ? value === 'true' : ['creditos_aceptados', 'ideal_para', 'amenidades', 'servicios'].includes(key) ? JSON.stringify(value.split(',').map((v) => v.trim()).filter(Boolean)) : value]));
    try { const response = await fetch('/api/propiedades', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!response.ok) throw new Error((await response.json()).error || 'No se pudo guardar'); router.push('/propiedades'); router.refresh(); } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar'); } finally { setSaving(false); }
  }
  return <main className="mx-auto max-w-6xl p-6 md:p-8"><h1 className="text-3xl font-extrabold">Nueva propiedad</h1><p className="mt-1 text-sm text-slate-400">Captura completa para inventario, KPIs y matching.</p><form onSubmit={submit} className="mt-6 space-y-6">{sections.map((section) => <section key={section.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"><h2 className="mb-4 text-lg font-bold text-amber-400">{section.title}</h2><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{section.fields.map((field) => <label key={field.key} className={`grid gap-1 text-sm text-slate-300 ${field.type === 'textarea' ? 'md:col-span-2 lg:col-span-3' : ''}`}>{field.label}<FieldControl field={field} value={form[field.key]} onChange={(value) => update(field.key, value)} /></label>)}</div></section>)}{error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}<button disabled={saving} className="rounded-lg bg-amber-500 px-6 py-3 font-bold text-slate-950 disabled:opacity-50">{saving ? 'Guardando…' : 'Guardar propiedad'}</button></form></main>;
}
