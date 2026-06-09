import { createContractTest } from '@/lib/contract-test';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { vi } from 'vitest';

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: vi.fn(),
}));

import { createServerSupabaseClient } from '@/lib/supabase-server';

describe('GET /api/ims/items', () => {
  const contract = createContractTest('/items', 'GET');
  const mockSupabase = {
    auth: {
      getSession: vi.fn(),
    },
    rpc: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
            })),
          })),
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
    
    const request = new NextRequest(new URL('/api/ims/items', 'http://localhost'));
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 403 when tenant not found', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ 
      data: { session: { user: { id: 'user-1' } } } 
    });
    mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: 'Not found' } });
    
    const request = new NextRequest(new URL('/api/ims/items', 'http://localhost'));
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(403);
    expect(data.error).toBe('Tenant not found');
  });

  it('returns items matching contract schema', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ 
      data: { session: { user: { id: 'user-1' } } } 
    });
    mockSupabase.rpc.mockResolvedValue({ data: 'tenant-1', error: null });
    
    const mockItems = [
      { id: 'item-1', category_id: 'cat-1', name: 'Item 1', sku: 'SKU-001', type: 'INGREDIENTS', purchasing_uom: 'lb', inventory_uom: 'lb', recipe_uom: null, inv_to_recipe_ratio: 1.0, is_active: true, par_level: 10, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
      { id: 'item-2', category_id: 'cat-1', name: 'Item 2', sku: 'SKU-002', type: 'PACKAGING', purchasing_uom: 'each', inventory_uom: 'each', recipe_uom: null, inv_to_recipe_ratio: 1.0, is_active: true, par_level: 5, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    ];
    
    const chainMock = {
      eq: vi.fn(() => chainMock),
      order: vi.fn(() => chainMock),
      range: vi.fn(() => Promise.resolve({ data: mockItems, error: null, count: 2 })),
    };
    mockSupabase.from.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn(() => Promise.resolve({ data: mockItems, error: null, count: 2 })),
            })),
          })),
        })),
      })),
    });

    const request = new NextRequest(new URL('/api/ims/items', 'http://localhost'));
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.items).toBeDefined();
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.pagination).toBeDefined();
    
    const contract = createContractTest('/items', 'GET');
    const validation = contract.validateResponse('200', data);
    expect(validation.success).toBe(true);
  });

  it('supports pagination parameters', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ 
      data: { session: { user: { id: 'user-1' } } } 
    });
    mockSupabase.rpc.mockResolvedValue({ data: 'tenant-1', error: null });
    
    // Create a full mock chain that matches the actual supabase calls
    const mockData = [];
    const mockRange = vi.fn(() => Promise.resolve({ data: mockData, error: null, count: 0 }));
    const mockOrder = vi.fn(() => ({ range: mockRange }));
    const mockEq2 = vi.fn(() => ({ order: mockOrder }));
    const mockEq1 = vi.fn(() => ({ eq: mockEq2 }));
    const mockSelect = vi.fn(() => ({ eq: mockEq1 }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));
    
    mockSupabase.from.mockImplementation(mockFrom);

    const request = new NextRequest(new URL('/api/ims/items?page=2&limit=10', 'http://localhost'));
    await GET(request);
    
    // Debug
    console.log('from calls:', mockFrom.mock.calls);
    console.log('select calls:', mockSelect.mock.calls);
    console.log('eq1 calls:', mockEq1.mock.calls);
    console.log('eq2 calls:', mockEq2.mock.calls);
    console.log('order calls:', mockOrder.mock.calls);
    console.log('range calls:', mockRange.mock.calls);
    
    // range is called with (from, to) where from = (page-1)*limit = 10, to = from + limit - 1 = 19
    expect(mockRange).toHaveBeenCalledWith(10, 19);
  });
});