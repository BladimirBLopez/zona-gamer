'use client';
import { useState } from 'react';
import Hero from './Hero';
import Showcase from './Showcase';
import Categories from './Categories';
import Catalog from './Catalog';

export default function Shop() {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Todos');

  const goCatalog = () =>
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <>
      <Hero q={q} setQ={setQ} onExplore={goCatalog} />
      <Showcase />
      <Categories
        cat={cat}
        onPick={(c) => {
          setCat(c);
          goCatalog();
        }}
      />
      <Catalog q={q} setQ={setQ} cat={cat} setCat={setCat} />
    </>
  );
}
