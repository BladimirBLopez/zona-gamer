import { NextResponse } from 'next/server';
import { getSql } from '../../../../lib/db';
import { hasAdminSession, sameOrigin } from '../../../../lib/admin-auth';
import {
  SETTING_KEYS,
  ensureSettings,
  readSettings,
  validateSettings,
  writeSettings
} from '../../../../lib/settings';

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
    await ensureSettings(sql);
    const settings = await readSettings(sql);
    return respond({ ok: true, settings });
  } catch (error) {
    console.error('Error ajustes:', error?.code || error?.name);
    return respond({ ok: false, error: 'No se pudieron cargar los ajustes.' }, 500);
  }
}

export async function PUT(request) {
  try {
    if (!sameOrigin(request)) {
      return respond({ ok: false, error: 'Origen no permitido' }, 403);
    }
    if (!(await hasAdminSession())) {
      return respond({ ok: false, error: 'No autorizado' }, 401);
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
    if (Buffer.byteLength(raw, 'utf8') > 4000) {
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
      Object.keys(data).length === 0 ||
      Object.keys(data).some((k) => !SETTING_KEYS.includes(k))
    ) {
      return respond({ ok: false, error: 'Datos inválidos' }, 400);
    }

    const sql = getSql();
    await ensureSettings(sql);
    const current = await readSettings(sql);

    const check = validateSettings({ ...current, ...data });
    if (!check.ok) {
      return respond({ ok: false, error: check.error }, 400);
    }

    await writeSettings(sql, check.values);
    return respond({ ok: true, settings: check.values });
  } catch (error) {
    console.error('Error guardando ajustes:', error?.code || error?.name);
    return respond({ ok: false, error: 'No se pudo guardar.' }, 500);
  }
}
