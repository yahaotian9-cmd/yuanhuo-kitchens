import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const orderId = Number((await ctx.params).id);
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const existing = await sql(`select id from shipments where order_id = $1`, [orderId]);
  if (existing[0]) {
    await sql(
      `update shipments set
        carrier = $2, tracking_no = $3, etd = $4, eta = $5, status = $6, last_event = $7, updated_at = now()
       where order_id = $1`,
      [
        orderId,
        String(body.carrier || ""),
        String(body.tracking_no || ""),
        body.etd ? String(body.etd) : null,
        body.eta ? String(body.eta) : null,
        String(body.status || "preparing"),
        String(body.last_event || ""),
      ],
    );
  } else {
    await sql(
      `insert into shipments (order_id, carrier, tracking_no, etd, eta, status, last_event)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [
        orderId,
        String(body.carrier || ""),
        String(body.tracking_no || ""),
        body.etd ? String(body.etd) : null,
        body.eta ? String(body.eta) : null,
        String(body.status || "preparing"),
        String(body.last_event || ""),
      ],
    );
  }

  if (body.mark_shipped === true) {
    await sql(`update orders set status = 'shipped', updated_at = now() where id = $1`, [orderId]);
  } else {
    await sql(`update orders set updated_at = now() where id = $1`, [orderId]);
  }

  return Response.json({ ok: true });
}
