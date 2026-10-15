'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Home, Search, ListChecks, Headset } from 'lucide-react';

const items = [
  { id: 'inicio', label: 'Inicio', href: '/#inicio', Icon: Home },
  { id: 'catalogo', label: 'Catálogo', href: '/catalogo', Icon: Search },
  { id: 'como-pedir', label: 'Cómo comprar', href: '/#como-pedir', Icon: ListChecks },
  { id: 'soporte', label: 'Soporte', href: '/#soporte', Icon: Headset },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [active, setActive] = useState(
    pathname === '/catalogo' ? 'catalogo' : 'inicio'
  );

  useEffect(() => {
    if (pathname === '/catalogo') {
      setActive('catalogo');
      return;
    }

    const update = () => {
      const line = window.innerHeight * 0.4;
      let current = 'inicio';

      ['inicio', 'como-pedir', 'soporte'].forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) {
          current = id;
        }
      });

      setActive(current);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [pathname]);

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-3 bottom-3 z-50 md:hidden"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="nav-pill flex gap-1 rounded-3xl p-1.5">
        {items.map(({ id, label, href, Icon }) => {
          const on = active === id;
          return (
            <a
              key={id}
              href={href}
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
