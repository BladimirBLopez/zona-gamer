'use client';
import { Search, ArrowRight } from 'lucide-react';

export default function Hero({ q, setQ, onExplore }) {
  const submit = (e) => {
    e.preventDefault();
    onExplore();
  };

  return (
    <section id="inicio" className="scroll-mt-24 px-4 pb-10 pt-12 sm:pb-14 sm:pt-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Cougar · Sharkoon</p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
          Sillas gamer originales, <span className="text-accent">precio y stock claros</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-gray-400 sm:text-lg">
          Elige tu modelo y pídelo directo por WhatsApp.
        </p>
        <form
          onSubmit={submit}
          className="glass mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl p-2"
        >
          <Search className="ml-2 shrink-0 text-gray-400" size={20} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="¿Qué silla buscas?"
            className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-gray-500 sm:text-base"
          />
          <button
            type="submit"
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
          >
            Explorar <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </section>
  );
}
