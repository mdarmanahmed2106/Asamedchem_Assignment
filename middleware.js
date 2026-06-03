import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // Public routes — always accessible
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    // Redirect logged-in users away from login page
    if (pathname === "/login" && user) {
      const dest = user.role === "ADMIN" ? "/admin/products" : "/seller/catalog";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  // Everything below requires authentication
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Role-based route protection
  if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/seller/catalog", req.url));
  }

  if (pathname.startsWith("/seller") && user.role !== "SELLER") {
    return NextResponse.redirect(new URL("/admin/products", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
