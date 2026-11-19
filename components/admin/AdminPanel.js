'use client';
import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, Package, AlertTriangle, Ban, RotateCcw } from 'lucide-react';
import { products as initial, categories } from '../../data/products';
import { fmt, stockInfo } from '../../lib/utils';

const KEY = 'zg-admin-demo';
const cats = categories.filter((c) => !['Todos', 'Cougar', 'Sharkoon'].includes(c));
const empty = { name: '', brand: '', category: cats[0] || '', price: 0, stock: 0, colors: '', description: '', features: '', image: '' };
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export default function Admin() {
  const [items, setItems] = useState(initial);
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Todas');
  const [form, setForm] = useState(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s) setItems(JSON.parse(s));
    } catch (e) {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch (e) {}
  }, [items, ready]);

  const list = useMemo(
    () =>
      items.filter(
        (p) =>
          (cat === 'Todas' || p.category === cat) &&
          (p.name + ' ' + p.brand).toLowerCase().includes(q.toLowerCase())
      ),
    [items, q, cat]
  );

  const stats = {
    total: items.length,
    low: items.filter((p) => p.stock > 0 && p.stock <= 3).length,
    out: items.filter((p) => p.stock <= 0).length,
  };

  const openNew = () => setForm({ ...empty });
  const openEdit = (p) =>
    setForm({
      ...p,
      colors: Array.isArray(p.colors) ? p.colors.join(', ') : p.colors || '',
      features: (p.features || []).join('\n'),
    });

  const save = () => {
    if (!form.name.trim()) return alert('Falta el nombre');
    const data = {
      ...form,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      features: form.features.split('\n').map((s) => s.trim()).filter(Boolean),
      slug: slugify(form.name),
    };
    if (form.id) {
      setItems((a) => a.map((p) => (p.id === form.id ? { ...p, ...data } : p)));
    } else {
      const id = Math.max(0, ...items.map((p) => p.id)) + 1;
      setItems((a) => [{ ...data, id, oldPrice: 0, badge: '' }, ...a]);
    }
    setForm(null);
  };

  const remove = (p) => {
    if (confirm(`¿Borrar "${p.name}"?`)) setItems((a) => a.filter((x) => x.id !== p.id));
  };

  const setStock = (id, d) =>
    setItems((a) => a.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + d) } : p)));

  const reset = () => {
    if (confirm('¿Volver a los datos originales?')) {
      setItems(initial);
      try {
        localStorage.removeItem(KEY);
      } catch (e) {}
    }
  };

  const input = 'w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-accent';
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <main className="min-h-screen bg-bg text-gray-100 pb-24">
      <header className="sticky top-0 z-20 bg-bg/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold">Panel <span className="text-neon">Zona Gamer</span></h1>
          <p className="text-[11px] text-gray-400">Borrador de propuesta · datos de prueba</p>
        </div>
        <button onClick={reset} className="p-2 rounded-lg bg-white/5 text-gray-300" title="Restablecer">
          <RotateCcw size={18} />
        </button>
      </header>

      <section className="px-4 pt-4 grid grid-cols-3 gap-2">
        {[
          { l: 'Productos', v: stats.total, i: Package, c: 'text-neon' },
          { l: 'Pocas unid.', v: stats.low, i: AlertTriangle, c: 'text-amber-300' },
          { l: 'Agotados', v: stats.out, i: Ban, c: 'text-red-300' },
        ].map((s) => (
          <div key={s.l} className="rounded-xl bg-card border border-white/10 p-3">
            <s.i size={16} className={s.c} />
            <p className="text-xl font-bold mt-1">{s.v}</p>
            <p className="text-[11px] text-gray-400">{s.l}</p>
          </div>
        ))}
      </section>

      <section className="px-4 pt-4 space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar producto o marca" className={input + ' pl-9'} />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {['Todas', ...cats].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs border ${
                cat === c ? 'bg-accent border-accent text-white' : 'border-white/10 text-gray-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 pt-3 space-y-2">
        {list.map((p) => {
          const s = stockInfo(p.stock);
          return (
            <div key={p.id} className="rounded-xl bg-card border border-white/10 p-3 flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="w-16 h-16 rounded-lg object-contain bg-black/40 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{p.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{p.brand} · {p.category}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-neon">{p.price > 0 ? `Bs ${fmt(p.price)}` : 'Consultar'}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-xs">
                    <button onClick={() => setStock(p.id, -1)} className="w-6 h-6 rounded bg-white/10">−</button>
                    <span className="w-8 text-center">{p.stock}</span>
                    <button onClick={() => setStock(p.id, 1)} className="w-6 h-6 rounded bg-white/10">+</button>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg bg-white/10"><Pencil size={14} /></button>
                    <button onClick={() => remove(p)} className="p-2 rounded-lg bg-red-500/20 text-red-300"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <p className="text-center text-sm text-gray-500 py-10">Sin resultados</p>}
      </section>

      <button onClick={openNew} className="fixed bottom-5 right-5 z-20 flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold shadow-lg">
        <Plus size={18} /> Nuevo
      </button>

      {form && (
        <div className="fixed inset-0 z-30 bg-black/70 flex items-end sm:items-center justify-center">
          <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card border border-white/10 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold">{form.id ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button onClick={() => setForm(null)} className="p-1"><X size={20} /></button>
            </div>
            <input className={input} placeholder="Nombre" value={form.name} onChange={set('name')} />
            <div className="grid grid-cols-2 gap-2">
              <input className={input} placeholder="Marca" value={form.brand} onChange={set('brand')} />
              <select className={input} value={form.category} onChange={set('category')}>
                {cats.map((c) => <option key={c} value={c} className="bg-card">{c}</option>)}
              </select>
              <input className={input} type="number" placeholder="Precio Bs" value={form.price} onChange={set('price')} />
              <input className={input} type="number" placeholder="Stock" value={form.stock} onChange={set('stock')} />
            </div>
            <input className={input} placeholder="Colores (separados por coma)" value={form.colors} onChange={set('colors')} />
            <input className={input} placeholder="URL de la foto (Cloudinary)" value={form.image} onChange={set('image')} />
            <textarea className={input} rows={3} placeholder="Descripción" value={form.description} onChange={set('description')} />
            <textarea className={input} rows={4} placeholder="Características (una por línea)" value={form.features} onChange={set('features')} />
            <button onClick={save} className="w-full rounded-lg bg-accent py-3 font-semibold text-sm">Guardar</button>
          </div>
        </div>
      )}
    </main>
  );
}
