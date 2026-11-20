import { NextResponse } from 'next/server';
import { getSql } from '../../../../lib/db';
import {
  hasAdminSession,
  sameOrigin
} from '../../../../lib/admin-auth';
import { ensureCategories } from '../../../../lib/categories';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function respond(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' }
  });
}

export async function GET() {
  try {
    if (!(await hasAdminSession())) {
      return respond({ ok: false, error: 'No autorizado' }, 401);
    }

    const sql = getSql();
    await ensureCategories(sql);

    const rows = await sql`
      SELECT
        c.id,
        c.name,
        (
          SELECT COUNT(*) FROM products p
          WHERE LOWER(TRIM(p.category)) = LOWER(c.name)
        ) AS products
      FROM categories c
      ORDER BY LOWER(c.name)
    `;

    return respond({
      ok: true,
      categories: rows.map((r) => ({
        id: r.id,
        name: r.name,
        products: Number(r.products)
      }))
    });
  } catch (error) {
    console.error('Error categorias:', error?.code || error?.name);
    return respond(
      { ok: false, error: 'No se pudieron cargar las categorías' },
      500
    );
  }
}

export async function POST(request) {
  try {
    if (!(await hasAdminSession())) {
      return respond({ ok: false, error: 'No autorizado' }, 401);
    }

    if (!sameOrigin(request)) {
      return respond({ ok: false, error: 'Origen no permitido' }, 403);
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

    if (Buffer.byteLength(raw, 'utf8') > 2000) {
      return respond({ ok: false, error: 'Datos demasiado grandes' }, 413);
    }

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      return respond({ ok: false, error: 'JSON inválido' }, 400);
    }

    if (
      !data ||
      typeof data !== 'object' ||
      Array.isArray(data) ||
      Object.keys(data).some((key) => key !== 'name') ||
      typeof data.name !== 'string'
    ) {
      return respond({ ok: false, error: 'Datos inválidos' }, 400);
    }

    const name = data.name.replace(/\s+/g, ' ').trim();

    if (
      name.length < 2 ||
      name.length > 60 ||
      !/^[\p{L}\p{N} &\-\/.,()+'’]+$/u.test(name)
    ) {
      return respond(
        {
          ok: false,
          error: 'Usa entre 2 y 60 caracteres: letras, números y espacios.'
        },
        400
      );
    }

    const sql = getSql();
    await ensureCategories(sql);

    const rows = await sql`
      INSERT INTO categories (name)
      VALUES (${name})
      ON CONFLICT DO NOTHING
      RETURNING id, name
    `;

    if (rows.length === 0) {
      return respond(
        { ok: false, error: 'Esa categoría ya existe.' },
        409
      );
    }

    return respond(
      { ok: true, category: { id: rows[0].id, name: rows[0].name } },
      201
    );
  } catch (error) {
    console.error('Error creando categoria:', error?.code || error?.name);
    return respond(
      { ok: false, error: 'No se pudo agregar la categoría' },
      500
    );
  }
}
