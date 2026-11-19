'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const logout = async () => {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('No se pudo cerrar sesión');
      }

      router.replace('/admin/login');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-xs text-red-400">
          {error}
        </span>
      )}
      <button
        type="button"
        onClick={logout}
        disabled={loading}
        className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-200 disabled:opacity-50"
      >
        <LogOut size={15} />
        {loading ? 'Saliendo...' : 'Cerrar sesión'}
      </button>
    </div>
  );
}
