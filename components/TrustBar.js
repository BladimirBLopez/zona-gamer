import { ShieldCheck, Tag, PackageCheck, MessageCircle } from 'lucide-react';
import Reveal from './Reveal';

const items = [
  { Icon: ShieldCheck, t: 'Productos originales', d: 'Cougar y Sharkoon' },
  { Icon: Tag, t: 'Precio claro', d: 'Todo en bolivianos' },
  { Icon: PackageCheck, t: 'Stock visible', d: 'Disponible o agotado' },
  { Icon: MessageCircle, t: 'Ayuda real', d: 'Atención por WhatsApp' },
];

export default function TrustBar() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map(({ Icon, t, d }, i) => (
          <Reveal key={t} delay={i * 0.06} className="h-full">
            <div className="glass flex h-full items-center gap-3 rounded-2xl p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Icon size={20} />
              </span>
              <span>
                <span className="block text-sm font-semibold leading-tight">{t}</span>
                <span className="mt-0.5 block text-xs text-gray-500">{d}</span>
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
