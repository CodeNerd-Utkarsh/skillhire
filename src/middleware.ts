import { type NextRequest, NextResponse } from 'next/server';
import { verifyToken, type UserPayload } from '@/lib/auth'; // Assuming your auth functions are here

const PROTECTED_ROUTES = {
  freelancer: ['/freelancer'],
  client: ['/client'],
};

// Helper function to check if path matches protected prefixes
function isPathProtected(pathname: string, role: keyof typeof PROTECTED_ROUTES): boolean {
  return PROTECTED_ROUTES[role].some(prefix => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('authToken')?.value; // Example: Get token from cookie

  console.log(`Middleware: Path=${pathname}, Token found=${!!token}`);

  let user: UserPayload | null = null;
  if (token) {
    user = await verifyToken(token); // Verify the token
    console.log(`Middleware: User verified=${!!user}, Role=${user?.role}`);
  }

  const isFreelancerRoute = isPathProtected(pathname, 'freelancer');
  const isClientRoute = isPathProtected(pathname, 'client');

  // Redirect to login if trying to access protected routes without being logged in
  if ((isFreelancerRoute || isClientRoute) && !user) {
    console.log(`Middleware: Redirecting to login (unauthenticated access to ${pathname})`);
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname); // Optional: redirect back after login
    return NextResponse.redirect(loginUrl);
  }

  // Redirect if wrong role tries to access protected routes
  if (user) {
    if (isFreelancerRoute && user.role !== 'freelancer') {
       console.log(`Middleware: Redirecting to client dashboard (client accessing freelancer route ${pathname})`);
       return NextResponse.redirect(new URL('/client/dashboard', request.url));
    }
    if (isClientRoute && user.role !== 'client') {
        console.log(`Middleware: Redirecting to freelancer dashboard (freelancer accessing client route ${pathname})`);
        return NextResponse.redirect(new URL('/freelancer/dashboard', request.url));
    }
  }

  // Allow request to proceed if none of the above conditions met
   console.log(`Middleware: Allowing access to ${pathname}`);
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (login/signup pages)
     * - services/ (public service browsing) - Allow public access to root and details
     * - / (homepage)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth|services$|services/\\d+$|^/$).*)',
    // Explicitly include top-level protected routes if needed, though the pattern above should cover them
    '/freelancer/:path*',
    '/client/:path*',
  ],
};