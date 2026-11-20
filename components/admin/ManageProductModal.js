'use client';

import { useEffect, useState } from 'react';
import { X, ImagePlus } from 'lucide-react';

const inputClass =
  'w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-accent';

export default function ManageProductModal({
  product, onClose, onSaved
}) {
  const [form, setForm] = useState({
    name: product.name || '',
    brand: product.brand || '',
    category: product.category || '',
    price: String(product.price),
    stock: String(product.stock),
    colors: product.colors || '',
    description: product.description || '',
    features: Array.isArray(product.features)
      ? product.features.filter(
          (value) => typeof value === 'string'
        ).join('\n')
      : '',
    newImage: ''
  });

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!photo) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const change = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value
    }));
  };

  const selectPhoto = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('La fotografía debe ser JPG, PNG o WebP.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('La fotografía debe pesar máximo 8 MB.');
      return;
    }
    setError('');
    setPhoto(file);
    setForm((current) => ({ ...current, newImage: '' }));
  };

  async function uploadPhoto(file) {
    const sign = await fetch('/api/admin/cloudinary/sign', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store'
    });
    const authorization = await sign.json().catch(() => ({}));

    if (!sign.ok || !authorization.ok) {
      throw new Error(
        authorization.error || 'No se pudo autorizar la fotografía.'
      );
    }
    if (authorization.cloud_name !== 'dkq95jus0') {
      throw new Error('Configuración de fotografías incorrecta.');
    }

    const data = new FormData();
    data.append('file', file);
    for (const key of [
      'api_key', 'timestamp', 'folder',
      'allowed_formats', 'signature'
    ]) {
      data.append(key, String(authorization[key]));
    }

    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dkq95jus0/image/upload',
      { method: 'POST', body: data }
    );
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.error?.message || 'No se pudo subir la fotografía.'
      );
    }

    const url = result.secure_url;
    if (
      result.resource_type !== 'image' ||
      typeof url !== 'string' ||
      !url.startsWith(
        'https://res.cloudinary.com/dkq95jus0/image/upload/'
      )
    ) {
      throw new Error('La fotografía recibida no es válida.');
    }
    return url;
  }

  async function requestUpdate(data) {
    const response = await fetch(
      `/api/admin/products/${product.id}`,
      {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }
    );

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(
        result.error || 'No se pudo guardar el cambio.'
      );
    }
    return result;
  }

  async function save(event) {
    event.preventDefault();
    if (saving) return;

    const rawPrice = form.price.trim();
    const rawStock = form.stock.trim();
    const price = Number(rawPrice);
    const stock = Number(rawStock);

    if (
      !/^\d+(?:\.\d{1,2})?$/.test(rawPrice) ||
      !Number.isFinite(price) || price > 10000000
    ) {
      setError('Revisa el precio. Máximo dos decimales.');
      return;
    }

    if (
      !/^\d+$/.test(rawStock) ||
      !Number.isSafeInteger(stock) || stock > 1000000
    ) {
      setError('El stock debe ser un número entero válido.');
      return;
    }

    const data = {
      action: 'update',
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category.trim(),
      price,
      stock,
      colors: form.colors.trim(),
      description: form.description.trim(),
      features: form.features.split('\n')
        .map((value) => value.trim())
        .filter(Boolean)
    };

    if (!data.name || !data.brand || !data.category) {
      setError('Nombre, marca y categoría son obligatorios.');
      return;
    }

    if (
      data.features.length > 30 ||
      data.features.some((value) => value.length > 200)
    ) {
      setError('Máximo 30 características de 200 caracteres.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (form.newImage) {
        data.image = form.newImage;
      } else if (photo) {
        data.image = await uploadPhoto(photo);
        setForm((current) => ({
          ...current,
          newImage: data.image
        }));
        setPhoto(null);
      }

      await requestUpdate(data);
      await onSaved('Producto actualizado correctamente.');
    } catch (err) {
      setError(err.message || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisibility() {
    if (saving) return;
    const willPublish = product.active === false;
    const message = willPublish
      ? '¿Volver a publicar este producto en la tienda?'
      : '¿Ocultar este producto de la tienda sin borrarlo?';

    if (!window.confirm(message)) return;

    setSaving(true);
    setError('');
    try {
      await requestUpdate({
        action: 'visibility',
        active: willPublish
      });
      await onSaved(
        willPublish
          ? 'Producto publicado correctamente.'
          : 'Producto ocultado correctamente.'
      );
    } catch (err) {
      setError(err.message || 'No se pudo cambiar la visibilidad.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/75 sm:items-center">
      <form
        onSubmit={save}
        role="dialog"
        aria-modal="true"
        aria-label={`Administrar ${product.name}`}
        className="w-full max-h-[94vh] overflow-y-auto space-y-3 rounded-t-2xl border border-white/10 bg-card p-4 text-gray-100 sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold">
              Editar producto
            </h2>
            <p className="text-xs text-gray-400">
              Modifica sus datos y guarda
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <label className="block space-y-1">
          <span className="text-xs">Nombre *</span>
          <input
            required maxLength={160}
            className={inputClass}
            value={form.name}
            onChange={change('name')}
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1">
            <span className="text-xs">Marca *</span>
            <input
              required maxLength={80}
              className={inputClass}
              value={form.brand}
              onChange={change('brand')}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Categoría *</span>
            <input
              required maxLength={100}
              className={inputClass}
              value={form.category}
              onChange={change('category')}
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1">
            <span className="text-xs">Precio (Bs) *</span>
            <input
              required type="number" min="0"
              max="10000000" step="0.01"
              className={inputClass}
              value={form.price}
              onChange={change('price')}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs">Stock *</span>
            <input
              required type="number" min="0"
              max="1000000" step="1"
              className={inputClass}
              value={form.stock}
              onChange={change('stock')}
            />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-xs">Colores</span>
          <input
            maxLength={300}
            className={inputClass}
            value={form.colors}
            onChange={change('colors')}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs">Descripción</span>
          <textarea
            rows={3} maxLength={4000}
            className={inputClass}
            value={form.description}
            onChange={change('description')}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs">
            Características (una por línea)
          </span>
          <textarea
            rows={4}
            className={inputClass}
            value={form.features}
            onChange={change('features')}
          />
        </label>

        <div className="space-y-2 rounded-xl border border-white/10 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ImagePlus size={17}/>
            Fotografía del producto
          </div>
          <div className="flex justify-center rounded-lg bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview || form.newImage || product.image}
              alt="Fotografía del producto"
              className="max-h-48 w-full object-contain"
            />
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={saving}
            onChange={selectPhoto}
            className="block w-full text-xs"
          />
          <p className="text-[11px] text-gray-400">
            Si no seleccionas otra, se conservará la fotografía actual.
            JPG, PNG o WebP. Máximo 8 MB.
          </p>
        </div>

        {error && (
          <p role="alert"
            className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-accent py-3 text-sm font-semibold disabled:opacity-50"
        >
          {saving ? 'Guardando cambios...' : 'Guardar cambios'}
        </button>

        <button
          type="button"
          onClick={toggleVisibility}
          disabled={saving}
          className="w-full rounded-lg border border-white/20 py-3 text-sm font-semibold disabled:opacity-50"
        >
          {product.active === false
            ? 'Volver a publicar producto'
            : 'Ocultar producto de la tienda'}
        </button>

        <p className="text-center text-[11px] text-gray-400">
          Ocultar no elimina los datos ni las fotografías.
        </p>
      </form>
    </div>
  );
}
