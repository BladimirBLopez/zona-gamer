export function optImg(url, w = 600) {
  if (typeof url !== 'string' || url.includes('f_auto')) return url;
  if (!url.startsWith('https://res.cloudinary.com/')) return url;
  const marker = '/image/upload/';
  const i = url.indexOf(marker);
  if (i === -1) return url;
  const at = i + marker.length;
  return url.slice(0, at) + 'f_auto,q_auto,c_limit,w_' + w + '/' + url.slice(at);
}
