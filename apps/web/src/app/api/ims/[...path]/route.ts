import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

const NESTJS_BASE_URL = process.env.NESTJS_API_URL || 'http://localhost:3001';

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
  method: string,
) {
  const { path } = await params;
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const pathname = path.join('/');
  const searchString = request.nextUrl.search;
  const url = `${NESTJS_BASE_URL}/${pathname}${searchString}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const restaurantId = request.headers.get('x-restaurant-id');
  if (restaurantId) {
    headers['x-restaurant-id'] = restaurantId;
  }

  const body = method !== 'GET' && method !== 'HEAD' ? await request.text() : undefined;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body || undefined,
    });

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return NextResponse.json(
      { error: 'Backend service unavailable', message: 'Could not connect to API server' },
      { status: 503 },
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handler(request, { params }, 'GET');
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handler(request, { params }, 'POST');
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handler(request, { params }, 'PUT');
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handler(request, { params }, 'PATCH');
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handler(request, { params }, 'DELETE');
}
