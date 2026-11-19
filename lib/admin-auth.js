import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual
} from 'node:crypto';
import { promisify } from 'node:util';
import { isIP } from 'node:net';
import { cookies } from 'next/headers';
import { getSql } from './db';

const scrypt = promisify(scryptCallback);

export const ADMIN_COOKIE = 'zg_admin_session';
export const SESSION_SECONDS = 12 * 60 * 60;

const loginKey = (request) => {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const ip = forwarded.split(',')[0].trim();
  const client = isIP(ip) ? ip : 'unknown';

  return createHash('sha256')
    .update('zona-gamer-admin-login:' + client)
    .digest('hex');
};

const hashToken = (token) =>
  createHash('sha256').update(token).digest('hex');

export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  return Boolean(origin && origin === request.nextUrl.origin);
}

export async function consumeLoginAttempt(request) {
  const sql = getSql();
  const key = loginKey(request);

  const rows = await sql`
    INSERT INTO admin_login_attempts AS a
      (key_hash, attempts, window_started_at)
    VALUES (${key}, 1, NOW())
    ON CONFLICT (key_hash) DO UPDATE SET
      attempts = CASE
        WHEN a.window_started_at <= NOW() - INTERVAL '15 minutes'
        THEN 1
        ELSE a.attempts + 1
      END,
      window_started_at = CASE
        WHEN a.window_started_at <= NOW() - INTERVAL '15 minutes'
        THEN NOW()
        ELSE a.window_started_at
      END
    WHERE
      a.window_started_at <= NOW() - INTERVAL '15 minutes'
      OR a.attempts < 8
    RETURNING attempts
  `;

  return rows.length > 0;
}

export async function verifyCredentials(password) {
  const stored = process.env.ADMIN_PASSWORD_HASH || '';

  if (!/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(stored)) {
    throw new Error('Configuracion de administrador invalida');
  }

  const [, salt, hash] = stored.split(':');
  const expected = Buffer.from(hash, 'hex');

  const actual = await scrypt(
    password,
    Buffer.from(salt, 'hex'),
    expected.length
  );

  const passwordCorrect = timingSafeEqual(expected, actual);

  return passwordCorrect;
}

export async function createAdminSession(request) {
  const key = loginKey(request);
  const token = randomBytes(32).toString('base64url');
  const sql = getSql();

  await sql`
    INSERT INTO admin_sessions
      (token_hash, expires_at)
    VALUES (
      ${hashToken(token)},
      NOW() + INTERVAL '12 hours'
    )
  `;

  await sql`
    DELETE FROM admin_login_attempts
    WHERE key_hash = ${key}
  `;

  return token;
}

export async function hasAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return false;
  }

  const sql = getSql();

  const rows = await sql`
    SELECT 1
    FROM admin_sessions
    WHERE token_hash = ${hashToken(token)}
      AND expires_at > NOW()
    LIMIT 1
  `;

  return rows.length === 1;
}

export async function deleteAdminSession(token) {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return;
  }

  const sql = getSql();

  await sql`
    DELETE FROM admin_sessions
    WHERE token_hash = ${hashToken(token)}
  `;
}
