import type { BomExpansion, Recipe, RecipeIngredient, RecipeId, RestaurantId, MenuItemMapping } from '@synculariti/types';
import type { CreateRecipeDto, UpdateRecipeDto, MenuItemMappingDto, RecipeIngredientDto } from '@synculariti/validators';
import type { FranchiseGroupId } from '@synculariti/types';

export type CreateRecipeCommand = {
  producesItemId?: string | null;
  recipeName: string;
  yieldQuantity: number;
  priceEur?: number | null;
  vatRate?: number | null;
  ingredients: RecipeIngredientDto[];
  restaurantId: RestaurantId | null;
  franchiseGroupId: FranchiseGroupId | null;
};

export interface IRecipeService {
  listRecipes(restaurantId: RestaurantId): Promise<Recipe[]>;
  listMappings(restaurantId: RestaurantId): Promise<MenuItemMapping[]>;
  expandBOM(recipeId: RecipeId, soldQty: number): Promise<BomExpansion>;
  resolveRecipeByPosString(restaurantId: RestaurantId, rawString: string): Promise<Recipe | null>;
  resolveRecipesByPosStrings(restaurantId: RestaurantId, rawStrings: string[]): Promise<MenuItemMapping[]>;
  getIngredients(recipeId: RecipeId): Promise<RecipeIngredient[]>;
  createRecipe(dto: CreateRecipeDto, restaurantId: RestaurantId | null, franchiseGroupId: string | null): Promise<Recipe>;
  bulkCreateRecipes(
    rows: Array<{
      producesItemSku: string;
      producesItemName: string | null;
      categoryName: string | null;
      recipeName: string | null;
      yieldQuantity: number;
      priceEur: number | null;
      vatRate: number | null;
      ingredientSku: string;
      ingredientName: string | null;
      quantityRequired: number;
      uom: string | null;
    }>,
    restaurantId: RestaurantId | null,
    franchiseGroupId: string | null,
  ): Promise<{ createdCount: number; skippedCount: number; errors: Array<{ row: number; message: string }> }>;
  updateRecipe(recipeId: RecipeId, dto: UpdateRecipeDto): Promise<Recipe>;
  deleteRecipe(recipeId: RecipeId): Promise<void>;
  createMenuItemMapping(restaurantId: RestaurantId, dto: MenuItemMappingDto): Promise<void>;
  deleteMapping(mappingId: string): Promise<void>;
  getUnmappedRows(restaurantId: RestaurantId, batchId: string): Promise<Array<{ id: string; rawItemName: string; quantitySold: number }>>;
}

export const RECIPE_SERVICE_TOKEN = Symbol('IRecipeService');
