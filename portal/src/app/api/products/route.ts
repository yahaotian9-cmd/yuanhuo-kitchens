import { sql } from "@/lib/db";
import type { ProductRecord } from "@/lib/products";

export async function GET() {
  const rows = await sql<ProductRecord>(
    `select id, slug, sku, name, name_zh, summary, summary_zh, description,
      body_type, category, length_m, width_m, height_m,
      base_price_usd, price_high_usd, moq, lead_days, compliance,
      cover_url, gallery_json, specs_json, featured, sort_order, updated_at
     from products
     where status = 'published'
     order by featured desc, sort_order asc, updated_at desc`,
  );
  return Response.json(
    { products: rows },
    {
      headers: {
        "cache-control": "no-store",
        "access-control-allow-origin": "*",
      },
    },
  );
}
