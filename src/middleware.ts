
import { NextResponse, type NextRequest } from 'next/server';

const protectedRoutes = ['/apps', '/chat', '/notes', '/tasks', '/files', '/ai-hub', '/contacts', '/earnings', '/profile', '/inventory', '/store', '/assistant' ];
const publicRoutes = ['/login', '/signup', '/forgot-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let static files and API routes pass through
  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/') || pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // This is a simplified check. In a real-world scenario with server-side rendering,
  // you would verify a session cookie here. Since this app uses client-side auth state,
  // the middleware's main job is just to distinguish between public and protected URL patterns
  // and let the client-side logic in AppLayout handle the final redirection after Firebase auth initializes.

  // If trying to access a protected route without being "logged in" (from the server's perspective),
  // redirect to login. The client-side will then take over.
  if (protectedRoutes.some(path => pathname.startsWith(path))) {
    // Let the client-side checks in AppLayout handle the final auth state
    return NextResponse.next();
  }
  
  // Allow access to public routes
  if (publicRoutes.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // For the root path, let the client-side logic in `page.tsx` handle the redirect.
  if (pathname === '/') {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
