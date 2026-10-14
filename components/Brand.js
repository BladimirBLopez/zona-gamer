import { config } from '../data/config';

// Cuando tengas el logo: ponlo en public/ y escribe aquí su ruta, ej. '/logo.webp'
export const LOGO_SRC = '/logo.webp';

export default function Brand({ size = 'md', tagline = false }) {
  if (LOGO_SRC) {
    return <img src={LOGO_SRC} alt={config.name} width={1955} height={781} className={size === 'sm' ? 'h-11 w-auto' : 'h-14 w-auto'} />;
  }
  const box = size === 'sm' ? 'h-10 w-10 text-base' : 'h-14 w-14 text-xl';
  const txt = size === 'sm' ? 'text-base' : 'text-xl';
  return (
    <span className="inline-flex items-center gap-3">
      <span className={`flex ${box} shrink-0 items-center justify-center rounded-xl bg-accent font-display font-extrabold text-black`}>
        ZG
      </span>
      <span className="leading-none">
        <span className={`block font-display ${txt} font-bold uppercase tracking-wide`}>{config.name}</span>
        {tagline ? (
          <span className="mt-1 block text-[10px] font-medium tracking-wider text-gray-500">Tienda gamer</span>
        ) : null}
      </span>
    </span>
  );
}
