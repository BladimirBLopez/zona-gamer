'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Share2, Check, X, ZoomIn, Weight, Armchair, Move, Layers } from 'lucide-react';
import { products } from '../data/products';
import { config } from '../data/config';
import { fmt, waLink, orderMsg, stockInfo, productUrl } from '../lib/utils';
import WhatsAppIcon from './WhatsAppIcon';

export default function ProductDetail({ p }) {
  const images = p.gallery && p.gallery.length ? p.gallery : [p.image];
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [copied, setCopied] = useState(false);
  const s = stockInfo(p.stock);
  const out = p.stock <= 0;
  const related = products.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4);
  const priceText = p.price > 0 ? `${p.from ? 'Desde ' : ''}Bs ${fmt(p.price)}` : 'Consultar precio';

  const specs = [
    { Icon: Weight, k: 'Soporta', v: p.specs && p.specs.soporta },
    { Icon: Armchair, k: 'Reclinación', v: p.specs && p.specs.reclina },
    { Icon: Move, k: 'Apoyabrazos', v: p.specs && p.specs.brazos },
    { Icon: Layers, k: 'Material', v: p.material },
  ].filter((x) => x.v);

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

  const cta = (className, label, outLabel) =>
    out ? (
      <span className={`rounded-xl bg-white/5 py-3.5 text-center text-sm text-gray-500 ${className}`}>{outLabel}</span>
    ) : (
      <a
        href={waLink(orderMsg(p))}
        target="_blank"
        rel="noopener noreferrer"
        className={`items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#25D366] py-3.5 font-bold text-white transition hover:bg-[#1ebe5b] active:scale-95 ${className}`}
      >
        <WhatsAppIcon size={20} /> {label}
      </a>
    );

  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1.5 text-sm text-gray-400">
        <Link href="/#catalogo" className="transition hover:text-accent">Catálogo</Link>
        <ChevronRight size={14} />
        <span>{p.category}</span>
        <ChevronRight size={14} />
        <span className="text-gray-200">{p.name}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label="Ampliar imagen"
            className="glass relative block aspect-square w-full overflow-hidden rounded-3xl"
          >
            <img src={images[idx]} alt={p.name} className={`h-full w-full object-contain p-4 ${out ? 'opacity-60 grayscale' : ''}`} />
            <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white">
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
                  className={`h-16 w-16 overflow-hidden rounded-xl border-2 bg-card transition ${
                    idx === i ? 'border-accent' : 'border-white/10'
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
            <span className="uppercase tracking-[0.2em] text-accent">{p.brand}</span>
            {p.badge ? <span className="rounded-full bg-accent px-2.5 py-0.5 text-white">{p.badge}</span> : null}
            <span className={`rounded-full px-2.5 py-0.5 ${s.cls}`}>{s.label}</span>
          </div>

          <div className="mt-3 flex items-start justify-between gap-3">
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{p.name}</h1>
            <button
              type="button"
              onClick={share}
              aria-label="Compartir"
              className="glass flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition hover:border-accent/50 active:scale-95"
            >
              {copied ? <Check size={18} className="text-accent" /> : <Share2 size={18} />}
            </button>
          </div>
          {p.colors ? <p className="mt-1 text-gray-400">{p.colors}</p> : null}

          <p className="mt-5 font-display text-4xl font-extrabold">{priceText}</p>
          <p className="mt-1 text-xs text-gray-500">{copied ? 'Link copiado.' : 'El pago y la entrega se coordinan por chat.'}</p>

          {cta('mt-5 hidden w-full md:flex', p.price > 0 ? 'Pedir por WhatsApp' : 'Consultar por WhatsApp', 'No disponible por ahora')}

          {specs.length ? (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {specs.map(({ Icon, k, v }) => (
                <div key={k} className="glass flex items-center gap-3 rounded-xl p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-500">{k}</span>
                    <span className="block text-sm font-bold">{v}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {p.features && p.features.length ? (
            <div className="mt-7">
              <h2 className="font-display text-lg font-semibold">Características</h2>
              <ul className="mt-3 grid gap-2">
                {p.features.map((f) => (
                  <li key={f} className="glass flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-sm text-gray-300">
                    <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      {related.length > 0 ? (
        <div className="mt-14">
          <h2 className="font-display text-xl font-bold sm:text-2xl">Otras opciones</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/producto/${r.slug}`}
                className="glass group overflow-hidden rounded-2xl transition hover:border-accent/50"
              >
                <div className="flex aspect-square items-center justify-center bg-white/5">
                  <img src={r.image} alt={r.name} loading="lazy" className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105" />
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-1 text-sm font-semibold">{r.name}</h3>
                  <p className="mt-0.5 text-sm font-bold">{r.price > 0 ? `Bs ${fmt(r.price)}` : 'Consultar precio'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-card px-4 pt-3 md:hidden"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] uppercase tracking-wider text-gray-500">{p.name}</p>
            <p className="truncate text-lg font-extrabold leading-tight">{priceText}</p>
          </div>
          {cta('flex shrink-0 px-5', p.price > 0 ? 'Pedir' : 'Consultar', 'Agotado')}
        </div>
      </div>

      {zoom ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-3" onClick={() => setZoom(false)}>
          <button
            type="button"
            onClick={() => setZoom(false)}
            aria-label="Cerrar"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white"
          >
            <X size={20} />
          </button>
          <img src={images[idx]} alt={p.name} className="max-h-full max-w-full object-contain" />
        </div>
      ) : null}
    </section>
  );
}
