import { NextResponse } from 'next/server';
import { getSql } from '../../../../../lib/db';
import {
  hasAdminSession,
  sameOrigin
} from '../../../../../lib/admin-auth';
import { ensureCategories } from '../../../../../lib/categories';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function respond(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' }
  });
}

const NAME_RE = /^[\p{L}\p{N} &\-\/.,()+'’]+$/u;

async function guard(request, params) {
  if (!(await hasAdminSession())) {
    return { res: respond({ ok: false, error: 'No autorizado' }, 401) };
  }
  if (!sameOrigin(request)) {
    return { res: respond({ ok: false, error: 'Origen no permitido' }, 403) };
  }
  const { id } = await params;
  if (typeof id !== 'string' || !/^[\w-]{1,64}$/.test(id)) {
    return { res: respond({ ok: false, error: 'Categoría inválida' }, 400) };
  }
  return { id };
}

export async function PATCH(request, { params }) {
  try {
    const g = await guard(request, params);
    if (g.res) return g.res;

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
    if (name.length < 2 || name.length > 60 || !NAME_RE.test(name)) {
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

    const found = await sql`
      SELECT id, name FROM categories WHERE id = ${g.id}
    `;
    if (found.length === 0) {
      return respond({ ok: false, error: 'La categoría no existe.' }, 404);
    }

    const oldName = found[0].name;
    if (oldName === name) {
      return respond({ ok: true, category: { id: found[0].id, name } });
    }

    const rows = await sql`
      WITH moved AS (
        UPDATE products
        SET category = ${name}
        WHERE LOWER(TRIM(category)) = LOWER(${oldName}::text)
        RETURNING 1
      )
      UPDATE categories
      SET name = ${name}
      WHERE id = ${g.id}
      RETURNING id, name
    `;

    if (rows.length === 0) {
      return respond({ ok: false, error: 'No se pudo renombrar.' }, 500);
    }

    return respond({
      ok: true,
      category: { id: rows[0].id, name: rows[0].name }
    });
  } catch (error) {
    if (error?.code === '23505') {
      return respond(
        { ok: false, error: 'Ya existe una categoría con ese nombre.' },
        409
      );
    }
    console.error('Error renombrando categoria:', error?.code || error?.name);
    return respond(
      { ok: false, error: 'No se pudo renombrar la categoría' },
      500
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const g = await guard(request, params);
    if (g.res) return g.res;

    const sql = getSql();

    const found = await sql`
      SELECT
        c.id,
        c.name,
        (
          SELECT COUNT(*) FROM products p
          WHERE LOWER(TRIM(p.category)) = LOWER(c.name)
        ) AS products
      FROM categories c
      WHERE c.id = ${g.id}
    `;

    if (found.length === 0) {
      return respond({ ok: false, error: 'La categoría no existe.' }, 404);
    }

    const count = Number(found[0].products);
    if (count > 0) {
      return respond(
        {
          ok: false,
          error: `Tiene ${count} ${count === 1 ? 'producto' : 'productos'}. Muévelos a otra categoría antes de borrarla.`
        },
        409
      );
    }

    const rows = await sql`
      DELETE FROM categories c
      WHERE c.id = ${g.id}
      AND NOT EXISTS (
        SELECT 1 FROM products p
        WHERE LOWER(TRIM(p.category)) = LOWER(c.name)
      )
      RETURNING c.id
    `;

    if (rows.length === 0) {
      return respond(
        { ok: false, error: 'No se pudo borrar: ahora tiene productos.' },
        409
      );
    }

    return respond({ ok: true });
  } catch (error) {
    console.error('Error borrando categoria:', error?.code || error?.name);
    return respond(
      { ok: false, error: 'No se pudo borrar la categoría' },
      500
    );
  }
}
