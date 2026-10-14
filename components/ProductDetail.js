'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Share2, Check, X, ZoomIn } from 'lucide-react';
import { products } from '../data/products';
import { config } from '../data/config';
import { fmt, waLink, orderMsg, stockInfo, productUrl } from '../lib/utils';

export default function ProductDetail({ p }) {
  const images = p.gallery && p.gallery.length ? p.gallery : [p.image];
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [copied, setCopied] = useState(false);
  const s = stockInfo(p.stock);
  const out = p.stock <= 0;
  const related = products.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4);

  const share = async () => {
    const url = productUrl(p);
    try {
      if (navigator.share) {
        await navigator.share({ title: p.name, text: `${p.name} en ${config.name}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <Link href="/#catalogo" className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-neon">
        <ArrowLeft size={16} /> Volver al catálogo
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        <div>
          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label="Ampliar imagen"
            className="glass relative block aspect-square w-full overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 via-card to-neon/10"
          >
            <img src={images[idx]} alt={p.name} className="h-full w-full object-contain p-3" />
            <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <ZoomIn size={14} /> Ampliar
            </span>
          </button>
          {images.length > 1 ? (
            <div className="mt-3 flex gap-2">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`Foto ${i + 1}`}
                  className={`h-16 w-16 overflow-hidden rounded-xl border bg-card transition ${
                    idx === i ? 'border-neon' : 'border-white/10'
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
            {p.badge ? <span className="rounded-full bg-fuchsia-500 px-2.5 py-0.5 text-white">{p.badge}</span> : null}
            <span className={`rounded-full px-2.5 py-0.5 ${s.cls}`}>{s.label}</span>
            <span className="text-gray-500">{p.brand} · {p.category}</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">{p.name}</h1>
          {p.colors ? <p className="mt-1 text-gray-400">{p.colors}</p> : null}
          <p className="mt-4 text-3xl font-extrabold text-neon">
            {p.price > 0 ? `${p.from ? 'Desde ' : ''}Bs ${fmt(p.price)}` : 'Consultar precio'}
          </p>

          {p.features && p.features.length ? (
            <ul className="mt-5 grid gap-2.5 text-sm text-gray-300">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-neon" />
                  {f}
                </li>
              ))}
            </ul>
          ) : null}

          {p.specs ? (
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[['Soporta', p.specs.soporta], ['Reclina', p.specs.reclina], ['Brazos', p.specs.brazos]].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/10 bg-white/5 px-2 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{k}</p>
                  <p className="mt-0.5 text-xs font-bold text-neon">{v}</p>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-6 flex gap-2">
            {out ? (
              <span className="flex-1 rounded-xl bg-white/5 py-3.5 text-center text-gray-500">No disponible por ahora</span>
            ) : (
              <a
                href={waLink(orderMsg(p))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 font-bold text-black transition hover:bg-emerald-400 active:scale-95"
              >
                <MessageCircle size={18} /> {p.price > 0 ? 'Pedir por WhatsApp' : 'Consultar por WhatsApp'}
              </a>
            )}
            <button
              type="button"
              onClick={share}
              aria-label="Compartir"
              className="glass flex w-14 items-center justify-center rounded-xl transition hover:border-accent/50 active:scale-95"
            >
              {copied ? <Check size={18} className="text-neon" /> : <Share2 size={18} />}
            </button>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            {copied ? 'Link copiado.' : 'El pago y la entrega se coordinan por chat.'}
          </p>
        </div>
      </div>

      {related.length > 0 ? (
        <div className="mt-14">
          <h2 className="font-display text-2xl font-bold">Otras opciones</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/producto/${r.slug}`}
                className="glass group overflow-hidden rounded-2xl transition hover:border-accent/50"
              >
                <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-accent/20 via-card to-neon/10">
                  <img src={r.image} alt={r.name} loading="lazy" className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105" />
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-1 text-sm font-semibold">{r.name}</h3>
                  <p className="mt-0.5 text-sm font-extrabold text-neon">
                    {r.price > 0 ? `Bs ${fmt(r.price)}` : 'Consultar precio'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {zoom ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-3" onClick={() => setZoom(false)}>
          <button
            type="button"
            onClick={() => setZoom(false)}
            aria-label="Cerrar"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white backdrop-blur"
          >
            <X size={20} />
          </button>
          <img src={images[idx]} alt={p.name} className="max-h-full max-w-full object-contain" />
        </div>
      ) : null}
    </section>
  );
}
