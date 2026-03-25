export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/topics/:path*", "/packets/:path*", "/saved", "/calendar", "/settings", "/admin/:path*"]
};
