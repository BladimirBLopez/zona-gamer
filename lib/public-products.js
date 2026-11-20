import { cache } from 'react';
import { getSql } from './db';
import { products as fallbackProducts } from '../data/products';

const optimize = (url, width) => {
  if (!url) return '';

  return url.includes('/upload/') && !url.includes('f_auto')
    ? url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`)
    : url;
};

// Esta función se utiliza únicamente desde el servidor.
// Solo consulta productos activos; no modifica Neon.
export const getPublicProducts = cache(async () => {
  try {
    const sql = getSql();

    const rows = await sql`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.brand,
        p.category,
        p.price,
        p.old_price,
        p.stock,
        p.colors,
        p.description,
        p.features,
        p.specs,
        p.tag_colors,
        p.material,
        p.badge,
        p.emoji,
        p.from_price,
        p.cards,
        p.og_image,
        p.extras,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'url', i.image_url,
                'position', i.position
              )
              ORDER BY i.position
            )
            FROM product_images i
            WHERE i.product_id = p.id
          ),
          '[]'::json
        ) AS images
      FROM products p
      WHERE p.active = TRUE
      ORDER BY p.sort_order, p.id
    `;

    return rows.map((p) => {
      const images = p.images.map((i) => i.url);

      return {
        ...p.extras,
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brand,
        category: p.category,
        price: Number(p.price),
        oldPrice: Number(p.old_price),
        stock: p.stock,
        colors: p.colors,
        description: p.description,
        features: p.features,
        specs: p.specs,
        tagColors: p.tag_colors,
        material: p.material,
        badge: p.badge,
        emoji: p.emoji,
        from: p.from_price,
        cards: p.cards,
        og: p.og_image,
        image: optimize(images[0], 1000),
        gallery: images.length > 1
          ? images.map((url) => optimize(url, 1200))
          : undefined,
      };
    });
  } catch (error) {
    console.error('Error consultando Neon; usando respaldo:', error?.code || error?.name);
    return fallbackProducts;
  }
});
