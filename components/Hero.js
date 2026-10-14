'use client';
import { ArrowRight } from 'lucide-react';
import { config } from '../data/config';
import { waLink } from '../lib/utils';
import WhatsAppIcon from './WhatsAppIcon';

export default function Hero({ onExplore }) {
  return (
    <section id="inicio" className="scroll-mt-24 px-4 pb-12 pt-12 sm:pb-16 sm:pt-20">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-300">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Catálogo · Cougar · Sharkoon
        </span>
        <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
          Sillas gamer originales, <span className="text-accent">precio y stock claros</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-gray-400 sm:text-lg">
          Elige tu modelo y pídelo directo por WhatsApp.
        </p>
        <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onExplore}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-white transition hover:opacity-90 active:scale-95"
          >
            Explorar catálogo <ArrowRight size={18} />
          </button>
          <a
            href={waLink(`Hola ${config.name} 👋`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-base font-semibold text-black transition hover:brightness-110 active:scale-95"
          >
            <WhatsAppIcon size={20} /> Pedir por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
