import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const rows = await sql(
    `select id, slug, name, summary, body_type, length_m, base_price_usd, cover_url, active, updated_at
     from products order by updated_at desc`,
  );
  return Response.json({ products: rows }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const slug = String(body.slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");
  const name = String(body.name || "").trim();
  if (!slug || !name) return Response.json({ error: "Slug and name are required." }, { status: 400 });
  const rows = await sql(
    `insert into products (slug, name, summary, body_type, length_m, base_price_usd, cover_url, active)
     values ($1,$2,$3,$4,$5,$6,$7,$8)
     returning id, slug, name`,
    [
      slug,
      name,
      String(body.summary || ""),
      String(body.body_type || "trailer"),
      Number(body.length_m || 5.2),
      Math.max(0, Math.round(Number(body.base_price_usd || 0))),
      String(body.cover_url || ""),
      body.active !== false,
    ],
  );
  return Response.json({ product: rows[0] }, { status: 201 });
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = Number(body.id);
  if (!Number.isFinite(id)) return Response.json({ error: "Missing id." }, { status: 400 });
  await sql(
    `update products set
      name = coalesce($2, name),
      summary = coalesce($3, summary),
      body_type = coalesce($4, body_type),
      length_m = coalesce($5, length_m),
      base_price_usd = coalesce($6, base_price_usd),
      cover_url = coalesce($7, cover_url),
      active = coalesce($8, active),
      updated_at = now()
     where id = $1`,
    [
      id,
      body.name != null ? String(body.name) : null,
      body.summary != null ? String(body.summary) : null,
      body.body_type != null ? String(body.body_type) : null,
      body.length_m != null ? Number(body.length_m) : null,
      body.base_price_usd != null ? Math.round(Number(body.base_price_usd)) : null,
      body.cover_url != null ? String(body.cover_url) : null,
      body.active != null ? Boolean(body.active) : null,
    ],
  );
  return Response.json({ ok: true });
}
