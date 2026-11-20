'use client';

import { useState } from 'react';
import { X, Tag, Plus } from 'lucide-react';

export default function CategoriesModule({
  categories,
  onClose,
  onReload,
  onCreated
}) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  async function add(event) {
    event.preventDefault();
    if (saving) return;

    const clean = name.replace(/\s+/g, ' ').trim();

    if (clean.length < 2) {
      setError('Escribe al menos 2 letras.');
      return;
    }

    setSaving(true);
    setError('');
    setDone('');

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: clean })
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(
          result.error || 'No se pudo agregar la categoría.'
        );
      }

      setName('');
      setDone(`Categoría "${result.category.name}" agregada.`);
      await onReload();
      if (onCreated) onCreated(result.category.name);
    } catch (err) {
      setError(err.message || 'No se pudo agregar la categoría.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 sm:items-center"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Categorías"
        className="flex max-h-[92vh] w-full flex-col rounded-t-2xl border border-white/10 bg-card text-gray-100 sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 p-4 pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-neon">
              <Tag size={20} />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">Categorías</h2>
              <p className="text-xs text-gray-400">
                Organiza tu catálogo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={add} className="space-y-2 px-4 pb-3">
          <label className="block text-xs text-gray-300" htmlFor="zg-cat-name">
            Nueva categoría
          </label>
          <div className="flex gap-2">
            <input
              id="zg-cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              disabled={saving}
              placeholder="Ej. Auriculares"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={saving || name.trim().length < 2}
              className="flex shrink-0 items-center gap-1 rounded-lg bg-accent px-4 text-sm font-semibold disabled:opacity-50"
            >
              <Plus size={16} />
              {saving ? 'Agregando...' : 'Agregar'}
            </button>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-400/30 bg-red-500/10 p-2 text-xs text-red-200"
            >
              {error}
            </p>
          )}

          {done && (
            <p
              role="status"
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-200"
            >
              {done}
            </p>
          )}
        </form>

        <div className="min-h-0 flex-1 overflow-y-auto border-t border-white/10 px-4 py-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {categories.length}{' '}
            {categories.length === 1 ? 'categoría' : 'categorías'}
          </p>

          <ul className="space-y-1.5">
            {categories.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
              >
                <span className="truncate text-sm font-medium">
                  {c.name}
                </span>
                <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-gray-300">
                  {c.products === 0
                    ? 'Sin productos'
                    : c.products === 1
                      ? '1 producto'
                      : `${c.products} productos`}
                </span>
              </li>
            ))}
          </ul>

          {categories.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-500">
              Aún no hay categorías.
            </p>
          )}
        </div>

        <p className="border-t border-white/10 px-4 py-3 text-center text-[11px] text-gray-400">
          Las categorías aparecen al registrar o editar un producto.
        </p>
      </div>
    </div>
  );
}
