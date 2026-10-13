import Catalog from '../components/Catalog';
import { config } from '../data/config';

const steps = [
  { n: '1', t: 'Elige', d: 'Busca tu producto en el catálogo y mira el stock.' },
  { n: '2', t: 'Escríbenos', d: 'Toca "Pedir por WhatsApp" y te llega el mensaje ya armado.' },
  { n: '3', t: 'Recibe', d: 'Coordinamos el pago y la entrega contigo por chat.' },
];

const faqs = [
  { q: '¿Cómo pago?', a: 'El pago se coordina por WhatsApp. No hay pagos en la web.' },
  { q: '¿El stock es real?', a: 'Sí, se actualiza seguido. Si algo cambia, te avisamos por chat.' },
  { q: '¿Hacen envíos?', a: 'Coordinamos la entrega contigo por WhatsApp según tu ciudad.' },
];

export default function Home() {
  const socials = [
    ['Instagram', config.instagram],
    ['Facebook', config.facebook],
    ['TikTok', config.tiktok],
  ].filter(([, url]) => url);

  return (
    <main>
      <header className="border-b border-white/5">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-lg font-bold">
            {config.name} <span className="text-neon">🎮</span>
          </span>
          <a href="#catalogo" className="text-sm text-gray-300 hover:text-white">Catálogo</a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-6 pt-14 text-center sm:pt-20">
        <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">
          Todo para tu <span className="bg-gradient-to-r from-accent to-neon bg-clip-text italic text-transparent">setup gamer</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-gray-400">
          Consolas, periféricos, juegos y gift cards. Elige y pide directo por WhatsApp.
        </p>
        <a
          href="#catalogo"
          className="mt-7 inline-block rounded-xl bg-accent px-7 py-3 font-semibold text-white shadow-lg shadow-accent/30 transition hover:opacity-90"
        >
          Ver catálogo
        </a>
        <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs text-gray-300">
          {['Stock real', 'Precio final', 'Atención por WhatsApp'].map((b) => (
            <span key={b} className="rounded-full border border-white/10 bg-card px-3 py-1">✔ {b}</span>
          ))}
        </div>
      </section>

      <Catalog />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold sm:text-3xl">Cómo pedir</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/10 bg-card p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-bold">{s.n}</span>
              <h3 className="mt-3 font-semibold">{s.t}</h3>
              <p className="mt-1 text-sm text-gray-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="text-2xl font-bold sm:text-3xl">Preguntas frecuentes</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="rounded-xl border border-white/10 bg-card p-4">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-gray-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 py-10 text-center text-sm text-gray-400">
        <p className="font-semibold text-gray-200">{config.name}</p>
        <p className="mt-1">{config.city} · {config.schedule}</p>
        {socials.length > 0 && (
          <div className="mt-3 flex justify-center gap-4">
            {socials.map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="hover:text-neon">{name}</a>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-gray-600">© {new Date().getFullYear()} {config.name}</p>
      </footer>

      <a
        href={`https://wa.me/${config.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribir por WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl shadow-lg shadow-emerald-500/30 transition hover:scale-105"
      >
        💬
      </a>
    </main>
  );
}
