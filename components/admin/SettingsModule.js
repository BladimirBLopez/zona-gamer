'use client';

import { useEffect, useState } from 'react';
import { X, Settings, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const inputCls =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-accent';

const waDigits = (v) => {
  let d = String(v || '').replace(/\D/g, '');
  if (d.length === 8 && /^[67]/.test(d)) d = '591' + d;
  return d;
};

function Field({ id, label, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-gray-300">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {hint ? <p className="mt-1 text-[11px] text-gray-400">{hint}</p> : null}
    </div>
  );
}

export default function SettingsModule({ onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/settings', {
          credentials: 'same-origin',
          cache: 'no-store'
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok || !result.ok) {
          throw new Error(result.error || 'No se pudieron cargar los ajustes.');
        }
        if (alive) {
          setForm(result.settings);
          setSaved(JSON.stringify(result.settings));
        }
      } catch (err) {
        if (alive) setError(err.message || 'No se pudieron cargar los ajustes.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function save(event) {
    event.preventDefault();
    if (saving || !form) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) {
        throw new Error(result.error || 'No se pudo guardar.');
      }
      setForm(result.settings);
      setSaved(JSON.stringify(result.settings));
      toast.success('Ajustes guardados');
      if (onSaved) onSaved(result.settings);
    } catch (err) {
      setError(err.message || 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  const dirty = form ? JSON.stringify(form) !== saved : false;
  const digits = form ? waDigits(form.whatsapp) : '';
  const waOk = digits.length >= 10 && digits.length <= 15;
  const bannerShown = form && form.banner_active && form.banner_text.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 sm:items-center"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ajustes"
        className="flex max-h-[92vh] w-full flex-col rounded-t-2xl border border-white/10 bg-card text-gray-100 sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3 p-4 pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-neon">
              <Settings size={20} />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">Ajustes</h2>
              <p className="text-xs text-gray-400">
                WhatsApp, redes y banner
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

        {loading && (
          <p className="px-4 pb-6 text-sm text-gray-400">Cargando...</p>
        )}

        {!loading && !form && (
          <p
            role="alert"
            className="mx-4 mb-6 rounded-lg border border-red-400/30 bg-red-500/10 p-2 text-xs text-red-200"
          >
            {error || 'No se pudieron cargar los ajustes.'}
          </p>
        )}

        {form && (
          <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
              <section className="space-y-3">
                <h3 className="text-sm font-bold">Contacto</h3>
                <Field
                  id="zg-set-wa"
                  label="Número de WhatsApp"
                  hint={
                    waOk
                      ? `Se usará: +${digits}`
                      : 'Con código de país, por ejemplo 59175034183.'
                  }
                >
                  <div className="flex gap-2">
                    <input
                      id="zg-set-wa"
                      value={form.whatsapp}
                      onChange={set('whatsapp')}
                      inputMode="tel"
                      maxLength={20}
                      placeholder="59175034183"
                      className={inputCls}
                    />
                    <a
                      href={`https://wa.me/${digits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-disabled={!waOk}
                      tabIndex={waOk ? 0 : -1}
                      className={`flex shrink-0 items-center gap-1 rounded-lg border border-white/10 px-3 text-sm font-semibold ${
                        waOk ? '' : 'pointer-events-none opacity-50'
                      }`}
                    >
                      <ExternalLink size={14} />
                      Probar
                    </a>
                  </div>
                </Field>
                <Field
                  id="zg-set-schedule"
                  label="Horario de atención"
                  hint="Opcional. Si lo dejas vacío, no se muestra."
                >
                  <input
                    id="zg-set-schedule"
                    value={form.schedule}
                    onChange={set('schedule')}
                    maxLength={80}
                    placeholder="Ej. Lun a Sáb, 9:00 a 19:00"
                    className={inputCls}
                  />
                </Field>
              </section>

              <section className="space-y-3 border-t border-white/10 pt-4">
                <h3 className="text-sm font-bold">Redes sociales</h3>
                {[
                  ['facebook', 'Facebook', 'https://facebook.com/...'],
                  ['tiktok', 'TikTok', 'https://tiktok.com/@...'],
                  ['instagram', 'Instagram', 'https://instagram.com/...']
                ].map(([key, label, ph]) => (
                  <Field key={key} id={`zg-set-${key}`} label={label}>
                    <input
                      id={`zg-set-${key}`}
                      value={form[key]}
                      onChange={set(key)}
                      inputMode="url"
                      maxLength={200}
                      placeholder={ph}
                      className={inputCls}
                    />
                  </Field>
                ))}
                <p className="text-[11px] text-gray-400">
                  Si dejas una red vacía, su ícono no aparece.
                </p>
              </section>

              <section className="space-y-3 border-t border-white/10 pt-4">
                <h3 className="text-sm font-bold">Banner</h3>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.banner_active}
                  onClick={() =>
                    setForm((f) => ({ ...f, banner_active: !f.banner_active }))
                  }
                  className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                >
                  <span>Mostrar banner en la tienda</span>
                  <span
                    className={`relative h-6 w-11 rounded-full transition ${
                      form.banner_active ? 'bg-accent' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                        form.banner_active ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </span>
                </button>
                <Field
                  id="zg-set-btext"
                  label="Texto del banner"
                  hint={`${form.banner_text.length}/120`}
                >
                  <input
                    id="zg-set-btext"
                    value={form.banner_text}
                    onChange={set('banner_text')}
                    maxLength={120}
                    placeholder="Ej. Envíos a todo el país"
                    className={inputCls}
                  />
                </Field>
                <Field
                  id="zg-set-blink"
                  label="Enlace del banner"
                  hint="Opcional: /catalogo o https://..."
                >
                  <input
                    id="zg-set-blink"
                    value={form.banner_link}
                    onChange={set('banner_link')}
                    maxLength={200}
                    placeholder="/catalogo"
                    className={inputCls}
                  />
                </Field>
                {bannerShown ? (
                  <div className="rounded-lg border border-white/10 bg-bg py-1.5 text-center text-[11px] font-medium text-gray-300">
                    {form.banner_text}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400">
                    Sin texto o apagado: el banner no se muestra.
                  </p>
                )}
              </section>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-400/30 bg-red-500/10 p-2 text-xs text-red-200"
                >
                  {error}
                </p>
              )}
            </div>

            <div
              className="border-t border-white/10 p-4"
              style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
            >
              <button
                type="submit"
                disabled={saving || !dirty}
                className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? 'Guardando...' : dirty ? 'Guardar cambios' : 'Sin cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
