'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[ISO] Error de aplicación:', error);
  }, [error]);

  const databaseError = /prisma|database|postgres|tenant\/user|ENOTFOUND/i.test(error.message);

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <section className="max-w-lg rounded-2xl border border-amber-500/30 bg-slate-900/80 p-8 text-center shadow-xl">
        <div className="text-4xl mb-4">⚠️</div>
        <h1 className="text-xl font-bold text-white">{databaseError ? 'Base de datos no disponible' : 'No se pudo cargar la página'}</h1>
        <p className="mt-3 text-sm text-slate-400">
          {databaseError
            ? 'Verifica que DATABASE_URL apunte a un PostgreSQL válido y reinicia la aplicación.'
            : 'Ocurrió un error inesperado al cargar este módulo.'}
        </p>
        <button onClick={() => reset()} className="mt-6 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-400">
          Reintentar
        </button>
      </section>
    </main>
  );
}
