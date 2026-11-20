export const CLOUD = 'dkq95jus0';
export const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_PICK = 25 * 1024 * 1024;
export const MAX_UPLOAD = 8 * 1024 * 1024;
export const MAX_PHOTOS = 10;

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`;

export async function prepareImage(file) {
  const MAX = 1600;
  let url = '';

  try {
    url = URL.createObjectURL(file);

    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });

    const scale = Math.min(
      1,
      MAX / Math.max(img.naturalWidth, img.naturalHeight)
    );
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.86)
    );

    if (blob && blob.size < file.size) {
      return new File([blob], 'producto.jpg', { type: 'image/jpeg' });
    }
  } catch {
    /* si no se puede reducir, se usa la original */
  } finally {
    if (url) URL.revokeObjectURL(url);
  }

  return file;
}

async function fetchRetry(url, options, tries = 2) {
  let last;

  for (let i = 0; i < tries; i += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);

    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } catch (error) {
      last = error;
      if (i < tries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    } finally {
      clearTimeout(timer);
    }
  }

  throw last;
}

export async function uploadPhoto(file) {
  let sign;

  try {
    sign = await fetchRetry('/api/admin/cloudinary/sign', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store'
    });
  } catch {
    throw new Error(
      'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.'
    );
  }

  const auth = await sign.json().catch(() => ({}));

  if (sign.status === 401) {
    throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.');
  }

  if (!sign.ok || !auth.ok) {
    throw new Error(
      auth.error || 'No se pudo autorizar la subida de la fotografía.'
    );
  }

  if (auth.cloud_name !== CLOUD) {
    throw new Error('Configuración de fotografías incorrecta.');
  }

  const data = new FormData();
  data.append('file', file);

  for (const key of [
    'api_key', 'timestamp', 'folder', 'allowed_formats', 'signature'
  ]) {
    data.append(key, String(auth[key]));
  }

  let response;

  try {
    response = await fetchRetry(UPLOAD_URL, { method: 'POST', body: data });
  } catch {
    throw new Error(
      'No se pudo conectar con el servicio de fotografías. Revisa tu internet o desactiva el bloqueador de contenido e inténtalo de nuevo.'
    );
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.error?.message || 'No se pudo subir la fotografía.'
    );
  }

  const url = result.secure_url;

  if (
    result.resource_type !== 'image' ||
    typeof url !== 'string' ||
    !url.startsWith(`https://res.cloudinary.com/${CLOUD}/image/upload/`)
  ) {
    throw new Error('La fotografía recibida no es válida.');
  }

  return url;
}
