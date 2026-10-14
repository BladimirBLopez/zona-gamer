'use client';
import { useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { products } from '../data/products';
import { fmt } from '../lib/utils';
import Reveal from './Reveal';
import ProductModal from './ProductModal';

const list = products.filter((p) => p.stock > 0);

export default function Featured() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', loop: true }, [
    Autoplay({ delay: 3500, stopOnInteraction: true }),
  ]);
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);
  const prev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <Reveal className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neon">Listos ahora</p>
          <h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Disponibles para pedir hoy</h2>
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
              <button
                type="button"
                onClick={() => setOpen(p)}
                className="glass group block w-full overflow-hidden rounded-2xl text-left transition hover:border-accent/50"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-accent/20 via-card to-neon/10">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">{p.brand}</p>
                  <h3 className="line-clamp-1 font-semibold">{p.name}</h3>
                  <p className="mt-1 font-extrabold text-neon">
                    {p.price > 0 ? `${p.from ? 'Desde ' : ''}Bs ${fmt(p.price)}` : 'Consultar precio'}
                  </p>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <ProductModal p={open} onClose={close} />
    </section>
  );
}
