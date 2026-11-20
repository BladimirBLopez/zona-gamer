let ready = false;

export async function ensureCategories(sql) {
  if (ready) return;

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS categories_name_lower_idx
    ON categories (LOWER(name))
  `;

  await sql`
    INSERT INTO categories (name)
    SELECT DISTINCT TRIM(category)
    FROM products
    WHERE category IS NOT NULL AND TRIM(category) <> ''
    ON CONFLICT DO NOTHING
  `;

  ready = true;
}

export async function categoryExists(sql, name) {
  await ensureCategories(sql);

  const rows = await sql`
    SELECT 1 FROM categories
    WHERE LOWER(name) = LOWER(${name})
    LIMIT 1
  `;

  return rows.length > 0;
}
