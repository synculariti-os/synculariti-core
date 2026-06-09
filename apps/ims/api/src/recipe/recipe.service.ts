import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';

import type {
  Recipe,
  RecipeIngredient,
  BomExpansion,
  RecipeId,
  RestaurantId,
} from '@synculariti/types';
import { asItemId } from '@synculariti/types';
import type { IRecipeService, CreateRecipeCommand } from './interfaces/i-recipe.service';
import type { CreateRecipeDto, UpdateRecipeDto, MenuItemMappingDto } from '@synculariti/validators';
import type { IRecipeRepository } from './interfaces/i-recipe.repository';
import type { IItemWriteService } from '../item/interfaces/i-item.service';
import { ITEM_WRITE_SERVICE_TOKEN } from '../item/interfaces/i-item.service';

export const RECIPE_REPOSITORY_TOKEN = Symbol('IRecipeRepository');

@Injectable()
export class RecipeService implements IRecipeService {
  constructor(
    @Inject(RECIPE_REPOSITORY_TOKEN) private readonly recipeRepo: IRecipeRepository,
    @Inject(ITEM_WRITE_SERVICE_TOKEN) private readonly itemService: IItemWriteService,
  ) {}

  async listRecipes(restaurantId: RestaurantId): Promise<Recipe[]> {
    return this.recipeRepo.findAllRecipes(restaurantId);
  }

  async listMappings(restaurantId: RestaurantId): Promise<import('@synculariti/types').MenuItemMapping[]> {
    return this.recipeRepo.findAllMappings(restaurantId);
  }

  async expandBOM(recipeId: RecipeId, soldQty: number): Promise<BomExpansion> {
    if (soldQty <= 0) {
      throw new BadRequestException('soldQty must be positive');
    }

    const recipe = await this.recipeRepo.findById(recipeId);
    if (!recipe) {
      throw new NotFoundException(`Recipe ${recipeId} not found`);
    }

    const ingredients = await this.recipeRepo.findIngredients(recipeId);

    if (ingredients.length === 0) {
      return [];
    }

    const scaleFactor = soldQty / recipe.yieldQuantity;
    const result: BomExpansion = [];

    for (const ing of ingredients) {
      if (ing.ingredientItemId) {
        // Raw ingredient
        result.push({
          itemId: ing.ingredientItemId,
          consumedQty: ing.quantityRequired * scaleFactor,
        });
      } else if (ing.subRecipeId) {
        // Sub-recipe: recursively expand it
        const subExpansion = await this.expandBOM(ing.subRecipeId, ing.quantityRequired * scaleFactor);
        result.push(...subExpansion);
      }
    }

    return result;
  }

  async resolveRecipeByPosString(
    restaurantId: RestaurantId,
    rawString: string,
  ): Promise<Recipe | null> {
    return this.recipeRepo.resolveByPosString(restaurantId, rawString);
  }

  async resolveRecipesByPosStrings(
    restaurantId: RestaurantId,
    rawStrings: string[],
  ): Promise<import('@synculariti/types').MenuItemMapping[]> {
    return this.recipeRepo.resolveRecipesByPosStrings(restaurantId, rawStrings);
  }

  async getIngredients(recipeId: RecipeId): Promise<RecipeIngredient[]> {
    return this.recipeRepo.findIngredients(recipeId);
  }

