import { NextResponse } from 'next/server';
import { getSql } from '../../../lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const optimize = (url, width) => {
  if (!url) return '';

  return url.includes('/upload/') && !url.includes('f_auto')
    ? url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`)
    : url;
};

export async function GET() {
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

    const products = rows.map((p) => {
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

    return NextResponse.json(
      { ok: true, total: products.length, products },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error consultando Neon:', error?.code || error?.name);

    return NextResponse.json(
      { ok: false, error: 'No se pudo consultar el catálogo' },
      { status: 500 }
    );
  }
}
