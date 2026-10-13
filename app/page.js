import Header from '../components/Header';
import Shop from '../components/Shop';
import BottomNav from '../components/BottomNav';
import { HowTo, Community, Faq, Support, Footer, FloatingWhatsApp } from '../components/Sections';

export default function Home() {
  return (
    <main>
      <Header />
      <Shop />
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
