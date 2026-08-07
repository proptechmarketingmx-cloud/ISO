'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Simulación de autenticación (listo para conectar con Supabase Auth)
      if (email && password) {
        router.push('/dashboard');
      } else {
        throw new Error('Ingrese su correo y contraseña');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-xl mx-auto shadow-lg shadow-amber-500/20">
            ISO
          </div>
          <h1 className="text-2xl font-extrabold text-white">ISO Plataforma</h1>
          <p className="text-xs text-slate-400">Acceso al Sistema Inmobiliario</p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="usuario@agencia.com"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            {loading ? 'Autenticando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
