import { cache } from 'react';
import { getSql } from './db';
import { config } from '../data/config';

export const SETTING_KEYS = [
  'whatsapp', 'schedule', 'facebook', 'tiktok', 'instagram',
  'banner_active', 'banner_text', 'banner_link',
];

export const DEFAULT_SETTINGS = {
  whatsapp: config.whatsapp || '',
  schedule: config.schedule || '',
  facebook: config.facebook || '',
  tiktok: config.tiktok || '',
  instagram: config.instagram || '',
  banner_active: false,
  banner_text: '',
  banner_link: '',
};

const SOCIAL = {
  facebook: { label: 'Facebook', hosts: ['facebook.com', 'fb.com', 'fb.me'] },
  tiktok: { label: 'TikTok', hosts: ['tiktok.com'] },
  instagram: { label: 'Instagram', hosts: ['instagram.com'] },
};

const clean = (v) => String(v).replace(/\s+/g, ' ').trim();
const fail = (error) => ({ ok: false, error });

function checkSocial(key, value) {
  const { label, hosts } = SOCIAL[key];
  const raw = clean(value);
  if (!raw) return { value: '' };
  let url = null;
  try { url = new URL(raw); } catch { url = null; }
  const host = url ? url.hostname.toLowerCase() : '';
  const okHost = hosts.some((d) => host === d || host.endsWith('.' + d));
  if (raw.length > 200 || !url || url.protocol !== 'https:' || url.username || url.password || !okHost) {
    return { error: `${label}: usa un enlace https:// de ${hosts[0]}.` };
  }
  return { value: url.href };
}

function checkLink(value) {
  const raw = clean(value);
  const msg = 'Enlace del banner: usa una ruta como /catalogo o un enlace https://';
  if (!raw) return { value: '' };
  if (raw.length > 200) return { error: msg };
  if (raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\')) {
    return { value: raw };
  }
  try {
    const url = new URL(raw);
    if (url.protocol === 'https:' && !url.username && !url.password) {
      return { value: url.href };
    }
  } catch {}
  return { error: msg };
}

export function validateSettings(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return fail('Datos inválidos');
  }
  const out = {};

  if (typeof input.whatsapp !== 'string') return fail('WhatsApp inválido');
  let digits = input.whatsapp.replace(/\D/g, '');
  if (digits.length === 8 && /^[67]/.test(digits)) digits = '591' + digits;
  if (digits.length < 10 || digits.length > 15) {
    return fail('WhatsApp: escribe el número con código de país, por ejemplo 59175034183.');
  }
  out.whatsapp = digits;

  if (typeof input.schedule !== 'string') return fail('Horario inválido');
  out.schedule = clean(input.schedule);
  if (out.schedule.length > 80) return fail('Horario: máximo 80 caracteres.');

  for (const key of Object.keys(SOCIAL)) {
    if (typeof input[key] !== 'string') return fail('Datos inválidos');
    const r = checkSocial(key, input[key]);
    if (r.error) return fail(r.error);
    out[key] = r.value;
  }

  if (typeof input.banner_active !== 'boolean') return fail('Datos inválidos');
  out.banner_active = input.banner_active;

  if (typeof input.banner_text !== 'string') return fail('Datos inválidos');
  out.banner_text = clean(input.banner_text);
  if (out.banner_text.length > 120) return fail('Banner: máximo 120 caracteres.');
  if (out.banner_active && !out.banner_text) {
    return fail('Banner: escribe el texto o desactívalo.');
  }

  if (typeof input.banner_link !== 'string') return fail('Datos inválidos');
  const l = checkLink(input.banner_link);
  if (l.error) return fail(l.error);
  out.banner_link = l.value;

  return { ok: true, values: out };
}

let ready = false;

// Solo para el admin: la tienda pública nunca crea tablas.
export async function ensureSettings(sql) {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  ready = true;
}

export async function readSettings(sql) {
  const rows = await sql`SELECT value FROM site_settings WHERE key = 'main'`;
  if (rows.length === 0) return { ...DEFAULT_SETTINGS };
  let stored = null;
  try { stored = JSON.parse(rows[0].value); } catch { stored = null; }
  const merged = { ...DEFAULT_SETTINGS };
  if (stored && typeof stored === 'object') {
    for (const k of SETTING_KEYS) {
      if (k in stored) merged[k] = stored[k];
    }
  }
  const check = validateSettings(merged);
  return check.ok ? check.values : { ...DEFAULT_SETTINGS };
}

export async function writeSettings(sql, values) {
  await sql`
    INSERT INTO site_settings (key, value)
    VALUES ('main', ${JSON.stringify(values)})
    ON CONFLICT (key) DO UPDATE
    SET value = EXCLUDED.value, updated_at = NOW()
  `;
}

// Para la tienda pública: nunca lanza error, siempre devuelve ajustes.
export const getSiteSettings = cache(async () => {
  try {
    return await readSettings(getSql());
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
});
