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
