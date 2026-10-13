'use client';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, MessageCircle, Check } from 'lucide-react';
import { fmt, waLink, orderMsg, stockInfo } from '../lib/utils';

export default function ProductModal({ p, onClose }) {
  useEffect(() => {
    if (!p) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [p, onClose]);

  return (
    <AnimatePresence>
      {p ? (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={p.name}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0b1322] sm:rounded-3xl"
          >
            <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-accent/30 via-card to-neon/20 text-8xl sm:h-56">
              {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" /> : p.emoji}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute right-3 top-3 rounded-full bg-black/50 p-2 backdrop-blur transition hover:bg-black/70"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                {p.badge ? <span className="rounded-full bg-fuchsia-500 px-2.5 py-0.5 text-white">{p.badge}</span> : null}
                <span className={`rounded-full px-2.5 py-0.5 ${stockInfo(p.stock).cls}`}>{stockInfo(p.stock).label}</span>
                <span className="text-gray-500">{p.category}</span>
              </div>
              <h3 className="mt-3 font-display text-xl font-bold">{p.name}</h3>
              {p.colors ? <p className="mt-0.5 text-sm text-gray-400">{p.colors}</p> : null}
              <div className="mt-2 flex items-baseline gap-2">
                {p.from ? <span className="text-sm font-semibold text-gray-400">Desde</span> : null}
                <span className="text-2xl font-extrabold text-neon">Bs {fmt(p.price)}</span>
                {p.oldPrice ? <span className="text-sm text-gray-500 line-through">Bs {fmt(p.oldPrice)}</span> : null}
              </div>
              {p.description ? <p className="mt-3 text-sm leading-relaxed text-gray-400">{p.description}</p> : null}

              {p.features && p.features.length ? (
                <ul className="mt-4 grid gap-2 text-sm text-gray-300">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-neon" />
                      {f}
                    </li>
                  ))}
                </ul>
              ) : null}

              {p.specs ? (
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[['Soporta', p.specs.soporta], ['Reclina', p.specs.reclina], ['Brazos', p.specs.brazos]].map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{k}</p>
                      <p className="mt-0.5 text-xs font-bold text-neon">{v}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {p.stock > 0 ? (
                <a
                  href={waLink(orderMsg(p))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-bold text-black transition hover:bg-emerald-400 active:scale-95"
                >
                  <MessageCircle size={18} /> Pedir por WhatsApp
                </a>
              ) : (
                <span className="mt-5 block rounded-xl bg-white/5 py-3 text-center text-gray-500">No disponible por ahora</span>
              )}
              <p className="mt-3 text-center text-xs text-gray-500">El pago y la entrega se coordinan por chat.</p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
