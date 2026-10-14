'use client';
import { useState } from 'react';
import Hero from './Hero';
import TrustBar from './TrustBar';
import Featured from './Featured';
import Catalog from './Catalog';

export default function Shop() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Todos');

  const goCatalog = () =>
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <>
      <Hero q={q} setQ={setQ} onExplore={goCatalog} />
      <TrustBar />
      <Featured />
      <Catalog q={q} setQ={setQ} cat={cat} setCat={setCat} />
    </>
  );
}
