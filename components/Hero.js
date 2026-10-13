'use client';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Gamepad2, Headphones, Keyboard, Cpu, ShieldCheck, Zap, MessageCircle } from 'lucide-react';

const floats = [
  { Icon: Gamepad2, cls: 'left-[6%] top-20', color: 'text-accent', delay: 0 },
  { Icon: Headphones, cls: 'right-[7%] top-28', color: 'text-neon', delay: 1 },
  { Icon: Keyboard, cls: 'left-[11%] bottom-24', color: 'text-neon', delay: 2 },
  { Icon: Cpu, cls: 'right-[10%] bottom-20', color: 'text-accent', delay: 0.5 },
];

const trust = [
  { Icon: ShieldCheck, t: 'Stock real' },
  { Icon: Zap, t: 'Respuesta rápida' },
  { Icon: MessageCircle, t: 'Pedido por WhatsApp' },
];

const up = (delay) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

export default function Hero({ q, setQ, onExplore }) {
  const submit = (e) => {
    e.preventDefault();
    onExplore();
  };

  return (
    <section id="inicio" className="relative scroll-mt-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-accent/25 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-neon/15 blur-[110px]" />

      {floats.map(({ Icon, cls, color, delay }, i) => (
        <motion.div
          key={i}
          className={`glass absolute hidden h-14 w-14 items-center justify-center rounded-2xl md:flex ${cls}`}
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 5, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={26} className={color} />
        </motion.div>
      ))}

      <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-14 text-center sm:pb-24 sm:pt-24">
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

        <motion.h1
          {...up(0.1)}
          className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
        >
          Sube de nivel tu <span className="text-gradient italic">setup gamer</span>
        </motion.h1>

        <motion.p {...up(0.2)} className="mx-auto mt-5 max-w-xl text-base text-gray-400 sm:text-lg">
          Consolas, periféricos, juegos y gift cards. Compara precio y stock, y pide directo por WhatsApp.
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

        <motion.div {...up(0.4)} className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-gray-300 sm:text-sm">
          {trust.map(({ Icon, t }) => (
            <span key={t} className="flex items-center gap-2">
              <Icon size={16} className="text-neon" /> {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
