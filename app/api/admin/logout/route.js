import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  sameOrigin,
  deleteAdminSession
} from '../../../../lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json(
      { error: 'Solicitud no permitida' },
      { status: 403 }
    );
  }

  try {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;

    await deleteAdminSession(token);

    const response = NextResponse.json(
      { ok: true },
      { headers: { 'Cache-Control': 'no-store' } }
    );

    response.cookies.set(ADMIN_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    });

    return response;
  } catch (error) {
    console.error('Error al cerrar sesion:', error?.message);

    return NextResponse.json(
      { error: 'No se pudo cerrar sesion' },
      { status: 500 }
    );
  }
}
