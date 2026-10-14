import { Music2, Users } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { config } from '../data/config';
import { waLink } from '../lib/utils';
import Brand from './Brand';

const links = [
  ['Catálogo', '/#catalogo'],
  ['Cómo comprar', '/#como-pedir'],
  ['Preguntas', '/#faq'],
  ['Soporte', '/#soporte'],
];

export default function Footer() {
  const socials = [
    config.tiktok && { label: 'TikTok', href: config.tiktok, Icon: Music2 },
    config.facebook && { label: 'Facebook', href: config.facebook, Icon: Users },
    { label: 'WhatsApp', href: waLink(`Hola ${config.name} 👋`), Icon: WhatsAppIcon },
  ].filter(Boolean);

  return (
    <footer className="border-t border-white/10 bg-bg px-4 pb-28 pt-12 md:pb-10">
      <div className="mx-auto max-w-7xl">
        <a href="/#inicio" className="inline-flex items-center gap-3" aria-label={config.name}>
          <Brand />
        </a>

        <p className="mt-5 max-w-md text-base leading-relaxed text-gray-400">
          Sillas y sillones gamer con precios claros y atención directa desde {config.city}.
        </p>

        <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="text-sm font-bold transition hover:text-neon">
              {label}
            </a>
          ))}
        </nav>

        <div className="mt-6 flex flex-wrap gap-3">
          {socials.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-card px-4 py-2.5 text-sm font-semibold transition hover:border-accent/60"
            >
              <Icon size={18} />
              {label}
            </a>
          ))}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs leading-relaxed text-gray-500 sm:text-sm">
          © {new Date().getFullYear()} {config.name}. Las marcas mencionadas pertenecen a sus respectivos titulares. {config.name} no declara afiliación con ellas.
        </div>
      </div>
    </footer>
  );
}
