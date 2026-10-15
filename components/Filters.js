'use client';
import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

const chip = (on) =>
  `whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs transition ${
    on ? 'border-accent bg-accent text-white' : 'border-white/10 text-gray-300 hover:border-accent/60'
  }`;

export default function Filters({ ranges, range, setRange, brands, brand, setBrand }) {
  const [open, setOpen] = useState(false);
  const active = (range !== 'all' ? 1 : 0) + (brand ? 1 : 0);
  const clear = () => {
    setRange('all');
    setBrand('');
  };

  return (
    <div className="mt-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className={`glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition hover:border-accent/50 ${
            active ? 'border-accent/60' : ''
          }`}
        >
          <SlidersHorizontal size={16} /> Filtros
          {active > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">
              {active}
            </span>
          ) : null}
        </button>
        {active > 0 ? (
          <button type="button" onClick={clear} className="flex items-center gap-1 text-xs text-gray-400 transition hover:text-accent">
            <X size={14} /> Limpiar
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="glass mt-3 space-y-5 rounded-2xl p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Marca</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {brands.map((b) => (
                <button key={b} type="button" onClick={() => setBrand(brand === b ? '' : b)} className={chip(brand === b)}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Precio</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {ranges.map((r) => (
                <button key={r.id} type="button" onClick={() => setRange(r.id)} className={chip(range === r.id)}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}
