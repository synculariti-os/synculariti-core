import { NextRequest, NextResponse } from 'next/server';
import { createContractTest } from '@/lib/contract-test';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { z } from 'zod';

const contract = createContractTest('/items/categories', 'GET');

const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  itemType: z.enum(['INGREDIENTS', 'PACKAGING', 'MERCHANDISE', 'SUPPLY', 'MISCELLANEOUS']).optional().nullable(),
  categoryGroup: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const contractTest = createContractTest('/items/categories', 'GET');
  const searchParams = request.nextUrl.searchParams;
  const itemType = searchParams.get('itemType') || undefined;
  
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: tenantId, error: tenantErr } = await supabase.rpc('get_my_tenant');
    if (tenantErr || !tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 403 });
    }

    let query = supabase
      .from('item_categories')
      .select('id, name, description, item_type, category_group, created_at, updated_at')
      .eq('tenant_id', tenantId)
      .order('name');
    
    if (itemType) {
      query = query.eq('item_type', itemType);
    }
    
    const { data: categories, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const responseData = (categories || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      itemType: cat.item_type,
      categoryGroup: cat.category_group,
      createdAt: cat.created_at,
      updatedAt: cat.updated_at,
    }));

    const validation = contractTest.validateResponse('200', responseData);
    if (!validation.success) {
      console.error('Contract validation failed:', validation.error);
    }

    return NextResponse.json(responseData);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const contractTest = createContractTest('/items/categories', 'POST');
  
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: tenantId, error: tenantErr } = await supabase.rpc('get_my_tenant');
    if (tenantErr || !tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: parsed.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { data: category, error } = await supabase
      .from('item_categories')
      .insert({
        name: parsed.data.name,
        description: parsed.data.description,
        item_type: parsed.data.itemType,
        category_group: parsed.data.categoryGroup,
        tenant_id: tenantId,
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const responseData = {
      id: category.id,
      name: category.name,
      description: category.description,
      itemType: category.item_type,
      categoryGroup: category.category_group,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
    };

    const validation = contractTest.validateResponse('201', responseData);
    if (!validation.success) {
      console.error('Contract validation failed:', validation.error);
    }

    return NextResponse.json(responseData, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}