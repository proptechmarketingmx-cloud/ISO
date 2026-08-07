'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Field = { key: string; label: string; type?: 'number' | 'date' | 'email' | 'tel' | 'select' | 'textarea' | 'multi'; options?: string[] };
const sections: { title: string; fields: Field[] }[] = [
  { title: 'Identificación', fields: [
    { key: 'nombre', label: 'Nombre' }, { key: 'apellido_paterno', label: 'Apellido paterno' }, { key: 'apellido_materno', label: 'Apellido materno' },
    { key: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date' }, { key: 'genero', label: 'Género', type: 'select', options: ['femenino', 'masculino', 'no_binario', 'prefiero_no_decir'] },
    { key: 'estado_civil', label: 'Estado civil', type: 'select', options: ['soltero', 'casado', 'union_libre', 'divorciado', 'viudo'] }, { key: 'nacionalidad', label: 'Nacionalidad' },
    { key: 'curp', label: 'CURP' }, { key: 'rfc', label: 'RFC' },
  ] },
  { title: 'Contacto y ubicación', fields: [
    { key: 'telefono_principal', label: 'Teléfono principal', type: 'tel' }, { key: 'whatsapp', label: 'WhatsApp', type: 'tel' }, { key: 'correo', label: 'Correo electrónico', type: 'email' },
    { key: 'pais', label: 'País' }, { key: 'estado', label: 'Estado' }, { key: 'municipio', label: 'Municipio' }, { key: 'colonia', label: 'Colonia' },
    { key: 'fraccionamiento', label: 'Fraccionamiento' }, { key: 'codigo_postal', label: 'Código postal' }, { key: 'direccion', label: 'Dirección física' },
  ] },
  { title: 'Demografía y familia', fields: [
    { key: 'profesion', label: 'Profesión' }, { key: 'puesto', label: 'Puesto / cargo' }, { key: 'escolaridad', label: 'Escolaridad', type: 'select', options: ['primaria', 'secundaria', 'media_superior', 'licenciatura', 'posgrado'] },
    { key: 'conyuge', label: 'Cónyuge' }, { key: 'conyuge_whatsapp', label: 'WhatsApp del cónyuge', type: 'tel' }, { key: 'hijos', label: 'Hijos', type: 'number' },
    { key: 'mascotas', label: 'Mascotas', type: 'number' }, { key: 'integrantes_hogar', label: 'Integrantes del hogar', type: 'number' }, { key: 'dependientes_eco', label: 'Dependientes económicos', type: 'number' }, { key: 'adultos_mayores_cargo', label: 'Adultos mayores a cargo', type: 'number' },
  ] },
  { title: 'Perfil financiero', fields: [
    { key: 'nombre_empresa', label: 'Empresa' }, { key: 'ocupacion', label: 'Ocupación' }, { key: 'antiguedad_laboral', label: 'Antigüedad laboral' },
    { key: 'ingreso_mensual', label: 'Ingreso mensual', type: 'number' }, { key: 'tipo_credito', label: 'Tipo de crédito', type: 'select', options: ['contado', 'infonavit', 'fovissste', 'bancario', 'cofinavit', 'otro'] },
    { key: 'presupuesto_min', label: 'Presupuesto mínimo', type: 'number' }, { key: 'presupuesto_max', label: 'Presupuesto máximo', type: 'number' }, { key: 'enganche_disponible', label: 'Enganche disponible', type: 'number' }, { key: 'pago_mensual_objetivo', label: 'Pago mensual objetivo', type: 'number' }, { key: 'capacidad_credito_max', label: 'Capacidad máxima de crédito', type: 'number' },
  ] },
  { title: 'Necesidad de vivienda', fields: [
    { key: 'operacion', label: 'Operación', type: 'select', options: ['venta', 'renta', 'preventa'] }, { key: 'tipo_propiedad', label: 'Tipo de propiedad', type: 'select', options: ['casa', 'departamento', 'terreno', 'local', 'oficina', 'bodega'] },
    { key: 'estado_busqueda', label: 'Estado de búsqueda' }, { key: 'ciudad_busqueda', label: 'Ciudad de búsqueda' }, { key: 'fraccionamiento_colonia', label: 'Zonas deseadas' },
    { key: 'habitaciones_pa', label: 'Recámaras PA mínimas', type: 'number' }, { key: 'habitaciones_pb', label: 'Recámaras PB mínimas', type: 'number' }, { key: 'banos', label: 'Baños mínimos', type: 'number' }, { key: 'estacionamiento', label: 'Estacionamientos mínimos', type: 'number' },
    { key: 'm2_terreno_min', label: 'Terreno mínimo (m²)', type: 'number' }, { key: 'm2_terreno_max', label: 'Terreno máximo (m²)', type: 'number' }, { key: 'm2_construccion_min', label: 'Construcción mínima (m²)', type: 'number' }, { key: 'm2_construccion_max', label: 'Construcción máxima (m²)', type: 'number' }, { key: 'niveles_max', label: 'Niveles máximos', type: 'number' }, { key: 'antiguedad_max', label: 'Antigüedad máxima (años)', type: 'number' },
    { key: 'motivacion', label: 'Motivación', type: 'select', options: ['inversion', 'casa_propia', 'cambio_de_vivienda', 'retiro', 'otro'] }, { key: 'amenidades_deseadas', label: 'Amenidades deseadas', type: 'multi' },
  ] },
  { title: 'Seguimiento comercial', fields: [
    { key: 'id_asesor', label: 'ID asesor', type: 'number' }, { key: 'estado_cliente', label: 'Estatus del lead', type: 'select', options: ['nuevo', 'contactado', 'cotizacion', 'negociacion', 'cerrado', 'perdido'] }, { key: 'temporalidad', label: 'Temporalidad de compra', type: 'select', options: ['inmediata', '1_3_meses', '3_6_meses', '6_12_meses', 'sin_definir'] },
    { key: 'referenciado', label: 'Referenciado por' }, { key: 'fuente_lead', label: 'Origen / fuente' }, { key: 'campana', label: 'Campaña' }, { key: 'medio_adquisicion', label: 'Medio de adquisición' }, { key: 'utm_source', label: 'UTM source' }, { key: 'utm_medium', label: 'UTM medium' }, { key: 'utm_campaign', label: 'UTM campaign' },
  ] },
];
const numeric = new Set(sections.flatMap((s) => s.fields.filter((f) => f.type === 'number').map((f) => f.key)));
const initial = Object.fromEntries(sections.flatMap((s) => s.fields.map((f) => [f.key, '']))) as Record<string, string>;

function FieldControl({ field, value, onChange }: { field: Field; value: string; onChange: (value: string) => void }) {
  const common = { value, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(e.target.value), className: 'rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white' };
  if (field.type === 'select') return <select {...common}><option value="">Seleccionar…</option>{field.options?.map((o) => <option key={o} value={o}>{o.replaceAll('_', ' ')}</option>)}</select>;
  if (field.type === 'textarea') return <textarea {...common} rows={3} />;
  return <input {...common} type={field.type === 'multi' ? 'text' : field.type || 'text'} placeholder={field.type === 'multi' ? 'Separar con comas' : undefined} />;
}

export default function NuevoClientePage() {
  const router = useRouter(); const [form, setForm] = useState(initial); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setSaving(true);
    const body = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim() === '' ? null : numeric.has(key) ? Number(value) : key === 'amenidades_deseadas' ? JSON.stringify(value.split(',').map((v) => v.trim()).filter(Boolean)) : value]));
    try { const response = await fetch('/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!response.ok) throw new Error((await response.json()).error || 'No se pudo guardar'); router.push('/clientes'); router.refresh(); } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo guardar'); } finally { setSaving(false); }
  }
  return <main className="mx-auto max-w-6xl p-6 md:p-8"><h1 className="text-3xl font-extrabold">Nuevo cliente</h1><p className="mt-1 text-sm text-slate-400">Expediente completo para CNA y matching.</p><form onSubmit={submit} className="mt-6 space-y-6">{sections.map((section) => <section key={section.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"><h2 className="mb-4 text-lg font-bold text-amber-400">{section.title}</h2><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{section.fields.map((field) => <label key={field.key} className="grid gap-1 text-sm text-slate-300">{field.label}<FieldControl field={field} value={form[field.key]} onChange={(value) => update(field.key, value)} /></label>)}</div></section>)}{error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}<button disabled={saving} className="rounded-lg bg-amber-500 px-6 py-3 font-bold text-slate-950 disabled:opacity-50">{saving ? 'Guardando…' : 'Guardar cliente'}</button></form></main>;
}
