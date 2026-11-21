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
    `insert into products (slug, name, summary, body_type, length_m, base_price_usd, cover_url, active)
     values
     ('fry-trailer', 'Fry trailer', 'Two-basket fry line with pack counter at the glass.', 'trailer', 5.2, 22000, '', true),
     ('grill-trailer', 'Grill trailer', 'Flat top facing the queue, bottles on the tongue.', 'trailer', 6.0, 26500, '', true),
     ('window-cart', 'Window cart', 'Coffee or one countertop fryer. No hitch.', 'cart', 2.2, 8500, '', true)`,
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
     (1, 'photo', 'Shell welded', 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2ddf?w=1200'),
     (1, 'video', 'Walkaround clip', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')`,
  );
  await db.query(
    `insert into shipments (order_id, carrier, tracking_no, etd, eta, status, last_event)
     values (1, 'Demo Line', 'DEMOCNQING001', current_date + 3, current_date + 28, 'preparing', 'Booking requested with forwarder')`,
  );
}
