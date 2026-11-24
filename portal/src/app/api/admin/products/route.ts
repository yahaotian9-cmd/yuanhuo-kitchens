import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  normalizeStatus,
  sanitizeGallery,
  sanitizeSpecs,
  slugify,
  type ProductRecord,
} from "@/lib/products";

const SELECT_COLS = `id, slug, sku, name, name_zh, summary, summary_zh, description,
  body_type, category, length_m, width_m, height_m,
  base_price_usd, price_high_usd, moq, lead_days, compliance,
  cover_url, gallery_json, specs_json, status, active, featured, sort_order, updated_at`;

export async function GET(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const status = (searchParams.get("status") || "").trim();
  const bodyType = (searchParams.get("body_type") || "").trim();

  const rows = await sql<ProductRecord>(
    `select ${SELECT_COLS}
     from products
     order by featured desc, sort_order asc, updated_at desc`,
  );

  const filtered = rows.filter((row) => {
    if (status && status !== "all" && row.status !== status) return false;
    if (bodyType && bodyType !== "all" && row.body_type !== bodyType) return false;
    if (q) {
      const hay = `${row.name} ${row.name_zh} ${row.sku} ${row.slug} ${row.summary} ${row.summary_zh}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const counts = {
    all: rows.length,
    published: rows.filter((r) => r.status === "published").length,
    draft: rows.filter((r) => r.status === "draft").length,
    archived: rows.filter((r) => r.status === "archived").length,
    featured: rows.filter((r) => r.featured).length,
  };

  return Response.json({ products: filtered, counts }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name || "").trim();
  const nameZh = String(body.name_zh || "").trim();
  if (!name && !nameZh) {
    return Response.json({ error: "请至少填写商品名称（英文或中文）。" }, { status: 400 });
  }
  const finalName = name || nameZh;
  const baseSlug = slugify(String(body.slug || finalName || "product")) || `product-${Date.now()}`;

  // Ensure unique slug when duplicating or colliding
  let slug = baseSlug;
  const existing = await sql<{ slug: string }>("select slug from products where slug = $1", [slug]);
  if (existing.length > 0) {
    slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
  }

  const bodyType = body.body_type === "cart" || body.body_type === "truck" ? body.body_type : "trailer";
  const lengthM = Math.max(1.2, Math.min(12, Number(body.length_m || 5.2) || 5.2));
  const widthM = Math.max(1.0, Math.min(3.5, Number(body.width_m || 2.1) || 2.1));
  const heightM = Math.max(1.5, Math.min(4.0, Number(body.height_m || 2.4) || 2.4));
  const basePrice = Math.max(0, Math.round(Number(body.base_price_usd || 0) || 0));
  const priceHigh = Math.max(basePrice, Math.round(Number(body.price_high_usd || 0) || 0));
  const moq = Math.max(1, Math.round(Number(body.moq || 1) || 1));
  const status = normalizeStatus(body.status, body.active);
  const gallery = sanitizeGallery(body.gallery ?? (body.cover_url ? [body.cover_url] : []));
  const coverUrl = String(body.cover_url || "").trim() || gallery[0] || "";
  if (coverUrl && !gallery.includes(coverUrl)) gallery.unshift(coverUrl);
  const specs = sanitizeSpecs(body.specs);
  const skuPrefix = bodyType === "cart" ? "TH-CT" : bodyType === "truck" ? "TH-TK" : "TH-TR";
  const sku = String(body.sku || "").trim() || `${skuPrefix}-${Math.round(lengthM * 100)}`;

  const rows = await sql<ProductRecord>(
    `insert into products (
      slug, sku, name, name_zh, summary, summary_zh, description,
      body_type, category, length_m, width_m, height_m,
      base_price_usd, price_high_usd, moq, lead_days, compliance,
      cover_url, gallery_json, specs_json, status, active, featured, sort_order
    )
    values (
      $1,$2,$3,$4,$5,$6,$7,
      $8,$9,$10,$11,$12,
      $13,$14,$15,$16,$17,
      $18,$19,$20,$21,$22,$23,$24
    )
    returning ${SELECT_COLS}`,
    [
      slug,
      sku,
      finalName,
      nameZh,
      String(body.summary || "").trim(),
      String(body.summary_zh || "").trim(),
      String(body.description || "").trim(),
      bodyType,
      String(body.category || "mixed").trim(),
      lengthM,
      widthM,
      heightM,
      basePrice,
      priceHigh,
      moq,
      String(body.lead_days || "25–40 days").trim(),
      String(body.compliance || "").trim(),
      coverUrl,
      JSON.stringify(gallery),
      JSON.stringify(specs),
      status,
      status === "published",
      Boolean(body.featured),
      Math.round(Number(body.sort_order ?? 100) || 100),
    ],
  );
  return Response.json({ product: rows[0] }, { status: 201 });
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  // Batch status update
  if (Array.isArray(body.ids) && body.ids.length > 0 && body.status) {
    const ids = body.ids.map((n) => Number(n)).filter((n) => Number.isFinite(n));
    const status = normalizeStatus(body.status);
    if (ids.length === 0) return Response.json({ error: "No valid ids." }, { status: 400 });
    for (const id of ids) {
      await sql(`update products set status = $2, active = $3, updated_at = now() where id = $1`, [
        id,
        status,
        status === "published",
      ]);
    }
    return Response.json({ ok: true, updated: ids.length });
  }

  const id = Number(body.id);
  if (!Number.isFinite(id)) return Response.json({ error: "Missing id." }, { status: 400 });

  const status = body.status != null || body.active != null ? normalizeStatus(body.status, body.active) : null;
  const gallery = body.gallery != null ? sanitizeGallery(body.gallery) : null;
  const coverUrl =
    body.cover_url != null
      ? String(body.cover_url).trim()
      : gallery != null
        ? gallery[0] || ""
        : null;
  const specs = body.specs != null ? sanitizeSpecs(body.specs) : null;
  const slug = body.slug != null ? slugify(String(body.slug)) || null : null;

  const rows = await sql<ProductRecord>(
    `update products set
      slug = coalesce($2, slug),
      sku = coalesce($3, sku),
      name = coalesce($4, name),
      name_zh = coalesce($5, name_zh),
      summary = coalesce($6, summary),
      summary_zh = coalesce($7, summary_zh),
      description = coalesce($8, description),
      body_type = coalesce($9, body_type),
      category = coalesce($10, category),
      length_m = coalesce($11, length_m),
      width_m = coalesce($12, width_m),
      height_m = coalesce($13, height_m),
      base_price_usd = coalesce($14, base_price_usd),
      price_high_usd = coalesce($15, price_high_usd),
      moq = coalesce($16, moq),
      lead_days = coalesce($17, lead_days),
      compliance = coalesce($18, compliance),
      cover_url = coalesce($19, cover_url),
      gallery_json = coalesce($20, gallery_json),
      specs_json = coalesce($21, specs_json),
      status = coalesce($22, status),
      active = coalesce($23, active),
      featured = coalesce($24, featured),
      sort_order = coalesce($25, sort_order),
      updated_at = now()
     where id = $1
     returning ${SELECT_COLS}`,
    [
      id,
      slug,
      body.sku != null ? String(body.sku).trim() : null,
      body.name != null ? String(body.name).trim() : null,
      body.name_zh != null ? String(body.name_zh).trim() : null,
      body.summary != null ? String(body.summary).trim() : null,
      body.summary_zh != null ? String(body.summary_zh).trim() : null,
      body.description != null ? String(body.description).trim() : null,
      body.body_type != null ? String(body.body_type) : null,
      body.category != null ? String(body.category) : null,
      body.length_m != null ? Number(body.length_m) : null,
      body.width_m != null ? Number(body.width_m) : null,
      body.height_m != null ? Number(body.height_m) : null,
      body.base_price_usd != null ? Math.max(0, Math.round(Number(body.base_price_usd))) : null,
      body.price_high_usd != null ? Math.max(0, Math.round(Number(body.price_high_usd))) : null,
      body.moq != null ? Math.max(1, Math.round(Number(body.moq))) : null,
      body.lead_days != null ? String(body.lead_days).trim() : null,
      body.compliance != null ? String(body.compliance).trim() : null,
      coverUrl,
      gallery != null ? JSON.stringify(gallery) : null,
      specs != null ? JSON.stringify(specs) : null,
      status,
      status != null ? status === "published" : null,
      body.featured != null ? Boolean(body.featured) : null,
      body.sort_order != null ? Math.round(Number(body.sort_order)) : null,
    ],
  );
  return Response.json({ ok: true, product: rows[0] ?? null });
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const rawIds = Array.isArray(body.ids) ? body.ids : body.id != null ? [body.id] : [];
  const ids = rawIds.map((n) => Number(n)).filter((n) => Number.isFinite(n));
  if (ids.length === 0) return Response.json({ error: "Missing id." }, { status: 400 });
  for (const id of ids) {
    await sql("delete from products where id = $1", [id]);
  }
  return Response.json({ ok: true, deleted: ids.length });
}
