'use client';
import { useEffect, useState } from 'react';
import { Home, Search, ListChecks, Headset } from 'lucide-react';
import { config } from '../data/config';

const items = [
  { id: 'inicio', label: 'Inicio', Icon: Home },
  { id: 'catalogo', label: 'Catálogo', Icon: Search },
  { id: 'como-pedir', label: 'Cómo pedir', Icon: ListChecks },
];

export default function BottomNav() {
  const [active, setActive] = useState('inicio');

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const base =
    'flex flex-1 flex-col items-center gap-1 rounded-2xl py-2.5 text-[11px] font-semibold transition-all duration-200';

  const goTo = (e, id) => {
    if (id === 'inicio') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const supportMsg = encodeURIComponent(`Hola ${config.name} 👋 Necesito ayuda con un pedido.`);

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-3 bottom-3 z-50 md:hidden"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex gap-1 rounded-3xl border border-white/10 bg-[#0a1220]/90 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl">
        {items.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => goTo(e, id)}
              aria-current={on ? 'page' : undefined}
              className={`${base} ${
                on ? 'bg-accent text-white shadow-lg shadow-accent/30' : 'text-gray-400 active:bg-white/5'
              }`}
            >
              <Icon size={20} strokeWidth={on ? 2.4 : 2} />
              <span>{label}</span>
            </a>
          );
        })}
        <a
          href={`https://wa.me/${config.whatsapp}?text=${supportMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} text-gray-400 active:bg-white/5`}
        >
          <Headset size={20} strokeWidth={2} />
          <span>Soporte</span>
        </a>
      </div>
    </nav>
  );
}
