import { tempImages, USE_PLACEHOLDERS, placeholder } from './temp-images';

export const categories = ['Todos', 'Sillas gamer', 'Sillones gamer', 'Cougar', 'Sharkoon'];

const item = (id, name, brand, category, colors, price, stock, features, soporta, reclina, brazos, extra = {}) => ({
  id,
  name,
  brand,
  category,
  colors,
  price,
  oldPrice: 0,
  slug: slugify(name),
  stock,
  emoji: category === 'Sillones gamer' ? '🛋️' : '🪑',
  image: tempImages[id] || (USE_PLACEHOLDERS ? placeholder(name, brand) : `/sillas/${String(id).padStart(2, '0')}.webp`),
  badge: '',
  description: '',
  features,
  specs: { soporta, reclina, brazos },
  ...extra,
});

const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const CLD = 'https://res.cloudinary.com/dkq95jus0/image/upload';
const TITAN = 'v1791961738/IMG-20261014-WA0000_msslce.jpg';
const CROP = 'c_crop,x_0.35,y_0.02,w_0.58,h_0.76';

const S = 'Sillas gamer';
const L = 'Sillones gamer';

const raw = [
  item(1, 'Sharkoon Elbrus 1', 'Sharkoon', S, 'Negro · Verde / Negro / Azul', 1800, 5,
    ['Tela transpirable', 'Reposabrazos acolchados abatibles', 'Mecanismo basculante regulable', 'Pistón de gas clase 4'],
    '120 kg', '3°–18°', 'Abatibles'),
  item(2, 'Cougar Armor One', 'Cougar', S, 'Negro · Naranja', 2250, 5,
    ['Cuero PVC transpirable', 'Cojines cervical y lumbar', 'Reclinación continua', 'Altura regulable por pistón'],
    '120 kg', 'Hasta 180°', '2D'),
  item(3, 'Sharkoon Skiller SGS2', 'Sharkoon', S, 'Negro · Rojo', 2350, 0,
    ['Tela suave y transpirable', 'Cojines cervical y lumbar', 'Reposabrazos ajustables 3D', 'Mecanismo basculante 3°–18°'],
    '110 kg', '90°–160°', '3D'),
  item(4, 'Cougar Armor Elite', 'Cougar', S, 'Consultar variantes', 2450, 5,
    ['PVC premium transpirable', 'Cojines cervical y lumbar', 'Reposabrazos regulables 2D', 'Tensión de inclinación ajustable'],
    '120 kg', 'Hasta 160°', '2D', { from: true }),
  item(5, 'Cougar Armor Elite Black', 'Cougar', S, 'Negro total', 2480, 5,
    ['PVC premium transpirable', 'Acabado negro sobrio', 'Cojines cervical y lumbar', 'Tensión de inclinación ajustable'],
    '120 kg', 'Hasta 160°', '2D'),
  item(6, 'Cougar Armor Elite', 'Cougar', S, 'Negro · Naranja', 2550, 5,
    ['PVC premium transpirable', 'Cojines cervical y lumbar', 'Reposabrazos regulables 2D', 'Tensión de inclinación ajustable'],
    '120 kg', 'Hasta 160°', '2D'),
  item(7, 'Cougar Armor Elite EVA', 'Cougar', S, 'Negro · Rosa', 2570, 5,
    ['PVC premium transpirable', 'Acabado EVA negro y rosa', 'Cojines cervical y lumbar', 'Tensión de inclinación ajustable'],
    '120 kg', 'Hasta 160°', '2D'),
  item(8, 'Cougar Armor One V2 F', 'Cougar', S, 'Tela · Negro / Naranja', 2630, 5,
    ['Tapizado de tela tejida', 'Cojines cervical y lumbar', 'Reposabrazos 4D plegables', 'Bolsillo posterior integrado'],
    '120 kg', '90°–155°', '4D plegables'),
  item(9, 'Cougar Explore Neo', 'Cougar', S, 'Negro · Naranja', 2780, 5,
    ['PVC premium transpirable', 'Cojines cervical y lumbar', 'Reposapiés retráctil', 'Asiento amplio de alta densidad'],
    '120 kg', '90°–155°', 'Altura'),
  item(10, 'Cougar Explore Neo Gold', 'Cougar', S, 'Negro · Dorado', 2780, 5,
    ['PVC premium transpirable', 'Cojines cervical y lumbar', 'Reposapiés retráctil', 'Asiento amplio de alta densidad'],
    '120 kg', '90°–155°', 'Altura'),
  item(11, 'Cougar Explore Royal', 'Cougar', S, 'Negro · Dorado', 2850, 5,
    ['PVC transpirable premium', 'Cojines cervical y lumbar', 'Reposabrazos 3D Hyperrotation', 'Asiento de soporte más amplio'],
    '120 kg', '90°–155°', '3D'),
  item(12, 'Cougar Explore Royal F Gray', 'Cougar', S, 'Tela gris', 2850, 0,
    ['Imitación lino transpirable', 'Cojines cervical y lumbar', 'Reposabrazos 3D Hyperrotation', 'Asiento de soporte más amplio'],
    '120 kg', '90°–155°', '3D'),
  item(13, 'Cougar Armor One X', 'Cougar', S, 'Negro · Verde', 3040, 5,
    ['Cuero PVC transpirable', 'Cojines cervical y lumbar', 'Reclinación continua', 'Altura regulable por pistón'],
    '120 kg', 'Hasta 180°', '2D'),
  item(14, 'Cougar Ranger One', 'Cougar', L, 'Negro · Naranja', 3250, 5,
    ['Butaca de tejido transpirable', 'Cojines cervical y lumbar', 'Reposapiés plegable integrado', 'Tres posiciones de reclinación'],
    '150 kg', '95°–160°', 'Fijos'),
  item(15, 'Sharkoon Skiller SGS4', 'Sharkoon', S, 'Negro · Gris', 4500, 5,
    ['PVC con espuma moldeada', 'Reposabrazos ajustables 4D', 'Mecanismo basculante multifunción', 'Base de aluminio de cinco radios'],
    '150 kg', '90°–160°', '4D', { badge: 'Oferta' }),
  item(16, 'Cougar Ranger Pro Royal', 'Cougar', L, 'Negro · Dorado', 4200, 5,
    ['PVC extra grueso transpirable', 'Mesa giratoria desmontable', 'Puerto de carga USB Type-C', 'Bolsillos laterales integrados'],
    '160 kg', '115°–157°', 'Fijos'),
  item(17, 'Cougar Overlord', 'Cougar', L, 'Negro · Naranja', 4300, 5,
    ['Cuero sintético PVC', 'Balanceo, reclinación y giro', 'Soporte ergonómico por zonas', 'Espuma de alta densidad'],
    '150 kg', '95°–160°', 'Trimotion'),
  item(19, 'Cougar Armor Titan', 'Cougar', S, 'Negro · Naranja', 0, 5,
    ['Cuero PVC premium transpirable y resistente', 'Cojín cervical ajustable con correa', 'Soporte lumbar ergonómico', 'Tapizado premium de alta durabilidad'],
    '160 kg', 'Hasta 170° con bloqueo', '4D',
    {
      image: `${CLD}/${CROP}/f_auto,q_auto,w_700/${TITAN}`,
      gallery: [`${CLD}/f_auto,q_auto,w_1400/${TITAN}`, `${CLD}/${CROP}/f_auto,q_auto,w_900/${TITAN}`],
      og: `${CLD}/f_jpg,q_auto,w_1200/${TITAN}`,
    }),
  item(18, 'Cougar Titan Pro V2 Gold F', 'Cougar', S, 'Terciopelo · Negro / Dorado', 5016, 5,
    ['Terciopelo premium', 'Soporte lumbar LiftBack', 'Almohada cervical magnética', 'Espuma de memoria'],
    '160 kg', '90°–155°', '4D'),
];

