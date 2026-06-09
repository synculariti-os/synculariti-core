import { NextRequest, NextResponse } from 'next/server';
import { createContractTest } from '@/lib/contract-test';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { z } from 'zod';

const contract = createContractTest('/items', 'GET');
const createContract = createContractTest('/items', 'POST');

const createItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1),
  sku: z.string().min(1),
  type: z.enum(['INGREDIENTS', 'PACKAGING', 'MERCHANDISE', 'SUPPLY', 'MISCELLANEOUS']),
  purchasingUom: z.string().min(1),
  inventoryUom: z.string().min(1),
  recipeUom: z.string().min(1).nullable().default(null),
  invToRecipeRatio: z.number().positive().default(1.0),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  const contractTest = createContractTest('/items', 'GET');
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  
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

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: items, error, count } = await supabase
      .from('items')
      .select('id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio, is_active, par_level, created_at, updated_at', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('name')
      .range(from, to);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const responseData = {
      items: (items || []).map((item: any) => ({
        id: item.id,
        categoryId: item.category_id,
        name: item.name,
        sku: item.sku,
        type: item.type,
        purchasingUom: item.purchasing_uom,
        inventoryUom: item.inventory_uom,
        recipeUom: item.recipe_uom,
        invToRecipeRatio: item.inv_to_recipe_ratio,
        isActive: item.is_active,
        parLevel: item.par_level,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };

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
  const contractTest = createContractTest('/items', 'POST');
  
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
    const parsed = createItemSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: parsed.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { data: item, error } = await supabase
      .from('items')
      .insert({
        category_id: parsed.data.categoryId,
        name: parsed.data.name,
        sku: parsed.data.sku,
        type: parsed.data.type,
        purchasing_uom: parsed.data.purchasingUom,
        inventory_uom: parsed.data.inventoryUom,
        recipe_uom: parsed.data.recipeUom,
        inv_to_recipe_ratio: parsed.data.invToRecipeRatio,
        is_active: parsed.data.isActive,
        tenant_id: tenantId,
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const responseData = {
      id: item.id,
      categoryId: item.category_id,
      name: item.name,
      sku: item.sku,
      type: item.type,
      purchasingUom: item.purchasing_uom,
      inventoryUom: item.inventory_uom,
      recipeUom: item.recipe_uom,
      invToRecipeRatio: item.inv_to_recipe_ratio,
      isActive: item.is_active,
      parLevel: item.par_level,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
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