import { NextResponse } from 'next/server';
import { getSql } from '../../../../../lib/db';
import {
  hasAdminSession,
  sameOrigin
} from '../../../../../lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function errorResponse(message, status) {
  return NextResponse.json(
    { ok: false, error: message },
    {
      status,
      headers: { 'Cache-Control': 'no-store' }
    }
  );
}

export async function PATCH(request, { params }) {
  try {
    if (!(await hasAdminSession())) {
      return errorResponse('No autorizado', 401);
    }

    if (!sameOrigin(request)) {
      return errorResponse('Origen no permitido', 403);
    }

    const { id: rawId } = await params;
    const id = Number(rawId);

    if (
      !/^[1-9]\d*$/.test(rawId) ||
      !Number.isSafeInteger(id)
    ) {
      return errorResponse('ID de producto inválido', 400);
    }

    const contentType = request.headers
      .get('content-type')
      ?.split(';')[0]
      .trim()
      .toLowerCase();

    if (contentType !== 'application/json') {
      return errorResponse('Se requiere JSON', 415);
    }

    const data = await request.json().catch(() => null);

    if (
      !data ||
      typeof data !== 'object' ||
      Array.isArray(data)
    ) {
      return errorResponse('Datos inválidos', 400);
    }

    const keys = Object.keys(data);

    if (
      keys.length === 0 ||
      keys.some((key) => !['price', 'stock'].includes(key))
    ) {
      return errorResponse(
        'Solo puedes modificar precio y stock',
        400
      );
    }

    const hasPrice = Object.hasOwn(data, 'price');
    const hasStock = Object.hasOwn(data, 'stock');

    const price = hasPrice ? data.price : null;
    const stock = hasStock ? data.stock : null;

    if (
      hasPrice &&
      (
        typeof price !== 'number' ||
        !Number.isFinite(price) ||
        price < 0 ||
        price > 10000000 ||
        Math.abs(price * 100 - Math.round(price * 100)) > 0.000001
      )
    ) {
      return errorResponse(
        'El precio debe ser válido y tener máximo 2 decimales',
        400
      );
    }

    if (
      hasStock &&
      (
        !Number.isInteger(stock) ||
        stock < 0 ||
        stock > 1000000
      )
    ) {
      return errorResponse(
        'El stock debe ser un número entero no negativo',
        400
      );
    }

    const sql = getSql();

    const rows = await sql`
      UPDATE products
      SET
        price = CASE
          WHEN ${hasPrice}
          THEN ${price}::numeric
          ELSE price
        END,
        stock = CASE
          WHEN ${hasStock}
          THEN ${stock}::integer
          ELSE stock
        END
      WHERE id = ${id}
      RETURNING id, price, stock
    `;

    if (rows.length === 0) {
      return errorResponse('Producto no encontrado', 404);
    }

    return NextResponse.json(
      {
        ok: true,
        product: {
          id: rows[0].id,
          price: Number(rows[0].price),
          stock: rows[0].stock
        }
      },
      {
        headers: { 'Cache-Control': 'no-store' }
      }
    );
  } catch (error) {
    console.error(
      'Error actualizando producto:',
      error?.code || error?.name
    );

    return errorResponse(
      'No se pudo actualizar el producto',
      500
    );
  }
}
// Gestión completa sin borrar productos o imágenes existentes.
export async function POST(request, { params }) {
  try {
    if (!(await hasAdminSession())) {
      return errorResponse('No autorizado', 401);
    }
    if (!sameOrigin(request)) {
      return errorResponse('Origen no permitido', 403);
    }

    const { id: rawId } = await params;
    const id = Number(rawId);
    if (!/^[1-9]\d*$/.test(rawId) || !Number.isSafeInteger(id)) {
      return errorResponse('ID inválido', 400);
    }

    const contentType = request.headers.get('content-type')
      ?.split(';')[0].trim().toLowerCase();
    if (contentType !== 'application/json') {
      return errorResponse('Se requiere JSON', 415);
    }

    const raw = await request.text();
    if (Buffer.byteLength(raw, 'utf8') > 20000) {
      return errorResponse('Datos demasiado grandes', 413);
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return errorResponse('JSON inválido', 400);
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return errorResponse('Datos inválidos', 400);
    }

    const sql = getSql();

    if (data.action === 'visibility') {
      if (
        Object.keys(data).some(
          (key) => !['action', 'active'].includes(key)
        ) ||
        typeof data.active !== 'boolean'
      ) {
        return errorResponse('Visibilidad inválida', 400);
      }

      const rows = await sql`
        UPDATE products
        SET active = ${data.active}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, active
      `;

      if (!rows.length) {
        return errorResponse('Producto no encontrado', 404);
      }

      return NextResponse.json(
        { ok: true, product: rows[0] },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (data.action !== 'update') {
      return errorResponse('Acción no permitida', 400);
    }

    const allowed = new Set([
      'action', 'name', 'brand', 'category', 'price',
      'stock', 'colors', 'description', 'features', 'image'
    ]);
    if (Object.keys(data).some((key) => !allowed.has(key))) {
      return errorResponse('Campos no permitidos', 400);
    }

    function field(value, max) {
      return typeof value === 'string' &&
        value.trim().length <= max
        ? value.trim()
        : null;
    }

    const name = field(data.name, 160);
    const brand = field(data.brand, 80);
    const category = field(data.category, 100);
    const colors = field(data.colors, 300);
    const description = field(data.description, 4000);
    const { price, stock, features } = data;
    const image = data.image ?? null;

    if (!name || !brand || !category ||
        colors === null || description === null) {
      return errorResponse('Datos de texto inválidos', 400);
    }

    if (
      typeof price !== 'number' ||
      !Number.isFinite(price) ||
      price < 0 || price > 10000000 ||
      Math.abs(price * 100 - Math.round(price * 100)) > 0.000001
    ) {
      return errorResponse('Precio inválido', 400);
    }

    if (!Number.isInteger(stock) || stock < 0 || stock > 1000000) {
      return errorResponse('Stock inválido', 400);
    }

    if (
      !Array.isArray(features) ||
      features.length > 30 ||
      features.some((item) =>
        typeof item !== 'string' ||
        !item.trim() ||
        item.trim().length > 200
      )
    ) {
      return errorResponse('Características inválidas', 400);
    }

    if (image !== null) {
      try {
        const url = new URL(image);
        if (
          image.length > 2000 ||
          url.protocol !== 'https:' ||
          url.hostname !== 'res.cloudinary.com' ||
          !url.pathname.startsWith(
            '/dkq95jus0/image/upload/'
          ) ||
          url.pathname.length <=
            '/dkq95jus0/image/upload/'.length ||
          url.username || url.password
        ) {
          return errorResponse('Fotografía inválida', 400);
        }
      } catch {
        return errorResponse('Fotografía inválida', 400);
      }
    }

    const rows = await sql`
      WITH updated AS (
        UPDATE products
        SET
          name = ${name},
          brand = ${brand},
          category = ${category},
          price = ${price},
          stock = ${stock},
          colors = ${colors},
          description = ${description},
          features = ${JSON.stringify(features.map(
            (value) => value.trim()
          ))}::jsonb,
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id
      ),
      old_primary AS (
        UPDATE product_images
        SET is_primary = FALSE
        WHERE product_id IN (SELECT id FROM updated)
          AND ${image !== null}
          AND is_primary = TRUE
        RETURNING product_id
      ),
      photo AS (
        INSERT INTO product_images (
          product_id, image_url, position, is_primary
        )
        SELECT
          updated.id,
          ${image}::text,
          COALESCE(
            (
              SELECT MAX(i.position) + 1
              FROM product_images i
              WHERE i.product_id = updated.id
            ),
            0
          ),
          TRUE
        FROM updated
        WHERE ${image !== null}
        RETURNING product_id
      )
      SELECT id FROM updated
    `;

    if (!rows.length) {
      return errorResponse('Producto no encontrado', 404);
    }

    return NextResponse.json(
      { ok: true, product: { id: rows[0].id } },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error(
      'Error gestionando producto:',
      error?.code || error?.name
    );
    return errorResponse('No se pudo guardar el producto', 500);
  }
}
