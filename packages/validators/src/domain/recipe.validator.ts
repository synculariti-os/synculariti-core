import { z } from 'zod';

export const recipeIngredientSchema = z.union([
  z.object({
    lineType: z.literal('ingredient'),
    ingredientItemId: z.string().uuid(),
    subRecipeId: z.null().optional(),
    quantityRequired: z.number().positive(),
  }),
  z.object({
    lineType: z.literal('sub_recipe'),
    subRecipeId: z.string().uuid(),
    ingredientItemId: z.null().optional(),
    quantityRequired: z.number().positive(),
  }),
]);
export type RecipeIngredientDto = z.infer<typeof recipeIngredientSchema>;

export const createRecipeSchema = z.object({
  producesItemId: z.string().uuid().nullable().optional(),
  recipeName: z.string().min(1),
  yieldQuantity: z.number().positive(),
  priceEur: z.number().min(0).nullable().optional(),
  vatRate: z.number().min(0).max(100).nullable().optional(),
  ingredients: z.array(recipeIngredientSchema).min(1),
});
export type CreateRecipeDto = z.infer<typeof createRecipeSchema>;

export const updateRecipeSchema = z.object({
  yieldQuantity: z.number().positive().optional(),
  priceEur: z.number().min(0).nullable().optional(),
  vatRate: z.number().min(0).max(100).nullable().optional(),
  ingredients: z.array(recipeIngredientSchema).min(1).optional(),
});
export type UpdateRecipeDto = z.infer<typeof updateRecipeSchema>;

export const menuItemMappingSchema = z.object({
  rawExcelString: z.string().min(1),
  recipeId: z.string().uuid(),
});
export type MenuItemMappingDto = z.infer<typeof menuItemMappingSchema>;
