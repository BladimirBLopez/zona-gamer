import { NextResponse } from 'next/server';
import { getSql } from '../../../../../../lib/db';
import {
  hasAdminSession,
  sameOrigin
} from '../../../../../../lib/admin-auth';
import { validCloudinaryUrl } from '../../../../../../lib/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_PHOTOS = 10;

function respond(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' }
  });
}

const bad = (message = 'Datos inválidos') =>
  respond({ ok: false, error: message }, 400);

export async function POST(request, { params }) {
  try {
    if (!(await hasAdminSession())) {
      return respond({ ok: false, error: 'No autorizado' }, 401);
    }

    if (!sameOrigin(request)) {
      return respond({ ok: false, error: 'Origen no permitido' }, 403);
    }

    const { id: rawId } = await params;
    const id = Number(rawId);

    if (!/^[1-9]\d*$/.test(rawId) || !Number.isSafeInteger(id)) {
      return bad('ID inválido');
    }

    const contentType = request.headers
      .get('content-type')
      ?.split(';')[0]
      .trim()
      .toLowerCase();

    if (contentType !== 'application/json') {
      return respond({ ok: false, error: 'Se requiere JSON' }, 415);
    }

    const raw = await request.text();

    if (Buffer.byteLength(raw, 'utf8') > 30000) {
      return respond({ ok: false, error: 'Datos demasiado grandes' }, 413);
    }

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      return bad('JSON inválido');
    }

    if (
      !data ||
      typeof data !== 'object' ||
      Array.isArray(data) ||
      Object.keys(data).some((key) => key !== 'items') ||
      !Array.isArray(data.items)
    ) {
      return bad();
    }

    if (data.items.length < 1 || data.items.length > MAX_PHOTOS) {
      return bad('Cada producto debe tener entre 1 y 10 fotografías.');
    }

    const ids = new Set();
    const urls = new Set();
    const clean = [];

    for (const item of data.items) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return bad();
      }

      const keys = Object.keys(item);

      if (keys.length !== 1) return bad();

      if (keys[0] === 'id') {
        const n = item.id;

        if (!Number.isSafeInteger(n) || n < 1 || ids.has(n)) return bad();

        ids.add(n);
        clean.push({ id: n });
      } else if (keys[0] === 'url') {
        if (!validCloudinaryUrl(item.url) || urls.has(item.url)) {
          return bad('Fotografía inválida');
        }

        urls.add(item.url);
        clean.push({ url: item.url });
      } else {
        return bad();
      }
    }

    const sql = getSql();

    const check = await sql`
      SELECT
        (SELECT COUNT(*) FROM products WHERE id = ${id}) AS product,
        (
          SELECT COUNT(*) FROM product_images
          WHERE product_id = ${id}
            AND id IN (
              SELECT value::int
              FROM jsonb_array_elements_text(${JSON.stringify([...ids])}::jsonb)
            )
        ) AS owned
    `;

    if (Number(check[0].product) !== 1) {
      return respond({ ok: false, error: 'Producto no encontrado' }, 404);
    }

    if (Number(check[0].owned) !== ids.size) {
      return bad('Alguna fotografía no pertenece a este producto.');
    }

    const json = JSON.stringify(clean);

    await sql.transaction([
      sql`
        UPDATE product_images
        SET active = FALSE, is_primary = FALSE
        WHERE product_id = ${id}
      `,
      sql`
        INSERT INTO product_images
          (product_id, image_url, position, is_primary, active)
        SELECT ${id}::int, s.url, 0, FALSE, TRUE
        FROM (
          SELECT DISTINCT e->>'url' AS url
          FROM jsonb_array_elements(${json}::jsonb) AS t(e)
          WHERE e->>'url' IS NOT NULL
        ) s
        WHERE NOT EXISTS (
          SELECT 1 FROM product_images x
          WHERE x.product_id = ${id} AND x.image_url = s.url
        )
      `,
      sql`
        UPDATE product_images i
        SET active = TRUE,
            position = s.pos,
            is_primary = (s.pos = 0)
        FROM (
          SELECT
            (ord - 1)::int AS pos,
            (e->>'id')::int AS img_id,
            e->>'url' AS url
          FROM jsonb_array_elements(${json}::jsonb)
            WITH ORDINALITY AS t(e, ord)
        ) s
        WHERE i.product_id = ${id}
          AND (
            (s.img_id IS NOT NULL AND i.id = s.img_id)
            OR (
              s.url IS NOT NULL
              AND i.id = (
                SELECT MIN(x.id) FROM product_images x
                WHERE x.product_id = ${id} AND x.image_url = s.url
              )
            )
          )
      `
    ]);

    return respond({ ok: true, count: clean.length });
  } catch (error) {
    console.error('Error guardando fotos:', error?.code || error?.name);
    return respond(
      { ok: false, error: 'No se pudieron guardar las fotografías' },
      500
    );
  }
}
