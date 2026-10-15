import Link from 'next/link';
import { products } from '../data/products';

const choices = [
  ['Sillas gamer', 19],
  ['Mesas Cougar', 40],
  ['Proyectores', 33],
  ['Cámaras', 20],
  ['Sillones gamer', 14],
  ['Mousepads', 37],
  ['Accesorios gamer', 39],
  ['Almacenamiento', 41],
  ['Pasta térmica', 44],
];

const cards = choices
  .map(([name, id]) => ({
    name,
    image: products.find((p) => p.id === id)?.image,
    count: products.filter((p) => p.category === name).length,
  }))
  .filter((c) => c.count > 0);

export default function HomeCategories() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Encuentra lo que buscas
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
            Compra por categoría
          </h2>
        </div>
        <Link
          href="/catalogo"
          className="text-sm font-semibold text-accent hover:underline"
        >
          Ver catálogo completo →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.name}
            href={`/catalogo?categoria=${encodeURIComponent(c.name)}`}
            className="glass group overflow-hidden rounded-2xl transition hover:border-accent/60"
          >
            <div className="flex aspect-[4/3] items-center justify-center bg-[#f1f1f4]">
              {c.image ? (
                <img
                  src={c.image}
                  alt={`Explorar ${c.name}`}
                  loading="lazy"
                  className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105"
                />
              ) : null}
            </div>
            <div className="p-3 sm:p-4">
              <h3 className="text-sm font-bold sm:text-base">
                {c.name}
              </h3>
              <p className="mt-1 text-xs text-gray-400">
                {c.count} productos · Explorar →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
