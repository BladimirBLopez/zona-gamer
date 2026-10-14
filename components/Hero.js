'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, ArrowRight, Gamepad2, Headphones, Keyboard, Cpu } from 'lucide-react';

const headlines = [
  ['Sube de nivel tu ', 'setup gamer'],
  ['Sillas y sillones ', 'originales'],
  ['Compara precio y stock, ', 'sin sorpresas'],
  ['Elige tu silla y ', 'pídela por WhatsApp'],
  ['Juega, trabaja y ', 'descansa mejor'],
];

const floats = [
  { Icon: Gamepad2, cls: 'left-[5%] top-14', color: 'text-accent', delay: 0 },
  { Icon: Headphones, cls: 'right-[6%] top-20', color: 'text-neon', delay: 1 },
  { Icon: Keyboard, cls: 'left-[9%] bottom-16', color: 'text-neon', delay: 2 },
  { Icon: Cpu, cls: 'right-[8%] bottom-14', color: 'text-accent', delay: 0.5 },
];

const up = (delay) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

export default function Hero({ q, setQ, onExplore }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % headlines.length), 4500);
    return () => clearInterval(t);
  }, []);

  const [a, b] = headlines[i];
  const submit = (e) => {
    e.preventDefault();
    onExplore();
  };

  return (
    <section id="inicio" className="relative scroll-mt-24 px-3 pt-5 sm:px-4 sm:pt-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-accent/40 bg-gradient-to-br from-accent/15 via-card to-neon/10 shadow-2xl shadow-accent/10">
        <div className="pointer-events-none absolute inset-0 bg-grid" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-accent/25 blur-[100px]" />
        <div className="pointer-events-none absolute -right-16 top-32 h-60 w-60 rounded-full bg-neon/15 blur-[90px]" />

        {floats.map(({ Icon, cls, color, delay }, n) => (
          <motion.div
            key={n}
            className={`glass absolute hidden h-14 w-14 items-center justify-center rounded-2xl md:flex ${cls}`}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 5, delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon size={26} className={color} />
          </motion.div>
        ))}

        <div className="relative mx-auto max-w-3xl px-5 pb-10 pt-10 text-center sm:px-8 sm:pb-14 sm:pt-16">
          <motion.span
            {...up(0)}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-200"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Catálogo gamer en vivo
          </motion.span>

          <div className="mt-6 flex min-h-[8rem] items-center justify-center sm:min-h-[12.5rem] lg:min-h-[10rem]">
            <AnimatePresence mode="wait">
              <motion.h1
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
              >
                {a}
                <span className="text-gradient italic">{b}</span>
              </motion.h1>
            </AnimatePresence>
          </div>

          <div className="mt-3 flex justify-center gap-1.5">
            {headlines.map((_, n) => (
              <button
                key={n}
                type="button"
                onClick={() => setI(n)}
                aria-label={`Mensaje ${n + 1}`}
                className={`h-1.5 rounded-full transition-all ${n === i ? 'w-6 bg-neon' : 'w-1.5 bg-gray-500/40'}`}
              />
            ))}
          </div>

          <motion.p {...up(0.2)} className="mx-auto mt-5 max-w-xl text-base text-gray-400 sm:text-lg">
            Sillas y sillones gamer originales Cougar y Sharkoon. Compara precio y stock, y pide directo por WhatsApp.
          </motion.p>

          <motion.form
            {...up(0.3)}
            onSubmit={submit}
            className="glass mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl p-2 shadow-2xl shadow-black/40"
          >
            <Search className="ml-2 shrink-0 text-gray-400" size={20} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="¿Qué producto buscas?"
              className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-gray-500 sm:text-base"
            />
            <button
              type="submit"
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-accent to-indigo-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition hover:opacity-90 active:scale-95"
            >
              Explorar <ArrowRight size={16} />
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
