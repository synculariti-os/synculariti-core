import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const PUBLIC_PATHS = ['/login', '/_next', '/favicon', '/brand/', '/manifest.json', '/icon.png', '/file.svg', '/globe.svg', '/window.svg', '/vercel.svg'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p));
}

function isApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

// Check if we're in a build-time context (no Supabase credentials available)
function isBuildTime(): boolean {
  return !supabaseUrl || !supabaseKey || supabaseUrl === '' || supabaseKey === '';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname) || isApiPath(pathname)) {
    return NextResponse.next();
  }

  // Skip auth during build time
  if (isBuildTime()) {
    console.log('[middleware] Skipping auth during build time for:', pathname);
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          response.cookies.set(name, value);
        });
      },
    },
  });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
