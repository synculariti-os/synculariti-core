import { NextRequest, NextResponse } from 'next/server';
import { createContractTest } from '@/lib/contract-test';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { z } from 'zod';

const getContract = createContractTest('/items/{id}', 'GET');
const putContract = createContractTest('/items/{id}', 'PUT');
const deleteContract = createContractTest('/items/{id}', 'DELETE');

const updateItemSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(1).optional(),
  sku: z.string().min(1).optional(),
  type: z.enum(['INGREDIENTS', 'PACKAGING', 'MERCHANDISE', 'SUPPLY', 'MISCELLANEOUS']).optional(),
  purchasingUom: z.string().min(1).optional(),
  inventoryUom: z.string().min(1).optional(),
  recipeUom: z.string().min(1).nullable().optional(),
  invToRecipeRatio: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

function getIdFromRequest(request: NextRequest): string {
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split('/');
  return segments[segments.length - 1];
}

export async function GET(request: NextRequest) {
  const contractTest = createContractTest('/items/{id}', 'GET');
  const id = getIdFromRequest(request);
  
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: tenantId, error: tenantErr } = await (supabase.rpc('get_my_tenant') as any) as { data: string | null; error: any };
    if (tenantErr || !tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 403 });
    }

    const { data: item, error } = await supabase
      .from('items')
      .select('id, category_id, name, sku, type, purchasing_uom, inventory_uom, recipe_uom, inv_to_recipe_ratio, is_active, par_level, created_at, updated_at')
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
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

export async function PUT(request: NextRequest) {
  const contractTest = createContractTest('/items/{id}', 'PUT');
  const id = getIdFromRequest(request);
  
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: tenantId, error: tenantErr } = await (supabase.rpc('get_my_tenant') as any) as { data: string | null; error: any };
    if (tenantErr || !tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateItemSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: parsed.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const updateData: Record<string, any> = {};
    if (parsed.data.categoryId) updateData.category_id = parsed.data.categoryId;
    if (parsed.data.name) updateData.name = parsed.data.name;
    if (parsed.data.sku) updateData.sku = parsed.data.sku;
    if (parsed.data.type) updateData.type = parsed.data.type;
    if (parsed.data.purchasingUom) updateData.purchasing_uom = parsed.data.purchasingUom;
    if (parsed.data.inventoryUom) updateData.inventory_uom = parsed.data.inventoryUom;
    if (parsed.data.recipeUom !== undefined) updateData.recipe_uom = parsed.data.recipeUom;
    if (parsed.data.invToRecipeRatio !== undefined) updateData.inv_to_recipe_ratio = parsed.data.invToRecipeRatio;
    if (parsed.data.isActive !== undefined) updateData.is_active = parsed.data.isActive;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data: item, error } = await (supabase
      .from('items')
      .update(updateData as any) as any)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
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

export async function DELETE(request: NextRequest) {
  const contractTest = createContractTest('/items/{id}', 'DELETE');
  const id = getIdFromRequest(request);
  
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: tenantId, error: tenantErr } = await (supabase.rpc('get_my_tenant') as any) as { data: string | null; error: any };
    if (tenantErr || !tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 403 });
    }

    const { error } = await (supabase
      .from('items')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenantId) as any);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const validation = contractTest.validateResponse('204', null);
    if (!validation.success) {
      console.error('Contract validation failed:', validation.error);
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}