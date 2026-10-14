'use client';
import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { products, colorOptions, materialOptions } from '../data/products';

const dots = {
  Naranja: '#f97316',
  Rosa: '#ec4899',
  Dorado: '#eab308',
  Verde: '#22c55e',
  Azul: '#3b82f6',
  Rojo: '#ef4444',
  Gris: '#9ca3af',
  Negro: '#111827',
};

const chip = (on) =>
  `whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs transition ${
    on ? 'border-neon bg-neon/15 text-neon' : 'border-white/10 text-gray-400 hover:border-neon/50'
  }`;

export default function Filters({ ranges, range, setRange, color, setColor, material, setMaterial }) {
  const [open, setOpen] = useState(false);
  const active = (range !== 'all' ? 1 : 0) + (color ? 1 : 0) + (material ? 1 : 0);
  const clear = () => {
    setRange('all');
    setColor('');
    setMaterial('');
  };
  const colors = colorOptions.filter((c) => products.some((p) => p.tagColors.includes(c)));
  const materials = materialOptions.filter((m) => products.some((p) => p.material === m));

  return (
    <div className="mt-1">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className={`glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition hover:border-accent/50 ${
            active ? 'border-neon/60' : ''
          }`}
        >
          <SlidersHorizontal size={16} /> Filtros
          {active > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-neon px-1 text-[11px] font-bold text-black">
              {active}
            </span>
          ) : null}
        </button>
        {active > 0 ? (
          <button type="button" onClick={clear} className="flex items-center gap-1 text-xs text-gray-400 transition hover:text-neon">
            <X size={14} /> Limpiar
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="glass mt-3 space-y-5 rounded-2xl p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Color</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(color === c ? '' : c)}
                  className={`flex items-center gap-2 ${chip(color === c)}`}
                >
                  <span className="h-3 w-3 rounded-full border border-white/30" style={{ background: dots[c] }} />
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Material</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {materials.map((m) => (
                <button key={m} type="button" onClick={() => setMaterial(material === m ? '' : m)} className={chip(material === m)}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Precio</p>
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
