'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="es"><body className="bg-slate-950 text-slate-100"><main className="min-h-screen flex items-center justify-center p-6"><section className="max-w-md rounded-2xl border border-red-500/30 bg-slate-900 p-8 text-center"><h1 className="text-xl font-bold">Servicio temporalmente no disponible</h1><p className="mt-3 text-sm text-slate-400">No pudimos cargar el sistema. Intenta nuevamente en unos momentos.</p><button onClick={() => reset()} className="mt-6 rounded-lg bg-amber-500 px-4 py-2 font-bold text-slate-950">Reintentar</button></section></main></body></html>;
}
