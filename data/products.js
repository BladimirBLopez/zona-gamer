import { imageFor, galleryFor } from './temp-images';


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
  emoji: { 'Sillones gamer': '🛋️', 'Mousepads': '🖱️', 'Cámaras': '📷' }[category] || '🪑',
  image: imageFor(id, name, brand),
  gallery: galleryFor(id),
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
  item(20, 'Imou Ranger 2 4MP', 'Imou', 'Cámaras', 'Interior · 4MP', 750, 5,
    ['Giro 360° e inclinación 90°', 'Seguimiento inteligente de movimiento', 'Audio bidireccional', 'Modo privacidad', 'Detección humana, de movimiento y de sonido', 'Zoom digital 16x'],
    '', '', '',
    { cards: [['Resolución', '4MP · QHD'], ['Visión', 'Nocturna'], ['Uso', 'Interior'], ['Grabación', 'MicroSD / NVR']] }),
  item(21, 'Imou Cruiser 2 5MP', 'Imou', 'Cámaras', 'Exterior · 5MP', 1150, 5,
    ['Pan & Tilt con cobertura 360°', 'Visión nocturna a color inteligente', 'Detección humana y de vehículos', 'Seguimiento inteligente', 'Sirena de 110 dB', 'Audio bidireccional'],
    '', '', '',
    { cards: [['Resolución', '5MP · 3K'], ['Visión', 'Color inteligente'], ['Uso', 'Exterior · IP66'], ['Grabación', 'Nube / SD / NVR']] }),
  item(22, 'Imou Cruiser 2 3MP', 'Imou', 'Cámaras', 'Exterior · 3MP', 980, 5,
    ['Pan & Tilt con cobertura 360°', 'Visión nocturna a color inteligente', 'Detección humana y de vehículos', 'Seguimiento inteligente', 'Sirena de 110 dB', 'Audio bidireccional'],
    '', '', '',
    { cards: [['Resolución', '3MP · 2K'], ['Visión', 'Color inteligente'], ['Uso', 'Exterior · IP66'], ['Grabación', 'Nube / SD / NVR']] }),
  item(23, 'Imou Bullet 3 5MP', 'Imou', 'Cámaras', 'Exterior · 5MP', 980, 5,
    ['Visión nocturna a color inteligente', 'Detección humana y de vehículos', 'Luz de foco activada por movimiento', 'Wi-Fi o conexión por cable', 'Audio bidireccional', 'Resistente al clima IP67'],
    '', '', '',
    { cards: [['Resolución', '5MP · 3K'], ['Visión', 'Color inteligente'], ['Uso', 'Exterior · IP67'], ['Grabación', 'Nube / SD / NVR']] }),
  item(24, 'Imou Bullet 3 3MP', 'Imou', 'Cámaras', 'Exterior · 3MP', 715, 5,
    ['Visión nocturna a color inteligente', 'Detección humana y de vehículos', 'Luz de foco activada por movimiento', 'Wi-Fi o conexión por cable', 'Audio bidireccional', 'Resistente al clima IP67'],
    '', '', '',
    { cards: [['Resolución', '3MP · 2K'], ['Visión', 'Color inteligente'], ['Uso', 'Exterior · IP67'], ['Grabación', 'Nube / SD / NVR']] }),
  item(25, 'Imou Cruiser Dual 2', 'Imou', 'Cámaras', 'Exterior · Doble lente', 0, 5,
    ['Doble lente: 3MP + 5MP', 'Detección inteligente Algo Play', 'Luces de advertencia roja y azul', 'Luz de foco activada por movimiento', 'Pan & Tilt con cobertura 360°', 'Audio bidireccional'],
    '', '', '',
    { cards: [['Lentes', 'Doble · 3MP + 5MP'], ['Visión', 'Color inteligente'], ['Uso', 'Exterior · IP66'], ['Grabación', 'Nube / MicroSD']] }),
  item(26, 'Imou Cell PT 3MP Solar', 'Imou', 'Cámaras', 'Exterior · Solar', 0, 5,
    ['Panel solar incluido para carga continua', 'Batería recargable por Type-C', '100% sin cables, Wi-Fi 2.4 GHz', 'Pan & Tilt con seguimiento inteligente', 'Detección de movimiento PIR y humana', 'Sirena y luz de foco'],
    '', '', '',
    { cards: [['Resolución', '3MP · 2K'], ['Visión', 'Color inteligente'], ['Uso', 'Exterior · IP66'], ['Grabación', 'Nube / MicroSD']] }),
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

