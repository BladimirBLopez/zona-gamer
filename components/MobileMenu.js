'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Home, Search, ListChecks, Info, Headset, MessageCircle } from 'lucide-react';
import { config } from '../data/config';
import { waLink } from '../lib/utils';
import Brand from './Brand';

const items = [
  ['Inicio', '/#inicio', Home],
  ['Catálogo', '/#catalogo', Search],
  ['Cómo pedir', '/#como-pedir', ListChecks],
  ['Preguntas', '/#faq', Info],
  ['Soporte', '/#soporte', Headset],
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const drawer = (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="menu"
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col border-l border-white/10 bg-bg p-5"
            style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
          >
            <div className="flex items-center justify-between">
              <Brand size="sm" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="glass flex h-10 w-10 items-center justify-center rounded-xl"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-1">
              {items.map(([label, href, Icon]) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-base font-medium transition hover:bg-white/5"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-neon">
                    <Icon size={18} />
                  </span>
                  {label}
                </a>
              ))}
            </nav>

            <div className="mt-auto">
              <a
                href={waLink(`Hola ${config.name} 👋`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 font-bold text-black transition hover:brightness-110 active:scale-95"
              >
                <MessageCircle size={18} /> Escríbenos por WhatsApp
              </a>
              <p className="mt-3 text-center text-xs text-gray-500">{config.schedule}</p>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={open}
        className="glass flex h-10 w-10 items-center justify-center rounded-xl transition hover:border-accent/50 active:scale-95"
      >
        <Menu size={20} />
      </button>
      {mounted ? createPortal(drawer, document.body) : null}
    </div>
  );
}
