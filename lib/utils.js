import { config } from '../data/config';

export const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const waLink = (text) =>
  `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(text)}`;

export const orderMsg = (p) =>
  `Hola ${config.name} 👋 Quiero pedir: ${p.name} (Bs ${fmt(p.price)}). ¿Está disponible?`;

export function stockInfo(stock) {
  if (stock <= 0) return { label: 'Agotado', cls: 'bg-red-500/20 text-red-300' };
  if (stock <= 3) return { label: 'Últimas unidades', cls: 'bg-amber-500/20 text-amber-300' };
  return { label: 'Disponible', cls: 'bg-emerald-500/20 text-emerald-300' };
}
