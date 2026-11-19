'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Pencil, X, Package, AlertTriangle, Ban, RotateCcw } from 'lucide-react';
import { fmt, stockInfo } from '../../lib/utils';

export default function Admin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Todas');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    setUnauthorized(false);

    try {
      const response = await fetch('/api/admin/products', {
        cache: 'no-store',
        credentials: 'same-origin',
      });

      const data = await response.json();

      if (response.status === 401) {
        setUnauthorized(true);
        throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.');
      }

      if (!response.ok || !data.ok || !Array.isArray(data.products)) {
        throw new Error(data.error || 'No se pudieron cargar los productos.');
      }

      setItems(data.products);
    } catch (err) {
      setItems([]);
      setError(err.message || 'Error al conectar con Neon.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const cats = useMemo(
    () => [...new Set(items.map((p) => p.category).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'es')),
    [items]
  );

  const list = useMemo(
    () => items.filter((p) =>
      (cat === 'Todas' || p.category === cat) &&
      `${p.name || ''} ${p.brand || ''}`
        .toLowerCase()
        .includes(q.toLowerCase().trim())
    ),
    [items, q, cat]
  );

  const stats = {
    total: items.length,
    low: items.filter((p) => p.stock > 0 && p.stock <= 3).length,
    out: items.filter((p) => p.stock <= 0).length,
  };

  const openEditor = (product) => {
    setSaveError('');
    setEditing({
      id: product.id,
      name: product.name,
      price: String(product.price),
      stock: String(product.stock),
    });
  };

  const saveChanges = async (event) => {
    event.preventDefault();
    if (!editing || saving) return;

    const rawPrice = editing.price.trim();
    const rawStock = editing.stock.trim();
    const price = Number(rawPrice);
    const stock = Number(rawStock);

    if (
      !/^\d+(?:\.\d{1,2})?$/.test(rawPrice) ||
      !Number.isFinite(price) ||
      price > 10000000
    ) {
      setSaveError('Ingresa un precio válido, con máximo 2 decimales.');
      return;
    }

    if (
      !/^\d+$/.test(rawStock) ||
      !Number.isSafeInteger(stock) ||
      stock > 1000000
    ) {
      setSaveError('El stock debe ser un número entero entre 0 y 1000000.');
      return;
    }

    setSaving(true);
    setSaveError('');

    try {
      const response = await fetch(
        `/api/admin/products/${editing.id}`,
        {
          method: 'PATCH',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ price, stock }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok || !result.product) {
        throw new Error(result.error || 'No se pudieron guardar los cambios.');
      }

      setItems((current) =>
        current.map((product) =>
          product.id === editing.id
            ? {
                ...product,
                price: result.product.price,
                stock: result.product.stock,
              }
            : product
        )
      );

      setEditing(null);
    } catch (error) {
      setSaveError(error.message || 'Error al guardar en Neon.');
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-accent';

  return (
    <main className="min-h-screen bg-bg text-gray-100 pb-24">
      <header className="sticky top-0 z-20 bg-bg/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold">
            Panel <span className="text-neon">Zona Gamer</span>
          </h1>
          <p className="text-[11px] text-gray-400">
            Productos reales de Neon · Solo lectura
          </p>
        </div>
        <button
          onClick={loadProducts}
          disabled={loading}
          className="p-2 rounded-lg bg-white/5 text-gray-300 disabled:opacity-50"
          title="Actualizar productos desde Neon"
          aria-label="Actualizar productos"
        >
          <RotateCcw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <section className="px-4 pt-4 grid grid-cols-3 gap-2">
        {[
          { l: 'Productos', v: stats.total, i: Package, c: 'text-neon' },
          { l: 'Pocas unid.', v: stats.low, i: AlertTriangle, c: 'text-amber-300' },
          { l: 'Agotados', v: stats.out, i: Ban, c: 'text-red-300' },
        ].map((s) => (
          <div key={s.l} className="rounded-xl bg-card border border-white/10 p-3">
            <s.i size={16} className={s.c} />
            <p className="text-xl font-bold mt-1">
              {loading || error ? '—' : s.v}
            </p>
            <p className="text-[11px] text-gray-400">{s.l}</p>
          </div>
        ))}
      </section>

      <section className="px-4 pt-4 space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar producto o marca"
            className={input + ' pl-9'}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['Todas', ...cats].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs border ${
                cat === c
                  ? 'bg-accent border-accent text-white'
                  : 'border-white/10 text-gray-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-3 space-y-2">
        {error && (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
            <p>{error}</p>
            {unauthorized && (
              <a href="/admin/login" className="mt-2 inline-block underline">
                Iniciar sesión nuevamente
              </a>
            )}
            <button
              onClick={loadProducts}
              className="mt-3 block rounded-lg bg-white/10 px-3 py-2"
            >
              Reintentar
            </button>
          </div>
        )}

        {loading && (
          <p className="text-center text-sm text-gray-400 py-10">
            Cargando productos desde Neon...
          </p>
        )}

        {!loading && !error && list.map((p) => {
          const s = stockInfo(p.stock);

          return (
            <div key={p.id} className="rounded-xl bg-card border border-white/10 p-3 flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.name}
                className="w-16 h-16 rounded-lg object-contain bg-black/40 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{p.name}</p>
                <p className="text-[11px] text-gray-400 truncate">
                  {p.brand} · {p.category}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-neon">
                    {p.price > 0 ? `Bs ${fmt(p.price)}` : 'Consultar'}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.cls}`}>
                    {s.label}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-400">
                    Stock: {p.stock}
                  </span>
                  <button
                    type="button"
                    onClick={() => openEditor(p)}
                    className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs"
                    aria-label={`Editar ${p.name}`}
                  >
                    <Pencil size={13} />
                    Editar
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {!loading && !error && list.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-10">
            Sin resultados
          </p>
        )}
      </section>

      {!loading && !error && (
        <p className="px-4 pt-5 text-center text-xs text-gray-500">
          Los cambios de precio y stock se guardan en Neon.
          Agregar nuevos productos estará disponible después.
        </p>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-30 bg-black/70 flex items-end sm:items-center justify-center"
          role="presentation"
        >
          <form
            onSubmit={saveChanges}
            role="dialog"
            aria-modal="true"
            aria-label={`Editar ${editing.name}`}
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-card border border-white/10 p-4 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display font-bold">Editar producto</h2>
                <p className="text-xs text-gray-400 mt-1">
                  {editing.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={saving}
                className="p-2 disabled:opacity-50"
                aria-label="Cerrar edición"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs text-gray-300">Precio en Bs</span>
                <input
                  type="number"
                  min="0"
                  max="10000000"
                  step="0.01"
                  required
                  className={input}
                  value={editing.price}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      price: event.target.value,
                    })
                  }
                />
              </label>

              <label className="space-y-1">
                <span className="text-xs text-gray-300">Existencias</span>
                <input
                  type="number"
                  min="0"
                  max="1000000"
                  step="1"
                  required
                  className={input}
                  value={editing.stock}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      stock: event.target.value,
                    })
                  }
                />
              </label>
            </div>

            {saveError && (
              <p className="rounded-lg bg-red-500/10 border border-red-400/30 p-3 text-sm text-red-200" role="alert">
                {saveError}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-accent py-3 font-semibold text-sm disabled:opacity-50"
            >
              {saving ? 'Guardando en Neon...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
