import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { parseStatus } from "@/lib/orders";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = Number((await ctx.params).id);
  if (!Number.isFinite(id)) return Response.json({ error: "Bad id" }, { status: 400 });

  const orders = await sql(
    `select o.*, p.name as product_name
     from orders o left join products p on p.id = o.product_id
     where o.id = $1`,
    [id],
  );
  const order = orders[0];
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });

  const payments = await sql(`select * from payments where order_id = $1 order by created_at asc`, [id]);
  const media = await sql(`select * from production_media where order_id = $1 order by created_at desc`, [id]);
  const shipments = await sql(`select * from shipments where order_id = $1 limit 1`, [id]);
  const products = await sql(`select id, name from products where active = true order by name asc`);

  return Response.json(
    { order, payments, media, shipment: shipments[0] ?? null, products },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function PATCH(request: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = Number((await ctx.params).id);
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const status = body.status != null ? parseStatus(String(body.status)) : null;
  if (body.status != null && !status) return Response.json({ error: "Bad status" }, { status: 400 });

  await sql(
    `update orders set
      status = coalesce($2, status),
      total_usd = coalesce($3, total_usd),
      notes = coalesce($4, notes),
      product_id = coalesce($5, product_id),
      updated_at = now()
     where id = $1`,
    [
      id,
      status,
      body.total_usd != null ? Math.round(Number(body.total_usd)) : null,
      body.notes != null ? String(body.notes) : null,
      body.product_id != null ? Number(body.product_id) : null,
    ],
  );
  return Response.json({ ok: true });
}
