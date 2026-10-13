'use client';
import { motion } from 'framer-motion';
import { Gamepad2, Keyboard, Disc, Headphones, Gift } from 'lucide-react';
import { products, categories } from '../data/products';

const icons = {
  Consolas: Gamepad2,
  Periféricos: Keyboard,
  Juegos: Disc,
  Accesorios: Headphones,
  'Gift cards': Gift,
};

export default function Categories({ cat, onPick }) {
  const list = categories.filter((c) => c !== 'Todos');
  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((c, i) => {
          const Icon = icons[c] || Gamepad2;
          const count = products.filter((p) => p.category === c).length;
          const on = cat === c;
          return (
            <motion.button
              key={c}
              type="button"
              onClick={() => onPick(c)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileTap={{ scale: 0.97 }}
              className={`glass group flex items-center gap-3 rounded-2xl p-4 text-left transition hover:border-accent/50 last:col-span-2 sm:last:col-span-1 ${
                on ? 'border-accent/70 bg-accent/10' : ''
              }`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/30 to-neon/20 text-neon transition group-hover:scale-110">
                <Icon size={22} />
              </span>
              <span>
                <span className="block text-sm font-semibold">{c}</span>
                <span className="block text-xs text-gray-500">
                  {count} {count === 1 ? 'producto' : 'productos'}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
