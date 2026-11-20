const PREFIX = '/dkq95jus0/image/upload/';

export function validCloudinaryUrl(value) {
  if (typeof value !== 'string' || value.length > 2000) return false;

  try {
    const url = new URL(value);

    return (
      url.protocol === 'https:' &&
      url.hostname === 'res.cloudinary.com' &&
      url.pathname.startsWith(PREFIX) &&
      url.pathname.length > PREFIX.length &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
