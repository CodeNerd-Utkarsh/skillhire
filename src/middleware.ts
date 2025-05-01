import { type NextRequest, NextResponse } from 'next/server';
import { verifyToken, type UserPayload } from '@/lib/auth';

const PROTECTED_ROUTES = {
  freelancer: ['/freelancer'],
  client: ['/client'],
};


function isPathProtected(pathname: string, role: keyof typeof PROTECTED_ROUTES): boolean {
  return PROTECTED_ROUTES[role].some(prefix => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('authToken')?.value;



  let user: UserPayload | null = null;
  if (token) {
    user = await verifyToken(token);

  }

  const isFreelancerRoute = isPathProtected(pathname, 'freelancer');
  const isClientRoute = isPathProtected(pathname, 'client');


  if ((isFreelancerRoute || isClientRoute) && !user) {

    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }


  if (user) {
    if (isFreelancerRoute && user.role !== 'freelancer') {

       return NextResponse.redirect(new URL('/client/dashboard', request.url));
    }
    if (isClientRoute && user.role !== 'client') {

        return NextResponse.redirect(new URL('/freelancer/dashboard', request.url));
    }
  }


  return NextResponse.next();
}


export const config = {
  matcher: [

    '/((?!api|_next/static|_next/image|favicon.ico|auth|services$|services/\\d+$|^/$).*)',

    '/freelancer/:path*',
    '/client/:path*',
  ],
};
