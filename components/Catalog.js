'use client';
import { useMemo, useState } from 'react';
import { products, categories } from '../data/products';
import { config } from '../data/config';

function waLink(p) {
  const msg = `Hola ${config.name} 👋 Quiero pedir: ${p.name} (Bs ${p.price}). ¿Está disponible?`;
  return `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(msg)}`;
}

function stockInfo(stock) {
  if (stock <= 0) return { label: 'Agotado', cls: 'bg-red-500/15 text-red-300' };
  if (stock <= 3) return { label: 'Últimas unidades', cls: 'bg-amber-500/15 text-amber-300' };
  return { label: 'Disponible', cls: 'bg-emerald-500/15 text-emerald-300' };
}

export default function Catalog() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Todos');

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter(
      (p) => (cat === 'Todos' || p.category === cat) && p.name.toLowerCase().includes(term)
    );
  }, [q, cat]);

  return (
    <section id="catalogo" className="mx-auto max-w-6xl px-4 py-14">
      <h2 className="text-2xl font-bold sm:text-3xl">Catálogo</h2>
      <p className="mt-1 text-sm text-gray-400">Elige tu producto y pídelo por WhatsApp.</p>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar producto..."
        className="mt-5 w-full rounded-xl border border-white/10 bg-card px-4 py-3 text-sm outline-none focus:border-accent"
      />

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${
              cat === c
                ? 'border-accent bg-accent text-white'
                : 'border-white/10 bg-card text-gray-300 hover:border-accent/60'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-10 text-center text-gray-400">No encontramos productos con esa búsqueda.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {list.map((p) => {
            const s = stockInfo(p.stock);
            const out = p.stock <= 0;
            return (
              <article key={p.id} className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-card">
                <div className="flex h-32 items-center justify-center bg-gradient-to-br from-accent/20 to-neon/10 text-5xl sm:h-44">
                  {p.image ? (
                    <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <span>{p.emoji}</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <span className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ${s.cls}`}>{s.label}</span>
                  <h3 className="mt-2 text-sm font-semibold sm:text-base">{p.name}</h3>
                  <p className="mt-1 text-lg font-bold text-neon">Bs {p.price}</p>
                  {out ? (
                    <span className="mt-3 rounded-xl bg-white/5 py-2 text-center text-sm text-gray-500">No disponible</span>
                  ) : (
                    <a
                      href={waLink(p)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 rounded-xl bg-emerald-500 py-2 text-center text-sm font-semibold text-black transition hover:bg-emerald-400"
                    >
                      Pedir por WhatsApp
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
