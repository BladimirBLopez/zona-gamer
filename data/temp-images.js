// Fotos por id de producto: pega links de Cloudinary (o cualquier URL directa).
// La 1ª es la de la tarjeta y la ficha; si pones más, forman la galería.
// Sin fotos => placeholder automático.
export const photos = {
  1: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1791969718/01-1_u9i7bi.png', 'https://res.cloudinary.com/dkq95jus0/image/upload/v1791969718/01-2_fzabz9.png', 'https://res.cloudinary.com/dkq95jus0/image/upload/v1791969719/01-3_ockrgh.png'],
  2: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1791969869/02-1_w1tn7b.png'],
  4: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1791969944/04-1_a3zujs.png'],
  5: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1791970175/05-1_t6dicv.png'],
  6: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1791995942/06-1_bdceei.png'],
  7: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1791995996/07-1_wg25c4.png'],
  8: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1791996058/08-1_v7ratt.png'],
  9: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1791996105/09-1_el8nyd.png'],
  10: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1791996152/10-1_bu2emx.png'],
  11: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1791996272/11-1_huchzd.png'],
  13: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1791996333/13-1_vzvvhz.png'],
  14: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1791996388/14-1_xxhlcu.png'],
  16: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1791996769/16-1_yjty9x.png'],
  17: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1791996837/17-1_yg2ukq.png'],
  18: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1791996892/18-1_d2wxjv.png'],
  20: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1792018251/file_0000000019f0820ea5079459f90b3c59_bylxfr.png'],
  21: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1792018323/file_00000000e288820ebed9b6d367d5b013_qhbllv.png'],
  22: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1792018362/file_000000002c9c820e9b6dcb6cd5730ab8_srwevh.png'],
  23: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1792018431/file_000000003434820eaf6de083fd134357_cf16do.png'],
  24: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1792018470/file_00000000269c820e8c4d6f20e7f8b108_unxtob.png'],
  25: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1792018504/file_000000001920820e96b840969bd069bd_uedjvp.png'],
  26: ['https://res.cloudinary.com/dkq95jus0/image/upload/v1792018564/file_000000004b7c820e9fb15221c5e9ab5a_lrx9ge.png'],
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
