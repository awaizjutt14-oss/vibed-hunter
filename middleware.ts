import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LANDING_HOSTS = new Set(["vibed.media", "www.vibed.media"]);

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host")?.split(":")[0].toLowerCase() ?? "";

  if (LANDING_HOSTS.has(hostname) && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/landing";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|.*\\..*).*)"]
};
