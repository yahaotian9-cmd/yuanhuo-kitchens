import { loginCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { password?: string };
  const cookie = loginCookie(String(body.password || ""));
  if (!cookie) {
    return Response.json({ error: "Wrong password." }, { status: 401 });
  }
  const res = Response.json({ ok: true });
  res.headers.append(
    "set-cookie",
    `${cookie.name}=${cookie.value}; Path=${cookie.path}; Max-Age=${cookie.maxAge}; HttpOnly; SameSite=Lax${cookie.secure ? "; Secure" : ""}`,
  );
  return res;
}
