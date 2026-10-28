import { NextResponse, type NextRequest } from "next/server";
import { getSessionAdminId, sessionCookie } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const adminId = await getSessionAdminId(
    request.cookies.get(sessionCookie.name)?.value,
  );
  if (adminId) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Sesi tidak valid. Silakan login." }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/kwitansi/:path*",
    "/api/pelanggan/:path*",
    "/api/pengaturan/:path*",
  ],
};
