import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/topics/:path*", "/packets/:path*", "/saved", "/calendar", "/settings", "/admin/:path*"]
};
