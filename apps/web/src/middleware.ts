import { type NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@synculariti/shared-supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const PUBLIC_PATHS = ['/login', '/_next', '/favicon', '/brand/', '/manifest.json', '/icon.png', '/file.svg', '/globe.svg', '/window.svg', '/vercel.svg'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p));
}

function isApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

function isBuildTime(): boolean {
  return !supabaseUrl || !supabaseKey;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname) || isApiPath(pathname)) {
    return NextResponse.next();
  }

  if (isBuildTime()) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const supabase = createServerSupabaseClient({
    getAll: () => request.cookies.getAll(),
    setAll: (cookiesToSet) => {
      cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
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
