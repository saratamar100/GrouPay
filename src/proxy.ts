import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAuthToken } from "@/app/services/server/auth";

const PROTECTED_PAGES = ["/groups", "/dashboard", "/profile"];
const PROTECTED_API = ["/api/groups", "/api/dashboard", "/api/profile"];

function isProtected(pathname: string, paths: string[]) {
  return paths.some((path) => pathname.startsWith(path));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value || null;

  const isPage = isProtected(pathname, PROTECTED_PAGES);
  const isApi = isProtected(pathname, PROTECTED_API);

  console.log("MIDDLEWARE >>>", {
    pathname,
    isPage,
    isApi,
    hasToken: !!token,
  });

  if (!isPage && !isApi) {
    return NextResponse.next();
  }

  if (!token) {
    console.log("MIDDLEWARE BLOCK (no token) >>>", pathname);

    if (isApi) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized - No token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  const payload = await verifyAuthToken(token);

  if (!payload) {
    console.log("MIDDLEWARE BLOCK (invalid token) >>>", pathname);

    if (isApi) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized - Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  console.log("MIDDLEWARE ALLOW >>>", pathname, "userId:", payload.userId);

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/groups/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/api/groups/:path*",
    "/api/dashboard/:path*",
    "/api/profile/:path*",
  ],
};
