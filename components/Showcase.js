'use client';
import { motion } from 'framer-motion';
import { products } from '../data/products';

const byId = (id) => products.find((p) => p.id === id);

const chairs = [
  { id: 7, cls: 'w-[28%] translate-y-4 -rotate-2', delay: 0.1 },
  { id: 19, cls: 'z-10 w-[40%]', delay: 0 },
  { id: 10, cls: 'w-[28%] translate-y-4 rotate-2', delay: 0.2 },
]
  .map((c) => ({ ...c, p: byId(c.id) }))
  .filter((c) => c.p);

export default function Showcase() {
  return (
    <section className="relative mx-auto mt-2 max-w-3xl px-4 pb-10">
      <div className="pointer-events-none absolute inset-x-10 bottom-6 h-40 rounded-full bg-accent/30 blur-[90px]" />
      <div className="relative flex items-end justify-center gap-2 sm:gap-4">
        {chairs.map((c) => (
          <div key={c.id} className={c.cls}>
            <motion.img
              src={c.p.image}
              alt={c.p.name}
              className="w-full rounded-2xl drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: c.delay }}
            />
          </div>
        ))}
      </div>
      <div className="mx-auto mt-2 h-4 w-3/4 rounded-[50%] bg-black/60 blur-xl" />
    </section>
  );
}
