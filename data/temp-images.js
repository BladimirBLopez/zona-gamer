// Ids de productos cuya foto YA está subida a Cloudinary (zona-gamer/01, 02, ...).
// Al subir una foto nueva, agrega su id aquí. Los demás muestran placeholder.
export const cloudinaryIds = [];

// Fotos externas de prueba por id (opcional).
export const tempImages = {};

const CLD = 'https://res.cloudinary.com/dkq95jus0/image/upload/f_auto,q_auto,w_1000';

const placeholder = (name, brand) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#0e7490"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/><text x="400" y="380" font-size="220" text-anchor="middle">🪑</text><text x="400" y="520" font-family="Arial,sans-serif" font-size="44" font-weight="700" fill="#22d3ee" text-anchor="middle" letter-spacing="6">${String(brand).toUpperCase()}</text><text x="400" y="580" font-family="Arial,sans-serif" font-size="34" fill="#e5e7eb" text-anchor="middle">${name}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const imageFor = (id, name, brand) => {
  if (cloudinaryIds.includes(id)) return `${CLD}/zona-gamer/${String(id).padStart(2, '0')}`;
  if (tempImages[id]) return tempImages[id];
  return placeholder(name, brand);
};
