'use client';
import { motion } from 'framer-motion';

const chairs = [
  { src: '/hero/hero-rosa.webp', cls: 'w-[28%] translate-y-4 -rotate-2', delay: 0.1 },
  { src: '/hero/hero-titan.webp', cls: 'z-10 w-[40%]', delay: 0 },
  { src: '/hero/hero-gold.webp', cls: 'w-[28%] translate-y-4 rotate-2', delay: 0.2 },
];

export default function Showcase() {
  return (
    <section className="relative mx-auto -mt-6 max-w-3xl px-4 pb-10">
      <div className="pointer-events-none absolute inset-x-10 bottom-6 h-40 rounded-full bg-accent/30 blur-[90px]" />
      <div className="relative flex items-end justify-center gap-2 sm:gap-4">
        {chairs.map((c) => (
          <div key={c.src} className={c.cls}>
            <motion.img
              src={c.src}
              alt="Silla gamer Cougar"
              className="w-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]"
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
