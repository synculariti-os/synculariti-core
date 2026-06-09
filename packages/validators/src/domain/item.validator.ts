import { z } from 'zod';

/**
 * Client-facing schema for item creation.
 * Ownership (franchiseGroupId / restaurantId) is intentionally EXCLUDED —
 * it is resolved server-side from the authenticated JWT context (R-ARCH-02).
 * The DB `item_owner_xor` constraint is enforced in ItemService, not here.
 */
export const createItemSchema = z.object({
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

export const updateItemSchema = createItemSchema.partial();

export const createUomConversionSchema = z.object({
  itemId: z.string().uuid(),
  fromUom: z.string().min(1),
  toUom: z.string().min(1),
  multiplierFactor: z.number().positive(),
});

export const itemTypeEnum = z.enum(['INGREDIENTS', 'PACKAGING', 'MERCHANDISE', 'SUPPLY', 'MISCELLANEOUS']);

export const CATEGORY_GROUPS: Record<string, string[]> = {
  INGREDIENTS: ['Produce', 'Meat & Poultry', 'Dairy & Eggs', 'Bakery', 'Sauces & Condiments', 'Seasoning', 'Cooking Essentials', 'Frozen Ingredients', 'Others'],
  PACKAGING: ['Food Containers', 'Drink Packaging', 'Wrapping', 'Carryout', 'Portioning', 'Others'],
  MERCHANDISE: ['Beverages', 'Ready-to-Eat Food', 'Retail Add-ons', 'Others'],
  SUPPLY: ['Cleaning', 'Hygiene', 'Paper Goods', 'Kitchen Consumables', 'Others'],
  MISCELLANEOUS: ['Uncategorized', 'Others'],
};

const baseCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  itemType: itemTypeEnum.optional().nullable(),
  categoryGroup: z.string().optional().nullable(),
});

export const createCategorySchema = baseCategorySchema;
export const updateCategorySchema = baseCategorySchema.partial();

export const updateItemOverrideSchema = z.object({
  parLevel: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const deleteItemsBulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export const deleteCategoriesBulkSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export type DeleteItemsBulkDto = z.infer<typeof deleteItemsBulkSchema>;
export type DeleteCategoriesBulkDto = z.infer<typeof deleteCategoriesBulkSchema>;

export type CreateItemDto = z.infer<typeof createItemSchema>;
export type UpdateItemDto = z.infer<typeof updateItemSchema>;
export type CreateUomConversionDto = z.infer<typeof createUomConversionSchema>;
export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
export type UpdateItemOverrideDto = z.infer<typeof updateItemOverrideSchema>;

