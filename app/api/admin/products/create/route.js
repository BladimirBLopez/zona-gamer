import { NextResponse } from 'next/server';
import { getSql } from '../../../../../lib/db';
import { categoryExists } from '../../../../../lib/categories';
import {
  hasAdminSession,
  sameOrigin
} from '../../../../../lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function fail(error, status) {
  return NextResponse.json(
    { ok: false, error },
    {
      status,
      headers: { 'Cache-Control': 'no-store' }
    }
  );
}

function textValue(value, max) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text.length <= max ? text : null;
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function validCloudinaryUrl(value) {
  try {
    const url = new URL(value);

    return (
      url.protocol === 'https:' &&
      url.hostname === 'res.cloudinary.com' &&
      url.pathname.startsWith('/dkq95jus0/image/upload/') &&
      url.pathname.length > '/dkq95jus0/image/upload/'.length &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export async function POST(request) {
  try {
    if (!(await hasAdminSession())) {
      return fail('No autorizado', 401);
    }

    if (!sameOrigin(request)) {
      return fail('Origen no permitido', 403);
    }

    const contentType = request.headers
      .get('content-type')
      ?.split(';')[0]
      .trim()
      .toLowerCase();

    if (contentType !== 'application/json') {
      return fail('Se requiere JSON', 415);
    }

    const raw = await request.text();

    if (Buffer.byteLength(raw, 'utf8') > 20000) {
      return fail('Datos demasiado grandes', 413);
    }

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      return fail('JSON inválido', 400);
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return fail('Datos inválidos', 400);
    }

    const allowed = new Set([
      'name', 'brand', 'category', 'price', 'stock',
      'colors', 'description', 'features', 'image', 'images'
    ]);

    if (Object.keys(data).some((key) => !allowed.has(key))) {
      return fail('Se recibieron campos no permitidos', 400);
    }

    const name = textValue(data.name, 160);
    const brand = textValue(data.brand, 80);
    const category = textValue(data.category, 100);
    const colors = textValue(data.colors ?? '', 300);
    const description = textValue(data.description ?? '', 4000);
    const image = textValue(data.image, 2000);

    const price = data.price;
    const stock = data.stock;
    const features = data.features ?? [];

    if (!name || !brand || !category) {
      return fail('Nombre, marca y categoría son obligatorios', 400);
    }

    if (colors === null || description === null) {
      return fail('Descripción o colores demasiado largos', 400);
    }

    if (
      typeof price !== 'number' ||
      !Number.isFinite(price) ||
      price < 0 ||
      price > 10000000 ||
      Math.abs(price * 100 - Math.round(price * 100)) > 0.000001
    ) {
      return fail('Precio inválido: máximo 2 decimales', 400);
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0 ||
      stock > 1000000
    ) {
      return fail('Stock inválido', 400);
    }

    if (
      !Array.isArray(features) ||
      features.length > 30 ||
      features.some(
        (item) =>
          typeof item !== 'string' ||
          !item.trim() ||
          item.trim().length > 200
      )
    ) {
      return fail('Características inválidas', 400);
    }

    const images = data.images === undefined
      ? [image]
      : data.images;

    if (
      !Array.isArray(images) ||
      images.length < 1 ||
      images.length > 10 ||
      images.some((url) =>
        typeof url !== 'string' ||
        url.length > 2000 ||
        !validCloudinaryUrl(url)
      ) ||
      new Set(images).size !== images.length
    ) {
      return fail('Fotografías inválidas o repetidas.', 400);
    }

    if (image !== images[0]) {
      return fail('La portada no coincide.', 400);
    }

    const slug = slugify(name);

    if (!slug) {
      return fail('El nombre no permite generar una dirección válida', 400);
    }

    const sql = getSql();

    if (!(await categoryExists(sql, category))) {
      return fail('Selecciona una categoría de la lista.', 400);
    }

    const rows = await sql`
      WITH new_product AS (
        INSERT INTO products (
          name,
          slug,
          brand,
          category,
          price,
          stock,
          colors,
          description,
          features,
          sort_order
        )
        VALUES (
          ${name},
          ${slug},
          ${brand},
          ${category},
          ${price},
          ${stock},
          ${colors},
          ${description},
          ${JSON.stringify(features.map((x) => x.trim()))}::jsonb,
          COALESCE(
            (SELECT MAX(sort_order) FROM products),
            0
          ) + 1
        )
        RETURNING id, name, slug, price, stock
      ),
        new_image AS (
          INSERT INTO product_images (
            product_id,
            image_url,
            position,
            is_primary
          )
          SELECT
            np.id,
            v.url,
            (v.ord - 1)::integer,
            (v.ord = 1)
          FROM new_product np
          CROSS JOIN LATERAL
            jsonb_array_elements_text(
              ${JSON.stringify(images)}::jsonb
            ) WITH ORDINALITY AS v(url, ord)
          RETURNING product_id
        )
      SELECT
        p.id,
        p.name,
        p.slug,
        p.price,
        p.stock
      FROM new_product p
        WHERE EXISTS (
          SELECT 1
          FROM new_image i
          WHERE i.product_id = p.id
        )
    `;

    if (rows.length !== 1) {
      throw new Error('No se confirmó la creación');
    }

    return NextResponse.json(
      {
        ok: true,
        product: {
          id: rows[0].id,
          name: rows[0].name,
          slug: rows[0].slug,
          price: Number(rows[0].price),
          stock: rows[0].stock,
          image
        }
      },
      {
        status: 201,
        headers: { 'Cache-Control': 'no-store' }
      }
    );
  } catch (error) {
    if (error?.code === '23505') {
      return fail(
        'Ya existe un producto con esa dirección. Utiliza un nombre diferente.',
        409
      );
    }

    console.error(
      'Error creando producto:',
      error?.code || error?.name
    );

    return fail('No se pudo crear el producto', 500);
  }
}
