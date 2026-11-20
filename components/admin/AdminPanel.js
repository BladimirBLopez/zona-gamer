'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Plus, Pencil, X, Package, AlertTriangle, Ban, RotateCcw, LayoutGrid, Tag, EyeOff } from 'lucide-react';
import { fmt, stockInfo } from '../../lib/utils';
import ProductFormModal from './ProductFormModal';
import { Toaster, toast } from 'sonner';
import CategoriesModule from './CategoriesModule';

export default function Admin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Todas');
  const [status, setStatus] = useState('all');
  const [managing, setManaging] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const setNotice = (message) => {
    if (message) toast.success(message);
  };
  const [categoryList, setCategoryList] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [createdCategory, setCreatedCategory] = useState(null);

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

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/categories', {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.ok && Array.isArray(data.categories)) {
        setCategoryList(data.categories);
      }
    } catch {
      /* el selector queda con la última lista cargada */
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const categoryNames = categoryList.map((c) => c.name);

  const openCategories = () => {
    loadCategories();
    setShowCategories(true);
  };

  const cats = useMemo(
    () => [...new Set(items.map((p) => p.category).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'es')),
    [items]
  );

  const list = useMemo(
    () => items.filter((p) =>
      (cat === 'Todas' || p.category === cat) &&
      (status === 'all' ||
        (status === 'low' && p.stock > 0 && p.stock <= 3) ||
        (status === 'out' && p.stock <= 0) ||
        (status === 'hidden' && p.active === false)) &&
      `${p.name || ''} ${p.brand || ''}`
        .toLowerCase()
        .includes(q.toLowerCase().trim())
    ),
    [items, q, cat, status]
  );

  const stats = {
    total: items.length,
    low: items.filter((p) => p.stock > 0 && p.stock <= 3).length,
    out: items.filter((p) => p.stock <= 0).length,
    hidden: items.filter((p) => p.active === false).length,
  };

  const [toggling, setToggling] = useState(null);
  const setToggleError = (message) => {
    if (message) toast.error(message);
  };

  const toggleVisibility = async (product) => {
    if (toggling !== null) return;

    const next = product.active === false;

    setToggling(product.id);
    setToggleError('');
    setItems((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, active: next } : item
      )
    );

    try {
      const response = await fetch(
        `/api/admin/products/${product.id}`,
        {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'visibility', active: next }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(
          result.error || 'No se pudo cambiar la visibilidad.'
        );
      }
    } catch (err) {
      setItems((current) =>
        current.map((item) =>
          item.id === product.id
            ? { ...item, active: !next }
            : item
        )
      );
      setToggleError(
        err.message || 'No se pudo cambiar la visibilidad.'
      );
    } finally {
      setToggling(null);
    }
  };

  const openNew = () => {
    setNotice('');
    setFormOpen(true);
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
            Administración de productos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMenu(true)}
            className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200"
            aria-label="Abrir módulos"
          >
            <LayoutGrid size={16} />
            Módulos
          </button>
          <button
          onClick={loadProducts}
          disabled={loading}
          className="p-2 rounded-lg bg-white/5 text-gray-300 disabled:opacity-50"
          title="Actualizar productos desde Neon"
          aria-label="Actualizar productos"
        >
          <RotateCcw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
        </div>
      </header>

      <section className="px-4 pt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { k: 'all', l: 'Productos', v: stats.total, i: Package, c: 'text-neon' },
          { k: 'low', l: 'Pocas unid.', v: stats.low, i: AlertTriangle, c: 'text-amber-300' },
          { k: 'out', l: 'Agotados', v: stats.out, i: Ban, c: 'text-red-300' },
          { k: 'hidden', l: 'Ocultos', v: stats.hidden, i: EyeOff, c: 'text-gray-300' },
        ].map((s) => (
          <button
            key={s.k}
            type="button"
            onClick={() => setStatus(status === s.k ? 'all' : s.k)}
            aria-pressed={status === s.k}
            className={'rounded-xl border p-3 text-left transition-colors ' + (status === s.k ? 'border-accent bg-accent/10' : 'border-white/10 bg-card')}
          >
            <s.i size={16} className={s.c} />
            <p className="mt-1 text-xl font-bold">
              {loading || error ? '—' : s.v}
            </p>
            <p className="text-[11px] text-gray-400">{s.l}</p>
          </button>
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

        {!loading && !error && (
          <div className="flex items-center justify-between px-1 text-xs text-gray-400">
            <span>Mostrando {list.length} de {items.length} productos</span>
            {(status !== 'all' || cat !== 'Todas' || q) && (
              <button
                type="button"
                onClick={() => { setStatus('all'); setCat('Todas'); setQ(''); }}
                className="font-semibold text-neon"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
        {!loading && !error && list.map((p) => {
          const s = stockInfo(p.stock);
          const visible = p.active !== false;
          const busy = toggling === p.id;

          return (
            <div
              key={p.id}
              className={`rounded-xl bg-card border p-3 flex gap-3 transition-colors ${
                visible ? 'border-white/10' : 'border-amber-400/30'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.name}
                className={`w-16 h-16 rounded-lg object-contain bg-black/40 shrink-0 transition ${
                  visible ? '' : 'opacity-40 grayscale'
                }`}
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
                <p className="mt-1 text-xs text-gray-400">
                  Stock: {p.stock}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/10 pt-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={visible}
                    aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${p.name} en la tienda`}
                    onClick={() => toggleVisibility(p)}
                    disabled={toggling !== null}
                    className={`flex items-center gap-2 disabled:opacity-60 ${
                      busy ? 'animate-pulse' : ''
                    }`}
                  >
                    <span
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                        visible ? 'bg-emerald-500' : 'bg-white/20'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          visible ? 'translate-x-[22px]' : 'translate-x-0.5'
                        }`}
                      />
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        visible ? 'text-emerald-300' : 'text-amber-300'
                      }`}
                    >
                      {busy ? 'Guardando...' : visible ? 'Visible' : 'Oculto'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setManaging(p)}
                    className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-[11px] font-semibold"
                    aria-label={`Editar todos los datos de ${p.name}`}
                  >
                    <Pencil size={12} />
                    Editar todo
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
          Agrega, edita, oculta y vuelve a publicar productos
          desde este panel.
        </p>
      )}

      <Toaster theme="dark" position="top-center" richColors closeButton />

      {showMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/60"
          role="presentation"
          onClick={() => setShowMenu(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Módulos del panel"
            onClick={(event) => event.stopPropagation()}
            className="absolute right-3 top-14 w-72 rounded-2xl border border-white/10 bg-card p-2 shadow-2xl"
          >
            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Módulos
            </p>
            <button
              type="button"
              onClick={() => setShowMenu(false)}
              className="flex w-full items-center gap-3 rounded-xl bg-white/5 px-3 py-3 text-left"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 text-neon">
                <Package size={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold">Productos</span>
                <span className="block text-[11px] text-gray-400">
                  Catálogo, precios y stock
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                openCategories();
              }}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-white/5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/20 text-neon">
                <Tag size={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold">Categorías</span>
                <span className="block text-[11px] text-gray-400">
                  Organiza tu catálogo
                </span>
              </span>
            </button>
          </div>
        </div>
      )}

      {showCategories && (
        <CategoriesModule
          categories={categoryList}
          onClose={() => setShowCategories(false)}
          onReload={loadCategories}
          onCreated={(name) => setCreatedCategory({ name })}
        />
      )}

      {!loading && !error && (
        <button
          type="button"
          onClick={openNew}
          className="fixed bottom-5 right-5 z-20 flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold shadow-lg"
        >
          <Plus size={18} />
          Nuevo producto
        </button>
      )}

      {formOpen && (
        <ProductFormModal
          mode="create"
          categories={categoryNames}
          brands={[...new Set(items.map((p) => p.brand).filter(Boolean))].sort((x, y) => x.localeCompare(y, 'es'))}
          onOpenCategories={openCategories}
          createdCategory={createdCategory}
          onClose={() => setFormOpen(false)}
          onSaved={async (message) => {
            setFormOpen(false);
            setNotice(message);
            await loadProducts();
          }}
        />
      )}

      {managing && (
        <ProductFormModal
          mode="edit"
          product={managing}
          categories={categoryNames}
          brands={[...new Set(items.map((p) => p.brand).filter(Boolean))].sort((x, y) => x.localeCompare(y, 'es'))}
          onOpenCategories={openCategories}
          createdCategory={createdCategory}
          onClose={() => setManaging(null)}
          onSaved={async (message) => {
            setManaging(null);
            setNotice(message);
            await loadProducts();
          }}
        />
      )}
    </main>
  );
}
