import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseProxyClient } from "@/lib/supabase/proxy";

const ADMIN_SUBDOMAIN = "admin";
const AUTH_REQUIRED_PATHS = ["/dashboard", "/admin"];
const PUBLIC_PATHS = ["/login", "/api/webhooks", "/api/inngest"];

export function extractSubdomain(host: string): string | null {
  const hostname = host.split(":")[0];

  if (hostname.endsWith(".localhost")) {
    const parts = hostname.split(".");
    return parts[0] === "localhost" ? null : parts[0];
  }

  if (hostname.endsWith(".127.0.0.1.nip.io")) {
    const parts = hostname.split(".");
    return parts[0];
  }

  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "ticktu.com";
  if (hostname.endsWith(`.${appDomain}`)) {
    const subdomain = hostname.replace(`.${appDomain}`, "");
    return subdomain || null;
  }

  return null;
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host");
  const { pathname } = request.nextUrl;
  if (!host) {
    return NextResponse.next();
  }

  const subdomain = extractSubdomain(host);

  // No subdomain — redirect to login (no marketing page yet)
  if (!subdomain) {
    if (!isPublicPath(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Admin subdomain
  if (subdomain === ADMIN_SUBDOMAIN) {
    requestHeaders.set("x-surface", "admin");

    // Auth check for admin routes (skip public paths like /login)
    if (!isPublicPath(pathname)) {
      const supabase = createSupabaseProxyClient(request, response);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Verify super_admin role
      const role = user.app_metadata?.role;
      if (role !== "super_admin") {
        return new NextResponse("Forbidden", { status: 403 });
      }

      requestHeaders.set("x-user-id", user.id);
      requestHeaders.set("x-user-role", "super_admin");
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Producer subdomain
  requestHeaders.set("x-tenant-slug", subdomain);

  // Dashboard routes require producer_admin auth
  if (pathname.startsWith("/dashboard")) {
    requestHeaders.set("x-surface", "dashboard");

    const supabase = createSupabaseProxyClient(request, response);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verify tenant_id matches subdomain's tenant
    const tenantId = user.app_metadata?.tenant_id;
    if (!tenantId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    requestHeaders.set("x-tenant-id", tenantId);
    requestHeaders.set("x-user-id", user.id);
    requestHeaders.set("x-user-role", user.app_metadata?.role ?? "producer_admin");

    // Rewrite /dashboard/... → /... so (dashboard) route group pages match
    const dashboardPath = pathname.replace(/^\/dashboard/, "") || "/";
    const rewriteUrl = new URL(dashboardPath, request.url);
    const rewriteResponse = NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });

    // Carry over cookies from supabase auth refresh
    for (const cookie of response.cookies.getAll()) {
      rewriteResponse.cookies.set(cookie.name, cookie.value, cookie);
    }
    return rewriteResponse;
  }

  // Public paths — pass through without rewrite
  if (isPublicPath(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Buyer surface — rewrite / → /{slug} so (buyer)/[slug] pages match
  requestHeaders.set("x-surface", "buyer");
  const buyerPath = `/${subdomain}${pathname}`;
  const rewriteUrl = new URL(buyerPath, request.url);
  return NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
