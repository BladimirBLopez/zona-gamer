// Fotos de prueba. Pega aquí URLs por id de producto (directas a la imagen).
// Cuando todo esté en Cloudinary: USE_PLACEHOLDERS = false y URLs finales.
export const USE_PLACEHOLDERS = true;

export const tempImages = {
  // 1: 'https://res.cloudinary.com/dkq95jus0/image/upload/f_auto,q_auto,w_1000/zona-gamer/01.webp',
};

export const placeholder = (name, brand) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#0e7490"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/><text x="400" y="380" font-size="220" text-anchor="middle">🪑</text><text x="400" y="520" font-family="Arial,sans-serif" font-size="44" font-weight="700" fill="#22d3ee" text-anchor="middle" letter-spacing="6">${String(brand).toUpperCase()}</text><text x="400" y="580" font-family="Arial,sans-serif" font-size="34" fill="#e5e7eb" text-anchor="middle">${name}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
