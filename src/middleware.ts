import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

import { canAccessRoute } from "@/lib/route-permissions"
import type { Role } from "@prisma/client"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  if (!isLoggedIn && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // RBAC Enforcement for dashboard routes
  if (isLoggedIn && pathname !== "/login" && !pathname.startsWith("/api")) {
    const userRole = req.auth?.user?.role as Role | undefined
    if (userRole && !canAccessRoute(pathname, userRole)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
