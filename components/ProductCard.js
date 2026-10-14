'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { fmt, stockInfo } from '../lib/utils';

const badgeCls = {
  Nuevo: 'bg-neon text-black',
  Oferta: 'bg-fuchsia-500 text-white',
  Popular: 'bg-amber-400 text-black',
};

export default function ProductCard({ p, i }) {
  const s = stockInfo(p.stock);
  const out = p.stock <= 0;
  const showStock = p.stock <= 3;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: (i % 4) * 0.06 }}
      className="h-full"
    >
      <Link
        href={`/producto/${p.slug}`}
        aria-label={`Ver detalles de ${p.name}`}
        className="group glass flex h-full flex-col overflow-hidden rounded-2xl transition-colors duration-300 hover:border-accent/50 hover:shadow-xl hover:shadow-accent/10"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-accent/20 via-card to-neon/10 sm:aspect-[4/3]">
          {p.image ? (
            <img
              src={p.image}
              alt={p.name}
              loading="lazy"
              className={`h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105 ${out ? 'opacity-60 grayscale' : ''}`}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-6xl sm:text-7xl">{p.emoji}</span>
          )}
          {p.badge ? (
            <span className={`absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${badgeCls[p.badge] || 'bg-white text-black'}`}>
              {p.badge}
            </span>
          ) : null}
          {showStock ? (
            <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur ${s.cls}`}>
              {s.label}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neon">{p.brand}</span>
          <h3 className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug sm:text-base">{p.name}</h3>
          {p.colors ? <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">{p.colors}</p> : null}
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
            <span className="text-lg font-extrabold sm:text-xl">
              {p.price > 0 ? (
                <>
                  {p.from ? <span className="mr-1 text-xs font-medium text-gray-400">Desde</span> : null}Bs {fmt(p.price)}
                </>
              ) : (
                'Consultar precio'
              )}
            </span>
            {p.oldPrice ? <span className="text-xs text-gray-500 line-through">Bs {fmt(p.oldPrice)}</span> : null}
          </div>
          <span className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 py-2.5 text-sm font-semibold transition group-hover:border-accent/60 group-hover:bg-accent group-hover:text-white">
            Ver detalles
            <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
