'use client';
import { useMemo, useState } from 'react';
import { Search, SearchX } from 'lucide-react';
import { products, categories } from '../data/products';
import { config } from '../data/config';
import { waLink } from '../lib/utils';
import ProductCard from './ProductCard';
import Filters from './Filters';

const sorts = [
  { id: 'default', label: 'Destacados' },
  { id: 'asc', label: 'Menor precio' },
  { id: 'desc', label: 'Mayor precio' },
];

const ranges = [
  { id: 'all', label: 'Todos los precios', min: 0, max: Infinity },
  { id: 'low', label: 'Hasta Bs 2.500', min: 1, max: 2500 },
  { id: 'mid', label: 'Bs 2.500 – 3.500', min: 2501, max: 3500 },
  { id: 'high', label: 'Más de Bs 3.500', min: 3501, max: Infinity },
];

const tabs = categories.filter((c) => c === 'Todos' || products.some((p) => p.category === c));
const brands = [...new Set(products.map((p) => p.brand))];

export default function Catalog({ q, setQ, cat, setCat }) {
  const [sort, setSort] = useState('default');
  const [range, setRange] = useState('all');
  const [brand, setBrand] = useState('');
  const [onlyAvail, setOnlyAvail] = useState(false);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const r0 = ranges.find((x) => x.id === range) || ranges[0];
    const inRange = (price) => price >= r0.min && price <= r0.max;
    let r = products.filter(
      (p) =>
        (cat === 'Todos' || p.category === cat) &&
        (!brand || p.brand === brand) &&
        `${p.name} ${p.brand}`.toLowerCase().includes(term) &&
        inRange(p.price) &&
        (!onlyAvail || p.stock > 0)
    );
    if (sort === 'asc') r = [...r].sort((a, b) => (a.price || Infinity) - (b.price || Infinity));
    else if (sort === 'desc') r = [...r].sort((a, b) => b.price - a.price);
    else r = [...r].sort((a, b) => (b.stock > 0) - (a.stock > 0));
    return r;
  }, [q, cat, brand, sort, range, onlyAvail]);

  const countOf = (c) => (c === 'Todos' ? products.length : products.filter((p) => p.category === c).length);

  const reset = () => {
    setQ('');
    setCat('Todos');
    setRange('all');
    setBrand('');
    setOnlyAvail(false);
  };

  return (
    <section id="catalogo" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-12">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Catálogo</p>
          <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Todos los productos</h2>
        </div>
        <p className="text-sm text-gray-400">
          {list.length} {list.length === 1 ? 'producto' : 'productos'}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="glass flex flex-1 items-center gap-2 rounded-xl px-3">
          <Search size={18} className="shrink-0 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar producto o marca"
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
        {tabs.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${
              cat === c
                ? 'border-accent bg-accent text-white'
                : 'border-white/10 bg-card text-gray-300 hover:border-accent/60'
            }`}
          >
            {c} <span className="ml-1 text-xs opacity-60">{countOf(c)}</span>
          </button>
        ))}
      </div>

      <Filters
        ranges={ranges}
        range={range}
        setRange={setRange}
        brands={brands}
        brand={brand}
        setBrand={setBrand}
        onlyAvail={onlyAvail}
        setOnlyAvail={setOnlyAvail}
      />

      {list.length === 0 ? (
        <div className="glass mx-auto mt-10 max-w-md rounded-2xl p-8 text-center">
          <SearchX size={36} className="mx-auto text-gray-500" />
          <p className="mt-3 font-semibold">No encontramos ese producto</p>
          <p className="mt-1 text-sm text-gray-400">Prueba con otra búsqueda o pregúntanos directo.</p>
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
            <ProductCard key={p.id} p={p} i={i} />
          ))}
        </div>
      )}
    </section>
  );
}
