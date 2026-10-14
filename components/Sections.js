import { Search, MessageCircle, PackageCheck, ChevronDown, ArrowRight } from 'lucide-react';
import Reveal from './Reveal';
import WhatsAppIcon from './WhatsAppIcon';
import { config } from '../data/config';
import { waLink } from '../lib/utils';

const steps = [
  { Icon: Search, t: 'Elige', d: 'Explora el catálogo y revisa precio y disponibilidad.' },
  { Icon: MessageCircle, t: 'Escríbenos', d: 'Desde la ficha del producto, un toque y tu pedido llega a WhatsApp ya redactado.' },
  { Icon: PackageCheck, t: 'Recibe', d: 'Confirmamos disponibilidad y coordinamos pago y entrega contigo.' },
];

const faqs = [
  { q: '¿Cómo pago?', a: 'El pago se coordina por WhatsApp. Lo coordinas directamente con nosotros.' },
  { q: '¿Cómo sé si hay stock?', a: 'Te confirmamos la disponibilidad por WhatsApp antes de cerrar tu pedido.' },
  { q: '¿Hacen envíos?', a: 'Coordinamos la entrega contigo por WhatsApp según tu ciudad.' },
  { q: '¿Tienen garantía?', a: 'Consulta por WhatsApp la garantía de cada producto antes de comprar.' },
];

export function HowTo() {
  return (
    <section id="como-pedir" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Cómo comprar</p>
        <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Así compras en tres pasos</h2>
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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Antes de comprar</p>
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
      className="fixed bottom-6 right-6 z-50 hidden h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/30 transition hover:scale-105 md:flex"
    >
      <WhatsAppIcon size={30} />
    </a>
  );
}

export function Support() {
  const phone = `+${config.whatsapp.slice(0, 3)} ${config.whatsapp.slice(3)}`;

  return (
    <section id="soporte" className="mx-auto max-w-4xl scroll-mt-24 px-4 py-14">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Soporte</p>
        <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Atención al cliente</h2>
        {config.schedule ? <p className="mt-2 text-sm text-gray-400">{config.schedule}</p> : null}
      </Reveal>
      <Reveal className="mt-6">
        <a
          href={waLink(`Hola ${config.name} 👋 Necesito ayuda con un pedido.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="glass group flex items-center justify-between gap-4 rounded-2xl p-5 transition hover:border-emerald-400/60"
        >
          <span className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366] text-white">
              <WhatsAppIcon size={26} />
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
    { label: 'Videos y lives', name: '@zonasgamer5', cta: 'Ver perfil de TikTok', href: config.tiktok },
    { label: 'Novedades y contacto', name: config.name, cta: 'Ver página de Facebook', href: config.facebook },
  ].filter((c) => c.href);

  if (cards.length === 0) return null;

  return (
    <section id="comunidad" className="mx-auto max-w-4xl scroll-mt-24 px-4 py-12">
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Comunidad</p>
        <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Nuestras redes</h2>
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
