import { logoutCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const res = NextResponse.redirect(new URL("/admin", url.origin));
  const cookie = logoutCookie();
  res.cookies.set(cookie.name, cookie.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: cookie.secure,
    path: "/",
    maxAge: 0,
  });
  return res;
}