const dup = {};
raw.forEach((p) => {
  dup[p.slug] = (dup[p.slug] || 0) + 1;
});
const tags = {
  1: { colors: ['Negro', 'Verde', 'Azul'], material: 'Tela' },
  2: { colors: ['Negro', 'Naranja'], material: 'Cuero PVC' },
  3: { colors: ['Negro', 'Rojo'], material: 'Tela' },
  4: { colors: [], material: 'Cuero PVC' },
  5: { colors: ['Negro'], material: 'Cuero PVC' },
  6: { colors: ['Negro', 'Naranja'], material: 'Cuero PVC' },
  7: { colors: ['Negro', 'Rosa'], material: 'Cuero PVC' },
  8: { colors: ['Negro', 'Naranja'], material: 'Tela' },
  9: { colors: ['Negro', 'Naranja'], material: 'Cuero PVC' },
  10: { colors: ['Negro', 'Dorado'], material: 'Cuero PVC' },
  11: { colors: ['Negro', 'Dorado'], material: 'Cuero PVC' },
  12: { colors: ['Gris'], material: 'Tela' },
  13: { colors: ['Negro', 'Verde'], material: 'Cuero PVC' },
  14: { colors: ['Negro', 'Naranja'], material: 'Tela' },
  15: { colors: ['Negro', 'Gris'], material: 'Cuero PVC' },
  16: { colors: ['Negro', 'Dorado'], material: 'Cuero PVC' },
  17: { colors: ['Negro', 'Naranja'], material: 'Cuero PVC' },
  18: { colors: ['Negro', 'Dorado'], material: 'Terciopelo' },
  19: { colors: ['Negro', 'Naranja'], material: 'Cuero PVC' },
};

export const colorOptions = ['Naranja', 'Rosa', 'Dorado', 'Verde', 'Azul', 'Rojo', 'Gris', 'Negro'];
export const materialOptions = ['Cuero PVC', 'Tela', 'Terciopelo'];

export const products = raw.map((p) => {
  const t = tags[p.id] || {};
  const base = dup[p.slug] > 1 ? { ...p, slug: `${p.slug}-${p.id}` } : p;
  return { ...base, tagColors: t.colors || [], material: t.material || '' };
});
