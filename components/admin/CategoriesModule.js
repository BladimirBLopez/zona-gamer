'use client';

import { useState } from 'react';
import { X, Tag, Plus, Pencil, Trash2, Check } from 'lucide-react';

export default function CategoriesModule({
  categories,
  onClose,
  onReload,
  onCreated,
  onRenamed
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
              <CategoryRow
                key={c.id}
                c={c}
                onReload={onReload}
                onRenamed={onRenamed}
              />
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

function CategoryRow({ c, onReload, onRenamed }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(c.name);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const countLabel =
    c.products === 0
      ? 'Sin productos'
      : c.products === 1
        ? '1 producto'
        : `${c.products} productos`;

  async function call(method, body) {
    const response = await fetch(`/api/admin/categories/${c.id}`, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result.error || 'No se pudo completar la acción.');
    }
    return result;
  }

  function startEdit() {
    setValue(c.name);
    setErr('');
    setConfirming(false);
    setEditing(true);
  }

  async function save(event) {
    event.preventDefault();
    if (busy) return;

    const clean = value.replace(/\s+/g, ' ').trim();
    if (clean.length < 2) {
      setErr('Escribe al menos 2 letras.');
      return;
    }
    if (clean === c.name) {
      setEditing(false);
      setErr('');
      return;
    }

    setBusy(true);
    setErr('');
    try {
      await call('PATCH', { name: clean });
      setEditing(false);
      await onReload();
      if (onRenamed) onRenamed(c.name, clean);
    } catch (e) {
      setErr(e.message || 'No se pudo renombrar.');
    } finally {
      setBusy(false);
    }
  }

  function askDelete() {
    setErr('');
    if (c.products > 0) {
      setErr(
        `Tiene ${c.products} ${c.products === 1 ? 'producto' : 'productos'}. Muévelos a otra categoría antes de borrarla.`
      );
      return;
    }
    setConfirming(true);
  }

  async function remove() {
    if (busy) return;
    setBusy(true);
    setErr('');
    try {
      await call('DELETE');
      await onReload();
    } catch (e) {
      setErr(e.message || 'No se pudo borrar.');
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
      {editing ? (
        <form onSubmit={save} className="flex items-center gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={60}
            disabled={busy}
            autoFocus
            aria-label="Nombre de la categoría"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={busy}
            aria-label="Guardar nombre"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-white disabled:opacity-60"
          >
            <Check size={16} />
          </button>
          <button
            type="button"
            onClick={() => { setEditing(false); setErr(''); }}
            disabled={busy}
            aria-label="Cancelar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-gray-400"
          >
            <X size={16} />
          </button>
        </form>
      ) : confirming ? (
        <div className="flex items-center justify-between gap-3">
          <span className="min-w-0 truncate text-sm">¿Borrar «{c.name}»?</span>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={busy}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              {busy ? 'Borrando...' : 'Borrar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {c.name}
          </span>
          <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-gray-300">
            {countLabel}
          </span>
          <button
            type="button"
            onClick={startEdit}
            aria-label={`Renombrar ${c.name}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={askDelete}
            aria-label={`Borrar ${c.name}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-300"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
      {err && (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {err}
        </p>
      )}
    </li>
  );
}
