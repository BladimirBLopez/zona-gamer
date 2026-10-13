import { Gamepad2, MessageCircle } from 'lucide-react';
import { config } from '../data/config';
import { waLink } from '../lib/utils';

const links = [
  ['Inicio', '#inicio'],
  ['Catálogo', '#catalogo'],
  ['Cómo pedir', '#como-pedir'],
  ['Preguntas', '#faq'],
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40">
      <div className="bg-gradient-to-r from-accent/25 via-neon/15 to-accent/25 py-1.5 text-center text-[11px] font-medium text-gray-200 sm:text-xs">
        🇧🇴 {config.city} <span className="mx-1.5 text-neon">•</span> Stock real{' '}
        <span className="mx-1.5 text-neon">•</span> Atención por WhatsApp
      </div>
      <div className="border-b border-white/5 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <a href="#inicio" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-neon shadow-lg shadow-accent/30">
              <Gamepad2 size={22} className="text-white" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">{config.name}</span>
          </a>
          <nav className="hidden items-center gap-7 md:flex">
            {links.map(([label, href]) => (
              <a key={href} href={href} className="text-sm text-gray-300 transition hover:text-neon">
                {label}
              </a>
            ))}
          </nav>
          <a
            href={waLink(`Hola ${config.name} 👋`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-bold text-black transition hover:bg-emerald-400 sm:px-4"
          >
            <MessageCircle size={17} />
            <span className="hidden sm:inline">Escríbenos</span>
          </a>
        </div>
      </div>
    </header>
  );
}
