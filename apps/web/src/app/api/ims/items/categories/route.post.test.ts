import { createContractTest } from '@/lib/contract-test';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { vi } from 'vitest';

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: vi.fn(),
}));

import { createServerSupabaseClient } from '@/lib/supabase-server';

describe('POST /api/ims/items/categories', () => {
  const contract = createContractTest('/items/categories', 'POST');
  const mockSupabase = {
    auth: {
      getSession: vi.fn(),
    },
    rpc: vi.fn(),
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createServerSupabaseClient as vi.Mock).mockResolvedValue(mockSupabase);
  });

  it('returns 401 when no session', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    
    const request = new NextRequest(new URL('/api/ims/items/categories', 'http://localhost'), {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Category' }),
    });
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 403 when tenant not found', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ 
      data: { session: { user: { id: 'user-1' } } } 
    });
    mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: 'Not found' } });
    
    const request = new NextRequest(new URL('/api/ims/items/categories', 'http://localhost'), {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Category' }),
    });
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(403);
    expect(data.error).toBe('Tenant not found');
  });

  it('returns 400 for invalid body', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ 
      data: { session: { user: { id: 'user-1' } } } 
    });
    mockSupabase.rpc.mockResolvedValue({ data: 'tenant-1', error: null });
    
    const request = new NextRequest(new URL('/api/ims/items/categories', 'http://localhost'), {
      method: 'POST',
      body: JSON.stringify({ name: '' }), // invalid: empty name
    });
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation error');
  });

  it('creates category matching contract schema', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ 
      data: { session: { user: { id: 'user-1' } } } 
    });
    mockSupabase.rpc.mockResolvedValue({ data: 'tenant-1', error: null });
    
    const mockCategory = {
      id: 'new-cat-1',
      name: 'New Category',
      description: 'Test category',
      item_type: 'INGREDIENTS',
      category_group: 'Produce',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    
    mockSupabase.from.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockCategory, error: null })),
        })),
      })),
    });

    const request = new NextRequest(new URL('/api/ims/items/categories', 'http://localhost'), {
      method: 'POST',
      body: JSON.stringify({ 
        name: 'New Category',
        description: 'Test category',
        itemType: 'INGREDIENTS',
        categoryGroup: 'Produce',
      }),
    });
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.name).toBe('New Category');
    expect(data.itemType).toBe('INGREDIENTS');
    
    const contract = createContractTest('/items/categories', 'POST');
    const validation = contract.validateResponse('201', data);
    expect(validation.success).toBe(true);
  });
});