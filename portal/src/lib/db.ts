import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
let pool: pg.Pool | undefined;
let local: Promise<PGlite> | undefined;

export function usingSampleDb() {
  return databaseUrl === "";
}

export async function sql<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  if (databaseUrl !== "") {
    pool ??= new pg.Pool({ connectionString: databaseUrl, max: 5 });
    return (await pool.query(text, params)).rows as T[];
  }
  local ??= startLocal().catch((error: unknown) => {
    local = undefined;
    throw error;
  });
  return (await (await local).query<T>(text, params)).rows;
}

async function startLocal(): Promise<PGlite> {
  const db = new PGlite();
  const files = (await readdir("migrations").catch(() => [])).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files) {
    await db.exec(await readFile(`migrations/${file}`, "utf8"));
  }
  const existing = await db.query<{ c: number }>("select count(*)::int as c from products");
  if ((existing.rows[0]?.c ?? 0) === 0) {
    await seed(db);
  }
  return db;
}

async function seed(db: PGlite) {
  await db.query(
    `insert into products (
      slug, sku, name, name_zh, summary, summary_zh, description,
      body_type, category, length_m, width_m, height_m,
      base_price_usd, price_high_usd, moq, lead_days, compliance,
      cover_url, gallery_json, specs_json, status, active, featured, sort_order
    )
     values
     (
       'fry-trailer', 'TH-TR-520', 'Fry trailer', '5.2米双篮炸炉餐车',
       'Two-basket fry line with pack counter at the glass and cold storage by the door.',
       '双篮炸炉产线，出餐台紧贴玻璃窗口，冷藏区靠近补货门。',
       'Full 304 stainless steel interior, twin-axle AL-KO brake chassis, commercial exhaust hood with fire-rated baffle filters, pre-wired for EU 230V/50Hz or US 120/240V/60Hz.',
       'trailer', 'fried', 5.2, 2.1, 2.5,
       19500, 26800, 1, '28–35 days', 'EU CE, US DOT/NSF, UK',
       '/hero-banner.jpg', '["/hero-banner.jpg"]',
       '[{"k":"Food contact","v":"304 stainless steel"},{"k":"Axle","v":"Twin axle w/ electric brake"},{"k":"Water system","v":"2×60L fresh + 120L grey"},{"k":"Power","v":"230V/50Hz or 120/240V/60Hz"}]',
       'published', true, true, 10
     ),
     (
       'grill-trailer', 'TH-TR-600', 'Grill trailer', '6.0米明档铁板烧烤拖车',
       'Flat top faces the queue. LPG cylinder cage mounted on the tongue, clear of the glass.',
       '明档铁板朝向排队动线，液化气钢瓶笼置于拖杆位置，远离玻璃窗口。',
       'Built for high-throughput burger, smash-grill, and street BBQ menus. Heavy-duty 2.5m hood, double prep chiller, anti-slip aluminum tread plate floor.',
       'trailer', 'grill', 6.0, 2.2, 2.5,
       23500, 31500, 1, '30–40 days', 'EU CE, US DOT/NSF, GCC',
       '/hero-banner.jpg', '["/hero-banner.jpg"]',
       '[{"k":"Heat","v":"LPG griddle + charbroiler"},{"k":"Ventilation","v":"2.5m commercial hood"},{"k":"Crew","v":"3–4 operators"},{"k":"Floor","v":"Anti-slip aluminum tread"}]',
       'published', true, true, 20
     ),
     (
       'window-cart', 'TH-CT-220', 'Window cart', '2.2米咖啡窗口手推车',
       'Coffee, crepes, or one countertop fryer. Compact footprint with no hitch needed.',
       '适合咖啡、可丽饼或单台面设备，无拖钩设计，轻松进驻商场与集市。',
       'Lightweight insulated composite shell with fold-down customer shelf, dual 25L water tanks, under-counter beverage fridge bay, and plug-in shore power breaker box.',
       'cart', 'coffee', 2.2, 1.6, 2.2,
       7800, 11200, 1, '18–25 days', 'EU CE, UK, AU ADR',
       '', '[]',
       '[{"k":"Power","v":"Single-phase 230V/50Hz"},{"k":"Water","v":"2×25L tanks + hot tap"},{"k":"Crew","v":"1–2 operators"}]',
       'published', true, false, 30
     ),
     (
       'chassis-body-450', 'TH-TK-450', 'Chassis kitchen body 4.5m', '4.5米卡车上装餐车厢体',
       'Drop-on custom kitchen box engineered for your locally registered truck chassis.',
       '可直接匹配客户当地已上牌的卡车底盘，按底盘图纸定制副车架与水电。',
       'Supplied with full mounting subframe, LED awning strip, pass-through cab window option, and export crate packing for 40HQ container loading.',
       'truck', 'mixed', 4.5, 2.1, 2.3,
       16800, 22900, 1, '25–35 days', 'EU CE, GCC, AU ADR',
       '', '[]',
       '[{"k":"Supply scope","v":"Kitchen body only (no truck cab)"},{"k":"Shipping","v":"1 unit per 40HQ container"}]',
       'draft', false, false, 40
     )`,
  );
  await db.query(
    `insert into orders (code, product_id, customer_name, company, country, email, whatsapp, config_json, status, total_usd, notes)
     values
     ('YH-2401', 1, 'Ana Costa', 'Costa Street Co', 'Portugal', 'ana@costa.example', '+351900000000',
      '{"menu":"fried","length":5.2}', 'producing', 24000, 'Sample order for local demo'),
     ('YH-2402', 2, 'Omar Hassan', 'Gulf Bites', 'UAE', 'omar@gulfbites.example', '+971500000000',
      '{"menu":"grill","length":6.0}', 'deposit', 28000, 'Deposit received')`,
  );
  await db.query(
    `insert into payments (order_id, kind, amount_usd, method, reference, paid_at, note)
     values
     (1, 'deposit', 7200, 'TT', 'SWIFT-DEMO-1', current_date - 20, '30% deposit'),
     (1, 'progress', 9600, 'TT', 'SWIFT-DEMO-2', current_date - 5, '40% after shell photos'),
     (2, 'deposit', 8400, 'TT', 'SWIFT-DEMO-3', current_date - 3, '30% deposit')`,
  );
  await db.query(
    `insert into production_media (order_id, kind, title, url)
     values
     (1, 'photo', 'Shell welded', '/hero-banner.jpg'),
     (1, 'video', 'Walkaround clip', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')`,
  );
  await db.query(
    `insert into shipments (order_id, carrier, tracking_no, etd, eta, status, last_event)
     values (1, 'Demo Line', 'DEMOCNQING001', current_date + 3, current_date + 28, 'preparing', 'Booking requested with forwarder')`,
  );
}
