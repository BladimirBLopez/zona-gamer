'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Plus, Pencil, X, Package, AlertTriangle, Ban, RotateCcw, LayoutGrid, Tag } from 'lucide-react';
import { fmt, stockInfo } from '../../lib/utils';
import ManageProductModal from './ManageProductModal';
import CategoriesModule from './CategoriesModule';

export default function Admin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Todas');
  const [managing, setManaging] = useState(null);
  const [newForm, setNewForm] = useState(null);
  const [newSaving, setNewSaving] = useState(false);
  const [newError, setNewError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [notice, setNotice] = useState('');
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

  const [toggling, setToggling] = useState(null);
  const [toggleError, setToggleError] = useState('');

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

  useEffect(() => {
    if (!selectedPhoto) {
      setPhotoPreview('');
      return;
    }

    const url = URL.createObjectURL(selectedPhoto);
    setPhotoPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedPhoto]);

  const selectPhoto = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setNewError('Selecciona una fotografía JPG, PNG o WebP.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setNewError('La fotografía debe pesar máximo 8 MB.');
      return;
    }

    setNewError('');
    setSelectedPhoto(file);
    setNewForm((current) =>
      current ? { ...current, image: '' } : current
    );
  };

  const uploadPhoto = async () => {
    if (!selectedPhoto) {
      throw new Error('Selecciona una fotografía.');
    }

    setPhotoUploading(true);
    setNewError('');

    try {
      const signResponse = await fetch('/api/admin/cloudinary/sign', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
      });

      const authorization = await signResponse.json().catch(() => ({}));

      if (!signResponse.ok || !authorization.ok) {
        throw new Error(
          authorization.error || 'No se pudo autorizar la fotografía.'
        );
      }

      if (authorization.cloud_name !== 'dkq95jus0') {
        throw new Error('Configuración de Cloudinary incorrecta.');
      }

      const body = new FormData();
      body.append('file', selectedPhoto);

      for (const key of [
        'api_key',
        'timestamp',
        'folder',
        'allowed_formats',
        'signature',
      ]) {
        body.append(key, String(authorization[key]));
      }

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dkq95jus0/image/upload',
        {
          method: 'POST',
          body,
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.error?.message || 'Cloudinary rechazó la fotografía.'
        );
      }

      if (
        result.resource_type !== 'image' ||
        typeof result.secure_url !== 'string' ||
        !result.secure_url.startsWith(
          'https://res.cloudinary.com/dkq95jus0/image/upload/'
        )
      ) {
        throw new Error('Cloudinary devolvió una imagen no válida.');
      }

      setNewForm((current) =>
        current
          ? { ...current, image: result.secure_url }
          : current
      );

      setSelectedPhoto(null);
      setNewError('');
      return result.secure_url;
    } catch (error) {
      throw new Error(
        error.message || 'No se pudo subir la fotografía.'
      );
    } finally {
      setPhotoUploading(false);
    }
  };

  const openNew = () => {
    setNewError('');
    setNotice('');
    setSelectedPhoto(null);
    setNewForm({
      name: '',
      brand: '',
      category: '',
      price: '0',
      stock: '0',
      colors: '',
      description: '',
      features: '',
      image: '',
    });
  };

  const updateNew = (key) => (event) => {
    setNewForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const createProduct = async (event) => {
    event.preventDefault();
    if (!newForm || newSaving || photoUploading) return;

    const rawPrice = newForm.price.trim();
    const rawStock = newForm.stock.trim();
    const price = Number(rawPrice);
    const stock = Number(rawStock);

    if (
      !/^\d+(?:\.\d{1,2})?$/.test(rawPrice) ||
      !Number.isFinite(price) ||
      price > 10000000
    ) {
      setNewError('El precio debe ser válido y tener máximo 2 decimales.');
      return;
    }

    if (
      !/^\d+$/.test(rawStock) ||
      !Number.isSafeInteger(stock) ||
      stock > 1000000
    ) {
      setNewError('El stock debe ser un número entero válido.');
      return;
    }

    const payload = {
      name: newForm.name.trim(),
      brand: newForm.brand.trim(),
      category: newForm.category.trim(),
      price,
      stock,
      colors: newForm.colors.trim(),
      description: newForm.description.trim(),
      features: newForm.features
        .split('\n')
        .map((value) => value.trim())
        .filter(Boolean),
      image: newForm.image.trim(),
    };

    if (
      !payload.name ||
      !payload.brand ||
      !payload.category ||
      (!selectedPhoto && !payload.image)
    ) {
      setNewError('Completa nombre, marca, categoría y fotografía.');
      return;
    }

    setNewSaving(true);
    setNewError('');

    try {
      if (!payload.image) {
        payload.image = await uploadPhoto();
      }

      const response = await fetch('/api/admin/products/create', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'No se pudo crear el producto.');
      }

      setNewForm(null);
      setNotice(`Producto "${result.product.name}" registrado en Neon.`);
      await loadProducts();
    } catch (error) {
      setNewError(error.message || 'Error al registrar el producto.');
    } finally {
      setNewSaving(false);
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
          onCreated={(name) => {
            setCreatedCategory({ name });
            setNewForm((current) =>
              current ? { ...current, category: name } : current
            );
          }}
        />
      )}

      {toggleError && (
        <div
          role="alert"
          className="fixed left-4 right-4 top-16 z-40 mx-auto flex max-w-lg items-start justify-between gap-3 rounded-xl border border-red-400/30 bg-red-950 p-3 text-sm text-red-100 shadow-xl"
        >
          <span>{toggleError}</span>
          <button
            type="button"
            onClick={() => setToggleError('')}
            aria-label="Cerrar aviso"
            className="shrink-0 rounded-lg p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="fixed left-4 right-4 top-16 z-40 mx-auto flex max-w-lg items-start justify-between gap-3 rounded-xl border border-emerald-500/30 bg-[#123227] p-3 text-sm text-emerald-100 shadow-xl"
        >
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice('')}
            aria-label="Cerrar aviso"
            className="shrink-0 rounded-lg p-1"
          >
            <X size={16} />
          </button>
        </div>
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

      {newForm && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/70 sm:items-center">
          <form
            onSubmit={createProduct}
            role="dialog"
            aria-modal="true"
            aria-label="Registrar nuevo producto"
            className="w-full max-h-[92vh] overflow-y-auto rounded-t-2xl border border-white/10 bg-card p-4 space-y-3 sm:max-w-lg sm:rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold">
                  Nuevo producto
                </h2>
                <p className="text-xs text-gray-400">
                  Se guardará directamente en Neon
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewForm(null);
                  setSelectedPhoto(null);
                }}
                disabled={newSaving || photoUploading}
                className="p-2 disabled:opacity-50"
                aria-label="Cerrar formulario"
              >
                <X size={20} />
              </button>
            </div>

            <label className="block space-y-1">
              <span className="text-xs text-gray-300">Nombre *</span>
              <input
                required
                maxLength={160}
                className={input}
                value={newForm.name}
                onChange={updateNew('name')}
                placeholder="Nombre del producto"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="text-xs text-gray-300">Marca *</span>
                <input
                  required
                  maxLength={80}
                  className={input}
                  value={newForm.brand}
                  onChange={updateNew('brand')}
                  placeholder="Ej. Cougar"
                  list="zg-new-brands"
                />
              </label>

              <div className="space-y-1">
                <label
                  htmlFor="zg-new-category"
                  className="block text-xs text-gray-300"
                >
                  Categoría *
                </label>
                <select
                  id="zg-new-category"
                  required
                  className={input}
                  style={{ colorScheme: 'dark' }}
                  value={newForm.category}
                  onChange={updateNew('category')}
                >
                  <option value="">Selecciona...</option>
                  {categoryNames.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={openCategories}
                  className="text-[11px] font-semibold text-neon"
                >
                  + Nueva categoría
                </button>
              </div>
            </div>

            <datalist id="zg-new-brands">
              {[...new Set(items.map((p) => p.brand).filter(Boolean))]
                .map((brand) => (
                  <option key={brand} value={brand} />
                ))}
            </datalist>

            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="text-xs text-gray-300">Precio Bs *</span>
                <input
                  required
                  type="number"
                  min="0"
                  max="10000000"
                  step="0.01"
                  className={input}
                  value={newForm.price}
                  onChange={updateNew('price')}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-gray-300">Existencias *</span>
                <input
                  required
                  type="number"
                  min="0"
                  max="1000000"
                  step="1"
                  className={input}
                  value={newForm.stock}
                  onChange={updateNew('stock')}
                />
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-xs text-gray-300">Colores</span>
              <input
                maxLength={300}
                className={input}
                value={newForm.colors}
                onChange={updateNew('colors')}
                placeholder="Negro, azul, rojo..."
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs text-gray-300">Descripción</span>
              <textarea
                rows={3}
                maxLength={4000}
                className={input}
                value={newForm.description}
                onChange={updateNew('description')}
                placeholder="Descripción del producto"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs text-gray-300">
                Características (una por línea)
              </span>
              <textarea
                rows={4}
                className={input}
                value={newForm.features}
                onChange={updateNew('features')}
                placeholder="Material resistente&#10;Diseño ergonómico"
              />
            </label>

            <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-sm font-semibold">
                Fotografía desde tu celular
              </p>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={selectPhoto}
                disabled={newSaving || photoUploading}
                className="block w-full text-xs text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-2 file:text-white"
              />

              {selectedPhoto && (
                <p className="text-xs text-gray-400">
                  {selectedPhoto.name}
                </p>
              )}

              {(photoPreview || newForm.image) && (
                <div className="flex justify-center rounded-lg bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview || newForm.image}
                    alt="Vista previa del producto"
                    className="max-h-48 w-full object-contain"
                  />
                </div>
              )}


              {newForm.image && !selectedPhoto && (
                <p className="text-xs text-emerald-300">
                  Fotografía lista para guardar con el producto.
                </p>
              )}

              <p className="text-[11px] text-gray-400">
                JPG, PNG o WebP. Máximo 8 MB. Se subirá automáticamente al guardar.
              </p>
            </div>


            {newError && (
              <p
                role="alert"
                className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200"
              >
                {newError}
              </p>
            )}

            <button
              type="submit"
              disabled={newSaving || photoUploading}
              className="w-full rounded-lg bg-accent py-3 text-sm font-semibold disabled:opacity-50"
            >
              {newSaving
                ? photoUploading
                  ? 'Subiendo fotografía...'
                  : 'Guardando producto...'
                : 'Guardar producto'}
            </button>
          </form>
        </div>
      )}

      {managing && (
        <ManageProductModal
          categories={categoryNames}
          onOpenCategories={openCategories}
          createdCategory={createdCategory}
          product={managing}
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
