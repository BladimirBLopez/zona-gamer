import { Search, MessageCircle, PackageCheck, ChevronDown, ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import { config } from '../data/config';
import { waLink } from '../lib/utils';

const steps = [
  { Icon: Search, t: 'Elige', d: 'Busca tu producto en el catálogo y revisa el stock.' },
  { Icon: MessageCircle, t: 'Escríbenos', d: 'Desde la ficha toca "Pedir por WhatsApp" y el mensaje llega ya armado.' },
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
    <section id="como-pedir" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Cómo pedir</p>
        <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Tres pasos y listo</h2>
      </Reveal>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {steps.map(({ Icon, t, d }, i) => (
          <Reveal key={t} delay={i * 0.08} className="h-full">
            <div className="glass h-full rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Icon size={20} />
                </span>
                <span className="font-display text-sm font-semibold text-gray-500">0{i + 1}</span>
              </div>
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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Antes de pedir</p>
        <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Preguntas frecuentes</h2>
      </Reveal>
      <div className="mt-6 space-y-3">
        {faqs.map((f, i) => (
          <Reveal key={f.q} delay={i * 0.04}>
            <details className="group glass rounded-xl p-4 open:border-accent/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium sm:text-base [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown size={18} className="shrink-0 text-accent transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-gray-400">{f.a}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function FloatingWhatsApp() {
  return (
    <a
      href={waLink(`Hola ${config.name} 👋`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="fixed bottom-6 right-6 z-50 hidden h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 transition hover:scale-105 md:flex"
    >
      <MessageCircle size={26} />
    </a>
  );
}

export function Support() {
  const phone = `+${config.whatsapp.slice(0, 3)} ${config.whatsapp.slice(3)}`;

  return (
    <section id="soporte" className="mx-auto max-w-4xl scroll-mt-24 px-4 py-14">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Soporte</p>
        <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">¿Dudas? Escríbenos</h2>
        <p className="mt-2 text-sm text-gray-400">{config.schedule}</p>
      </Reveal>
      <Reveal className="mt-6">
        <a
          href={waLink(`Hola ${config.name} 👋 Necesito ayuda con un pedido.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="glass group flex items-center justify-between gap-4 rounded-2xl p-5 transition hover:border-emerald-400/60"
        >
          <span className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-black">
              <MessageCircle size={24} />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold">WhatsApp</span>
              <span className="block text-sm text-gray-400">{phone}</span>
            </span>
          </span>
          <ArrowRight size={20} className="text-emerald-500 transition group-hover:translate-x-1" />
        </a>
      </Reveal>
    </section>
  );
}

export function Community() {
  const cards = [
    { label: 'Videos y lives', name: '@zonasgamer5', cta: 'Ver nuestro TikTok', href: config.tiktok },
    { label: 'Novedades y contacto', name: config.name, cta: 'Visitar nuestra página de Facebook', href: config.facebook },
  ].filter((c) => c.href);

  if (cards.length === 0) return null;

  return (
    <section id="comunidad" className="mx-auto max-w-4xl scroll-mt-24 px-4 py-12">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Comunidad</p>
        <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Síguenos</h2>
        <p className="mt-2 max-w-xl text-sm text-gray-400">
          En nuestras redes publicamos novedades y productos de {config.name}.
        </p>
      </Reveal>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((c, i) => (
          <Reveal key={c.label} delay={i * 0.06} className="h-full">
            <a
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="glass group flex h-full items-center justify-between gap-4 rounded-2xl p-5 transition hover:border-accent/50"
            >
              <span>
                <span className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-accent">{c.label}</span>
                <span className="mt-1 block font-display text-lg font-semibold">{c.name}</span>
                <span className="mt-0.5 block text-sm text-gray-400">{c.cta}</span>
              </span>
              <ArrowRight size={20} className="shrink-0 text-accent transition group-hover:translate-x-1" />
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
