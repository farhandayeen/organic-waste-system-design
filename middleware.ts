import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(request) {
    const token = request.nextauth.token;
    const { pathname } = request.nextUrl;

    // Define protected routes by role
    const protectedRoutes = {
      '/app/member': ['member', 'admin_bumdes', 'super_admin'],
      '/app/admin': ['admin_bumdes', 'super_admin'],
      '/app/super-admin': ['super_admin'],
    } as const;

    type ProtectedRoute = keyof typeof protectedRoutes;

    // Check if route is protected
    const isProtectedRoute = Object.keys(protectedRoutes).some((route) =>
      pathname.startsWith(route)
    );

    if (!isProtectedRoute) {
      return NextResponse.next();
    }

    // Check if user has access to this route
    const route = (Object.keys(protectedRoutes) as ProtectedRoute[]).find((r) =>
      pathname.startsWith(r)
    );
    const userRole = token?.role as string | undefined;

    if (route && userRole) {
      const allowedRoles: readonly string[] = protectedRoutes[route];
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/app/:path*',
  ],
};
