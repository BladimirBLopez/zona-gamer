'use client';
import { motion } from 'framer-motion';
import { Armchair, Sofa, Crown, Zap } from 'lucide-react';
import { products } from '../data/products';

const cards = [
  { name: 'Sillas gamer', Icon: Armchair },
  { name: 'Sillones gamer', Icon: Sofa },
  { name: 'Cougar', Icon: Crown },
  { name: 'Sharkoon', Icon: Zap },
];

export default function Categories({ cat, onPick }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ name, Icon }, i) => {
          const count = products.filter((p) => p.category === name || p.brand === name).length;
          const on = cat === name;
          return (
            <motion.button
              key={name}
              type="button"
              onClick={() => onPick(name)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileTap={{ scale: 0.97 }}
              className={`glass group flex items-center gap-3 rounded-2xl p-4 text-left transition hover:border-accent/50 ${
                on ? 'border-accent/70 bg-accent/10' : ''
              }`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/30 to-neon/20 text-neon transition group-hover:scale-110">
                <Icon size={22} />
              </span>
              <span>
                <span className="block text-sm font-semibold">{name}</span>
                <span className="block text-xs text-gray-500">
                  {count} {count === 1 ? 'modelo' : 'modelos'}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
