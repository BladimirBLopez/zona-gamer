import { notFound } from 'next/navigation';
import { products } from '../../../data/products';
import { config } from '../../../data/config';
import { fmt } from '../../../lib/utils';
import Header from '../../../components/Header';
import ProductDetail from '../../../components/ProductDetail';
import { FloatingWhatsApp } from '../../../components/Sections';
import Footer from '../../../components/Footer';

const find = (slug) => products.find((x) => x.slug === slug);

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = find(slug);
  if (!p) return {};
  const title = `${p.name} | ${config.name}`;
  const desc = `${p.name}${p.colors ? ' (' + p.colors + ')' : ''} en ${config.name}. ${
    p.price > 0 ? 'Bs ' + fmt(p.price) + '. ' : ''
  }Pídela por WhatsApp.`;
  const img = p.og || '/og.png';
  return {
    title,
    description: desc,
    alternates: { canonical: `/producto/${p.slug}` },
    openGraph: { title, description: desc, url: `/producto/${p.slug}`, images: [{ url: img }] },
    twitter: { card: 'summary_large_image', images: [img] },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const p = find(slug);
  if (!p) notFound();
  return (
    <main>
      <Header />
      <ProductDetail p={p} />
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
