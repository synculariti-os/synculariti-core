import type { Item, ItemWithOverride, ItemId, RestaurantId, FranchiseGroupId, UomConversion, Category, ItemRestaurantOverride } from '@synculariti/types';
import type { 
  UpdateItemDto, 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  CreateUomConversionDto, 
  UpdateItemOverrideDto 
} from '@synculariti/validators';
import type { CreateItemCommand, CreateCategoryCommand } from './i-item.service';

export interface IItemRepository {
  findById(itemId: ItemId, restaurantId: RestaurantId): Promise<ItemWithOverride | null>;
  findByIdRaw(itemId: ItemId, franchiseGroupId?: FranchiseGroupId): Promise<Item | null>;
  findBySku(sku: string, restaurantId: RestaurantId): Promise<Item | null>;
  getUomConversion(itemId: ItemId, fromUom: string, toUom: string): Promise<UomConversion | null>;
  listParLevels(restaurantId: RestaurantId, page?: number, limit?: number): Promise<{ data: ItemWithOverride[]; meta: { total: number; page: number; limit: number; totalPages: number } }>;
  listCategories(restaurantId: RestaurantId, franchiseGroupId: string | null, itemType?: string | null): Promise<Category[]>;
  createItem(data: CreateItemCommand): Promise<Item>;
  updateItem(itemId: ItemId, data: UpdateItemDto): Promise<Item>;
  deleteItem(itemId: ItemId): Promise<void>;
  deleteItemsBulk(itemIds: ItemId[]): Promise<void>;
  createCategory(data: CreateCategoryCommand): Promise<Category>;
  updateCategory(categoryId: string, data: UpdateCategoryDto): Promise<Category>;
  deleteCategory(categoryId: string): Promise<void>;
  deleteCategoriesBulk(categoryIds: string[]): Promise<void>;
  listUomConversions(itemId: ItemId): Promise<UomConversion[]>;
  deleteUomConversion(id: string): Promise<void>;
  upsertUomConversion(data: CreateUomConversionDto): Promise<UomConversion>;
  upsertItemOverride(itemId: ItemId, restaurantId: RestaurantId, data: UpdateItemOverrideDto): Promise<ItemRestaurantOverride>;
  generateSku(categoryId: string, restaurantId: RestaurantId | null): Promise<string>;
  upsertCategory(data: CreateCategoryCommand): Promise<Category>;
  upsertItem(data: CreateItemCommand): Promise<Item>;
}

export const ITEM_REPOSITORY_TOKEN = Symbol('IItemRepository');
