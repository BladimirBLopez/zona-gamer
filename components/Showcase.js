'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { products } from '../data/products';

const byId = (id) => products.find((p) => p.id === id);

const chairs = [
  { id: 1, cls: 'w-[28%] translate-y-4 -rotate-2', delay: 0.1 },
  { id: 2, cls: 'z-10 w-[40%]', delay: 0 },
  { id: 5, cls: 'w-[28%] translate-y-4 rotate-2', delay: 0.2 },
]
  .map((c) => ({ ...c, p: byId(c.id) }))
  .filter((c) => c.p && !c.p.image.startsWith('data:'));

export default function Showcase() {
  if (!chairs.length) return null;
  return (
    <section className="mx-auto mt-6 max-w-3xl px-4 pb-8">
      <div className="flex items-end justify-center gap-2 sm:gap-4">
        {chairs.map((c) => (
          <div key={c.id} className={c.cls}>
            <Link href={`/producto/${c.p.slug}`} aria-label={c.p.name} className="block">
              <motion.div
                className="aspect-square overflow-hidden rounded-2xl bg-[#f1f1f4]"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: c.delay }}
              >
                <img src={c.p.image} alt={c.p.name} className="h-full w-full object-contain p-1" />
              </motion.div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
