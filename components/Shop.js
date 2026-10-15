'use client';
import Link from 'next/link';
import Hero from './Hero';
import Showcase from './Showcase';
import TrustBar from './TrustBar';
import Featured from './Featured';
import HomeCategories from './HomeCategories';

export default function Shop() {
  const goCatalog = () => {
    window.location.assign('/catalogo');
  };

  return (
    <>
      <Hero onExplore={goCatalog} />
      <Showcase />
      <TrustBar />
      <HomeCategories />
      <Featured />

      <div className="mx-auto max-w-7xl px-4 pb-12 text-center">
        <Link
          href="/catalogo"
          className="inline-flex items-center justify-center rounded-xl bg-accent px-7 py-3 font-bold text-white transition hover:opacity-90"
        >
          Explorar todos los productos →
        </Link>
      </div>
    </>
  );
}
