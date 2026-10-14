import { Headphones, PackageCheck, MessageCircle } from 'lucide-react';

const items = [
  { Icon: MessageCircle, text: 'Pedido directo por WhatsApp' },
  { Icon: Headphones, text: 'Asesoría antes de comprar' },
  { Icon: PackageCheck, text: 'Disponibilidad confirmada' },
];

export default function TrustBar() {
  return (
    <section className="border-y border-white/10 bg-white/[0.02]">
      <ul className="no-scrollbar mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-3 md:justify-center md:gap-10">
        {items.map(({ Icon, text }) => (
          <li key={text} className="flex shrink-0 items-center gap-2 text-xs font-medium text-gray-300 sm:text-sm">
            <Icon size={16} className="text-accent" />
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}
