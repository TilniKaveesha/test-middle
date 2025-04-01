// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { Role } from "@/types/auth";

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const { pathname } = request.nextUrl;
    const token = request.nextauth.token;

    // Redirect to sign-in if no token
    if (!token) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // Redirect to correct dashboard based on role when accessing the root path
    if (pathname === "/") {
      const redirectMap: Record<Role, string> = {
        admin: "/admin",
        suser: "/Suser",
        user: "/user",
      };

      return NextResponse.redirect(new URL(redirectMap[token.role as Role] || "/sign-in", request.url));
    }

    // Role-based route protection
    if (pathname.startsWith("/admin") && token.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (pathname.startsWith("/Suser") && token.role !== "suser") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (pathname.startsWith("/user") && token.role !== "user") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/sign-in",
      error: "/auth/error",
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up).*)",
  ],
};
