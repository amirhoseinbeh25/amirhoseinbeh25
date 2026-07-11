import { db } from "./db";

export type Category = {
  id: number;
  slug: string;
  title: string;
  description: string;
  color: string;
};

export type Spec = { label: string; value: string };

export type Product = {
  id: number;
  slug: string;
  title: string;
  categoryId: number;
  categorySlug: string;
  categoryTitle: string;
  categoryColor: string;
  brand: string;
  summary: string;
  specs: Spec[];
};

export type Brand = { id: number; slug: string; name: string };

export type Post = {
  id: number;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
};

export type SiteSettings = {
  nameLatin: string;
  nameFa: string;
  tagline: string;
  shortDescription: string;
  phone1: string;
  phone2: string;
  email: string;
  address: string;
  mapEmbedUrl: string;
  workHours: string;
  socialTelegram: string;
  socialInstagram: string;
  socialWhatsapp: string;
  socialLinkedin: string;
};

const COLORS = ["amber", "coral", "teal", "indigo", "olive"] as const;
export type SwatchColor = (typeof COLORS)[number];
export function isSwatchColor(v: string): v is SwatchColor {
  return (COLORS as readonly string[]).includes(v);
}
export { COLORS };

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9؀-ۿ]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseSpecs(raw: string): Spec[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.search(/[:：]/);
      if (idx === -1) return { label: line, value: "" };
      return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
    });
}

export function specsToText(specs: Spec[]) {
  return specs.map((s) => `${s.label}: ${s.value}`).join("\n");
}

// Categories
export function getCategories(): Category[] {
  return db.prepare("SELECT * FROM categories ORDER BY id").all() as Category[];
}

export function getCategory(slug: string): Category | undefined {
  return db.prepare("SELECT * FROM categories WHERE slug = ?").get(slug) as Category | undefined;
}

export function getCategoryById(id: number): Category | undefined {
  return db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as Category | undefined;
}

export function createCategory(data: { slug: string; title: string; description: string; color: string }) {
  db.prepare("INSERT INTO categories (slug, title, description, color) VALUES (?, ?, ?, ?)").run(
    slugify(data.slug || data.title),
    data.title,
    data.description,
    data.color
  );
}

export function updateCategory(
  id: number,
  data: { slug: string; title: string; description: string; color: string }
) {
  db.prepare("UPDATE categories SET slug = ?, title = ?, description = ?, color = ? WHERE id = ?").run(
    slugify(data.slug || data.title),
    data.title,
    data.description,
    data.color,
    id
  );
}

export function deleteCategory(id: number) {
  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
}

// Products
type ProductRow = {
  id: number;
  slug: string;
  title: string;
  category_id: number;
  brand: string;
  summary: string;
  specs: string;
  category_slug: string;
  category_title: string;
  category_color: string;
};

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    categoryId: row.category_id,
    categorySlug: row.category_slug,
    categoryTitle: row.category_title,
    categoryColor: row.category_color,
    brand: row.brand,
    summary: row.summary,
    specs: JSON.parse(row.specs || "[]"),
  };
}

const PRODUCT_SELECT = `
  SELECT p.*, c.slug as category_slug, c.title as category_title, c.color as category_color
  FROM products p JOIN categories c ON c.id = p.category_id
`;

export function getProducts(): Product[] {
  const rows = db.prepare(`${PRODUCT_SELECT} ORDER BY p.id`).all() as ProductRow[];
  return rows.map(mapProduct);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  const rows = db
    .prepare(`${PRODUCT_SELECT} WHERE c.slug = ? ORDER BY p.id`)
    .all(categorySlug) as ProductRow[];
  return rows.map(mapProduct);
}

export function getProduct(slug: string): Product | undefined {
  const row = db.prepare(`${PRODUCT_SELECT} WHERE p.slug = ?`).get(slug) as ProductRow | undefined;
  return row ? mapProduct(row) : undefined;
}

export function getProductById(id: number): Product | undefined {
  const row = db.prepare(`${PRODUCT_SELECT} WHERE p.id = ?`).get(id) as ProductRow | undefined;
  return row ? mapProduct(row) : undefined;
}

export function createProduct(data: {
  slug: string;
  title: string;
  categoryId: number;
  brand: string;
  summary: string;
  specsText: string;
}) {
  db.prepare(
    "INSERT INTO products (slug, title, category_id, brand, summary, specs) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    slugify(data.slug || data.title),
    data.title,
    data.categoryId,
    data.brand,
    data.summary,
    JSON.stringify(parseSpecs(data.specsText))
  );
}