const descriptions = {
  1: 'Silla de tela transpirable con reposabrazos acolchados abatibles y mecanismo basculante regulable de 3° a 18°. Se ofrece en versiones verde, negra y azul. Soporta hasta 120 kg.',
  2: 'Silla en cuero PVC transpirable con cojines cervical y lumbar, reclinación continua hasta 180° y altura regulable por pistón. Soporta hasta 120 kg.',
  3: 'Silla de tela suave y transpirable con cojines cervical y lumbar, reposabrazos ajustables 3D y mecanismo basculante de 3° a 18°. Reclina de 90° a 160° y soporta hasta 110 kg.',
  4: 'Silla en PVC premium transpirable con cojines cervical y lumbar, reposabrazos regulables 2D y tensión de inclinación ajustable. Reclina hasta 160° y soporta hasta 120 kg. Precio desde; consulta por la variante.',
  5: 'Armor Elite en negro total: PVC premium transpirable de acabado sobrio, cojines cervical y lumbar y tensión de inclinación ajustable. Reclina hasta 160° y soporta hasta 120 kg.',
  6: 'Armor Elite en negro y naranja: PVC premium transpirable, cojines cervical y lumbar, reposabrazos regulables 2D y tensión de inclinación ajustable. Reclina hasta 160°.',
  7: 'Armor Elite EVA con acabado negro y rosa en PVC premium transpirable. Incluye cojines cervical y lumbar, tensión de inclinación ajustable y reclina hasta 160°.',
  8: 'Silla con tapizado de tela tejida, cojines cervical y lumbar, reposabrazos 4D plegables y bolsillo posterior integrado. Reclina de 90° a 155° y soporta hasta 120 kg.',
  9: 'Silla en PVC premium transpirable con reposapiés retráctil, cojines cervical y lumbar y asiento amplio de alta densidad. Reclina de 90° a 155° y soporta hasta 120 kg.',
  10: 'Versión negra y dorada de la Explore Neo: PVC premium transpirable, reposapiés retráctil, cojines cervical y lumbar y asiento amplio de alta densidad. Reclina de 90° a 155°.',
  11: 'Silla en PVC transpirable premium con reposabrazos 3D Hyperrotation, cojines cervical y lumbar y un asiento de soporte más amplio. Reclina de 90° a 155° y soporta hasta 120 kg.',
  12: 'Silla con tapizado de tela gris transpirable, reposabrazos 3D Hyperrotation, cojines cervical y lumbar y asiento de soporte más amplio. Reclina de 90° a 155°. Hoy agotada.',
  13: 'Silla en cuero PVC transpirable en negro y verde, con cojines cervical y lumbar, reclinación continua hasta 180° y altura regulable por pistón. Soporta hasta 120 kg.',
  14: 'Sillón tipo butaca en tejido transpirable con cojines cervical y lumbar, reposapiés plegable integrado y tres posiciones de reclinación (95° a 160°). Soporta hasta 150 kg.',
  15: 'Silla en PVC con espuma moldeada, reposabrazos ajustables 4D, mecanismo basculante multifunción y base de aluminio de cinco radios. Reclina de 90° a 160° y soporta hasta 150 kg.',
  16: 'Sillón en PVC extra grueso transpirable con mesa giratoria desmontable, puerto de carga USB Type-C y bolsillos laterales integrados. Reclina de 115° a 157° y soporta hasta 160 kg.',
  17: 'Sillón en cuero sintético PVC con balanceo, reclinación y giro, soporte ergonómico por zonas y espuma de alta densidad. Reclina de 95° a 160° y soporta hasta 150 kg.',
  18: 'Silla en terciopelo premium con soporte lumbar LiftBack, almohada cervical magnética y espuma de memoria. Reposabrazos 4D, reclina de 90° a 155° y soporta hasta 160 kg.',
  19: 'Silla en cuero PVC premium transpirable con cojín cervical ajustable con correa, soporte lumbar ergonómico y reposabrazos 4D. Reclina hasta 170° con bloqueo y soporta hasta 160 kg. Consulta el precio por WhatsApp.',
  20: 'Cámara Wi-Fi para interior con imagen 4MP QHD, visión nocturna y giro de 360° con inclinación de 90°. Sigue el movimiento, detecta personas y sonidos, y tiene audio bidireccional y modo privacidad. Graba en MicroSD o NVR.',
  21: 'Cámara Wi-Fi para exterior 5MP (3K) con Pan & Tilt de 360°, visión nocturna a color y resistencia IP66. Detecta personas y vehículos, sigue el movimiento y tiene sirena de 110 dB y audio bidireccional. Graba en nube, MicroSD o NVR.',
  22: 'Cámara Wi-Fi para exterior 3MP (2K) con Pan & Tilt de 360°, visión nocturna a color y resistencia IP66. Detecta personas y vehículos, sigue el movimiento y tiene sirena de 110 dB y audio bidireccional. Graba en nube, MicroSD o NVR.',
  23: 'Cámara tipo bullet para exterior 5MP (3K) con visión nocturna a color, luz de foco activada por movimiento y resistencia IP67. Detecta personas y vehículos, tiene audio bidireccional y se conecta por Wi-Fi o cable. Graba en nube, MicroSD o NVR.',
  24: 'Cámara tipo bullet para exterior 3MP (2K) con visión nocturna a color, luz de foco activada por movimiento y resistencia IP67. Detecta personas y vehículos, tiene audio bidireccional y se conecta por Wi-Fi o cable. Graba en nube, MicroSD o NVR.',
  25: 'Cámara de exterior con doble lente (3MP + 5MP), Pan & Tilt de 360° y visión nocturna a color. Incluye luces de advertencia roja y azul, luz de foco activada por movimiento, audio bidireccional y resistencia IP66. Se conecta por Wi-Fi o cable y graba en nube o MicroSD. Consulta el precio por WhatsApp.',
  26: 'Cámara de exterior 3MP (2K) sin cables, con batería recargable por Type-C y panel solar incluido para carga continua. Tiene Pan & Tilt, seguimiento inteligente, detección PIR y humana, sirena con luz de foco y audio bidireccional. Wi-Fi 2.4 GHz, resistencia IP66; graba en nube o MicroSD. Consulta el precio por WhatsApp.',
};

export const colorOptions = ['Naranja', 'Rosa', 'Dorado', 'Verde', 'Azul', 'Rojo', 'Gris', 'Negro'];
export const materialOptions = ['Cuero PVC', 'Tela', 'Terciopelo'];

export const products = raw.map((p) => {
  const t = tags[p.id] || {};
  const base = dup[p.slug] > 1 ? { ...p, slug: `${p.slug}-${p.id}` } : p;
  return { ...base, description: descriptions[p.id] || base.description, tagColors: t.colors || [], material: t.material || '' };
});

const catOrder = ['Sillas gamer', 'Sillones gamer', 'Mousepads', 'Cámaras'];
const brandList = [...new Set(['Cougar', 'Sharkoon', ...products.map((p) => p.brand)])];
export const categories = [
  'Todos',
  ...catOrder.filter((c) => products.some((p) => p.category === c)),
  ...[...new Set(products.map((p) => p.category))].filter((c) => !catOrder.includes(c)),
  ...brandList,
];
