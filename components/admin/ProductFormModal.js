'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Loader2, Minus, Plus } from 'lucide-react';
import PhotoManager from './PhotoManager';
import { uploadPhoto } from './photo-tools';

const fieldClass =
  'w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-3 text-base outline-none transition focus:border-accent focus:bg-white/[0.07] disabled:opacity-60';

const parseFeatures = (text) =>
  text.split('\n').map((v) => v.trim()).filter(Boolean);

function initialForm(product) {
  if (!product) {
    return {
      name: '', brand: '', category: '', price: '', stock: '0',
      colors: '', description: '', features: ''
    };
  }

  return {
    name: product.name || '',
    brand: product.brand || '',
    category: product.category || '',
    price: String(product.price ?? ''),
    stock: String(product.stock ?? 0),
    colors: product.colors || '',
    description: product.description || '',
    features: Array.isArray(product.features)
      ? product.features.filter((v) => typeof v === 'string').join('\n')
      : ''
  };
}

function initialPhotos(product) {
  return Array.isArray(product?.photos)
    ? product.photos.map((p) => ({
        key: `e${p.id}`,
        id: p.id,
        preview: p.thumb || p.url
      }))
    : [];
}

function validate(form, photoCount) {
  const e = {};
  const name = form.name.trim();
  const brand = form.brand.trim();
  const price = form.price.trim().replace(',', '.');
  const stock = form.stock.trim();
  const features = parseFeatures(form.features);

  if (!name) e.name = 'Escribe el nombre del producto.';
  else if (name.length > 160) e.name = 'Máximo 160 caracteres.';

  if (!brand) e.brand = 'Indica la marca.';
  else if (brand.length > 80) e.brand = 'Máximo 80 caracteres.';

  if (!form.category) e.category = 'Selecciona una categoría.';

  if (!/^\d+(\.\d{1,2})?$/.test(price) || Number(price) > 10000000) {
    e.price = 'Ingresa un precio válido (máximo 2 decimales).';
  }

  if (!/^\d+$/.test(stock) || Number(stock) > 1000000) {
    e.stock = 'Ingresa un número entero.';
  }

  if (form.colors.trim().length > 300) e.colors = 'Máximo 300 caracteres.';
  if (form.description.trim().length > 4000) {
    e.description = 'Máximo 4000 caracteres.';
  }

  if (features.length > 30 || features.some((f) => f.length > 200)) {
    e.features = 'Máximo 30 características de 200 caracteres cada una.';
  }

  if (photoCount < 1) e.photo = 'Agrega al menos una fotografía del producto.';

  return e;
}

