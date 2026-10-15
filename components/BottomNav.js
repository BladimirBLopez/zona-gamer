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
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let current = items[0].id;
      items.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      });
      const bottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (bottom) current = items[items.length - 1].id;
      setActive(current);
    };
    const onChange = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onChange, { passive: true });
    window.addEventListener('resize', onChange);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onChange) : null;
    if (ro) ro.observe(document.body);
    return () => {
      window.removeEventListener('scroll', onChange);
      window.removeEventListener('resize', onChange);
      if (ro) ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
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
