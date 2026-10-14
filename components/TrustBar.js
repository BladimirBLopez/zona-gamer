import { ShieldCheck, Tag, PackageCheck, ListChecks } from 'lucide-react';

const items = [
  { Icon: ShieldCheck, t: 'Productos originales' },
  { Icon: Tag, t: 'Precios en bolivianos' },
  { Icon: PackageCheck, t: 'Stock visible' },
  { Icon: ListChecks, t: 'Ficha completa de cada silla' },
];

export default function TrustBar() {
  return (
    <section className="border-y border-white/10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-3 px-4 py-5 sm:grid-cols-4">
        {items.map(({ Icon, t }) => (
          <div key={t} className="flex items-center gap-2.5 text-sm text-gray-300">
            <Icon size={18} className="shrink-0 text-accent" />
            <span className="leading-tight">{t}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
