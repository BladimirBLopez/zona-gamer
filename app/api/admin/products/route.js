import { NextResponse } from 'next/server';
import { getSql } from '../../../../lib/db';
import { hasAdminSession } from '../../../../lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function optimize(url, width) {
  if (!url) return '';

  return url.includes('/upload/') && !url.includes('f_auto')
    ? url.replace(
        '/upload/',
        `/upload/f_auto,q_auto,w_${width}/`
      )
    : url;
}

export async function GET() {
  try {
    if (!(await hasAdminSession())) {
      return NextResponse.json(
        { ok: false, error: 'No autorizado' },
        {
          status: 401,
          headers: { 'Cache-Control': 'no-store' }
        }
      );
    }

    const sql = getSql();

    const rows = await sql`
      SELECT
        p.*,
        COALESCE(
          (
            SELECT json_agg(
              i.image_url ORDER BY COALESCE(i.is_primary, FALSE) DESC, i.position ASC
            )
            FROM product_images i
            WHERE i.product_id = p.id AND COALESCE(i.active, TRUE)
          ),
          '[]'::json
        ) AS image_urls,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object('id', i.id, 'url', i.image_url)
              ORDER BY COALESCE(i.is_primary, FALSE) DESC, i.position ASC, i.id ASC
            )
            FROM product_images i
            WHERE i.product_id = p.id AND COALESCE(i.active, TRUE)
          ),
          '[]'::json
        ) AS photo_rows
      FROM products p
      ORDER BY p.sort_order, p.id
    `;

    const products = rows.map((p) => {
      const images = p.image_urls || [];

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
        active: p.active,
        sortOrder: p.sort_order,
        image: optimize(images[0], 1000),
        photos: (p.photo_rows || []).map((row) => ({
          id: row.id,
          url: row.url,
          thumb: optimize(row.url, 500)
        })),
        gallery: images.length > 1
          ? images.map((url) => optimize(url, 1200))
          : undefined
      };
    });

    return NextResponse.json(
      {
        ok: true,
        total: products.length,
        products
      },
      {
        headers: { 'Cache-Control': 'no-store' }
      }
    );
  } catch (error) {
    console.error(
      'Error productos admin:',
      error?.code || error?.name
    );

    return NextResponse.json(
      {
        ok: false,
        error: 'No se pudieron cargar los productos'
      },
      { status: 500 }
    );
  }
}
