'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Plus, Pencil, X, Package, AlertTriangle, Ban, RotateCcw, LayoutGrid, Tag, EyeOff, LogOut } from 'lucide-react';
import { fmt, stockInfo } from '../../lib/utils';
import ProductFormModal from './ProductFormModal';
import { Toaster, toast } from 'sonner';
import { useRouter } from 'next/navigation';
import CategoriesModule from './CategoriesModule';

export default function Admin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Todas');
  const [status, setStatus] = useState('all');
  const [limit, setLimit] = useState(15);
  useEffect(() => {
    setLimit(15);
  }, [q, cat, status]);
  const [managing, setManaging] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const setNotice = (message) => {
    if (message) toast.success(message);
  };
  const [categoryList, setCategoryList] = useState([]);
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('No se pudo cerrar sesión');
      router.replace('/admin/login');
      router.refresh();
    } catch (err) {
      toast.error(err.message || 'No se pudo cerrar sesión');
      setLoggingOut(false);
    }
  };
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

  const catCount = useMemo(() => {
    const m = {};
    items.forEach((p) => {
      if (p.category) m[p.category] = (m[p.category] || 0) + 1;
    });
    return m;
  }, [items]);

  const catsByCount = useMemo(
    () => [...cats].sort(
      (x, y) => (catCount[y] || 0) - (catCount[x] || 0) || x.localeCompare(y, 'es')
    ),
    [cats, catCount]
  );

  const list = useMemo(
    () => items.filter((p) =>
      (cat === 'Todas' || p.category === cat) &&
      (status === 'all' ||
        (status === 'low' && p.stock > 0 && p.stock <= 3) ||
        (status === 'out' && p.stock <= 0) ||
        (status === 'hidden' && p.active === false)) &&
      `${p.name || ''} ${p.brand || ''} ${p.category || ''}`
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
    setNewName('');
    setNotice('');
    setFormOpen(true);
  };

  const input = 'w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-accent';

  return (
    <main className="admin-ui min-h-screen bg-bg text-gray-100 pb-28">
      <header className="bg-bg border-b border-white/10 px-4 py-3 flex items-center justify-between">
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
          { k: 'all', l: 'Productos', v: stats.total, i: Package, c: 'text-neon', t: 'bg-accent/10' },
          { k: 'low', l: 'Pocas unid.', v: stats.low, i: AlertTriangle, c: 'text-amber-300', t: 'bg-amber-500/10' },
          { k: 'out', l: 'Agotados', v: stats.out, i: Ban, c: 'text-red-300', t: 'bg-red-500/10' },
          { k: 'hidden', l: 'Ocultos', v: stats.hidden, i: EyeOff, c: 'text-gray-300', t: 'bg-white/5' },
        ].map((s) => (
          <button
            key={s.k}
            type="button"
            onClick={() => setStatus(status === s.k ? 'all' : s.k)}
            aria-pressed={status === s.k}
            className={'rounded-2xl border p-3 text-left transition-colors ' + (status === s.k ? 'border-accent bg-accent/10' : 'border-white/10 bg-card')}
          >
            <span className={'flex h-8 w-8 items-center justify-center rounded-lg ' + s.t}><s.i size={16} className={s.c} /></span>
            <p className="mt-2 text-2xl font-bold leading-none">
              {loading || error ? '—' : s.v}
            </p>
            <p className="mt-1 text-[11px] font-medium text-gray-400">{s.l}</p>
          </button>
        ))}
      </section>

      <section className="sticky top-0 z-10 bg-bg/95 backdrop-blur border-b border-white/10 px-4 pt-3 pb-2 space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
          {q && (
            <button
              type="button"
              onClick={() => setQ('')}
              aria-label="Borrar búsqueda"
              className="absolute right-2 top-1.5 p-1 text-gray-400"
            >
              <X size={16} />
            </button>
          )}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar nombre, marca o categoría"
            className={input + ' pl-9 pr-9'}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['Todas', ...catsByCount].map((c) => (
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
              <span className="ml-1 opacity-70">
                {c === 'Todas' ? items.length : catCount[c] || 0}
              </span>
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
            <span>Mostrando {Math.min(limit, list.length)} de {list.length} productos</span>
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
        {!loading && !error && list.slice(0, limit).map((p) => {
          const s = stockInfo(p.stock);
          const visible = p.active !== false;
          const busy = toggling === p.id;

          return (
            <div
              key={p.id}
              className={`flex items-center gap-3 rounded-2xl border bg-card p-2.5 transition-colors ${
                visible ? 'border-white/10' : 'border-amber-400/30'
              }`}
            >
              <button
                type="button"
                onClick={() => setManaging(p)}
                aria-label={`Editar ${p.name}`}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt=""
                  className={`h-14 w-14 shrink-0 rounded-xl bg-black/40 object-contain transition ${
                    visible ? '' : 'opacity-40 grayscale'
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{p.name}</span>
                  <span className="block truncate text-[11px] text-gray-400">
                    {p.brand} · {p.category}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-100">
                      {p.price > 0 ? `Bs ${fmt(p.price)}` : 'Consultar'}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${s.cls}`}>
                      {p.stock <= 0 ? 'Agotado' : `${p.stock} en stock`}
                    </span>
                  </span>
                </span>
                <Pencil size={14} className="shrink-0 text-gray-500" />
              </button>

              <button
                type="button"
                role="switch"
                aria-checked={visible}
                aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${p.name} en la tienda`}
                onClick={() => toggleVisibility(p)}
                disabled={toggling !== null}
                className={`flex min-w-[3.5rem] shrink-0 flex-col items-center gap-1 disabled:opacity-60 ${
                  busy ? 'animate-pulse' : ''
                }`}
              >
                <span
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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
                  className={`text-[10px] font-semibold ${
                    visible ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  {busy ? 'Guardando' : visible ? 'Visible' : 'Oculto'}
                </span>
              </button>
            </div>
          );
        })}

        {!loading && !error && list.length > limit && (
          <button
            type="button"
            onClick={() => setLimit((n) => n + 15)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-gray-200"
          >
            Ver más ({list.length - limit} restantes)
          </button>
        )}

        {!loading && !error && list.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm text-gray-500">Sin resultados</p>
            {q.trim() && (
              <button
                type="button"
                onClick={() => { setNewName(q.trim()); setFormOpen(true); }}
                className="mt-3 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
              >
                Crear «{q.trim()}»
              </button>
            )}
          </div>
        )}
      </section>

      {!loading && !error && (
        <p className="px-4 pt-5 text-center text-xs text-gray-500">
          Agrega, edita, oculta y vuelve a publicar productos
          desde este panel.
        </p>
      )}

      <Toaster theme="light" position="top-center" richColors closeButton />

      {showCategories && (
        <CategoriesModule
          categories={categoryList}
          onClose={() => setShowCategories(false)}
          onReload={loadCategories}
          onCreated={(name) => setCreatedCategory({ name })}
        />
      )}

      <nav
        aria-label="Navegación del panel"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-bg/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-1 px-2 py-1.5">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-current="page"
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-neon"
          >
            <Package size={22} />
            <span className="text-[13px] font-semibold">Productos</span>
          </button>
          <button
            type="button"
            onClick={openCategories}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-gray-300 active:bg-white/5"
          >
            <Tag size={22} />
            <span className="text-[13px] font-semibold">Categorías</span>
          </button>
          <button
            type="button"
            onClick={openNew}
            disabled={loading || Boolean(error)}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-gray-300 disabled:opacity-40"
          >
            <span className="flex h-8 w-12 items-center justify-center rounded-full bg-accent text-white">
              <Plus size={20} />
            </span>
            <span className="text-[13px] font-semibold">Nuevo</span>
          </button>
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-gray-300 active:bg-white/5 disabled:opacity-50"
          >
            <LogOut size={22} />
            <span className="text-[13px] font-semibold">{loggingOut ? 'Saliendo' : 'Salir'}</span>
          </button>
        </div>
      </nav>

      {formOpen && (
        <ProductFormModal
          mode="create"
          defaultCategory={cat !== 'Todas' ? cat : ''}
          defaultName={newName}
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
