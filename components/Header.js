import WhatsAppIcon from './WhatsAppIcon';
import { config } from '../data/config';
import { waLink } from '../lib/utils';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';
import Brand from './Brand';

const links = [
  ['Inicio', '/#inicio'],
  ['Catálogo', '/#catalogo'],
  ['Cómo pedir', '/#como-pedir'],
  ['Preguntas', '/#faq'],
  ['Soporte', '/#soporte'],
];

export default function Header() {
  return (
    <>
      <div className="bg-bg bg-gradient-to-r from-accent/25 via-neon/15 to-accent/25 py-1.5 text-center text-[11px] font-medium text-gray-200 sm:text-xs">
        🇧🇴 {config.city} <span className="mx-1.5 text-neon">•</span> Productos originales{' '}
        <span className="mx-1.5 text-neon">•</span> Atención por WhatsApp
      </div>
      <header className="nav-surface sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <a href="/#inicio" aria-label={config.name} className="flex items-center">
            <Brand size="sm" />
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            {links.map(([label, href]) => (
              <a key={href} href={href} className="text-sm text-gray-300 transition hover:text-neon">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href={waLink(`Hola ${config.name} 👋`)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escribir por WhatsApp"
              className="flex h-10 items-center gap-2 rounded-xl bg-[#25D366] px-3 text-sm font-bold text-white transition hover:bg-[#1ebe5b] sm:px-4"
            >
              <WhatsAppIcon size={20} />
              <span className="hidden sm:inline">Escríbenos</span>
            </a>
            <MobileMenu />
          </div>
        </div>
      </header>
    </>
  );
}
