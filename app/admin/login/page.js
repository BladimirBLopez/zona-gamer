'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, LogIn } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (event) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        cache: 'no-store',
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'No se pudo iniciar sesión'
        );
      }

      setPassword('');
      router.replace('/admin');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-10 text-gray-100">
      <form
        onSubmit={login}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-card p-6 shadow-xl"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-2xl bg-accent/15 p-4 text-neon">
            <LockKeyhole size={30} />
          </div>

          <h1 className="font-display text-2xl font-bold">
            Zona <span className="text-neon">Gamer</span>
          </h1>

          <p className="text-sm text-gray-400">
            Acceso al panel administrativo
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="admin-password"
            className="text-sm text-gray-300"
          >
            Contraseña
          </label>
          <input
            id="admin-password"
            type="password"
            required
            maxLength={256}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-accent"
            placeholder="Tu contraseña"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          <LogIn size={18} />
          {loading ? 'Ingresando...' : 'Ingresar al panel'}
        </button>

        <p className="text-center text-xs text-gray-500">
          Acceso exclusivo para administración
        </p>
      </form>
    </main>
  );
}