  async bulkCreateRecipes(
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
  ): Promise<{ createdCount: number; skippedCount: number; errors: Array<{ row: number; message: string }> }> {
    const errors: Array<{ row: number; message: string }> = [];
    let createdCount = 0;
    let skippedCount = 0;

    const resolvedRestaurantId = restaurantId ?? null;

    // Group rows by recipe key (producesItemSku || recipeName)
    const groups = new Map<string, typeof rows>();
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const key = row.producesItemSku || row.recipeName || `__row_${i}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    }

    for (const [key, groupRows] of groups) {
      const firstRow = groupRows[0];
      try {
        let producesItemId: string | null = null;
        let recipeName: string | null = firstRow.recipeName;

        if (firstRow.producesItemSku) {
          producesItemId = await this.itemService.ensureItemDependencies(
            {
              sku: firstRow.producesItemSku,
              name: firstRow.producesItemName || firstRow.recipeName || firstRow.producesItemSku,
              categoryName: firstRow.categoryName || 'General',
              type: 'INGREDIENTS',
              uom: firstRow.uom || undefined,
            },
            resolvedRestaurantId,
            franchiseGroupId,
          );

          if (!recipeName) {
            recipeName = firstRow.producesItemName || firstRow.producesItemSku;
          }
        }

        if (!recipeName) {
          errors.push({ row: 0, message: `Recipe "${key}" has no recipe name` });
          continue;
        }

        // Check for existing recipe to avoid duplicates
        const existingRecipe = producesItemId
          ? await this.recipeRepo.findByProducesItemId(producesItemId)
          : recipeName
            ? await this.recipeRepo.findByRecipeName(recipeName)
            : null;

        if (existingRecipe) {
          skippedCount++;
          continue;
        }

        const ingredients: Array<{ lineType: 'ingredient'; ingredientItemId: string; quantityRequired: number }> = [];
        let hasIngredientError = false;

        for (const row of groupRows) {
          if (!row.ingredientSku) {
            errors.push({ row: 0, message: `Ingredient SKU is missing in recipe "${key}"` });
            hasIngredientError = true;
            continue;
          }

          // Ensure ingredient item exists (default is RAW)
          const ingredientItemId = await this.itemService.ensureItemDependencies(
            {
              sku: row.ingredientSku,
              name: row.ingredientName || row.ingredientSku,
              categoryName: firstRow.categoryName || 'General',
              type: 'INGREDIENTS',
              uom: row.uom || undefined,
            },
            resolvedRestaurantId,
            franchiseGroupId,
          );

          if (!ingredientItemId) {
            errors.push({ row: 0, message: `Failed to resolve ingredient SKU: "${row.ingredientSku}" in recipe "${key}"` });
            hasIngredientError = true;
            continue;
          }

          ingredients.push({
            lineType: 'ingredient' as const,
            ingredientItemId,
            quantityRequired: row.quantityRequired,
          });
        }

        if (hasIngredientError) continue;
        if (ingredients.length === 0) {
          errors.push({ row: 0, message: `Recipe "${key}" has no valid ingredients` });
          continue;
        }

        const dto: CreateRecipeDto = {
          producesItemId,
          recipeName,
          yieldQuantity: firstRow.yieldQuantity,
          priceEur: firstRow.priceEur,
          vatRate: firstRow.vatRate,
          ingredients,
        };

        await this.createRecipe(dto, resolvedRestaurantId, franchiseGroupId);
        createdCount++;
      } catch (err) {
        errors.push({ row: 0, message: `Failed to create recipe "${key}": ${err instanceof Error ? err.message : String(err)}` });
      }
    }

    return { createdCount, skippedCount, errors };
  }

  async createRecipe(
    dto: CreateRecipeDto,
    restaurantId: RestaurantId | null,
    franchiseGroupId: string | null
  ): Promise<Recipe> {
    const resolvedRestaurantId = restaurantId ?? null;
    const resolvedFranchiseGroupId = resolvedRestaurantId ? null : (franchiseGroupId ?? null);

    if (!resolvedRestaurantId && !resolvedFranchiseGroupId) {
      throw new BadRequestException(
        'Cannot create recipe: authenticated user has no restaurant or franchise group context assigned.',
      );
    }

    if (dto.producesItemId) {
      const item = await this.itemService.findById(
        asItemId(dto.producesItemId),
        resolvedRestaurantId as RestaurantId
      );
      if (!item) {
        throw new NotFoundException(`Item not found: ${dto.producesItemId}`);
      }
    }

    const command: CreateRecipeCommand = {
      ...dto,
      producesItemId: dto.producesItemId ?? null,
      priceEur: dto.priceEur ?? null,
      vatRate: dto.vatRate ?? null,
      restaurantId: resolvedRestaurantId,
      franchiseGroupId: resolvedFranchiseGroupId ? (resolvedFranchiseGroupId as any) : null,
    };

    return this.recipeRepo.create(command);
  }

  async updateRecipe(recipeId: RecipeId, dto: UpdateRecipeDto): Promise<Recipe> {
    const existing = await this.recipeRepo.findById(recipeId);
    if (!existing) {
      throw new NotFoundException(`Recipe ${recipeId} not found`);
    }

    return this.recipeRepo.update(recipeId, dto);
  }

  async deleteRecipe(recipeId: RecipeId): Promise<void> {
    const existing = await this.recipeRepo.findById(recipeId);
    if (!existing) {
      throw new NotFoundException(`Recipe ${recipeId} not found`);
    }
    await this.recipeRepo.deleteRecipe(recipeId);
  }

  async createMenuItemMapping(restaurantId: RestaurantId, dto: MenuItemMappingDto): Promise<void> {
    const existing = await this.recipeRepo.findById(dto.recipeId as RecipeId);
    if (!existing) {
      throw new NotFoundException(`Recipe ${dto.recipeId} not found`);
    }

    await this.recipeRepo.upsertMapping(restaurantId, dto.rawExcelString, dto.recipeId as RecipeId);
  }

  async deleteMapping(mappingId: string): Promise<void> {
    await this.recipeRepo.deleteMapping(mappingId);
  }

  async getUnmappedRows(
    restaurantId: RestaurantId,
    batchId: string,
  ): Promise<Array<{ id: string; rawItemName: string; quantitySold: number }>> {
    return this.recipeRepo.getUnmappedRows(restaurantId, batchId);
  }
}
