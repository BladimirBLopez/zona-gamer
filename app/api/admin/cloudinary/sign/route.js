import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import {
  hasAdminSession,
  sameOrigin
} from '../../../../../lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CLOUD_NAME = 'dkq95jus0';
const FOLDER = 'zona-gamer/products';
const ALLOWED_FORMATS = 'jpg,png,webp';

function respond(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' }
  });
}

export async function POST(request) {
  try {
    if (!(await hasAdminSession())) {
      return respond(
        { ok: false, error: 'No autorizado' },
        401
      );
    }

    if (!sameOrigin(request)) {
      return respond(
        { ok: false, error: 'Origen no permitido' },
        403
      );
    }

    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const configuredCloud = process.env.CLOUDINARY_CLOUD_NAME;

    if (
      !apiKey ||
      !apiSecret ||
      (configuredCloud && configuredCloud !== CLOUD_NAME)
    ) {
      console.error('Configuracion Cloudinary incompleta');
      return respond(
        { ok: false, error: 'Cloudinary no configurado' },
        503
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);

    const signature = createHash('sha1')
      .update(
        `allowed_formats=${ALLOWED_FORMATS}&folder=${FOLDER}&timestamp=${timestamp}${apiSecret}`
      )
      .digest('hex');

    return respond({
      ok: true,
      cloud_name: CLOUD_NAME,
      api_key: apiKey,
      timestamp,
      folder: FOLDER,
      allowed_formats: ALLOWED_FORMATS,
      signature
    });
  } catch (error) {
    console.error(
      'Error autorizando Cloudinary:',
      error?.name || 'Error'
    );

    return respond(
      { ok: false, error: 'No se pudo autorizar la subida' },
      500
    );
  }
}
