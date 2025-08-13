
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect to dashboard if authenticated user tries to access auth pages
    if (token && (path.startsWith("/auth") || path === "/")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Check role-based access
    const userRole = token?.role;
    
    // Owner has access to everything
    if (userRole === "OWNER") {
      return NextResponse.next();
    }

    // Role-based route protection
    const roleRoutes: Record<string, string[]> = {
      "/employees": ["ADMIN_GENERAL", "RECLUTADOR"],
      "/finances": ["ADMIN_GENERAL", "FINANZAS"],
      "/payments": [
        "ENCARGADO_PAGO_MEXICO",
        "ENCARGADO_PAGO_PERU", 
        "ENCARGADO_PAGO_COLOMBIA",
        "ENCARGADO_PAGO_ZELLE",
        "AT_CLIENTE"
      ],
      "/chetadores": ["ADMIN_GENERAL", "CHETADORES"],
    };

    // Check if current path requires specific roles
    for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
      if (path.startsWith(route)) {
        if (!allowedRoles.includes(userRole as string)) {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Allow access to auth pages without token
        if (path.startsWith("/auth")) {
          return true;
        }
        
        // Require token for all other pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
