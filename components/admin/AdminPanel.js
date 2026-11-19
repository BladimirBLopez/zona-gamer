'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Package, AlertTriangle, Ban, RotateCcw } from 'lucide-react';
import { fmt, stockInfo } from '../../lib/utils';

export default function Admin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Todas');

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
                <div className="mt-2 text-xs text-gray-400">
                  Stock: {p.stock}
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
          Edición, stock y nuevos productos se habilitarán
          cuando esté lista la API de guardado seguro.
        </p>
      )}
    </main>
  );
}
