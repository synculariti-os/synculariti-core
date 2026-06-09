import { Page } from '@playwright/test';
import {
  MOCK_USER_ID,
  MOCK_ACCESS_TOKEN,
  MOCK_REFRESH_TOKEN,
  MOCK_RESTAURANTS,
  MOCK_AUTH_PROFILE,
} from './mock-data';

// Must match the actual Supabase URL from the app's .env.local
const SUPABASE_URL = 'https://ooljbdretyikzdfoshjv.supabase.co';
const API = 'http://localhost:3001';

function mockSupabaseAuth(page: Page, sessionExists: boolean) {
  return Promise.all([
    page.route(`${SUPABASE_URL}/auth/v1/user`, (route) => {
      if (sessionExists) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: MOCK_USER_ID,
            email: 'admin@example.com',
            aud: 'authenticated',
            role: 'authenticated',
            app_metadata: { provider: 'email' },
            user_metadata: { full_name: 'Admin User' },
            confirmed_at: '2025-01-01T00:00:00Z',
            created_at: '2025-01-01T00:00:00Z',
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ user: null }),
        });
      }
    }),

    page.route(`${SUPABASE_URL}/auth/v1/token*`, (route) => {
      const url = new URL(route.request().url());
      const grantType = url.searchParams.get('grant_type');
      if (grantType === 'password' || grantType === 'refresh_token') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            access_token: MOCK_ACCESS_TOKEN,
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: MOCK_REFRESH_TOKEN,
            user: {
              id: MOCK_USER_ID,
              email: 'admin@example.com',
              aud: 'authenticated',
            },
          }),
        });
      } else {
        route.fulfill({ status: 400, body: 'Unsupported grant_type' });
      }
    }),

    page.route(`${SUPABASE_URL}/auth/v1/logout*`, (route) => {
      route.fulfill({ status: 204 });
    }),
  ]);
}

function mockBackendApi(page: Page) {
  return Promise.all([
    page.route(`${API}/**`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    }),

    page.route(`${API}/auth/me`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_AUTH_PROFILE }),
      });
    }),

    page.route(`${API}/tenant/context`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_RESTAURANTS }),
      });
    }),

    page.route(`${API}/auth/select-restaurant`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    }),

    page.route(`${API}/items`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 'item-001', name: 'Tomato', sku: 'VEG-001' },
            { id: 'item-002', name: 'Onion', sku: 'VEG-002' },
          ],
        }),
      });
    }),

    page.route(`${API}/procurement/vendors`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    }),

    page.route(`${API}/recipes`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    }),

    page.route(`${API}/tenant/restaurants`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_RESTAURANTS }),
      });
    }),
  ]);
}

export async function setupApiMocks(page: Page, sessionExists = false) {
  // Catch-all must be registered BEFORE specific routes.
  // Playwright uses "last registered wins", so we register the catch-all
  // for /api and /auth/v1 first, then the specific routes override.
  // Specific endpoints NOT covered by our mocks will cascade up to catch-alls.

  // Step 1: Catch-all for API endpoints (ensures ANY unmatched API route returns 200)
  await page.route(`${API}/**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });

  // Step 2: Specific backend API mocks (override catch-all)
  await mockBackendApi(page);

  // Step 3: Catch-all for Supabase auth (returns null user for any unmatched auth call)
  await page.route(`${SUPABASE_URL}/auth/v1/**`, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user: null }),
    });
  });

  // Step 4: Specific Supabase auth mocks (override catch-all)
  await mockSupabaseAuth(page, sessionExists);
}

export async function seedAuthState(page: Page, overrides?: {
  permissions?: string[];
  fullName?: string;
  restaurantId?: string | null;
  restaurantName?: string | null;
  franchiseGroupId?: string | null;
}) {
  const dataStr = JSON.stringify({
    state: {
      restaurantId: overrides && 'restaurantId' in overrides ? overrides.restaurantId : MOCK_AUTH_PROFILE.restaurantId,
      restaurantName: overrides && 'restaurantName' in overrides ? overrides.restaurantName : 'Downtown Bistro',
      franchiseGroupId: overrides?.franchiseGroupId ?? MOCK_AUTH_PROFILE.franchiseGroupId,
      permissions: overrides?.permissions ?? MOCK_AUTH_PROFILE.permissions,
      userEmail: MOCK_AUTH_PROFILE.email,
      userFullName: overrides?.fullName ?? MOCK_AUTH_PROFILE.fullName,
    },
    version: 0,
  });

  await page.addInitScript((str) => {
    localStorage.setItem('ims-auth-context', str);
  }, dataStr);
}

/**
 * Uses the global window.__supabase client (exposed in dev mode) to
 * restore a valid auth session. This is needed because @supabase/ssr
 * cookie-based session recovery doesn't work reliably with mocked routes.
 *
 * Must be called AFTER the page navigates to a URL where supabase.ts
 * has been loaded (so __supabase is available).
 */
export async function seedSupabaseSession(page: Page): Promise<boolean> {
  return page.evaluate(
    async ({ accessToken, refreshToken, userId, email }) => {
      const supabase = (window as any).__supabase;
      if (!supabase) return false;

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: {
          id: userId,
          email: email,
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: { provider: 'email' },
          user_metadata: { full_name: 'Admin User' },
          confirmed_at: '2025-01-01T00:00:00Z',
          created_at: '2025-01-01T00:00:00Z',
        },
      });
      return !error;
    },
    {
      accessToken: MOCK_ACCESS_TOKEN,
      refreshToken: MOCK_REFRESH_TOKEN,
      userId: MOCK_USER_ID,
      email: 'admin@example.com',
    },
  );
}

export async function clearAuthState(page: Page) {
  await page.addInitScript(() => {
    localStorage.removeItem('ims-auth-context');
  });
}

/**
 * Set the Supabase auth token cookie directly without needing __supabase.
 * This bypasses the need to first load a page that imports supabase.ts,
 * useful for roles (like Unknown) where the AppShell would cause a redirect loop.
 */
export async function seedSupabaseSessionCookie(page: Page) {
  const cookiePayload = {
    access_token: MOCK_ACCESS_TOKEN,
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: MOCK_REFRESH_TOKEN,
    user: {
      id: MOCK_USER_ID,
      email: 'admin@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: { provider: 'email' },
      user_metadata: { full_name: 'Admin User' },
      confirmed_at: '2025-01-01T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z',
    },
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  };
  const b64 = Buffer.from(JSON.stringify(cookiePayload)).toString('base64');
  const cookieValue = `base64-${b64}`;
  const cookieName = 'sb-ooljbdretyikzdfoshjv-auth-token';

  const context = page.context();
  await context.addCookies([
    {
      name: cookieName,
      value: cookieValue,
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
}
