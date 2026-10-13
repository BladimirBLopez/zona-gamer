'use client';
import { useCallback, useMemo, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import { products, categories } from '../data/products';
import { config } from '../data/config';
import { waLink } from '../lib/utils';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';

const sorts = [
  { id: 'default', label: 'Destacados' },
  { id: 'asc', label: 'Menor precio' },
  { id: 'desc', label: 'Mayor precio' },
];

export default function Catalog({ q, setQ, cat, setCat }) {
  const [sort, setSort] = useState('default');
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    let r = products.filter(
      (p) => (cat === 'Todos' || p.category === cat) && p.name.toLowerCase().includes(term)
    );
    if (sort === 'asc') r = [...r].sort((a, b) => a.price - b.price);
    else if (sort === 'desc') r = [...r].sort((a, b) => b.price - a.price);
    else r = [...r].sort((a, b) => (b.stock > 0) - (a.stock > 0));
    return r;
  }, [q, cat, sort]);

  const reset = () => {
    setQ('');
    setCat('Todos');
  };

  return (
    <section id="catalogo" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-12">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neon">Catálogo</p>
          <h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Elige y pide por WhatsApp</h2>
        </div>
        <p className="text-sm text-gray-500">
          {list.length} {list.length === 1 ? 'producto' : 'productos'}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="glass flex flex-1 items-center gap-2 rounded-xl px-3">
          <Search size={18} className="shrink-0 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar producto..."
            className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-gray-500"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Ordenar"
          className="glass rounded-xl px-3 py-3 text-sm outline-none"
        >
          {sorts.map((s) => (
            <option key={s.id} value={s.id} className="bg-[#0d1626]">
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${
              cat === c
                ? 'border-accent bg-accent text-white shadow-lg shadow-accent/30'
                : 'border-white/10 bg-card text-gray-300 hover:border-accent/60'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="glass mx-auto mt-10 max-w-md rounded-2xl p-8 text-center">
          <SearchX size={36} className="mx-auto text-gray-500" />
          <p className="mt-3 font-semibold">No encontramos ese producto</p>
          <p className="mt-1 text-sm text-gray-500">Prueba con otra búsqueda o pregúntanos directo.</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button type="button" onClick={reset} className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:border-accent/60">
              Limpiar filtros
            </button>
            <a
              href={waLink(`Hola ${config.name} 👋 Estoy buscando: ${q || 'un producto'}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-black hover:bg-emerald-400"
            >
              Preguntar por WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p, i) => (
            <ProductCard key={p.id} p={p} i={i} onOpen={setOpen} />
          ))}
        </div>
      )}

      <ProductModal p={open} onClose={close} />
    </section>
  );
}