export function updateProduct(
  id: number,
  data: { slug: string; title: string; categoryId: number; brand: string; summary: string; specsText: string }
) {
  db.prepare(
    "UPDATE products SET slug = ?, title = ?, category_id = ?, brand = ?, summary = ?, specs = ? WHERE id = ?"
  ).run(
    slugify(data.slug || data.title),
    data.title,
    data.categoryId,
    data.brand,
    data.summary,
    JSON.stringify(parseSpecs(data.specsText)),
    id
  );
}

export function deleteProduct(id: number) {
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
}

// Brands
export function getBrands(): Brand[] {
  return db.prepare("SELECT * FROM brands ORDER BY id").all() as Brand[];
}

export function getBrandById(id: number): Brand | undefined {
  return db.prepare("SELECT * FROM brands WHERE id = ?").get(id) as Brand | undefined;
}

export function createBrand(data: { slug: string; name: string }) {
  db.prepare("INSERT INTO brands (slug, name) VALUES (?, ?)").run(slugify(data.slug || data.name), data.name);
}

export function updateBrand(id: number, data: { slug: string; name: string }) {
  db.prepare("UPDATE brands SET slug = ?, name = ? WHERE id = ?").run(
    slugify(data.slug || data.name),
    data.name,
    id
  );
}

export function deleteBrand(id: number) {
  db.prepare("DELETE FROM brands WHERE id = ?").run(id);
}

// Posts
export function getPosts(): Post[] {
  return db.prepare("SELECT * FROM posts ORDER BY id DESC").all() as Post[];
}

export function getPost(slug: string): Post | undefined {
  return db.prepare("SELECT * FROM posts WHERE slug = ?").get(slug) as Post | undefined;
}

export function getPostById(id: number): Post | undefined {
  return db.prepare("SELECT * FROM posts WHERE id = ?").get(id) as Post | undefined;
}

export function createPost(data: { slug: string; title: string; date: string; excerpt: string; content: string }) {
  db.prepare("INSERT INTO posts (slug, title, date, excerpt, content) VALUES (?, ?, ?, ?, ?)").run(
    slugify(data.slug || data.title),
    data.title,
    data.date,
    data.excerpt,
    data.content
  );
}

export function updatePost(
  id: number,
  data: { slug: string; title: string; date: string; excerpt: string; content: string }
) {
  db.prepare("UPDATE posts SET slug = ?, title = ?, date = ?, excerpt = ?, content = ? WHERE id = ?").run(
    slugify(data.slug || data.title),
    data.title,
    data.date,
    data.excerpt,
    data.content,
    id
  );
}

export function deletePost(id: number) {
  db.prepare("DELETE FROM posts WHERE id = ?").run(id);
}

// Site settings
export function getSiteSettings(): SiteSettings {
  const row = db.prepare("SELECT * FROM site_settings WHERE id = 1").get() as Record<string, string>;
  return {
    nameLatin: row.name_latin,
    nameFa: row.name_fa,
    tagline: row.tagline,
    shortDescription: row.short_description,
    phone1: row.phone1,
    phone2: row.phone2,
    email: row.email,
    address: row.address,
    mapEmbedUrl: row.map_embed_url,
    workHours: row.work_hours,
    socialTelegram: row.social_telegram,
    socialInstagram: row.social_instagram,
    socialWhatsapp: row.social_whatsapp,
    socialLinkedin: row.social_linkedin,
  };
}

export function updateSiteSettings(data: SiteSettings) {
  db.prepare(
    `UPDATE site_settings SET name_latin = ?, name_fa = ?, tagline = ?, short_description = ?,
     phone1 = ?, phone2 = ?, email = ?, address = ?, map_embed_url = ?, work_hours = ?,
     social_telegram = ?, social_instagram = ?, social_whatsapp = ?, social_linkedin = ? WHERE id = 1`
  ).run(
    data.nameLatin,
    data.nameFa,
    data.tagline,
    data.shortDescription,
    data.phone1,
    data.phone2,
    data.email,
    data.address,
    data.mapEmbedUrl,
    data.workHours,
    data.socialTelegram,
    data.socialInstagram,
    data.socialWhatsapp,
    data.socialLinkedin
  );
}
