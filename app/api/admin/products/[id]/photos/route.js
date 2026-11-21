import { NextResponse } from 'next/server';
import { getSql } from '../../../../../../lib/db';
import {
  hasAdminSession,
  sameOrigin
} from '../../../../../../lib/admin-auth';
import { validCloudinaryUrl } from '../../../../../../lib/cloudinary';
import { categoryExists } from '../../../../../../lib/categories';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_PHOTOS = 10;
const MAX_BODY_BYTES = 60000;
const PRODUCT_KEYS = [
  'name',
  'brand',
  'category',
  'price',
  'stock',
  'colors',
  'description',
  'features'
];

function respond(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' }
  });
}

const bad = (message = 'Datos inválidos') =>
  respond({ ok: false, error: message }, 400);

function text(value, max) {
  return typeof value === 'string' && value.trim().length <= max
    ? value.trim()
    : null;
}

// Mismas reglas que la acción "update" de /api/admin/products/[id].
function parseProduct(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Datos del producto inválidos' };
  }

  if (Object.keys(input).some((key) => !PRODUCT_KEYS.includes(key))) {
    return { error: 'Campos no permitidos' };
  }

  const name = text(input.name, 160);
  const brand = text(input.brand, 80);
  const category = text(input.category, 100);
  const colors = text(input.colors, 300);
  const description = text(input.description, 4000);
  const { price, stock, features } = input;

  if (
    !name ||
    !brand ||
    !category ||
    colors === null ||
    description === null
  ) {
    return { error: 'Datos de texto inválidos' };
  }

  if (
    typeof price !== 'number' ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 10000000 ||
    Math.abs(price * 100 - Math.round(price * 100)) > 0.000001
  ) {
    return { error: 'Precio inválido' };
  }

  if (!Number.isInteger(stock) || stock < 0 || stock > 1000000) {
    return { error: 'Stock inválido' };
  }

  if (
    !Array.isArray(features) ||
    features.length > 30 ||
    features.some(
      (item) =>
        typeof item !== 'string' ||
        !item.trim() ||
        item.trim().length > 200
    )
  ) {
    return { error: 'Características inválidas' };
  }

  return {
    value: {
      name,
      brand,
      category,
      price,
      stock,
      colors,
      description,
      features: features.map((value) => value.trim())
    }
  };
}

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

    if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
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
      Object.keys(data).some(
        (key) => key !== 'items' && key !== 'product'
      ) ||
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

    let product = null;

    if (data.product !== undefined) {
      const parsed = parseProduct(data.product);

      if (parsed.error) return bad(parsed.error);

      product = parsed.value;
    }

    const sql = getSql();

    if (product && !(await categoryExists(sql, product.category))) {
      return bad('Selecciona una categoría de la lista.');
    }

    const idList = JSON.stringify([...ids]);
    const urlList = JSON.stringify([...urls]);

    const check = await sql`
      SELECT
        (SELECT COUNT(*) FROM products WHERE id = ${id}) AS product,
        (
          SELECT COUNT(*) FROM product_images
          WHERE product_id = ${id}
            AND id IN (
              SELECT value::bigint
              FROM jsonb_array_elements_text(${idList}::jsonb)
            )
        ) AS owned
    `;

    if (Number(check[0].product) !== 1) {
      return respond({ ok: false, error: 'Producto no encontrado' }, 404);
    }

    if (Number(check[0].owned) !== ids.size) {
      return bad('Alguna fotografía no pertenece a este producto.');
    }

    // Fotos del producto que coinciden por ID o por URL (activas o no).
    const linked = await sql`
      SELECT id, image_url
      FROM product_images
      WHERE product_id = ${id}
        AND (
          id IN (
            SELECT value::bigint
            FROM jsonb_array_elements_text(${idList}::jsonb)
          )
          OR image_url IN (
            SELECT value
            FROM jsonb_array_elements_text(${urlList}::jsonb)
          )
        )
    `;

    const byId = new Map();
    const byUrl = new Map();

    for (const row of linked) {
      const rowId = String(row.id);
      byId.set(rowId, rowId);

      // Si una URL aparece en varias filas, se usa la de menor id
      // (igual que el SQL de más abajo).
      const current = byUrl.get(row.image_url);

      if (current === undefined || Number(rowId) < Number(current)) {
        byUrl.set(row.image_url, rowId);
      }
    }

    const used = new Set();

    for (const item of clean) {
      const matched =
        'id' in item
          ? byId.get(String(item.id))
          : byUrl.get(item.url);

      if (matched === undefined) {
        if ('id' in item) return bad('Fotografía no encontrada.');
        continue;
      }

      if (used.has(matched)) {
        return bad('Fotografía repetida en la lista.');
      }

      used.add(matched);
    }

    const json = JSON.stringify(clean);
    const total = clean.length;

    const queries = [
      // Bloquea el producto mientras dura la transacción.
      sql`
        SELECT id
        FROM products
        WHERE id = ${id}
        FOR UPDATE
      `
    ];

    // Datos del producto: misma transacción que las fotos.
    if (product) {
      queries.push(sql`
        UPDATE products
        SET
          name = ${product.name},
          brand = ${product.brand},
          category = ${product.category},
          price = ${product.price},
          stock = ${product.stock},
          colors = ${product.colors},
          description = ${product.description},
          features = ${JSON.stringify(product.features)}::jsonb,
          updated_at = NOW()
        WHERE id = ${id}
      `);
    }

    queries.push(
      // 1) Desactiva todas las fotos del producto y saca de las
      //    posiciones 0-9 a las que las ocupan, llevándolas por
      //    encima de la posición máxima existente. Las que ya están
      //    en 10 o más no se mueven.
      sql`
        WITH numbered AS (
          SELECT
            i.id,
            (
              SELECT GREATEST(COALESCE(MAX(x.position), 0), 9)
              FROM product_images x
              WHERE x.product_id = ${id}
            ) + ROW_NUMBER() OVER (ORDER BY i.id) AS temporary_position
          FROM product_images i
          WHERE i.product_id = ${id}
            AND i.position < ${MAX_PHOTOS}::integer
        )
        UPDATE product_images AS i
        SET
          active = FALSE,
          is_primary = FALSE,
          position = COALESCE(
            (SELECT n.temporary_position FROM numbered n WHERE n.id = i.id)::integer,
            i.position
          )
        WHERE i.product_id = ${id}
      `,

      // 2) Inserta las fotografías nuevas en su posición definitiva.
      sql`
        INSERT INTO product_images (
          product_id,
          image_url,
          position,
          is_primary,
          active
        )
        SELECT
          ${id}::integer,
          e->>'url',
          (ord - 1)::integer,
          (ord = 1),
          TRUE
        FROM jsonb_array_elements(${json}::jsonb)
          WITH ORDINALITY AS t(e, ord)
        WHERE e->>'url' IS NOT NULL
          AND NOT EXISTS (
            SELECT 1
            FROM product_images AS x
            WHERE x.product_id = ${id}
              AND x.image_url = e->>'url'
          )
      `,

      // 3) Reactiva las fotos existentes elegidas con su orden y portada.
      sql`
        UPDATE product_images AS i
        SET
          active = TRUE,
          position = s.pos,
          is_primary = (s.pos = 0)
        FROM (
          SELECT
            (ord - 1)::integer AS pos,
            (e->>'id')::bigint AS img_id,
            e->>'url' AS url
          FROM jsonb_array_elements(${json}::jsonb)
            WITH ORDINALITY AS t(e, ord)
        ) AS s
        WHERE i.product_id = ${id}
          AND (
            (s.img_id IS NOT NULL AND i.id = s.img_id)
            OR (
              s.url IS NOT NULL
              AND i.id = (
                SELECT MIN(x.id)
                FROM product_images x
                WHERE x.product_id = ${id}
                  AND x.image_url = s.url
              )
            )
          )
      `,

      // 4) Verificación: si el resultado no es exactamente el pedido
      //    (cantidad, posiciones 0..n-1 y una sola portada), esta
      //    división por cero falla y se deshace TODA la transacción.
      sql`
        SELECT 1 / CASE WHEN (
          SELECT
            COUNT(*) = ${total}::integer
            AND MIN(position) = 0
            AND MAX(position) = ${total}::integer - 1
            AND COUNT(*) FILTER (WHERE is_primary) = 1
            AND COUNT(*) FILTER (WHERE is_primary AND position = 0) = 1
          FROM product_images
          WHERE product_id = ${id} AND active
        ) THEN 1 ELSE 0 END AS verificado
      `
    );

    await sql.transaction(queries);

    return respond({ ok: true, count: total });
  } catch (error) {
    const code = error?.code;

    console.error('Error guardando fotos:', code || error?.name);

    if (code === '23505') {
      return respond(
        {
          ok: false,
          error:
            'Conflicto al ordenar las fotografías. No se guardó nada; intenta de nuevo.'
        },
        409
      );
    }

    if (code === '22012') {
      return respond(
        {
          ok: false,
          error:
            'No se pudo confirmar el orden de las fotografías. No se guardó nada.'
        },
        500
      );
    }

    return respond(
      {
        ok: false,
        error:
          'No se pudieron guardar los cambios. No se guardó nada; puedes reintentar.'
      },
      500
    )
  }
}
