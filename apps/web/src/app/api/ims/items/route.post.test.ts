import { createContractTest } from '@/lib/contract-test';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { vi } from 'vitest';

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: vi.fn(),
}));

import { createServerSupabaseClient } from '@/lib/supabase-server';

describe('POST /api/ims/items', () => {
  const contract = createContractTest('/items', 'POST');
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
    
    const request = new NextRequest(new URL('/api/ims/items', 'http://localhost'), {
      method: 'POST',
      body: JSON.stringify({ 
        categoryId: 'cat-1',
        name: 'Test Item',
        sku: 'SKU-001',
        type: 'INGREDIENTS',
        purchasingUom: 'lb',
        inventoryUom: 'lb',
      }),
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
    
    const request = new NextRequest(new URL('/api/ims/items', 'http://localhost'), {
      method: 'POST',
      body: JSON.stringify({ 
        categoryId: 'cat-1',
        name: 'Test Item',
        sku: 'SKU-001',
        type: 'INGREDIENTS',
        purchasingUom: 'lb',
        inventoryUom: 'lb',
      }),
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
    
    const request = new NextRequest(new URL('/api/ims/items', 'http://localhost'), {
      method: 'POST',
      body: JSON.stringify({ name: '' }), // invalid: missing required fields
    });
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation error');
  });

  it('creates item matching contract schema', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ 
      data: { session: { user: { id: 'user-1' } } } 
    });
    mockSupabase.rpc.mockResolvedValue({ data: 'tenant-1', error: null });
    
    const mockItem = {
      id: '00000000-0000-0000-0000-000000000002',
      category_id: '00000000-0000-0000-0000-000000000001',
      name: 'New Item',
      sku: 'SKU-001',
      type: 'INGREDIENTS',
      purchasing_uom: 'lb',
      inventory_uom: 'lb',
      recipe_uom: null,
      inv_to_recipe_ratio: 1.0,
      is_active: true,
      par_level: 10,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    
    mockSupabase.from.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockItem, error: null })),
        })),
      })),
    });

    const request = new NextRequest(new URL('/api/ims/items', 'http://localhost'), {
      method: 'POST',
      body: JSON.stringify({ 
        categoryId: '00000000-0000-0000-0000-000000000001',
        name: 'New Item',
        sku: 'SKU-001',
        type: 'INGREDIENTS',
        purchasingUom: 'lb',
        inventoryUom: 'lb',
      }),
    });
    const response = await POST(request);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    expect(response.status).toBe(201);
    expect(data.name).toBe('New Item');
    expect(data.type).toBe('INGREDIENTS');
    
    const contract = createContractTest('/items', 'POST');
    const validation = contract.validateResponse('201', data);
    expect(validation.success).toBe(true);
  });
});