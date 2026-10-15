import Header from '../../components/Header';
import Catalog from '../../components/Catalog';
import Footer from '../../components/Footer';
import BottomNav from '../../components/BottomNav';
import { FloatingWhatsApp } from '../../components/Sections';
import { products } from '../../data/products';

export const metadata = {
  title: 'Catálogo | Zona Gamer',
  description: 'Explora productos gamer, compara precios y consulta por WhatsApp.',
  alternates: { canonical: '/catalogo' },
};

export default async function CatalogoPage({ searchParams }) {
  const params = await searchParams;
  const category = typeof params?.categoria === 'string'
    ? params.categoria
    : 'Todos';

  const initialCategory = products.some(
    (p) => p.category === category
  ) ? category : 'Todos';

  return (
    <main>
      <Header />
      <div className="mx-auto max-w-7xl px-4 pt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Zona Gamer
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
          Explora nuestro catálogo
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-gray-400 sm:text-base">
          Encuentra tus productos favoritos, compara precios y consulta directamente por WhatsApp.
        </p>
      </div>
      <Catalog key={initialCategory} initialCategory={initialCategory} />
      <Footer />
      <FloatingWhatsApp />
      <BottomNav />
    </main>
  );
}
