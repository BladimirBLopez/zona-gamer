import { config } from '../data/config';

// Cuando tengas el logo: ponlo en public/ y escribe aquí su ruta, ej. '/logo.webp'
export const LOGO_SRC = '';

export default function Brand({ size = 'md' }) {
  if (LOGO_SRC) {
    return (
      <img
        src={LOGO_SRC}
        alt={config.name}
        className={size === 'sm' ? 'h-11 w-auto' : 'h-14 w-auto'}
      />
    );
  }
  const box = size === 'sm' ? 'h-10 w-10 text-base' : 'h-14 w-14 text-xl';
  const txt = size === 'sm' ? 'text-lg' : 'text-2xl';
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`flex ${box} items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-accent/40 to-neon/20 font-display font-extrabold`}
      >
        ZG
      </span>
      <span className={`font-display ${txt} font-bold tracking-tight`}>{config.name}</span>
    </span>
  );
}
