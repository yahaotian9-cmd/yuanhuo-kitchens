import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

const MAX_PHOTO = 1_800_000; // ~1.8MB base64 budget

export async function POST(request: Request, ctx: Ctx) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const orderId = Number((await ctx.params).id);
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const kind = String(body.kind || "photo");
  const title = String(body.title || "").trim();
  let url = String(body.url || "").trim();

  if (kind === "photo") {
    if (!url.startsWith("data:image/")) {
      return Response.json({ error: "Photos must be uploaded as image data URLs, or use kind=video with a link." }, { status: 400 });
    }
    if (url.length > MAX_PHOTO) {
      return Response.json({ error: "Photo too large. Keep under ~1.3MB file size." }, { status: 400 });
    }
  } else if (kind === "video") {
    if (!/^https?:\/\//i.test(url)) {
      return Response.json({ error: "Video must be an https link (YouTube, Drive, etc.)." }, { status: 400 });
    }
  } else {
    return Response.json({ error: "kind must be photo or video" }, { status: 400 });
  }

  const rows = await sql(
    `insert into production_media (order_id, kind, title, url) values ($1,$2,$3,$4) returning id`,
    [orderId, kind, title, url],
  );
  await sql(`update orders set status = case when status in ('deposit','producing') then 'ready' else status end, updated_at = now() where id = $1`, [
    orderId,
  ]);
  return Response.json({ media: rows[0] }, { status: 201 });
}
