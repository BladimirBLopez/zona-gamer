'use client';
import { Armchair, Sofa, Crown, Zap, Mouse, Camera } from 'lucide-react';
import { products } from '../data/products';

const allCards = [
  { name: 'Sillas gamer', Icon: Armchair },
  { name: 'Sillones gamer', Icon: Sofa },
  { name: 'Mousepads', Icon: Mouse },
  { name: 'Cámaras', Icon: Camera },
  { name: 'Cougar', Icon: Crown },
  { name: 'Sharkoon', Icon: Zap },
];
const cards = allCards.filter((c) => products.some((p) => p.category === c.name || p.brand === c.name));

export default function Categories({ cat, onPick }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-5">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {cards.map(({ name, Icon }) => {
          const count = products.filter((p) => p.category === name || p.brand === name).length;
          const on = cat === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onPick(name)}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
                on ? 'border-accent bg-accent text-white' : 'border-white/10 bg-white/5 text-gray-200 hover:border-accent/50'
              }`}
            >
              <Icon size={16} className={on ? '' : 'text-accent'} />
              {name}
              <span className={`text-xs ${on ? 'text-white/80' : 'text-gray-500'}`}>{count}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
