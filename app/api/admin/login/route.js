import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  SESSION_SECONDS,
  sameOrigin,
  consumeLoginAttempt,
  verifyCredentials,
  createAdminSession
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
    const body = await request.json();
    const { username, password } = body || {};

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      username.length > 100 ||
      password.length > 256
    ) {
      return NextResponse.json(
        { error: 'Datos invalidos' },
        { status: 400 }
      );
    }

    const allowed = await consumeLoginAttempt(request);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta en 15 minutos.' },
        { status: 429 }
      );
    }

    const valid = await verifyCredentials(username, password);

    if (!valid) {
      return NextResponse.json(
        { error: 'Usuario o contraseña incorrectos' },
        { status: 401 }
      );
    }

    const token = await createAdminSession(request);

    const response = NextResponse.json(
      { ok: true },
      { headers: { 'Cache-Control': 'no-store' } }
    );

    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_SECONDS
    });

    return response;
  } catch (error) {
    console.error('Error de autenticacion:', error?.message);

    return NextResponse.json(
      { error: 'No se pudo iniciar sesion' },
      { status: 500 }
    );
  }
}
