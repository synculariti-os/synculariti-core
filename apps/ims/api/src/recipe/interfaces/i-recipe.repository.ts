import type {
  Recipe,
  RecipeIngredient,
  RecipeId,
  RestaurantId,
} from '@synculariti/types';
import type { UpdateRecipeDto } from '@synculariti/validators';
import type { CreateRecipeCommand } from './i-recipe.service';

export interface IRecipeRepository {
  findAllRecipes(restaurantId: RestaurantId): Promise<Recipe[]>;
  findAllMappings(restaurantId: RestaurantId): Promise<import('@synculariti/types').MenuItemMapping[]>;
  findById(recipeId: RecipeId): Promise<Recipe | null>;
  findByProducesItemId(itemId: string): Promise<Recipe | null>;
  findByRecipeName(recipeName: string): Promise<Recipe | null>;
  findIngredients(recipeId: RecipeId): Promise<RecipeIngredient[]>;
  resolveByPosString(restaurantId: RestaurantId, rawString: string): Promise<Recipe | null>;
  resolveRecipesByPosStrings(restaurantId: RestaurantId, rawStrings: string[]): Promise<import('@synculariti/types').MenuItemMapping[]>;
  getUnmappedRows(restaurantId: RestaurantId, batchId: string): Promise<Array<{ id: string; rawItemName: string; quantitySold: number }>>;
  create(data: CreateRecipeCommand): Promise<Recipe>;
  update(recipeId: RecipeId, dto: UpdateRecipeDto): Promise<Recipe>;
  deleteRecipe(recipeId: RecipeId): Promise<void>;
  upsertMapping(restaurantId: RestaurantId, rawString: string, recipeId: RecipeId): Promise<void>;
  deleteMapping(mappingId: string): Promise<void>;
}
