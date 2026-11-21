import { sql } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = (request.nextUrl.searchParams.get("code") || "").trim();
  const email = (request.nextUrl.searchParams.get("email") || "").trim().toLowerCase();
  if (!code || !email) {
    return Response.json({ error: "Order code and email are required." }, { status: 400 });
  }

  const orders = await sql<{
    id: number;
    code: string;
    customer_name: string;
    company: string;
    country: string;
    status: string;
    total_usd: number;
    product_name: string | null;
    updated_at: string;
  }>(
    `select o.id, o.code, o.customer_name, o.company, o.country, o.status, o.total_usd, o.updated_at,
            p.name as product_name
     from orders o
     left join products p on p.id = o.product_id
     where o.code = $1 and lower(o.email) = $2
     limit 1`,
    [code, email],
  );
  const order = orders[0];
  if (!order) {
    return Response.json({ error: "No order matches that code and email." }, { status: 404 });
  }

  const payments = await sql(
    `select kind, amount_usd, method, reference, paid_at::text as paid_at
     from payments where order_id = $1 order by created_at asc`,
    [order.id],
  );
  const media = await sql(
    `select kind, title, url, created_at::text as created_at
     from production_media where order_id = $1 order by created_at desc`,
    [order.id],
  );
  const shipments = await sql(
    `select carrier, tracking_no, etd::text as etd, eta::text as eta, status, last_event
     from shipments where order_id = $1 limit 1`,
    [order.id],
  );

  return Response.json(
    {
      order: {
        code: order.code,
        customer_name: order.customer_name,
        company: order.company,
        country: order.country,
        status: order.status,
        total_usd: order.total_usd,
        product_name: order.product_name,
        updated_at: order.updated_at,
      },
      payments,
      media,
      shipment: shipments[0] ?? null,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
