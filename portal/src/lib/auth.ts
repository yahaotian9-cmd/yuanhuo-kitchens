import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "yh_admin";

function secrets() {
  const password = process.env.ADMIN_PASSWORD?.trim() || "demo";
  const session = process.env.SESSION_SECRET?.trim() || `local-${password}`;
  return { password, session, isSample: !process.env.ADMIN_PASSWORD?.trim() };
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function authMeta() {
  const { isSample } = secrets();
  return { isSample, hint: isSample ? "demo" : null };
}

export async function isAdmin() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return false;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return false;
  const { session } = secrets();
  const expected = sign(payload, session);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  if (payload !== "admin") return false;
  return true;
}

export async function requireAdmin() {
  if (!(await isAdmin())) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

function shouldBeSecure(request?: Request) {
  if (!request) return process.env.NODE_ENV === "production";
  const proto = request.headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  return request.url.startsWith("https://");
}

export function loginCookie(password: string, request?: Request) {
  const { password: expected, session } = secrets();
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const value = `admin.${sign("admin", session)}`;
  return {
    name: COOKIE,
    value,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: shouldBeSecure(request),
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  };
}

export function logoutCookie(request?: Request) {
  return {
    name: COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: shouldBeSecure(request),
    path: "/",
    maxAge: 0,
  };
}
