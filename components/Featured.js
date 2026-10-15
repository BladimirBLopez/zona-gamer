'use client';
import { useCallback } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { products } from '../data/products';
import { fmt } from '../lib/utils';
import Reveal from './Reveal';

const featuredIds = [19, 40, 33, 34, 20, 39, 41, 44];
const list = featuredIds
  .map((id) => products.find((p) => p.id === id))
  .filter(Boolean);

export default function Featured() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ]);
  const prev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <Reveal className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Selección</p>
          <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Productos destacados</h2>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button type="button" onClick={prev} aria-label="Anterior" className="glass flex h-10 w-10 items-center justify-center rounded-xl transition hover:border-accent/50 active:scale-95">
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={next} aria-label="Siguiente" className="glass flex h-10 w-10 items-center justify-center rounded-xl transition hover:border-accent/50 active:scale-95">
            <ChevronRight size={20} />
          </button>
        </div>
      </Reveal>

      <div className="mt-6 overflow-hidden" ref={emblaRef}>
        <div className="-ml-3 flex">
          {list.map((p) => (
            <div key={p.id} className="min-w-0 shrink-0 grow-0 basis-[72%] pl-3 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <Link
                href={`/producto/${p.slug}`}
                className="glass group block overflow-hidden rounded-2xl transition hover:border-accent/50"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-[#f1f1f4]">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-500">{p.brand}</p>
                  <h3 className="mt-0.5 line-clamp-1 font-semibold">{p.name}</h3>
                  <p className="mt-1 font-bold">
                    {p.price > 0 ? `${p.from ? 'Desde ' : ''}Bs ${fmt(p.price)}` : 'Consultar precio'}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
