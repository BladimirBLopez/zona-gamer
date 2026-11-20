import Header from '../components/Header';
import Shop from '../components/Shop';
import BottomNav from '../components/BottomNav';
import { HowTo, Community, Faq, Support, FloatingWhatsApp } from '../components/Sections';
import Footer from '../components/Footer';
import { getPublicProducts } from '../lib/public-products';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await getPublicProducts();
  return (
    <main>
      <Header />
      <Shop products={products} />
      <HowTo />
      <Community />
      <Faq />
      <Support />
      <Footer />
      <FloatingWhatsApp />
      <BottomNav />
    </main>
  );
}
