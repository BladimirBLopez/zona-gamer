// Fotos por id de producto: pega links de Cloudinary (o cualquier URL directa).
// La 1ª es la de la tarjeta y la ficha; si pones más, forman la galería.
// Sin fotos => placeholder automático.
export const photos = {
  // 1: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1700000000/elbrus.webp'],
  // 2: ['link-foto-principal', 'link-poster', 'link-detalle'],
};

const opt = (url, w) =>
  url.includes('/upload/') && !url.includes('f_auto')
    ? url.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`)
    : url;

const placeholder = (name, brand) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c1917"/><stop offset="1" stop-color="#881337"/></linearGradient></defs><rect width="800" height="800" fill="url(#g)"/><text x="400" y="380" font-size="220" text-anchor="middle">🪑</text><text x="400" y="520" font-family="Arial,sans-serif" font-size="44" font-weight="700" fill="#fb7185" text-anchor="middle" letter-spacing="6">${String(brand).toUpperCase()}</text><text x="400" y="580" font-family="Arial,sans-serif" font-size="34" fill="#e5e7eb" text-anchor="middle">${name}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const imageFor = (id, name, brand) => {
  const list = photos[id];
  return list && list.length ? opt(list[0], 1000) : placeholder(name, brand);
};

export const galleryFor = (id) => {
  const list = photos[id];
  return list && list.length > 1 ? list.map((u) => opt(u, 1200)) : undefined;
};
