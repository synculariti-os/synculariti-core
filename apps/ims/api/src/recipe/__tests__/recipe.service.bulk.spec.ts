import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecipeService } from '../recipe.service';
import type { IRecipeRepository } from '../interfaces/i-recipe.repository';
import type { IItemWriteService } from '../../item/interfaces/i-item.service';

describe('RecipeService - Bulk Creation', () => {
  let service: RecipeService;
  let mockRecipeRepo: any;
  let mockItemService: any;

  beforeEach(() => {
    mockRecipeRepo = {
      findById: vi.fn(),
      findByProducesItemId: vi.fn(),
      findByRecipeName: vi.fn(),
      findIngredients: vi.fn(),
      resolveByPosString: vi.fn(),
      resolveRecipesByPosStrings: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsertMapping: vi.fn(),
      findAllRecipes: vi.fn(),
      findAllMappings: vi.fn(),
      deleteRecipe: vi.fn(),
      deleteMapping: vi.fn(),
      getUnmappedRows: vi.fn(),
    };

    mockItemService = {
      findById: vi.fn(),
      findBySku: vi.fn(),
      convertUom: vi.fn(),
      listParLevels: vi.fn(),
      listCategories: vi.fn(),
      createItem: vi.fn(),
      createCategory: vi.fn(),
      ensureItemDependencies: vi.fn(),
    };

    service = new RecipeService(mockRecipeRepo, mockItemService);
  });

  it('calls ensureItemDependencies and creates recipes successfully', async () => {
    const rows = [
      {
        producesItemSku: 'PREP-001',
        producesItemName: 'Produced Salad',
        categoryName: 'Salads',
        recipeName: 'Salad Recipe',
        yieldQuantity: 2,
        priceEur: null,
        vatRate: null,
        ingredientSku: 'RAW-001',
        ingredientName: 'Tomato',
        quantityRequired: 0.5,
        uom: 'kg',
      },
    ];

    mockItemService.ensureItemDependencies.mockResolvedValueOnce('produced-item-uuid'); // for producesItem
    mockItemService.ensureItemDependencies.mockResolvedValueOnce('ingredient-item-uuid'); // for ingredient
    mockItemService.findById.mockResolvedValue({ id: 'produced-item-uuid' });
    mockRecipeRepo.create.mockResolvedValue({ id: 'recipe-uuid' });

    const result = await service.bulkCreateRecipes(
      rows,
      'restaurant-uuid' as any,
      null,
    );

    expect(mockItemService.ensureItemDependencies).toHaveBeenCalledTimes(2);
    expect(mockItemService.ensureItemDependencies).toHaveBeenNthCalledWith(
      1,
      {
        sku: 'PREP-001',
        name: 'Produced Salad',
        categoryName: 'Salads',
        type: 'INGREDIENTS',
        uom: 'kg',
      },
      'restaurant-uuid',
      null,
    );
    expect(mockItemService.ensureItemDependencies).toHaveBeenNthCalledWith(
      2,
      {
        sku: 'RAW-001',
        name: 'Tomato',
        categoryName: 'Salads',
        type: 'INGREDIENTS',
        uom: 'kg',
      },
      'restaurant-uuid',
      null,
    );

    expect(result.createdCount).toBe(1);
    expect(result.errors).toHaveLength(0);
  });
});
