import { products } from '../data/products';
import { config } from '../data/config';

export default function sitemap() {
  const now = new Date();
  return [
    { url: config.url, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${config.url}/catalogo`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    ...products.map((p) => ({
      url: `${config.url}/producto/${p.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
  ];
}
