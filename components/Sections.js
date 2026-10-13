import { Search, MessageCircle, PackageCheck, ChevronDown, MapPin, Clock, ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import { config } from '../data/config';
import { waLink } from '../lib/utils';

const steps = [
  { Icon: Search, t: 'Elige', d: 'Busca tu producto en el catálogo y revisa el stock.' },
  { Icon: MessageCircle, t: 'Escríbenos', d: 'Toca "Pedir por WhatsApp" y el mensaje llega ya armado.' },
  { Icon: PackageCheck, t: 'Recibe', d: 'Coordinamos el pago y la entrega contigo por chat.' },
];

const faqs = [
  { q: '¿Cómo pago?', a: 'El pago se coordina por WhatsApp. No hay pagos dentro de la web.' },
  { q: '¿El stock es real?', a: 'Sí, lo actualizamos seguido. Si algo cambia, te avisamos por chat.' },
  { q: '¿Hacen envíos?', a: 'Coordinamos la entrega contigo por WhatsApp según tu ciudad.' },
  { q: '¿Puedo reservar un producto?', a: 'Escríbenos y lo coordinamos. Te confirmamos disponibilidad al momento.' },
  { q: '¿Tienen garantía?', a: 'Consulta por WhatsApp la garantía de cada producto antes de comprar.' },
];

export function HowTo() {
  return (
    <section id="como-pedir" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16">
      <Reveal>
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-neon">Sin complicaciones</p>
        <h2 className="mt-2 text-center font-display text-3xl font-bold sm:text-4xl">Cómo pedir</h2>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {steps.map(({ Icon, t, d }, i) => (
          <Reveal key={t} delay={i * 0.1} className="h-full">
            <div className="glass relative h-full rounded-2xl p-6">
              <span className="absolute right-5 top-3 font-display text-6xl font-bold text-white/5">{i + 1}</span>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-neon text-white shadow-lg shadow-accent/30">
                <Icon size={22} />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-gray-400">{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-12">
      <Reveal>
        <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">Preguntas frecuentes</h2>
      </Reveal>
      <div className="mt-8 space-y-3">
        {faqs.map((f, i) => (
          <Reveal key={f.q} delay={i * 0.05}>
            <details className="group glass rounded-xl p-4 open:border-accent/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown size={18} className="shrink-0 text-neon transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-gray-400">{f.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-accent/30 via-card to-neon/20 p-8 text-center sm:p-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-neon/20 blur-[80px]" />
          <h2 className="relative font-display text-2xl font-bold sm:text-4xl">¿No encuentras lo que buscas?</h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-gray-300 sm:text-base">
            Escríbenos por WhatsApp y te ayudamos a conseguirlo.
          </p>
          <a
            href={waLink(`Hola ${config.name} 👋 Quiero consultar por un producto.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-black transition hover:bg-emerald-400 active:scale-95"
          >
            <MessageCircle size={18} /> Hablar por WhatsApp <ArrowRight size={16} />
          </a>
        </div>
      </Reveal>
    </section>
  );
}

export function Footer() {
  const socials = [
    ['Instagram', config.instagram],
    ['Facebook', config.facebook],
    ['TikTok', config.tiktok],
  ].filter(([, url]) => url);

  return (
    <footer className="border-t border-white/5 px-4 pb-28 pt-12 md:pb-10">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold">{config.name} 🎮</p>
          <p className="mt-2 text-sm text-gray-500">Tu tienda gamer en {config.city}. Pide fácil por WhatsApp.</p>
        </div>
        <div className="text-sm text-gray-400">
          <p className="font-semibold text-gray-200">Contacto</p>
          <p className="mt-2 flex items-center gap-2"><MapPin size={15} className="text-neon" /> {config.city}</p>
          <p className="mt-1 flex items-center gap-2"><Clock size={15} className="text-neon" /> {config.schedule}</p>
          <a href={waLink(`Hola ${config.name} 👋`)} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-2 hover:text-neon">
            <MessageCircle size={15} className="text-neon" /> WhatsApp
          </a>
        </div>
        <div className="text-sm text-gray-400">
          <p className="font-semibold text-gray-200">Enlaces</p>
          <div className="mt-2 flex flex-col gap-1">
            <a href="#catalogo" className="hover:text-neon">Catálogo</a>
            <a href="#como-pedir" className="hover:text-neon">Cómo pedir</a>
            <a href="#faq" className="hover:text-neon">Preguntas frecuentes</a>
            {socials.map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="hover:text-neon">{name}</a>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} {config.name}. Todos los derechos reservados.
      </p>
    </footer>
  );
}

export function FloatingWhatsApp() {
  return (
    <a
      href={waLink(`Hola ${config.name} 👋`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-6 right-6 z-50 hidden h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg shadow-emerald-500/40 transition hover:scale-110 md:flex"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />
      <MessageCircle size={26} className="relative" />
    </a>
  );
}
