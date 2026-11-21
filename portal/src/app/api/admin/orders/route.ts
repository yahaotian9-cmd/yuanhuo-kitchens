import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { makeOrderCode, parseStatus } from "@/lib/orders";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const orders = await sql(
    `select o.id, o.code, o.customer_name, o.company, o.country, o.email, o.status, o.total_usd, o.updated_at,
            p.name as product_name
     from orders o
     left join products p on p.id = o.product_id
     order by o.updated_at desc`,
  );
  return Response.json({ orders }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const customer_name = String(body.customer_name || "").trim();
  const country = String(body.country || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  if (!customer_name || !country || !email) {
    return Response.json({ error: "Name, country, and email are required." }, { status: 400 });
  }
  const code = makeOrderCode();
  const rows = await sql(
    `insert into orders (code, product_id, customer_name, company, country, email, whatsapp, config_json, status, total_usd, notes)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     returning id, code`,
    [
      code,
      body.product_id ? Number(body.product_id) : null,
      customer_name,
      String(body.company || ""),
      country,
      email,
      String(body.whatsapp || ""),
      JSON.stringify(body.config_json || {}),
      parseStatus(String(body.status || "inquiry")) || "inquiry",
      Math.max(0, Math.round(Number(body.total_usd || 0))),
      String(body.notes || ""),
    ],
  );
  return Response.json({ order: rows[0] }, { status: 201 });
}
