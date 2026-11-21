import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const orderId = Number((await ctx.params).id);
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const kind = String(body.kind || "deposit");
  const amount = Math.round(Number(body.amount_usd || 0));
  if (!amount || amount < 0) return Response.json({ error: "Amount required" }, { status: 400 });
  const rows = await sql(
    `insert into payments (order_id, kind, amount_usd, method, reference, paid_at, note)
     values ($1,$2,$3,$4,$5,$6,$7) returning id`,
    [
      orderId,
      kind,
      amount,
      String(body.method || "TT"),
      String(body.reference || ""),
      body.paid_at ? String(body.paid_at) : null,
      String(body.note || ""),
    ],
  );
  await sql(`update orders set updated_at = now() where id = $1`, [orderId]);
  return Response.json({ payment: rows[0] }, { status: 201 });
}
