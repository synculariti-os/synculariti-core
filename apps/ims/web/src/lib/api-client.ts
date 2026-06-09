import { supabase as _supabase } from './supabase';
import { useAuthStore } from '../store/use-auth-store';

// Use global __supabase when available (E2E tests) so that all chunks
// reference the same client instance — setSession() persists across
// dynamic import boundaries.
function getSupabase() {
  if (typeof window !== 'undefined' && (window as any).__supabase) {
    return (window as any).__supabase;
  }
  return _supabase;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type FetchOptions = Omit<RequestInit, 'body'> & {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  responseType?: 'json' | 'blob' | 'text';
};

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const supabase = getSupabase();
  const result = await supabase.auth.getSession();
  const session = result.data.session;

  if (!session || result.error) {
    await supabase.auth.signOut().catch(() => {});
    useAuthStore.getState().clearContext();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please sign in again.');
  }

  const { restaurantId } = useAuthStore.getState();
  
  const headers = new Headers(options.headers);
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }
  if (restaurantId) {
    headers.set('x-restaurant-id', restaurantId);
  }
  
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    options.body = JSON.stringify(options.body) as string;
  }

  let url = `${API_URL}${endpoint}`;
  
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, String(value));
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const fetchOptions = {
    ...options,
    headers,
  } as RequestInit;

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const errorData = await response.json();
      if (typeof errorData.message === 'string') {
        errorMsg = errorData.message;
      } else if (typeof errorData.error === 'string') {
        errorMsg = errorData.error;
      } else if (typeof errorData.error?.message === 'string') {
        errorMsg = errorData.error.message;
      } else {
        errorMsg = JSON.stringify(errorData) || errorMsg;
      }
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(errorMsg);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  if (options.responseType === 'blob') {
    return response.blob() as Promise<T>;
  }
  if (options.responseType === 'text') {
    return response.text() as Promise<T>;
  }
  return response.json();
}
