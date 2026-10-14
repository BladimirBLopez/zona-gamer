'use client';
import { useEffect, useState } from 'react';
import { Home, Search, ListChecks, Headset } from 'lucide-react';

const items = [
  { id: 'inicio', label: 'Inicio', Icon: Home },
  { id: 'catalogo', label: 'Catálogo', Icon: Search },
  { id: 'como-pedir', label: 'Cómo comprar', Icon: ListChecks },
  { id: 'soporte', label: 'Soporte', Icon: Headset },
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

  const goTo = (e, id) => {
    if (id === 'inicio') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-3 bottom-3 z-50 md:hidden"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="nav-pill flex gap-1 rounded-3xl p-1.5">
        {items.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => goTo(e, id)}
              aria-current={on ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2.5 text-[11px] font-semibold transition-all duration-200 ${
                on ? 'bg-accent text-white' : 'text-gray-400 active:bg-white/5'
              }`}
            >
              <Icon size={20} strokeWidth={on ? 2.4 : 2} />
              <span>{label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