async function postJson(url, body) {
  let response;

  try {
    response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch {
    throw new Error(
      'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.'
    );
  }

  const result = await response.json().catch(() => ({}));

  if (response.status === 401) {
    throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.');
  }

  if (!response.ok || !result.ok) {
    throw new Error(result.error || 'No se pudo guardar.');
  }

  return result;
}

function Section({ title, subtitle, children }) {
  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && (
          <p className="text-[11px] text-gray-400">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({ id, label, required, error, hint, children }) {
  return (
    <div data-error={error ? 'true' : undefined} className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center justify-between text-xs font-medium text-gray-300"
      >
        <span>
          {label}
          {required && <span className="text-neon"> *</span>}
        </span>
        {hint && <span className="font-normal text-gray-500">{hint}</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}

export default function ProductFormModal({
  mode = 'create',
  product = null,
  categories = [],
  brands = [],
  onOpenCategories,
  createdCategory = null,
  onClose,
  onSaved
}) {
  const isEdit = mode === 'edit' && Boolean(product);

  const initial = useMemo(
    () => initialForm(isEdit ? product : null),
    [isEdit, product]
  );
  const initialKeys = useMemo(
    () => initialPhotos(isEdit ? product : null).map((p) => p.key).join(','),
    [isEdit, product]
  );

  const [form, setForm] = useState(initial);
  const [photos, setPhotos] = useState(() =>
    initialPhotos(isEdit ? product : null)
  );
  const [preparing, setPreparing] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [step, setStep] = useState('');
  const [progress, setProgress] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const bodyRef = useRef(null);
  const seenCategory = useRef(createdCategory);
  const createdRef = useRef(null);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  const busy = step !== '';

  const errors = useMemo(
    () => validate(form, photos.length),
    [form, photos.length]
  );
  const shown = submitted ? errors : {};

  const dirty =
    JSON.stringify(form) !== JSON.stringify(initial) ||
    photos.map((p) => p.key).join(',') !== initialKeys;

  const categoryOptions = useMemo(
    () =>
      form.category && !categories.includes(form.category)
        ? [form.category, ...categories]
        : categories,
    [categories, form.category]
  );

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(
    () => () => {
      photosRef.current.forEach((p) => {
        if (p.local) URL.revokeObjectURL(p.preview);
      });
    },
    []
  );

  useEffect(() => {
    if (createdCategory && createdCategory !== seenCategory.current) {
      seenCategory.current = createdCategory;
      setForm((current) => ({ ...current, category: createdCategory.name }));
    }
  }, [createdCategory]);

  const change = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const bump = (delta) => {
    setForm((current) => {
      const now = /^\d+$/.test(current.stock) ? Number(current.stock) : 0;
      const next = Math.max(0, Math.min(1000000, now + delta));
      return { ...current, stock: String(next) };
    });
  };

  function requestClose() {
    if (busy) return;

    if (
      dirty &&
      !window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')
    ) {
      return;
    }

    onClose();
  }

  async function submit(event) {
    event.preventDefault();
    if (busy || preparing) return;

    setSubmitted(true);
    setFormError('');

    if (Object.keys(errors).length > 0) {
      setFormError('Revisa los campos marcados en rojo.');
      setTimeout(() => {
        bodyRef.current
          ?.querySelector('[data-error="true"]')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
      return;
    }

    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      price: Number(form.price.trim().replace(',', '.')),
      stock: Number(form.stock.trim()),
      colors: form.colors.trim(),
      description: form.description.trim(),
      features: parseFeatures(form.features)
    };

    try {
      let list = [...photos];
      const pending = list.filter((p) => p.file && !p.remoteUrl).length;

      if (pending > 0) {
        setStep('upload');
        let done = 0;

        for (let i = 0; i < list.length; i += 1) {
          if (list[i].file && !list[i].remoteUrl) {
            done += 1;
            setProgress(`${done} de ${pending}`);

            const url = await uploadPhoto(list[i].file);
            list[i] = { ...list[i], remoteUrl: url };
            setPhotos([...list]);
          }
        }
      }

      const items = list.map((p) =>
        p.id ? { id: p.id } : { url: p.remoteUrl }
      );

      setStep('save');

      if (isEdit) {
        await postJson(`/api/admin/products/${product.id}`, {
          action: 'update',
          ...payload
        });

        await postJson(`/api/admin/products/${product.id}/photos`, {
          items
        });
      } else {
        if (!createdRef.current) {
          const created = await postJson('/api/admin/products/create', {
            ...payload,
            image: items[0].url
          });
          createdRef.current = created.product.id;
        }

        if (items.length > 1) {
          try {
            await postJson(
              `/api/admin/products/${createdRef.current}/photos`,
              { items }
            );
          } catch (error) {
            throw new Error(
              `El producto ya se guardó, pero las fotografías no. ${error.message}`
            );
          }
        }
      }

      await onSaved(
        isEdit
          ? 'Producto actualizado correctamente.'
          : `Producto "${payload.name}" creado correctamente.`
      );
    } catch (error) {
      setFormError(error.message || 'No se pudo guardar el producto.');
    } finally {
      setStep('');
      setProgress('');
    }
  }

  const stockNumber = /^\d+$/.test(form.stock) ? Number(form.stock) : 0;
  const photoMessage = shown.photo || photoError;
  const hasPending = photos.some((p) => p.file && !p.remoteUrl);

  const submitLabel =
    step === 'upload'
      ? `Subiendo fotografía ${progress}...`
      : step === 'save'
        ? 'Guardando...'
        : isEdit
          ? 'Guardar cambios'
          : 'Registrar producto';

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/75 sm:items-center"
      role="presentation"
    >
      <form
        onSubmit={submit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Editar producto' : 'Nuevo producto'}
        className="flex h-[94dvh] w-full flex-col rounded-t-2xl border border-white/10 bg-card text-gray-100 sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold">
              {isEdit ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <p className="truncate text-xs text-gray-400">
              {isEdit ? product.name : 'Completa los datos del producto'}
            </p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={busy}
            className="rounded-lg p-2 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div
          ref={bodyRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
        >
          <Section
            title="Fotografías"
            subtitle="La primera es la portada. Ordénalas con el ícono ⠿ o las flechas."
          >
            <div data-error={photoMessage ? 'true' : undefined}>
              <PhotoManager
                items={photos}
                onChange={setPhotos}
                onError={setPhotoError}
                onPreparing={setPreparing}
                disabled={busy}
              />
            </div>

            {photoMessage && (
              <p className="text-xs text-red-300">{photoMessage}</p>
            )}

            {!photoMessage && hasPending && (
              <p className="text-xs text-gray-400">
                Las fotografías nuevas se suben al guardar.
              </p>
            )}
          </Section>

          <Section title="Información">
            <Field id="zg-name" label="Nombre" required error={shown.name}>
              <input
                id="zg-name"
                className={fieldClass}
                value={form.name}
                onChange={change('name')}
                maxLength={160}
                disabled={busy}
                autoComplete="off"
                placeholder="Ej. Silla gamer Cougar Armor"
              />
            </Field>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field id="zg-brand" label="Marca" required error={shown.brand}>
                <input
                  id="zg-brand"
                  className={fieldClass}
                  value={form.brand}
                  onChange={change('brand')}
                  maxLength={80}
                  disabled={busy}
                  autoComplete="off"
                  list="zg-brands"
                  placeholder="Ej. Cougar"
                />
                <datalist id="zg-brands">
                  {brands.map((b) => (
                    <option key={b} value={b} />
                  ))}
                </datalist>
              </Field>

              <Field
                id="zg-category"
                label="Categoría"
                required
                error={shown.category}
              >
                <select
                  id="zg-category"
                  className={fieldClass}
                  style={{ colorScheme: 'dark' }}
                  value={form.category}
                  onChange={change('category')}
                  disabled={busy}
                >
                  <option value="">Selecciona...</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {onOpenCategories && (
              <button
                type="button"
                onClick={onOpenCategories}
                disabled={busy}
                className="inline-flex min-h-10 items-center text-sm font-semibold text-neon disabled:opacity-50"
              >
                + Crear nueva categoría
              </button>
            )}
          </Section>

          <Section title="Precio y existencias">
            <div className="grid grid-cols-2 gap-3">
              <Field id="zg-price" label="Precio" required error={shown.price}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    Bs
                  </span>
                  <input
                    id="zg-price"
                    className={fieldClass + ' pl-10'}
                    value={form.price}
                    onChange={change('price')}
                    inputMode="decimal"
                    disabled={busy}
                    autoComplete="off"
                    placeholder="0.00"
                  />
                </div>
              </Field>

              <Field
                id="zg-stock"
                label="Existencias"
                required
                error={shown.stock}
              >
                <div className="flex items-stretch gap-1.5">
                  <button
                    type="button"
                    onClick={() => bump(-1)}
                    disabled={busy || stockNumber <= 0}
                    aria-label="Restar una unidad"
                    className="flex w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 disabled:opacity-40"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    id="zg-stock"
                    className={fieldClass + ' min-w-0 px-1 text-center'}
                    value={form.stock}
                    onChange={change('stock')}
                    inputMode="numeric"
                    disabled={busy}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => bump(1)}
                    disabled={busy}
                    aria-label="Sumar una unidad"
                    className="flex w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 disabled:opacity-40"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </Field>
            </div>

            <p className="text-[11px] text-gray-500">
              Con precio 0 la tienda muestra «Consultar».
            </p>
          </Section>

          <Section title="Detalles">
            <Field
              id="zg-colors"
              label="Colores"
              hint="Opcional"
              error={shown.colors}
            >
              <input
                id="zg-colors"
                className={fieldClass}
                value={form.colors}
                onChange={change('colors')}
                maxLength={300}
                disabled={busy}
                autoComplete="off"
                placeholder="Negro, azul, rojo..."
              />
            </Field>

            <Field
              id="zg-description"
              label="Descripción"
              hint={`${form.description.length}/4000`}
              error={shown.description}
            >
              <textarea
                id="zg-description"
                rows={4}
                className={fieldClass}
                value={form.description}
                onChange={change('description')}
                maxLength={4000}
                disabled={busy}
                placeholder="Cuenta de qué trata el producto"
              />
            </Field>

            <Field
              id="zg-features"
              label="Características"
              hint={`${parseFeatures(form.features).length}/30 · una por línea`}
              error={shown.features}
            >
              <textarea
                id="zg-features"
                rows={5}
                className={fieldClass}
                value={form.features}
                onChange={change('features')}
                disabled={busy}
                placeholder={'Material resistente\nDiseño ergonómico'}
              />
            </Field>
          </Section>
        </div>

        <div className="space-y-2 border-t border-white/10 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {formError && (
            <p
              role="alert"
              className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200"
            >
              {formError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={requestClose}
              disabled={busy}
              className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy || preparing}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold disabled:opacity-60"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              {submitLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
